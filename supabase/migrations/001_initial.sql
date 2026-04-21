-- ==========================================
-- 追忆 (ZhuīYì) Database Schema
-- Migration 001: Initial schema + RLS + auto-profile trigger
-- ==========================================

-- ==========================================
-- Users table (extends auth.users)
-- ==========================================

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL DEFAULT 'Anonymous',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Prevent direct inserts/updates/deletes by users (managed by trigger)
-- Only the trigger function (running as SECURITY DEFINER) should insert into public.users

-- ==========================================
-- Auto-profile trigger
-- Creates a public.users row when a new auth.users row is created
-- ==========================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    CASE
      WHEN NEW.raw_user_meta_data->>'full_name' IS NOT NULL
        THEN NEW.raw_user_meta_data->>'full_name'
      WHEN NEW.email IS NOT NULL THEN split_part(NEW.email, '@', 1)
      ELSE 'Anonymous'
    END,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- Journeys table
-- ==========================================

CREATE TABLE IF NOT EXISTS public.journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  style TEXT NOT NULL,
  cover_image_url TEXT,
  summary_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.journeys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own journeys"
  ON public.journeys FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journeys"
  ON public.journeys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journeys"
  ON public.journeys FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own journeys"
  ON public.journeys FOR DELETE
  USING (auth.uid() = user_id);

-- ==========================================
-- Chapters table
-- ==========================================

CREATE TABLE IF NOT EXISTS public.chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id UUID NOT NULL REFERENCES public.journeys(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  narrative_text TEXT NOT NULL,
  photo_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
  analyses JSONB NOT NULL DEFAULT '[]'::jsonb,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read chapters of own journeys"
  ON public.chapters FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.journeys
    WHERE public.journeys.id = public.chapters.journey_id
    AND public.journeys.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert chapters of own journeys"
  ON public.chapters FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.journeys
    WHERE public.journeys.id = public.chapters.journey_id
    AND public.journeys.user_id = auth.uid()
  ));

CREATE POLICY "Users can update chapters of own journeys"
  ON public.chapters FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.journeys
    WHERE public.journeys.id = public.chapters.journey_id
    AND public.journeys.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete chapters of own journeys"
  ON public.chapters FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.journeys
    WHERE public.journeys.id = public.chapters.journey_id
    AND public.journeys.user_id = auth.uid()
  ));

-- ==========================================
-- Generated images table
-- ==========================================

CREATE TABLE IF NOT EXISTS public.generated_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  journey_id UUID REFERENCES public.journeys(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  prompt TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.generated_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own generated images"
  ON public.generated_images FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own generated images"
  ON public.generated_images FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own generated images"
  ON public.generated_images FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own generated images"
  ON public.generated_images FOR DELETE
  USING (auth.uid() = user_id);