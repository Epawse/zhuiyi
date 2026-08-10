import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import {
  buildChapterUpserts,
  buildHistoryEntryFromCloud,
  buildJourneyUpsert,
  mergeCloudAndLocalHistory,
} from '../src/lib/supabase/history-sync.ts'
import type { HistoryEntry } from '../src/types/photo.ts'

const entry: HistoryEntry = {
  id: 'ancient|江岸:120',
  createdAt: '2026-08-01T02:03:04.000Z',
  style: 'ancient',
  chapterCount: 2,
  chapterSummaries: [
    { title: '江岸', location: '武汉', narrativePreview: '第一章' },
    { title: '归途', location: '武汉', narrativePreview: '第二章' },
  ],
  narratives: [
    { title: 'old title 1', text: 'first' },
    { title: 'old title 2', text: 'second' },
  ],
  summary: 'summary',
}

test('journey upsert retains the stable local ID and original timestamp', () => {
  assert.deepEqual(buildJourneyUpsert('user-1', entry, 'https://example.test/cover.png'), {
    user_id: 'user-1',
    source_entry_id: entry.id,
    style: 'ancient',
    cover_image_url: 'https://example.test/cover.png',
    summary_text: 'summary',
    created_at: '2026-08-01T02:03:04.000Z',
  })
})

test('chapter reconciliation uses one deterministic key per journey order', () => {
  assert.deepEqual(buildChapterUpserts('journey-1', entry), [
    {
      journey_id: 'journey-1',
      title: '江岸',
      narrative_text: 'first',
      photo_urls: [],
      analyses: [],
      order_index: 0,
    },
    {
      journey_id: 'journey-1',
      title: '归途',
      narrative_text: 'second',
      photo_urls: [],
      analyses: [],
      order_index: 1,
    },
  ])
})

test('cloud readback keeps the source ID stable for the next migration', () => {
  const cloudEntry = buildHistoryEntryFromCloud(
    {
      id: 'cloud-journey-uuid',
      source_entry_id: entry.id,
      created_at: entry.createdAt,
      style: entry.style,
      cover_image_url: null,
      summary_text: entry.summary || null,
    },
    []
  )

  assert.equal(cloudEntry.id, entry.id)
  assert.equal(buildJourneyUpsert('user-1', cloudEntry, null).source_entry_id, entry.id)
})

test('migration enforces the same conflict keys used by cloud upserts', async () => {
  const migration = await readFile(
    new URL('../supabase/migrations/003_history_idempotency.sql', import.meta.url),
    'utf8'
  )

  assert.match(migration, /UNIQUE \(user_id, source_entry_id\)/)
  assert.match(migration, /UNIQUE \(journey_id, order_index\)/)
  assert.match(
    migration,
    /WHERE conrelid = 'public\.journeys'::regclass\s+AND conname = 'journeys_user_source_entry_key'/
  )
  assert.match(
    migration,
    /WHERE conrelid = 'public\.chapters'::regclass\s+AND conname = 'chapters_journey_order_key'/
  )
})

test('Google auth uses a reusable sign-in flow instead of one-time identity linking', async () => {
  const authProvider = await readFile(
    new URL('../src/components/auth/AuthProvider.tsx', import.meta.url),
    'utf8'
  )

  assert.match(authProvider, /auth\.signInWithOAuth\(/)
  assert.doesNotMatch(authProvider, /auth\.linkIdentity\(/)
})

test('partial migration readback retains unmatched local entries', () => {
  const cloudEntry = { ...entry, summary: 'cloud wins' }
  const failedLocalEntry = {
    ...entry,
    id: 'local-only',
    createdAt: '2026-08-02T02:03:04.000Z',
  }

  assert.deepEqual(
    mergeCloudAndLocalHistory(
      [cloudEntry],
      [{ ...entry, summary: 'stale local copy' }, failedLocalEntry],
      20
    ),
    [failedLocalEntry, cloudEntry]
  )
})

test('local retry candidates survive the history size limit', () => {
  const cloudEntries = Array.from({ length: 20 }, (_, index) => ({
    ...entry,
    id: `cloud-${index}`,
    createdAt: `2026-08-${String(index + 1).padStart(2, '0')}T02:03:04.000Z`,
  }))
  const failedLocalEntry = {
    ...entry,
    id: 'local-only',
    createdAt: '2026-07-01T02:03:04.000Z',
  }

  const merged = mergeCloudAndLocalHistory(cloudEntries, [failedLocalEntry], 20)

  assert.equal(merged.length, 20)
  assert.ok(merged.some((candidate) => candidate.id === failedLocalEntry.id))
})
