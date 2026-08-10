import type { SupabaseClient } from '@supabase/supabase-js'
import type { HistoryEntry } from '@/types'
import { uploadBase64Image } from './storage'
import {
  buildChapterUpserts,
  buildHistoryEntryFromCloud,
  buildJourneyUpsert,
  deleteOwnedCloudHistory,
} from './history-sync'

const HISTORY_KEY = 'zhuiyi-history'

/**
 * Delete every cloud journey owned by the authenticated user.
 * Chapters are removed by the database's ON DELETE CASCADE constraint.
 *
 * Rejects on failure so callers can preserve local history.
 */
export async function deleteHistoryFromCloud(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  await deleteOwnedCloudHistory({
    userId,
    getAuthenticatedUserId: async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      return user?.id ?? null
    },
    listVisibleJourneyIds: async (linkedUserId) => {
      const { data, error } = await supabase
        .from('journeys')
        .select('id')
        .eq('user_id', linkedUserId)
      if (error) throw error
      return (data || []).map((journey) => journey.id)
    },
    deleteVisibleJourneys: async (linkedUserId) => {
      const { data, error } = await supabase
        .from('journeys')
        .delete()
        .eq('user_id', linkedUserId)
        .select('id')
      if (error) throw error
      return (data || []).map((journey) => journey.id)
    },
  })
}

/**
 * Load all localStorage history entries.
 */
function loadLocalHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
  } catch {
    return []
  }
}

/**
 * Save a history entry to Supabase (journey + chapters).
 *
 * @param supabase - Supabase browser client
 * @param userId - Authenticated user ID
 * @param entry - History entry to save
 * @param coverImageBase64 - Optional base64 cover image data URL
 * @returns Journey ID on success, null on failure
 */
export async function saveHistoryToCloud(
  supabase: SupabaseClient,
  userId: string,
  entry: HistoryEntry,
  coverImageBase64?: string
): Promise<string | null> {
  try {
    // 1. Upload cover image if present
    let coverImageUrl = entry.coverImage || null
    if (coverImageBase64?.startsWith('data:image/')) {
      coverImageUrl = await uploadBase64Image(
        supabase,
        'covers',
        userId,
        `${entry.id}.png`,
        coverImageBase64
      )
      if (!coverImageUrl) return null
    }

    // 2. Upsert the journey by its stable local history ID. Reusing the same
    // source entry updates the existing row instead of creating a duplicate.
    const { data: journey, error: journeyError } = await supabase
      .from('journeys')
      .upsert(buildJourneyUpsert(userId, entry, coverImageUrl), {
        onConflict: 'user_id,source_entry_id',
      })
      .select('id')
      .single()

    if (journeyError || !journey) {
      console.error('[history] Journey upsert failed:', journeyError?.message)
      return null
    }

    const journeyId = journey.id

    // 3. Upsert chapters by order, then remove stale trailing chapters. This
    // makes retries safe and also reconciles entries whose chapter count changed.
    const chapters = buildChapterUpserts(journeyId, entry)
    if (chapters.length > 0) {
      const { error: chaptersError } = await supabase
        .from('chapters')
        .upsert(chapters, { onConflict: 'journey_id,order_index' })

      if (chaptersError) {
        console.error('[history] Chapters upsert failed:', chaptersError.message)
        return null
      }
    }

    let staleChaptersQuery = supabase
      .from('chapters')
      .delete()
      .eq('journey_id', journeyId)

    if (chapters.length > 0) {
      staleChaptersQuery = staleChaptersQuery.gte('order_index', chapters.length)
    }

    const { error: staleChaptersError } = await staleChaptersQuery
    if (staleChaptersError) {
      console.error('[history] Stale chapter cleanup failed:', staleChaptersError.message)
      return null
    }

    return journeyId
  } catch (err) {
    console.error('[history] saveHistoryToCloud exception:', err)
    return null
  }
}

/**
 * Load all history from Supabase for a user.
 *
 * @param supabase - Supabase browser client
 * @param userId - Authenticated user ID
 * @returns Array of HistoryEntry
 */
export async function loadHistoryFromCloud(
  supabase: SupabaseClient,
  userId: string
): Promise<HistoryEntry[]> {
  try {
    // 1. Fetch all journeys
    const { data: journeys, error: journeysError } = await supabase
      .from('journeys')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (journeysError || !journeys) {
      console.error('[history] Load journeys failed:', journeysError?.message)
      return []
    }

    // 2. For each journey, fetch its chapters
    const entries: HistoryEntry[] = []

    for (const journey of journeys) {
      const { data: chapters, error: chaptersError } = await supabase
        .from('chapters')
        .select('*')
        .eq('journey_id', journey.id)
        .order('order_index', { ascending: true })

      if (chaptersError) {
        console.error('[history] Load chapters failed for journey', journey.id, chaptersError.message)
        // Do not return a partial cloud snapshot: callers persist a successful
        // readback to localStorage, which would otherwise discard chapter data.
        return []
      }

      entries.push(buildHistoryEntryFromCloud(journey, chapters || []))
    }

    return entries
  } catch (err) {
    console.error('[history] loadHistoryFromCloud exception:', err)
    return []
  }
}

/**
 * Migrate all localStorage history entries to Supabase.
 *
 * @param supabase - Supabase browser client
 * @param userId - Authenticated user ID
 * @returns Count of migrated and failed entries
 */
export async function migrateHistoryToCloud(
  supabase: SupabaseClient,
  userId: string
): Promise<{ migrated: number; failed: number }> {
  const localEntries = loadLocalHistory()
  let migrated = 0
  let failed = 0

  for (const entry of localEntries) {
    const journeyId = await saveHistoryToCloud(
      supabase,
      userId,
      entry,
      entry.coverImage || undefined
    )

    if (journeyId) {
      migrated++
    } else {
      failed++
    }
  }

  return { migrated, failed }
}
