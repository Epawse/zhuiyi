'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'
import { STYLES } from '@/types/style'
import { HistoryEntry } from '@/types'

export function SharePage() {
  const chapters = useAppStore((s) => s.chapters)
  const style = useAppStore((s) => s.style)
  const addHistory = useAppStore((s) => s.addHistory)
  const reset = useAppStore((s) => s.reset)
  const theme = STYLES[style]
  const isDark = style === 'cyber'

  const coverImage = useAppStore((s) => s.coverImage)
  const summary = useAppStore((s) => s.summary)

  useEffect(() => {
    if (chapters.length === 0) return
    // Wait for at least one narrative to be ready
    if (!chapters.some((ch) => ch.narrative)) return

    const dedupKey = [
      style,
      ...chapters.map((ch) => `${ch.title}:${(ch.narrative?.text?.length ?? 0)}`),
    ].join('|')

    const existing = useAppStore.getState().history.some(
      (h) => h.id === dedupKey
    )
    if (existing) return

    const entry: HistoryEntry = {
      id: dedupKey,
      createdAt: new Date().toISOString(),
      style,
      chapterCount: chapters.length,
      chapterSummaries: chapters.map((ch) => ({
        title: ch.title,
        location: ch.photos[0]?.analysis?.location_guess || '未知地点',
        narrativePreview: ch.narrative?.text?.slice(0, 60) || '',
      })),
      coverImage: coverImage,
      narratives: chapters
        .filter((ch) => ch.narrative)
        .map((ch) => ({ title: ch.title, text: ch.narrative!.text })),
      summary: summary?.text || undefined,
    }
    addHistory(entry)
  }, [chapters, style, coverImage, summary, addHistory])

  const bgBase = isDark ? '#0a0a0f' : '#1a1a2e'
  const cardBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.06)'

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 noise-overlay"
      style={{ backgroundColor: bgBase, color: isDark ? '#E0E0E0' : '#F5F0E8' }}
    >
      {theme.backgroundImage && (
        <div
          className="absolute inset-0 opacity-15 bg-cover bg-center"
          style={{ backgroundImage: `url(${theme.backgroundImage})` }}
        />
      )}

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative z-10 max-w-md w-full"
      >
        <div
          className="rounded-3xl p-8 shadow-2xl backdrop-blur-xl"
          style={{
            backgroundColor: cardBg,
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.1)'}`,
          }}
        >
          <h2
            className="text-2xl mb-6"
            style={{ fontFamily: theme.font.heading }}
          >
            追忆 · {theme.label}
          </h2>

          {chapters.map((chapter, i) => (
            <motion.div
              key={chapter.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className="mb-6 pb-6"
              style={{
                borderBottom: i < chapters.length - 1 ? `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.08)'}` : 'none',
              }}
            >
              <h3 className="text-sm font-medium mb-2 opacity-60">{chapter.title}</h3>
              {chapter.narrative && (
                <p
                  className="text-sm leading-relaxed mb-3"
                  style={{ fontFamily: theme.font.body }}
                >
                  {chapter.narrative.text}
                </p>
              )}
              <div className="flex gap-1.5 overflow-x-auto">
                {chapter.photos.slice(0, 4).map((photo) => (
                  <div key={photo.id} className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={photo.preview} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </motion.div>
          ))}

          <div className="flex gap-3 mt-2">
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: '追忆', text: '看看我的追忆故事' })
                }
              }}
              className="flex-1 py-2.5 rounded-full text-white text-sm font-medium transition-all hover:scale-[1.02] active:scale-95"
              style={{
                backgroundColor: theme.colors.accent,
                boxShadow: `0 4px 20px ${theme.colors.accent}25`,
              }}
            >
              分享
            </button>
            <button
              onClick={reset}
              className="flex-1 py-2.5 rounded-full text-sm transition-all hover:scale-[1.02] active:scale-95"
              style={{
                borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.2)',
                color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.6)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.15)'}`,
              }}
            >
              重新开始
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}