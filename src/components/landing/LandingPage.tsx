'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'
import { UploadArea } from './UploadArea'
import { STYLES } from '@/types/style'
import { StyleType, HistoryEntry, PhotoChapter, ChapterNarrative } from '@/types'

// Stagger animation variants
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
} as const

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
  },
} as const

const uploadVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.9, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number], delay: 0.1 },
  },
} as const

export function LandingPage() {
  const setStyle = useAppStore((s) => s.setStyle)
  const style = useAppStore((s) => s.style)
  const history = useAppStore((s) => s.history)
  const clearHistory = useAppStore((s) => s.clearHistory)
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    useAppStore.getState().hydrate()
  }, [])

  const theme = STYLES[style]

  // Style-dependent background tint
  const bgTintMap: Record<StyleType, { from: string; via: string; to: string }> = {
    ancient: { from: '#0f0e0a', via: '#1a1710', to: '#2a2418' },
    proust: { from: '#0a0a0f', via: '#0f0f1a', to: '#1a1a2e' },
    cyber: { from: '#050508', via: '#080812', to: '#0e0e1e' },
    custom: { from: '#0a0a0f', via: '#10101e', to: '#1a1a2e' },
  }
  const bgTint = bgTintMap[style] ?? bgTintMap.proust

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden bg-[#0a0a0f]">
      {/* Background gradient layers - style-tinted */}
      <div
        className="absolute inset-0 transition-colors duration-1000"
        style={{
          background: `linear-gradient(to bottom, ${bgTint.from}, ${bgTint.via}, ${bgTint.to})`,
        }}
      />

      {/* AI-generated landing background */}
      <div
        className="absolute inset-0 opacity-30 bg-cover bg-center transition-opacity duration-700"
        style={{ backgroundImage: 'url(/bg-landing.jpg)' }}
      />

      {/* Center warm glow - uses theme accent color */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full opacity-[0.09] transition-all duration-1000"
        style={{
          background: `radial-gradient(ellipse at center, ${theme.colors.accent} 0%, ${theme.colors.secondary} 30%, transparent 70%)`,
        }}
      />

      {/* Subtle noise/grain texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '256px 256px',
        }}
      />

      {/* Animated grain - CSS animation for subtle movement */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.015]">
        <div
          className="absolute inset-0 animate-pulse"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: '512px 512px',
            animationDuration: '8s',
          }}
        />
      </div>

      {/* History button - top right glass pill */}
      <motion.button
        onClick={() => setShowHistory(!showHistory)}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="absolute top-4 right-4 z-50 flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/5 backdrop-blur border border-white/10 text-white/50 hover:bg-white/10 hover:text-white/70 transition-all text-sm"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span>历史记录</span>
        {history.length > 0 && (
          <span className="bg-white/15 text-white/80 text-[10px] rounded-full px-1.5 py-0.5 min-w-[18px] text-center">{history.length}</span>
        )}
      </motion.button>

      {/* History panel */}
      {showHistory && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="absolute top-16 right-4 w-80 max-h-[70vh] overflow-y-auto bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/40 p-4 z-50"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-white/70">历史记录</h3>
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="text-xs text-white/30 hover:text-red-400 transition-colors"
              >
                清空
              </button>
            )}
          </div>
          {history.length === 0 ? (
            <p className="text-sm text-white/25 py-4 text-center">还没有历史记录，上传照片开始你的第一次追忆</p>
          ) : (
            <div className="space-y-2">
              {history.map((entry) => (
                <HistoryCard key={entry.id} entry={entry} />
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Main content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-col items-center w-full max-w-2xl"
      >
        {/* Title */}
        <motion.h1
          variants={itemVariants}
          className="text-6xl md:text-8xl font-serif mb-4 text-center tracking-wider"
          style={{
            fontFamily: '"Cormorant Garamond", "Noto Serif SC", "STSong", Georgia, serif',
            textShadow: '0 0 60px rgba(212, 165, 116, 0.2), 0 0 120px rgba(212, 165, 116, 0.08)',
            color: '#F5F0E8',
          }}
        >
          追忆
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          className="text-base md:text-lg text-white/40 mb-14 text-center max-w-md tracking-wide"
          style={{
            fontFamily: '"Noto Serif SC", Georgia, serif',
          }}
        >
          上传照片，让AI唤醒你的记忆
        </motion.p>

        {/* Upload area */}
        <motion.div variants={uploadVariants} className="w-full flex justify-center">
          <UploadArea />
        </motion.div>

        {/* Style selector pills */}
        <motion.div
          variants={itemVariants}
          className="mt-12 flex flex-wrap justify-center gap-2.5"
        >
          {(Object.keys(STYLES) as StyleType[]).map((key) => {
            const s = STYLES[key]
            const isActive = style === key
            return (
              <motion.button
                key={key}
                onClick={() => setStyle(key)}
                className="relative px-5 py-2 rounded-full text-sm transition-colors"
                style={{
                  fontFamily: s.id === 'ancient' ? '"Noto Serif SC", serif' : s.id === 'cyber' ? '"JetBrains Mono", monospace' : 'inherit',
                  color: isActive ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.45)',
                  border: `1px solid ${isActive ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'}`,
                  backgroundColor: isActive ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
                }}
                whileHover={{
                  backgroundColor: isActive ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)',
                  borderColor: isActive ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.12)',
                }}
                whileTap={{ scale: 0.97 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeStyleGlow"
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `radial-gradient(ellipse at center, ${s.colors.accent}15 0%, transparent 70%)`,
                    }}
                    transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                  />
                )}
                <span className="relative z-10">{s.label}</span>
              </motion.button>
            )
          })}
        </motion.div>

        {/* Hint text */}
        <motion.p
          variants={itemVariants}
          className="mt-6 text-xs text-white/20 tracking-wider"
        >
          选择风格后上传照片开始
        </motion.p>
      </motion.div>
    </div>
  )
}

function HistoryCard({ entry }: { entry: HistoryEntry }) {
  const theme = STYLES[entry.style]

  const timeStr = new Date(entry.createdAt).toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const handleClick = () => {
    const store = useAppStore.getState()
    store.setStyle(entry.style)
    if (entry.coverImage) store.setCoverImage(entry.coverImage)

    // Restore chapters with narratives if available
    if (entry.narratives && entry.narratives.length > 0) {
      const restoredChapters: PhotoChapter[] = entry.narratives.map((n, i) => ({
        id: `hist-${entry.id}-ch${i}`,
        title: n.title,
        photos: [],
        startTime: new Date(),
        endTime: new Date(),
        centerLat: 0,
        centerLng: 0,
        narrative: { text: n.text, style: entry.style } as ChapterNarrative,
        generatingNarrative: false,
      }))
      store.setChapters(restoredChapters)
      store.setState('experience')
    }
  }

  return (
    <div
      onClick={handleClick}
      className="flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-white/5 border border-transparent hover:border-white/5 cursor-pointer"
    >
      <div
        className="w-1 h-8 rounded-full flex-shrink-0 opacity-60"
        style={{ backgroundColor: theme.colors.accent }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-white/60">{theme.label}</span>
          <span className="text-xs text-white/25">
            {entry.chapterCount} 篇章 · {timeStr}
          </span>
        </div>
        {entry.chapterSummaries[0] && (
          <p className="text-xs text-white/25 truncate mt-0.5">
            {entry.chapterSummaries[0].narrativePreview || entry.chapterSummaries[0].location}
          </p>
        )}
      </div>
    </div>
  )
}