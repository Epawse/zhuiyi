import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Convert a base64 data URL to a Blob.
 * Handles "data:image/png;base64,..." format.
 */
function base64ToBlob(base64Data: string): Blob {
  const [meta, data] = base64Data.split(',')
  const mimeMatch = meta.match(/data:(.*?);/)
  const mime = mimeMatch ? mimeMatch[1] : 'image/png'
  const binary = atob(data)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return new Blob([bytes], { type: mime })
}

/**
 * Upload a base64 image to Supabase Storage.
 *
 * @param supabase - Supabase client instance
 * @param bucket - Storage bucket name
 * @param userId - User ID (used as folder prefix for RLS)
 * @param fileName - File name within the user folder
 * @param base64Data - Base64 data URL (data:image/...;base64,...)
 * @returns Public URL for public buckets, or null on failure
 */
export async function uploadBase64Image(
  supabase: SupabaseClient,
  bucket: 'covers' | 'photos' | 'share-cards',
  userId: string,
  fileName: string,
  base64Data: string
): Promise<string | null> {
  try {
    const blob = base64ToBlob(base64Data)
    const filePath = `${userId}/${fileName}`

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, blob, {
        contentType: blob.type,
        upsert: true,
      })

    if (error) {
      console.error('[storage] Upload failed:', error.message)
      return null
    }

    // For public buckets (covers, share-cards), return the public URL
    if (bucket === 'covers' || bucket === 'share-cards') {
      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)
      return data.publicUrl
    }

    // For private bucket (photos), return signed URL
    const { data: signedData, error: signError } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, 3600) // 1 hour expiry

    if (signError || !signedData) {
      console.error('[storage] Signed URL failed:', signError?.message)
      return null
    }

    return signedData.signedUrl
  } catch (err) {
    console.error('[storage] Upload exception:', err)
    return null
  }
}

/**
 * Delete a file from Supabase Storage.
 *
 * @param supabase - Supabase client instance
 * @param bucket - Storage bucket name
 * @param path - Full path of the file to delete (including user folder prefix)
 * @returns true if deleted successfully, false otherwise
 */
export async function deleteStorageFile(
  supabase: SupabaseClient,
  bucket: 'covers' | 'photos' | 'share-cards',
  path: string
): Promise<boolean> {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path])

    if (error) {
      console.error('[storage] Delete failed:', error.message)
      return false
    }

    return true
  } catch (err) {
    console.error('[storage] Delete exception:', err)
    return false
  }
}