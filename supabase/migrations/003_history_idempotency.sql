-- ==========================================
-- 追忆 (ZhuīYì) History migration idempotency
-- Migration 003: stable local source IDs + chapter reconciliation keys
-- ==========================================

ALTER TABLE public.journeys
  ADD COLUMN IF NOT EXISTS source_entry_id TEXT;

-- Existing cloud-only rows did not retain their local source ID. Use their
-- journey UUID as a stable fallback so subsequent cloud readbacks remain
-- idempotent as well.
UPDATE public.journeys
SET source_entry_id = id::text
WHERE source_entry_id IS NULL;

-- If an earlier attempt added the column but stopped before the constraint,
-- retain every journey while giving duplicate source IDs a stable fallback.
WITH duplicate_sources AS (
  SELECT
    id,
    row_number() OVER (
      PARTITION BY user_id, source_entry_id
      ORDER BY created_at, id
    ) AS duplicate_rank
  FROM public.journeys
)
UPDATE public.journeys AS journeys
SET source_entry_id = journeys.id::text
FROM duplicate_sources
WHERE journeys.id = duplicate_sources.id
  AND duplicate_sources.duplicate_rank > 1;

ALTER TABLE public.journeys
  ALTER COLUMN source_entry_id SET NOT NULL;

-- The old client inserted a fresh journey per attempt, so its chapters normally
-- already have unique order indexes. Reindex only dirty/partially migrated
-- journeys before enforcing the key; no chapter rows are discarded.
WITH duplicate_chapter_journeys AS (
  SELECT journey_id
  FROM public.chapters
  GROUP BY journey_id, order_index
  HAVING count(*) > 1
),
affected_journeys AS (
  SELECT DISTINCT journey_id
  FROM duplicate_chapter_journeys
),
reindexed_chapters AS (
  SELECT
    chapters.id,
    row_number() OVER (
      PARTITION BY chapters.journey_id
      ORDER BY chapters.order_index, chapters.created_at, chapters.id
    ) - 1 AS new_order_index
  FROM public.chapters AS chapters
  INNER JOIN affected_journeys
    ON affected_journeys.journey_id = chapters.journey_id
)
UPDATE public.chapters AS chapters
SET order_index = reindexed_chapters.new_order_index
FROM reindexed_chapters
WHERE chapters.id = reindexed_chapters.id;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.journeys'::regclass
      AND conname = 'journeys_user_source_entry_key'
  ) THEN
    ALTER TABLE public.journeys
      ADD CONSTRAINT journeys_user_source_entry_key
      UNIQUE (user_id, source_entry_id);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.chapters'::regclass
      AND conname = 'chapters_journey_order_key'
  ) THEN
    ALTER TABLE public.chapters
      ADD CONSTRAINT chapters_journey_order_key
      UNIQUE (journey_id, order_index);
  END IF;
END
$$;
