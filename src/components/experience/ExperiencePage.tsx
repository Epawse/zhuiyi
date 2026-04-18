'use client'

import { useAppStore } from '@/store/useAppStore'
import { STYLES } from '@/types/style'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StyleType, PhotoChapter, JourneySummary } from '@/types'

type ViewMode = 'photo' | 'scroll' | 'map'

function useTypewriter(text: string, speed = 40) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    setDisplayed('')
    setDone(false)
    if (!text) return

    let i = 0
    const timer = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) {
        clearInterval(timer)
        setDone(true)
      }
    }, speed)
    return () => clearInterval(timer)
  }, [text, speed])

  return { displayed, done }
}

function NarrativeBlock({ text, fontFamily }: { text: string; fontFamily: string }) {
  const { displayed, done } = useTypewriter(text, 35)
  return (
    <p
      className={`text-lg leading-[1.9] whitespace-pre-wrap ${done ? '' : 'typewriter-cursor'}`}
      style={{ fontFamily }}
    >
      {displayed}
    </p>
  )
}

// === PHOTO FLOW MODE ===
function PhotoFlow({ chapters, style }: { chapters: PhotoChapter[]; style: StyleType }) {
  const theme = STYLES[style]
  const isDark = style === 'cyber'

  // Flatten: each photo is a slide, first photo of each chapter carries chapter info
  type PhotoSlide = {
    photo: PhotoChapter['photos'][0]
    isFirstInChapter: boolean
    chapterTitle: string
    chapterLocation: string
    chapterTime: string
  }
  const slides: PhotoSlide[] = []

  chapters.forEach((chapter) => {
    const loc = chapter.photos[0]?.analysis?.location_guess || ''
    const time = chapter.photos[0]?.analysis?.time_of_day || ''
    chapter.photos.forEach((photo, i) => {
      slides.push({
        photo,
        isFirstInChapter: i === 0,
        chapterTitle: chapter.title,
        chapterLocation: loc,
        chapterTime: time,
      })
    })
  })

  return (
    <div className="h-screen overflow-y-auto snap-y snap-mandatory" style={{ scrollBehavior: 'smooth' }}>
      {slides.map((slide) => {
        const { photo, isFirstInChapter, chapterTitle, chapterLocation, chapterTime } = slide
        const analysis = photo.analysis
        return (
          <div
            key={photo.id}
            className="snap-start h-screen relative flex items-center justify-center"
          >
            {/* Full-bleed blurred background */}
            <img
              src={photo.preview}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              style={{ filter: 'brightness(0.35) saturate(0.7) blur(2px)', transform: 'scale(1.05)' }}
            />
            {/* Gradient overlay */}
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to top, ${isDark ? 'rgba(10,10,15,0.92)' : 'rgba(26,26,46,0.88)'} 0%, transparent 45%, transparent 55%, ${isDark ? 'rgba(10,10,15,0.4)' : 'rgba(26,26,46,0.3)'} 100%)`,
              }}
            />

            {/* Photo — large */}
            <div
              className="relative z-10 w-[88vw] max-w-lg"
              style={{
                aspectRatio: '3/4',
                borderRadius: '1.5rem',
                overflow: 'hidden',
                boxShadow: '0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)',
              }}
            >
              <img
                src={photo.preview}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>

            {/* Floating info card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="absolute bottom-6 left-4 right-4 z-10 mx-auto max-w-lg"
            >
              <div
                className="rounded-2xl px-5 py-4"
                style={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(40px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.12)'}`,
                }}
              >
                {/* Chapter title on first photo */}
                {isFirstInChapter && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.colors.accent }} />
                    <h3
                      className="text-base font-semibold"
                      style={{
                        fontFamily: theme.font.heading,
                        color: isDark ? '#E0E0E0' : '#F5F0E8',
                      }}
                    >
                      {chapterTitle}
                    </h3>
                  </div>
                )}
                {analysis && (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      {!isFirstInChapter && (
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.colors.accent }} />
                      )}
                      <span className="text-xs font-medium" style={{ color: theme.colors.accent }}>
                        {analysis.location_guess}
                      </span>
                      <span style={{ color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.3)' }}>·</span>
                      <span className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.45)' }}>
                        {analysis.time_of_day}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{
                      color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.8)',
                      fontFamily: theme.font.body,
                    }}>
                      {analysis.scene}
                    </p>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )
      })}
    </div>
  )
}

