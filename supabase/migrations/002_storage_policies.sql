-- ==========================================
-- 追忆 (ZhuīYì) Storage Buckets + Policies
-- Migration 002: Create storage buckets and folder-based access policies
-- ==========================================

-- ==========================================
-- Create buckets
-- ==========================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('covers', 'covers', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('share-cards', 'share-cards', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- ==========================================
-- Covers bucket policies
-- Public read, authenticated users can upload to their own folder
-- Folder structure: {user_id}/{filename}
-- ==========================================

-- Allow public read access to covers
CREATE POLICY "Covers are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'covers');

-- Allow authenticated users to upload covers to their own folder
CREATE POLICY "Authenticated users can upload covers to own folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'covers'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to update their own covers
CREATE POLICY "Authenticated users can update own covers"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'covers'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to delete their own covers
CREATE POLICY "Authenticated users can delete own covers"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'covers'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ==========================================
-- Photos bucket policies
-- Private bucket — only authenticated users can read/write their own folder
-- Folder structure: {user_id}/{filename}
-- ==========================================

-- Allow authenticated users to read photos in their own folder
CREATE POLICY "Authenticated users can read own photos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'photos'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to upload photos to their own folder
CREATE POLICY "Authenticated users can upload own photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'photos'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to update their own photos
CREATE POLICY "Authenticated users can update own photos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'photos'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to delete their own photos
CREATE POLICY "Authenticated users can delete own photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'photos'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ==========================================
-- Share-cards bucket policies
-- Public read, authenticated users can upload to their own folder
-- Folder structure: {user_id}/{filename}
-- ==========================================

-- Allow public read access to share-cards
CREATE POLICY "Share cards are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'share-cards');

-- Allow authenticated users to upload share-cards to their own folder
CREATE POLICY "Authenticated users can upload share cards to own folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'share-cards'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to update their own share-cards
CREATE POLICY "Authenticated users can update own share cards"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'share-cards'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to delete their own share-cards
CREATE POLICY "Authenticated users can delete own share cards"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'share-cards'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );