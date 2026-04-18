'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'
import { STYLES } from '@/types/style'
import { clusterPhotos } from '@/lib/photo/cluster'

export function ProcessingPage() {
  const photos = useAppStore((s) => s.photos)
  const setChapters = useAppStore((s) => s.setChapters)
  const setState = useAppStore((s) => s.setState)
  const style = useAppStore((s) => s.style)
  const [progress, setProgress] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')

  const theme = STYLES[style]
  const isDark = style === 'cyber'

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

  // Current photo being analyzed (first analyzing photo, or last analyzed)
  const analyzing = photos.find((p) => p.analyzing && !p.analysis)
  const currentPhoto = analyzing || photos.filter((p) => p.analysis).slice(-1)[0] || photos[0]

  // Background photo: use the one being analyzed, or most recently completed
  const bgPhoto = analyzing?.preview
    || photos.filter((p) => p.analysis).slice(-1)[0]?.preview
    || photos[0]?.preview
    || photos.filter((p) => p.analysis).slice(-1)[0]?.preview
    || photos[0]?.preview

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* === FULL-BLEED BACKGROUND — current photo with blur/desaturation === */}
      <AnimatePresence mode="wait">
        {bgPhoto && (
          <motion.div
            key={bgPhoto}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed inset-0 z-0"
          >
            <img
              src={bgPhoto}
              alt=""
              className="w-full h-full object-cover"
              style={{
                filter: 'blur(3px) brightness(0.4) saturate(0.6) contrast(1.1)',
                transform: 'scale(1.08)',
              }}
            />
            {/* Dark overlay */}
            <div
              className="absolute inset-0"
              style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.45)' }}
            />
            {/* Accent glow from theme */}
            <div
              className="absolute inset-0 opacity-[0.08]"
              style={{
                background: `radial-gradient(ellipse at 50% 40%, ${theme.colors.accent} 0%, transparent 60%)`,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fallback solid bg if no photo */}
      {!bgPhoto && (
        <div
          className="fixed inset-0 z-0"
          style={{ backgroundColor: isDark ? '#0a0a0f' : '#1a1a2e' }}
        />
      )}

      {/* === CONTENT === */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center"
        >
          {/* Current photo — large, with frosted glass frame */}
          <AnimatePresence mode="wait">
            {currentPhoto && (
              <motion.div
                key={currentPhoto.id}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -10 }}
                transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                className="w-48 h-48 md:w-56 md:h-56 rounded-3xl overflow-hidden mb-8"
                style={{
                  boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)`,
                }}
              >
                <img
                  src={currentPhoto.preview}
                  alt=""
                  className="w-full h-full object-cover"
                />
                {/* Analyzing shimmer overlay */}
                {!currentPhoto.analysis && (
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent animate-pulse" />
                )}
                {/* Completed check mark */}
                {currentPhoto.analysis && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', bounce: 0.4 }}
                    className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: theme.colors.accent,
                      boxShadow: `0 0 16px ${theme.colors.accent}60`,
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Title */}
          <h2
            className="text-2xl md:text-3xl mb-2 text-center"
            style={{
              fontFamily: theme.font.heading,
              color: isDark ? '#E0E0E0' : '#F5F0E8',
            }}
          >
            正在唤醒记忆
          </h2>

          {/* Subtitle — analysis info */}
          {currentPhoto?.analysis && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm mb-8"
              style={{
                color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.45)',
                fontFamily: theme.font.body,
              }}
            >
              {currentPhoto.analysis.location_guess} · {currentPhoto.analysis.time_of_day}
            </motion.p>
          )}
          {!currentPhoto?.analysis && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm mb-8"
              style={{
                color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.4)',
                fontFamily: theme.font.body,
              }}
            >
              识别场景与情绪...
            </motion.p>
          )}

          {/* Photo filmstrip — subtle row at bottom */}
          <div className="flex gap-2 mb-8 overflow-x-auto px-2 max-w-xs">
            {photos.map((photo, i) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0"
                style={{
                  border: photo.analysis
                    ? `1.5px solid ${theme.colors.accent}40`
                    : '1.5px solid rgba(255,255,255,0.1)',
                  boxShadow: photo.analysis
                    ? `0 0 8px ${theme.colors.accent}20`
                    : 'none',
                }}
              >
                <img
                  src={photo.preview}
                  alt=""
                  className="w-full h-full object-cover"
                  style={{
                    opacity: photo.analysis ? 1 : 0.5,
                  }}
                />
              </motion.div>
            ))}
          </div>

          {/* Progress bar — slim, elegant */}
          <div
            className="w-52 h-[3px] rounded-full overflow-hidden mb-3"
            style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, ${theme.colors.accent}, ${theme.colors.secondary || theme.colors.accent})`,
              }}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <p
            className="text-xs tracking-widest"
            style={{
              color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.3)',
            }}
          >
            {analyzed} / {photos.length}
          </p>

          {errorMsg && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-sm mt-4"
            >
              {errorMsg}
            </motion.p>
          )}
        </motion.div>
      </div>
    </div>
  )
}