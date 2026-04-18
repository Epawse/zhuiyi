import exifr from 'exifr'

export async function extractExif(file: File): Promise<{
  latitude?: number
  longitude?: number
  datetime?: string
  altitude?: number
  orientation?: number
  make?: string
  model?: string
} | null> {
  try {
    const data = await exifr.parse(file, {
      gps: true,
      tiff: true,
      exif: true,
      translateValues: true,
    })

    if (!data) return null

    return {
      latitude: data.latitude ?? undefined,
      longitude: data.longitude ?? undefined,
      datetime: data.DateTimeOriginal?.toISOString() ?? data.CreateDate?.toISOString() ?? undefined,
      altitude: data.GPSAltitude ?? undefined,
      orientation: data.Orientation ?? undefined,
      make: data.Make ?? undefined,
      model: data.Model ?? undefined,
    }
  } catch {
    return null
  }
}