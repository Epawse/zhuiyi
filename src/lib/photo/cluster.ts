import { PhotoFile, PhotoChapter } from '@/types'

export function clusterPhotos(photos: PhotoFile[]): PhotoChapter[] {
  const analyzed = photos.filter((p) => p.analysis && p.exif)
  if (analyzed.length === 0) return []

  const sorted = [...analyzed].sort((a, b) => {
    const timeA = a.exif?.datetime ? new Date(a.exif.datetime).getTime() : 0
    const timeB = b.exif?.datetime ? new Date(b.exif.datetime).getTime() : 0
    return timeA - timeB
  })

  const chapters: PhotoChapter[] = []
  let currentChapter: PhotoFile[] = [sorted[0]]

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1]
    const curr = sorted[i]

    const prevTime = prev.exif?.datetime ? new Date(prev.exif.datetime).getTime() : 0
    const currTime = curr.exif?.datetime ? new Date(curr.exif.datetime).getTime() : 0
    const timeDiff = currTime - prevTime

    const prevLat = prev.exif?.latitude || 0
    const prevLng = prev.exif?.longitude || 0
    const currLat = curr.exif?.latitude || 0
    const currLng = curr.exif?.longitude || 0
    const dist = Math.sqrt((currLat - prevLat) ** 2 + (currLng - prevLng) ** 2)

    const sameLocation = dist < 0.01
    const sameDay = timeDiff < 8 * 60 * 60 * 1000

    if (sameLocation && sameDay) {
      currentChapter.push(curr)
    } else {
      chapters.push(createChapter(currentChapter))
      currentChapter = [curr]
    }
  }

  if (currentChapter.length > 0) {
    chapters.push(createChapter(currentChapter))
  }

  return chapters
}

function createChapter(photos: PhotoFile[]): PhotoChapter {
  const times = photos
    .map((p) => (p.exif?.datetime ? new Date(p.exif.datetime).getTime() : 0))
    .filter(Boolean)
  const lats = photos.map((p) => p.exif?.latitude).filter((v): v is number => v !== undefined) as number[]
  const lngs = photos.map((p) => p.exif?.longitude).filter((v): v is number => v !== undefined) as number[]

  const chapterId = `ch-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`

  return {
    id: chapterId,
    title: photos[0]?.analysis?.scene || '未命名篇章',
    photos,
    startTime: new Date(Math.min(...times)),
    endTime: new Date(Math.max(...times)),
    centerLat: lats.length ? lats.reduce((a, b) => a + b, 0) / lats.length : 0,
    centerLng: lngs.length ? lngs.reduce((a, b) => a + b, 0) / lngs.length : 0,
    narrative: null,
    generatingNarrative: false,
  }
}