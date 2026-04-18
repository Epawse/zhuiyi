'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { clusterPhotos } from '@/lib/photo/cluster'
import { PhotoAnalysis } from '@/types'

export function ProcessingPage() {
  const photos = useAppStore((s) => s.photos)
  const setChapters = useAppStore((s) => s.setChapters)
  const setState = useAppStore((s) => s.setState)
  const [results, setResults] = useState<Record<string, PhotoAnalysis | null>>({})
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const analyzeAll = async () => {
      const currentPhotos = useAppStore.getState().photos
      const newResults: Record<string, PhotoAnalysis | null> = {}

      for (let i = 0; i < currentPhotos.length; i++) {
        const photo = currentPhotos[i]
        setProgress(i)
        try {
          const res = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              image: photo.preview,
              exif: photo.exif,
            }),
          })
          const analysis = await res.json()
          newResults[photo.id] = analysis
          useAppStore.getState().updatePhoto(photo.id, { analysis, analyzing: false })
        } catch (err) {
          console.error('Failed to analyze photo', photo.id, err)
          newResults[photo.id] = null
          useAppStore.getState().updatePhoto(photo.id, { analyzing: false })
        }
        setResults({ ...newResults })
      }
      setProgress(currentPhotos.length)

      const updatedPhotos = useAppStore.getState().photos
      const chapters = clusterPhotos(updatedPhotos)
      setChapters(chapters)
      setState('experience')
    }

    analyzeAll()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <h2 className="text-2xl font-serif mb-6">正在唤醒记忆...</h2>

      <div className="grid grid-cols-3 md:grid-cols-4 gap-3 max-w-lg mb-8">
        {photos.map((photo) => (
          <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden">
            <img src={photo.preview} alt="" className="w-full h-full object-cover" />
            {photo.analyzing && !photo.analysis && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {photo.analysis && (
              <div className="absolute top-1 right-1 w-4 h-4 bg-green-500 rounded-full" />
            )}
          </div>
        ))}
      </div>

      <p className="text-gray-500 text-sm">
        {progress} / {photos.length} 张照片已分析
      </p>
    </div>
  )
}