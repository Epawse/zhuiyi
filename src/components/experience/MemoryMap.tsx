'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { PhotoChapter, STYLES, StyleType } from '@/types'

interface MemoryMapProps {
  chapters: PhotoChapter[]
  style: StyleType
}

interface MapPoint {
  x: number
  y: number
  label: string
  photoPreview: string
  chapterIndex: number
}

export function MemoryMap({ chapters, style }: MemoryMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [points, setPoints] = useState<MapPoint[]>([])
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  const theme = STYLES[style]
  const isDark = style === 'cyber'

  const accentColor = theme.colors.accent
  const textColor = isDark ? 'rgba(255,255,255,0.6)' : theme.colors.text
  const lineColor = isDark ? 'rgba(0,255,212,0.2)' : `${theme.colors.accent}25`
  const glowColor = isDark ? 'rgba(0,255,212,0.4)' : `${theme.colors.accent}50`

  // Calculate positions from GPS coordinates
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

    // Also include photos without GPS but with location guesses
    const photosWithGps = allPhotos.filter((p) => p.lat !== 0 && p.lng !== 0)

    if (photosWithGps.length === 0) {
      // Fallback: arrange points in a gentle arc based on chapter order
      const fallbackPoints: MapPoint[] = []
      chapters.forEach((ch, ci) => {
        ch.photos.slice(0, 2).forEach((p, pi) => {
          const t = (ci + pi * 0.3) / Math.max(chapters.length, 1)
          fallbackPoints.push({
            x: 0.15 + t * 0.7,
            y: 0.3 + Math.sin(t * Math.PI) * 0.2 + pi * 0.05,
            label: p.analysis?.location_guess || ch.title,
            photoPreview: p.preview,
            chapterIndex: ci,
          })
        })
      })
      setPoints(fallbackPoints)
      return
    }

    // Normalize GPS to 0-1 range with padding
    const lats = photosWithGps.map((p) => p.lat)
    const lngs = photosWithGps.map((p) => p.lng)
    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)
    const minLng = Math.min(...lngs)
    const maxLng = Math.max(...lngs)

    const latRange = maxLat - minLat || 0.01
    const lngRange = maxLng - minLng || 0.01

    const mapPoints: MapPoint[] = photosWithGps.map((p) => ({
      x: 0.12 + ((p.lng - minLng) / lngRange) * 0.76,
      y: 0.12 + ((p.lat - minLat) / latRange) * 0.76,
      label: p.label,
      photoPreview: p.preview,
      chapterIndex: p.chapterIndex,
    }))

    setPoints(mapPoints)
  }, [chapters])

  // Resize observer
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        })
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

    // Clear
    ctx.clearRect(0, 0, w, h)

    const px = (p: MapPoint) => ({ x: p.x * w, y: (1 - p.y) * h + h * 0.05 })

    // Draw connecting lines
    if (points.length > 1) {
      ctx.beginPath()
      const first = px(points[0])
      ctx.moveTo(first.x, first.y)

      for (let i = 1; i < points.length; i++) {
        const prev = px(points[i - 1])
        const curr = px(points[i])
        const midX = (prev.x + curr.x) / 2
        const midY = (prev.y + curr.y) / 2 - 10
        ctx.quadraticCurveTo(prev.x + (curr.x - prev.x) * 0.5, midY, curr.x, curr.y)
      }

      ctx.strokeStyle = lineColor
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Glow line
      ctx.beginPath()
      ctx.moveTo(first.x, first.y)
      for (let i = 1; i < points.length; i++) {
        const prev = px(points[i - 1])
        const curr = px(points[i])
        const midX = (prev.x + curr.x) / 2
        const midY = (prev.y + curr.y) / 2 - 10
        ctx.quadraticCurveTo(prev.x + (curr.x - prev.x) * 0.5, midY, curr.x, curr.y)
      }
      ctx.strokeStyle = glowColor
      ctx.lineWidth = 4
      ctx.filter = 'blur(4px)'
      ctx.stroke()
      ctx.filter = 'none'
    }

    // Draw points
    points.forEach((p, i) => {
      const { x, y } = px(p)
      const isHovered = hoveredPoint === i

      // Outer glow
      const glowRadius = isHovered ? 20 : 10
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowRadius)
      gradient.addColorStop(0, glowColor)
      gradient.addColorStop(1, 'transparent')
      ctx.beginPath()
      ctx.arc(x, y, glowRadius, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()

      // Core dot
      const dotRadius = isHovered ? 5 : 3.5
      ctx.beginPath()
      ctx.arc(x, y, dotRadius, 0, Math.PI * 2)
      ctx.fillStyle = accentColor
      ctx.fill()

      // Label (only when hovered or for first/last)
      if (isHovered || i === 0 || i === points.length - 1) {
        ctx.font = '11px system-ui, sans-serif'
        ctx.fillStyle = textColor
        ctx.textAlign = 'center'
        ctx.fillText(p.label, x, y - dotRadius - 8)
      }
    })
  }, [points, dimensions, hoveredPoint, accentColor, lineColor, glowColor, textColor])

  if (points.length === 0) return null

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 0.3 }}
      className="relative w-full rounded-2xl overflow-hidden"
      style={{
        height: Math.min(300, dimensions.width * 0.5 || 200),
        backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : `${theme.colors.surface}40`,
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : `${theme.colors.accent}15`}`,
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
            return Math.hypot(mx - x, my - y) < 20
          })
          setHoveredPoint(hovered >= 0 ? hovered : null)
        }}
        onMouseLeave={() => setHoveredPoint(null)}
      />

      {/* Hovered photo thumbnail */}
      {hoveredPoint !== null && points[hoveredPoint] && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-3 left-3 w-14 h-14 rounded-lg overflow-hidden shadow-lg border border-white/10"
        >
          <img
            src={points[hoveredPoint].photoPreview}
            alt=""
            className="w-full h-full object-cover"
          />
        </motion.div>
      )}
    </motion.div>
  )
}