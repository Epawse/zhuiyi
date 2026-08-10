import type { HistoryEntry } from '@/types'

export interface JourneyUpsertPayload {
  user_id: string
  source_entry_id: string
  style: string
  cover_image_url: string | null
  summary_text: string | null
  created_at: string
}

export interface ChapterUpsertPayload {
  journey_id: string
  title: string
  narrative_text: string
  photo_urls: string[]
  analyses: unknown[]
  order_index: number
}

interface CloudJourney {
  id: string
  source_entry_id?: string | null
  created_at: string
  style: string
  cover_image_url: string | null
  summary_text: string | null
}

interface CloudChapter {
  title: string
  narrative_text: string
}

export function buildJourneyUpsert(
  userId: string,
  entry: HistoryEntry,
  coverImageUrl: string | null
): JourneyUpsertPayload {
  return {
    user_id: userId,
    source_entry_id: entry.id,
    style: entry.style,
    cover_image_url: coverImageUrl,
    summary_text: entry.summary || null,
    created_at: entry.createdAt,
  }
}

export function buildChapterUpserts(
  journeyId: string,
  entry: HistoryEntry
): ChapterUpsertPayload[] {
  return (entry.narratives || []).map((narrative, index) => ({
    journey_id: journeyId,
    title: entry.chapterSummaries?.[index]?.title || narrative.title,
    narrative_text: narrative.text,
    photo_urls: [],
    analyses: [],
    order_index: index,
  }))
}

export function buildHistoryEntryFromCloud(
  journey: CloudJourney,
  chapters: CloudChapter[]
): HistoryEntry {
  const narratives = chapters.map((chapter) => ({
    title: chapter.title,
    text: chapter.narrative_text,
  }))

  return {
    // Rows created before migration 003 fall back to their journey UUID. The
    // migration backfills that same UUID into source_entry_id before enforcing
    // the column, so the ID remains stable on the next sync.
    id: journey.source_entry_id || journey.id,
    createdAt: journey.created_at,
    style: journey.style as HistoryEntry['style'],
    chapterCount: narratives.length,
    chapterSummaries: chapters.map((chapter) => ({
      title: chapter.title,
      location: '未知地点',
      narrativePreview: chapter.narrative_text?.slice(0, 60) || '',
    })),
    coverImage: journey.cover_image_url,
    narratives: narratives.length > 0 ? narratives : undefined,
    summary: journey.summary_text || undefined,
  }
}

export function mergeCloudAndLocalHistory(
  cloudEntries: HistoryEntry[],
  localEntries: HistoryEntry[],
  maxEntries: number
): HistoryEntry[] {
  const cloudIds = new Set(cloudEntries.map((entry) => entry.id))
  const unmatchedLocalEntries = localEntries.filter((entry) => !cloudIds.has(entry.id))
  const unmatchedLocalIds = new Set(unmatchedLocalEntries.map((entry) => entry.id))
  const byNewestFirst = (a: HistoryEntry, b: HistoryEntry) =>
    Date.parse(b.createdAt) - Date.parse(a.createdAt)

  const merged = [
    ...cloudEntries,
    ...unmatchedLocalEntries,
  ].sort(byNewestFirst)

  if (merged.length <= maxEntries) return merged

  // Keep every local-only row eligible for a later retry, even when the cloud
  // already contains enough older rows to fill the local history limit.
  const retainedLocalEntries = unmatchedLocalEntries
    .sort(byNewestFirst)
    .slice(0, maxEntries)
  const remainingSlots = maxEntries - retainedLocalEntries.length

  return [
    ...retainedLocalEntries,
    ...merged
      .filter((entry) => !unmatchedLocalIds.has(entry.id))
      .slice(0, remainingSlots),
  ].sort(byNewestFirst)
}
