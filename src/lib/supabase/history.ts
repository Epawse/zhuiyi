import type { SupabaseClient } from '@supabase/supabase-js'
import type { HistoryEntry } from '@/types'
import { uploadBase64Image } from './storage'

const HISTORY_KEY = 'zhuiyi-history'

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
    let coverImageUrl: string | null = null
    if (coverImageBase64) {
      coverImageUrl = await uploadBase64Image(
        supabase,
        'covers',
        userId,
        `${entry.id}.png`,
        coverImageBase64
      )
    }

    // 2. Insert journey row
    const { data: journey, error: journeyError } = await supabase
      .from('journeys')
      .insert({
        user_id: userId,
        style: entry.style,
        cover_image_url: coverImageUrl,
        summary_text: entry.summary || null,
      })
      .select('id')
      .single()

    if (journeyError || !journey) {
      console.error('[history] Journey insert failed:', journeyError?.message)
      return null
    }

    const journeyId = journey.id

    // 3. Insert chapter rows
    if (entry.narratives && entry.narratives.length > 0) {
      const chapters = entry.narratives.map((narrative, index) => ({
        journey_id: journeyId,
        title: narrative.title,
        narrative_text: narrative.text,
        photo_urls: [] as string[],
        analyses: [] as unknown[],
        order_index: index,
      }))

      // Attach chapter summaries if available
      entry.chapterSummaries?.forEach((summary, index) => {
        if (chapters[index]) {
          chapters[index].title = summary.title
        }
      })

      const { error: chaptersError } = await supabase
        .from('chapters')
        .insert(chapters)

      if (chaptersError) {
        console.error('[history] Chapters insert failed:', chaptersError.message)
        // Journey was created but chapters failed — still return journey ID
      }
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
      }

      const narratives = (chapters || []).map((ch) => ({
        title: ch.title,
        text: ch.narrative_text,
      }))

      const chapterSummaries = (chapters || []).map((ch) => ({
        title: ch.title,
        location: '未知地点',
        narrativePreview: ch.narrative_text?.slice(0, 60) || '',
      }))

      entries.push({
        id: journey.id,
        createdAt: journey.created_at,
        style: journey.style as HistoryEntry['style'],
        chapterCount: narratives.length,
        chapterSummaries,
        coverImage: journey.cover_image_url,
        narratives: narratives.length > 0 ? narratives : undefined,
        summary: journey.summary_text || undefined,
      })
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