// === MEMORY SCROLL MODE ===
function MemoryScroll({ chapters, style, summary, coverImage }: {
  chapters: PhotoChapter[]; style: StyleType; summary: JourneySummary | null; coverImage: string | null
}) {
  const theme = STYLES[style]
  const isDark = style === 'cyber'
  const bgImageUrl = coverImage || theme.backgroundImage || ''

  return (
    <div className="min-h-screen">
      {/* Fixed background */}
      {bgImageUrl && (
        <div className="fixed inset-0 z-0">
          <img
            src={bgImageUrl}
            alt=""
            className="w-full h-full object-cover scale-105"
            style={{ filter: 'blur(2px) brightness(0.5) saturate(0.8)' }}
          />
          <div className="absolute inset-0" style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.65)' : 'rgba(0,0,0,0.4)' }} />
        </div>
      )}
      {!bgImageUrl && (
        <div className="fixed inset-0 z-0" style={{ backgroundColor: isDark ? '#0a0a0f' : '#1a1a2e' }} />
      )}

      {/* Scrollable content */}
      <div className="relative z-10 max-w-2xl mx-auto px-5 pb-20 pt-16">
        {/* Summary */}
        {summary && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="rounded-3xl p-6 md:p-8 mb-10"
            style={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(40px) saturate(180%)',
              WebkitBackdropFilter: 'blur(40px) saturate(180%)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.12)'}`,
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            }}
          >
            <div className="w-8 h-0.5 mb-4" style={{ backgroundColor: theme.colors.accent }} />
            <NarrativeBlock text={summary.text} fontFamily={theme.font.heading} />
          </motion.div>
        )}

        {!summary && (
          <div className="rounded-3xl p-6 md:p-8 mb-10" style={{
            backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(40px) saturate(180%)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.1)'}`,
          }}>
            <p className="animate-pulse text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.4)' }}>
              总结正在浮现...
            </p>
          </div>
        )}

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div
            className="absolute left-[7px] top-0 bottom-0 w-[1.5px]"
            style={{ backgroundColor: `${theme.colors.accent}20` }}
          />

          {chapters.map((chapter, i) => (
            <motion.div
              key={chapter.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * i }}
              className="relative pl-8 pb-10"
            >
              {/* Timeline dot */}
              <div
                className="absolute left-0 top-1.5 w-4 h-4 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.1)',
                  border: `2px solid ${theme.colors.accent}`,
                }}
              >
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.colors.accent }} />
              </div>

              {/* Chapter title */}
              <h3
                className="text-lg font-semibold mb-3"
                style={{
                  fontFamily: theme.font.heading,
                  color: isDark ? '#E0E0E0' : '#F5F0E8',
                }}
              >
                {chapter.title}
              </h3>

              {/* Photo strip — larger */}
              {chapter.photos.length > 0 && (
                <div className="flex gap-2.5 mb-4 overflow-x-auto pb-2" style={{ marginLeft: '-4px', paddingLeft: '4px', paddingRight: '4px' }}>
                  {chapter.photos.slice(0, 5).map((photo, pi) => (
                    <div
                      key={photo.id}
                      className="flex-shrink-0 rounded-xl overflow-hidden"
                      style={{
                        width: pi === 0 ? '140px' : '100px',
                        aspectRatio: pi === 0 ? '4/5' : '3/4',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                      }}
                    >
                      <img src={photo.preview} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}

              {/* Narrative */}
              {chapter.narrative && (
                <div
                  className="rounded-2xl p-4"
                  style={{
                    backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.07)',
                    backdropFilter: 'blur(30px) saturate(160%)',
                    WebkitBackdropFilter: 'blur(30px) saturate(160%)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.1)'}`,
                  }}
                >
                  <NarrativeBlock text={chapter.narrative.text} fontFamily={theme.font.heading} />
                </div>
              )}

              {!chapter.narrative && chapter.generatingNarrative && (
                <div className="rounded-2xl p-4" style={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.08)'}`,
                }}>
                  <p className="animate-pulse text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.35)' }}>
                    叙事浮现中...
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Share CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 text-center pb-8"
        >
          <button
            onClick={() => useAppStore.getState().setState('share')}
            className="px-8 py-3.5 rounded-full text-sm font-medium transition-all hover:scale-105 active:scale-95"
            style={{
              backgroundColor: theme.colors.accent,
              color: '#fff',
              boxShadow: `0 6px 30px ${theme.colors.accent}40`,
            }}
          >
            分享这段记忆
          </button>
        </motion.div>
      </div>
    </div>
  )
}

// === STAR MAP MODE ===
function StarMap({ chapters, style, summary, coverImage }: {
  chapters: PhotoChapter[]; style: StyleType; summary: JourneySummary | null; coverImage: string | null
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [points, setPoints] = useState<Array<{
    x: number; y: number; label: string; photoPreview: string; chapterIndex: number
  }>>([])
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  const theme = STYLES[style]
  const isDark = style === 'cyber'
  const accentColor = theme.colors.accent
  const lineColor = isDark ? 'rgba(0,255,212,0.2)' : `${theme.colors.accent}25`
  const glowColor = isDark ? 'rgba(0,255,212,0.4)' : `${theme.colors.accent}50`
  const textColor = isDark ? 'rgba(255,255,255,0.6)' : theme.colors.text
  const bgImageUrl = coverImage || theme.backgroundImage || ''

  // Calculate positions
  useEffect(() => {
    if (chapters.length === 0) return

    const allPhotos = chapters.flatMap((ch, ci) =>
      ch.photos
        .filter((p) => p.exif?.latitude && p.exif?.longitude)
        .map((p) => ({
          lat: p.exif!.latitude!,
          lng: p.exif!.longitude!,
          label: p.analysis?.location_guess || ch.title,
          preview: p.preview,
          chapterIndex: ci,
        }))
    )

    const photosWithGps = allPhotos.filter((p) => p.lat !== 0 && p.lng !== 0)

    if (photosWithGps.length === 0) {
      const fallbackPoints = chapters.flatMap((ch, ci) => {
        const totalItems = chapters.length
        if (ch.photos.length > 0) {
          return ch.photos.slice(0, 2).map((p, pi) => ({
            x: 0.1 + ((ci + pi * 0.3) / Math.max(totalItems, 1)) * 0.8,
            y: 0.15 + Math.sin(((ci + pi * 0.3) / Math.max(totalItems, 1)) * Math.PI) * 0.3 + pi * 0.05,
            label: p.analysis?.location_guess || ch.title,
            photoPreview: p.preview,
            chapterIndex: ci,
          }))
        }
        const t = ci / Math.max(totalItems - 1, 1)
        return [{
          x: 0.1 + t * 0.8,
          y: 0.2 + Math.sin(t * Math.PI) * 0.3,
          label: ch.title,
          photoPreview: '',
          chapterIndex: ci,
        }]
      })
      setPoints(fallbackPoints)
      return
    }

    const lats = photosWithGps.map((p) => p.lat)
    const lngs = photosWithGps.map((p) => p.lng)
    const minLat = Math.min(...lats), maxLat = Math.max(...lats)
    const minLng = Math.min(...lngs), maxLng = Math.max(...lngs)
    const latRange = maxLat - minLat || 0.01
    const lngRange = maxLng - minLng || 0.01

    setPoints(photosWithGps.map((p) => ({
      x: 0.08 + ((p.lng - minLng) / lngRange) * 0.84,
      y: 0.08 + ((p.lat - minLat) / latRange) * 0.84,
      label: p.label,
      photoPreview: p.preview,
      chapterIndex: p.chapterIndex,
    })))
  }, [chapters])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({ width: entry.contentRect.width, height: entry.contentRect.height })
      }
    })
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || points.length === 0 || dimensions.width === 0) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const w = dimensions.width
    const h = dimensions.height
    canvas.width = w * dpr
    canvas.height = h * dpr
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, w, h)

    const px = (p: typeof points[0]) => ({ x: p.x * w, y: (1 - p.y) * h + h * 0.05 })

    if (points.length > 1) {
      const first = px(points[0])
      // Glow line
      ctx.beginPath()
      ctx.moveTo(first.x, first.y)
      for (let i = 1; i < points.length; i++) {
        const prev = px(points[i - 1])
        const curr = px(points[i])
        const midY = (prev.y + curr.y) / 2 - 10
        ctx.quadraticCurveTo(prev.x + (curr.x - prev.x) * 0.5, midY, curr.x, curr.y)
      }
      ctx.strokeStyle = glowColor
      ctx.lineWidth = 4
      ctx.filter = 'blur(4px)'
      ctx.stroke()
      ctx.filter = 'none'

      // Sharp line
      ctx.beginPath()
      ctx.moveTo(first.x, first.y)
      for (let i = 1; i < points.length; i++) {
        const prev = px(points[i - 1])
        const curr = px(points[i])
        const midY = (prev.y + curr.y) / 2 - 10
        ctx.quadraticCurveTo(prev.x + (curr.x - prev.x) * 0.5, midY, curr.x, curr.y)
      }
      ctx.strokeStyle = lineColor
      ctx.lineWidth = 1.5
      ctx.stroke()
    }

    points.forEach((p, i) => {
      const { x, y } = px(p)
      const isHovered = hoveredPoint === i
      const glowRadius = isHovered ? 24 : 12
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowRadius)
      gradient.addColorStop(0, glowColor)
      gradient.addColorStop(1, 'transparent')
      ctx.beginPath()
      ctx.arc(x, y, glowRadius, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()

      const dotRadius = isHovered ? 6 : 4
      ctx.beginPath()
      ctx.arc(x, y, dotRadius, 0, Math.PI * 2)
      ctx.fillStyle = accentColor
      ctx.fill()

      if (isHovered || i === 0 || i === points.length - 1) {
        ctx.font = '12px system-ui, sans-serif'
        ctx.fillStyle = textColor
        ctx.textAlign = 'center'
        ctx.fillText(p.label, x, y - dotRadius - 10)
      }
    })
  }, [points, dimensions, hoveredPoint, accentColor, lineColor, glowColor, textColor])

  if (chapters.length === 0) return null

  return (
    <div className="min-h-screen relative">
      {/* Full-bleed background */}
      {bgImageUrl && (
        <div className="fixed inset-0 z-0">
          <img src={bgImageUrl} alt="" className="w-full h-full object-cover scale-105"
            style={{ filter: 'blur(3px) brightness(0.35) saturate(0.7)' }} />
          <div className="absolute inset-0" style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.45)' }} />
        </div>
      )}
      {!bgImageUrl && (
        <div className="fixed inset-0 z-0" style={{ backgroundColor: isDark ? '#0a0a0f' : '#1a1a2e' }} />
      )}

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-5 pb-20 pt-16">
        {/* Summary */}
        {summary && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="rounded-3xl p-6 md:p-8 mb-8"
            style={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(40px) saturate(180%)',
              WebkitBackdropFilter: 'blur(40px) saturate(180%)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.12)'}`,
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            }}
          >
            <div className="w-8 h-0.5 mb-4" style={{ backgroundColor: theme.colors.accent }} />
            <NarrativeBlock text={summary.text} fontFamily={theme.font.heading} />
          </motion.div>
        )}

        {/* Constellation map — large */}
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="relative w-full rounded-3xl overflow-hidden"
          style={{
            height: Math.max(400, dimensions.width * 0.7),
            backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.1)'}`,
          }}
        >
          <canvas
            ref={canvasRef}
            className="absolute inset-0"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const mx = e.clientX - rect.left
              const my = e.clientY - rect.top
              const hovered = points.findIndex((p) => {
                const x = p.x * rect.width
                const y = (1 - p.y) * rect.height + rect.height * 0.05
                return Math.hypot(mx - x, my - y) < 25
              })
              setHoveredPoint(hovered >= 0 ? hovered : null)
            }}
            onMouseLeave={() => setHoveredPoint(null)}
          />

          {/* Hovered photo thumbnail — larger */}
          {hoveredPoint !== null && points[hoveredPoint] && points[hoveredPoint].photoPreview && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute bottom-4 left-4 rounded-xl overflow-hidden shadow-2xl border border-white/10"
              style={{ width: '80px', height: '80px' }}
            >
              <img src={points[hoveredPoint].photoPreview} alt="" className="w-full h-full object-cover" />
            </motion.div>
          )}

          {/* Hovered label — larger, bottom right */}
          {hoveredPoint !== null && points[hoveredPoint] && (
            <div
              className="absolute bottom-4 right-4 px-3 py-2 rounded-xl text-sm font-medium"
              style={{
                backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(20px)',
                color: '#fff',
                border: `1px solid rgba(255,255,255,0.1)`,
              }}
            >
              {points[hoveredPoint].label}
            </div>
          )}
        </motion.div>

        {/* Chapter cards below map */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-3">
          {chapters.map((ch) => (
            <div
              key={ch.id}
              className="rounded-xl overflow-hidden"
              style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.07)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.1)'}`,
              }}
            >
              {ch.photos[0] && (
                <div className="w-full aspect-video overflow-hidden">
                  <img src={ch.photos[0].preview} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="px-3 py-2.5">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.colors.accent }} />
                  <span className="text-xs font-medium truncate" style={{
                    color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.9)',
                    fontFamily: theme.font.heading,
                  }}>
                    {ch.title}
                  </span>
                </div>
                {ch.photos[0]?.analysis && (
                  <span className="text-[10px]" style={{ color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.45)' }}>
                    {ch.photos[0].analysis.location_guess}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Share CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center"
        >
          <button
            onClick={() => useAppStore.getState().setState('share')}
            className="px-8 py-3.5 rounded-full text-sm font-medium transition-all hover:scale-105 active:scale-95"
            style={{
              backgroundColor: theme.colors.accent,
              color: '#fff',
              boxShadow: `0 6px 30px ${theme.colors.accent}40`,
            }}
          >
            分享这段记忆
          </button>
        </motion.div>
      </div>
    </div>
  )
}

// === MAIN EXPERIENCE PAGE ===
export function ExperiencePage() {
  const chapters = useAppStore((s) => s.chapters)
  const updateChapter = useAppStore((s) => s.updateChapter)
  const style = useAppStore((s) => s.style)
  const setStyle = useAppStore((s) => s.setStyle)
  const coverImage = useAppStore((s) => s.coverImage)
  const setCoverImage = useAppStore((s) => s.setCoverImage)
  const generatingCover = useAppStore((s) => s.generatingCover)
  const setGeneratingCover = useAppStore((s) => s.setGeneratingCover)
  const summary = useAppStore((s) => s.summary)
  const setSummary = useAppStore((s) => s.setSummary)
  const generatingSummary = useAppStore((s) => s.generatingSummary)
  const setGeneratingSummary = useAppStore((s) => s.setGeneratingSummary)

  const [viewMode, setViewMode] = useState<ViewMode>('photo')

  const narrativeStarted = useRef<Set<string>>(new Set())
  const coverStarted = useRef(false)
  const summaryStarted = useRef(false)
  const theme = STYLES[style]
  const isDark = style === 'cyber'

  // Generate narratives for chapters
  useEffect(() => {
    chapters.forEach((chapter) => {
      if (narrativeStarted.current.has(chapter.id)) return
      if (chapter.narrative) return

      narrativeStarted.current.add(chapter.id)
      updateChapter(chapter.id, { generatingNarrative: true })

      fetch('/api/narrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analyses: chapter.photos.map((p) => p.analysis).filter(Boolean),
          style,
        }),
      })
        .then(async (res) => {
          const reader = res.body?.getReader()
          if (!reader) return
          let text = ''
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            const chunk = new TextDecoder().decode(value)
            for (const line of chunk.split('\n')) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') break
                try {
                  const parsed = JSON.parse(data)
                  text += parsed.text || ''
                } catch {}
              }
            }
          }
          updateChapter(chapter.id, {
            narrative: { text, style },
            generatingNarrative: false,
          })
        })
        .catch(() => {
          updateChapter(chapter.id, { generatingNarrative: false })
        })
    })
  }, [chapters, style, updateChapter])

  // Generate cover image
  useEffect(() => {
    if (coverStarted.current) return
    if (coverImage) return
    if (generatingCover) return
    if (chapters.length === 0) return

    const allNarrativesReady = chapters.every((ch) => ch.narrative !== null)
    if (!allNarrativesReady) return

    coverStarted.current = true

    const uniqueLocations = new Set<string>()
    const keyScenes: string[] = []

    for (const chapter of chapters) {
      for (const photo of chapter.photos) {
        if (photo.analysis) {
          if (photo.analysis.location_guess) uniqueLocations.add(photo.analysis.location_guess)
          keyScenes.push(photo.analysis.scene)
        }
      }
    }

    if (keyScenes.length === 0) return

    const earliestDate = chapters.reduce(
      (min, ch) => (ch.startTime < min ? ch.startTime : min),
      chapters[0].startTime
    )
    const latestDate = chapters.reduce(
      (max, ch) => (ch.endTime > max ? ch.endTime : max),
      chapters[0].endTime
    )
    const timeframe = `${earliestDate.toLocaleDateString('zh-CN', { month: 'long', year: 'numeric' })} - ${latestDate.toLocaleDateString('zh-CN', { month: 'long', year: 'numeric' })}`

    const locationsStr = Array.from(uniqueLocations).join(', ')
    const scenesStr = keyScenes.slice(0, 8).join('; ')

    const scenePromptPrefix = theme.scenePrompt || 'Create a panoramic artistic illustration that captures the mood and atmosphere.'
    const prompt = `${scenePromptPrefix} A panoramic artistic illustration that captures the journey through ${locationsStr} during ${timeframe}, in ${theme.label} artistic style. The scene should weave together: ${scenesStr}`

    setGeneratingCover(true)
    fetch('/api/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, mode: 'scene' }),
    })
      .then((r) => r.json())
      .then((data) => {
        setCoverImage(data.image || null)
        setGeneratingCover(false)
      })
      .catch(() => {
        setGeneratingCover(false)
      })
  }, [chapters, coverImage, generatingCover, theme.scenePrompt, theme.label, setCoverImage, setGeneratingCover])

  // Generate summary after all narratives are ready
  useEffect(() => {
    if (summaryStarted.current) return
    if (summary) return
    if (generatingSummary) return
    if (chapters.length === 0) return

    const allNarrativesReady = chapters.every((ch) => ch.narrative !== null)
    if (!allNarrativesReady) return

    summaryStarted.current = true

    const chapterNarratives = chapters
      .filter((ch) => ch.narrative)
      .map((ch) => ({ title: ch.title, text: ch.narrative!.text }))

    if (chapterNarratives.length === 0) return

    setGeneratingSummary(true)
    fetch('/api/summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chapterNarratives, style }),
    })
      .then(async (res) => {
        const reader = res.body?.getReader()
        if (!reader) return
        let text = ''
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = new TextDecoder().decode(value)
          for (const line of chunk.split('\n')) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') break
              try {
                const parsed = JSON.parse(data)
                text += parsed.text || ''
              } catch {}
            }
          }
        }
        setSummary({ text, style })
        setGeneratingSummary(false)
      })
      .catch(() => {
        setGeneratingSummary(false)
      })
  }, [chapters, summary, generatingSummary, style, setSummary, setGeneratingSummary])

  const modeLabels: Record<ViewMode, string> = {
    photo: '照片流',
    scroll: '记忆长卷',
    map: '星图',
  }

  const modeIcons: Record<ViewMode, string> = {
    photo: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
    scroll: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    map: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z',
  }

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: isDark ? '#0a0a0f' : '#1a1a2e' }}>
      {/* Mode switcher — fixed top-left */}
      <div className="fixed top-4 left-4 z-50">
        <div
          className="flex gap-1 p-1 rounded-2xl"
          style={{
            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(40px) saturate(180%)',
            WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.12)'}`,
          }}
        >
          {(Object.keys(modeLabels) as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className="relative px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5"
              style={{
                backgroundColor: viewMode === mode ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.15)') : 'transparent',
                color: viewMode === mode ? theme.colors.accent : (isDark ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.5)'),
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={modeIcons[mode]} />
              </svg>
              <span className="hidden sm:inline">{modeLabels[mode]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Style indicator — fixed top-right */}
      <button
        onClick={() => {
          const styles = Object.keys(STYLES) as StyleType[]
          const currentIdx = styles.indexOf(style)
          const nextStyle = styles[(currentIdx + 1) % styles.length]
          if (nextStyle !== 'custom') setStyle(nextStyle)
        }}
        className="fixed top-4 right-4 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all"
        style={{
          backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.1)',
          color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.6)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.12)'}`,
        }}
      >
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.colors.accent }} />
        <span>{theme.label}</span>
      </button>

      {/* Content by mode */}
      <AnimatePresence mode="wait">
        {viewMode === 'photo' && (
          <motion.div key="photo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="min-h-screen">
            <PhotoFlow chapters={chapters} style={style} />
          </motion.div>
        )}
        {viewMode === 'scroll' && (
          <motion.div key="scroll" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="min-h-screen">
            <MemoryScroll chapters={chapters} style={style} summary={summary} coverImage={coverImage} />
          </motion.div>
        )}
        {viewMode === 'map' && (
          <motion.div key="map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="min-h-screen">
            <StarMap chapters={chapters} style={style} summary={summary} coverImage={coverImage} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}