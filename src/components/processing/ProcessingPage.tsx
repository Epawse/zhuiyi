'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'
import { clusterPhotos } from '@/lib/photo/cluster'

export function ProcessingPage() {
  const photos = useAppStore((s) => s.photos)
  const setChapters = useAppStore((s) => s.setChapters)
  const setState = useAppStore((s) => s.setState)
  const [progress, setProgress] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const analyzeAll = async () => {
      const currentPhotos = useAppStore.getState().photos
      let failCount = 0

      for (let i = 0; i < currentPhotos.length; i++) {
        const photo = currentPhotos[i]
        setProgress(i + 1)
        useAppStore.getState().updatePhoto(photo.id, { analyzing: true })

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

          if (analysis.error) {
            failCount++
            useAppStore.getState().updatePhoto(photo.id, {
              analyzing: false,
              analysis: {
                scene: '未识别场景',
                location_guess: '未知地点',
                mood: [],
                season: 'spring',
                time_of_day: 'afternoon',
                activity: '未知',
                key_objects: [],
                notable_detail: '分析失败',
                confidence: 'low',
              },
            })
          } else {
            useAppStore.getState().updatePhoto(photo.id, { analysis, analyzing: false })
          }
        } catch (err) {
          failCount++
          useAppStore.getState().updatePhoto(photo.id, {
            analyzing: false,
            analysis: {
              scene: '未识别场景',
              location_guess: '未知地点',
              mood: [],
              season: 'spring',
              time_of_day: 'afternoon',
              activity: '未知',
              key_objects: [],
              notable_detail: '分析失败',
              confidence: 'low',
            },
          })
        }
      }

      if (failCount === currentPhotos.length) {
        setErrorMsg('所有照片分析失败，请重试')
        return
      }

      const updatedPhotos = useAppStore.getState().photos
      const chapters = clusterPhotos(updatedPhotos)
      setChapters(chapters)
      setState('experience')
    }

    analyzeAll()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const analyzed = photos.filter((p) => p.analysis).length
  const pct = photos.length > 0 ? Math.round((analyzed / photos.length) * 100) : 0

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[#0a0a0f] overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full opacity-[0.04]"
        style={{
          background: 'radial-gradient(ellipse at center, #D4A574 0%, transparent 70%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 flex flex-col items-center"
      >
        <h2
          className="text-2xl md:text-3xl mb-10 text-center"
          style={{
            fontFamily: 'var(--font-noto-serif), Georgia, serif',
            color: 'rgba(245, 240, 232, 0.8)',
          }}
        >
          正在唤醒记忆...
        </h2>

        {/* Photo grid with stagger reveal */}
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3 max-w-lg mb-8">
          {photos.map((photo, i) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="relative aspect-square rounded-xl overflow-hidden"
              style={{
                boxShadow: photo.analysis
                  ? '0 0 20px rgba(0, 200, 120, 0.15)'
                  : '0 4px 16px rgba(0,0,0,0.4)',
              }}
            >
              <img src={photo.preview} alt="" className="w-full h-full object-cover" />
              <AnimatePresence>
                {photo.analyzing && !photo.analysis && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/50 flex items-center justify-center"
                  >
                    <div className="w-5 h-5 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
                  </motion.div>
                )}
              </AnimatePresence>
              {photo.analysis && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                />
              )}
            </motion.div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="w-64 h-1 rounded-full bg-white/5 overflow-hidden mb-4">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #D4A574, #8B6914)',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <p className="text-white/30 text-sm">
          {analyzed} / {photos.length} 张照片已分析
        </p>

        {errorMsg && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-400 text-sm mt-3"
          >
            {errorMsg}
          </motion.p>
        )}
      </motion.div>
    </div>
  )
}