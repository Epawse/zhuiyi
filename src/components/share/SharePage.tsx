'use client'

import { useEffect, useRef, useState } from 'react'
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

  // Save to history
  useEffect(() => {
    if (chapters.length === 0) return
    if (!chapters.some((ch) => ch.narrative)) return

    const dedupKey = [
      style,
      ...chapters.map((ch) => `${ch.title}:${(ch.narrative?.text?.length ?? 0)}`),
    ].join('|')

    if (useAppStore.getState().history.some((h) => h.id === dedupKey)) return

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
      coverImage,
      narratives: chapters
        .filter((ch) => ch.narrative)
        .map((ch) => ({ title: ch.title, text: ch.narrative!.text })),
      summary: summary?.text || undefined,
    }
    addHistory(entry)
  }, [chapters, style, coverImage, summary, addHistory])

  const bgBase = isDark ? '#0a0a0f' : '#1a1a2e'

  // Collect all unique locations
  const locations = Array.from(new Set(
    chapters
      .map((ch) => ch.photos[0]?.analysis?.location_guess)
      .filter(Boolean) as string[]
  ))

  return (
    <div
      className="min-h-screen flex flex-col items-center py-8 px-4 noise-overlay"
      style={{ backgroundColor: bgBase, color: isDark ? '#E0E0E0' : '#F5F0E8' }}
    >
      {theme.backgroundImage && (
        <div
          className="fixed inset-0 opacity-15 bg-cover bg-center"
          style={{ backgroundImage: `url(${theme.backgroundImage})` }}
        />
      )}

      {/* === 9:16 Share Card === */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative z-10 w-full max-w-sm"
      >
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            aspectRatio: '9/16',
            background: `linear-gradient(to bottom, ${isDark ? 'rgba(10,10,15,0.95)' : 'rgba(26,26,46,0.95)'}, ${isDark ? 'rgba(10,10,15,0.98)' : 'rgba(26,26,46,0.98)'})`,
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.1)'}`,
            boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(40px)',
          }}
        >
          {/* Cover image area — top 35% */}
          <div className="relative" style={{ height: '35%' }}>
            {coverImage ? (
              <>
                <img
                  src={coverImage}
                  alt=""
                  className="w-full h-full object-cover"
                  style={{ filter: 'brightness(0.7) saturate(0.8)' }}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(to bottom, transparent 40%, ${isDark ? 'rgba(10,10,15,1)' : 'rgba(26,26,46,1)'})`,
                  }}
                />
              </>
            ) : (
              <div
                className="w-full h-full"
                style={{
                  background: `radial-gradient(ellipse at 50% 30%, ${theme.colors.accent}15, transparent 60%), ${isDark ? '#0a0a0f' : '#1a1a2e'}`,
                }}
              />
            )}

            {/* Title overlay */}
            <div className="absolute bottom-4 left-5 right-5">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.colors.accent }} />
                <span className="text-xs font-medium" style={{ color: theme.colors.accent }}>
                  {theme.label}
                </span>
              </div>
              <h2
                className="text-2xl"
                style={{ fontFamily: theme.font.heading, color: isDark ? '#E0E0E0' : '#F5F0E8' }}
              >
                追忆
              </h2>
            </div>
          </div>

          {/* Summary — 15% */}
          <div className="px-5 pt-3" style={{ height: '15%' }}>
            {summary && (
              <p
                className="text-sm leading-relaxed line-clamp-3"
                style={{ fontFamily: theme.font.body, color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.8)' }}
              >
                {summary.text}
              </p>
            )}
          </div>

          {/* Chapter cards — 40% */}
          <div className="px-5 overflow-y-auto" style={{ height: '40%' }}>
            <div className="space-y-3">
              {chapters.map((chapter, i) => (
                <div
                  key={chapter.id}
                  className="rounded-xl p-3"
                  style={{
                    backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.08)'}`,
                  }}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.colors.accent }} />
                    <span className="text-xs font-medium" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.8)' }}>
                      {chapter.title}
                    </span>
                    {chapter.photos[0]?.analysis && (
                      <span className="text-[10px] ml-auto" style={{ color: theme.colors.accent }}>
                        {chapter.photos[0].analysis.location_guess}
                      </span>
                    )}
                  </div>
                  {chapter.narrative && (
                    <p
                      className="text-xs leading-relaxed line-clamp-2"
                      style={{ fontFamily: theme.font.body, color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.6)' }}
                    >
                      {chapter.narrative.text}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer — 10% */}
          <div className="px-5 flex items-center justify-between" style={{ height: '10%' }}>
            <div className="flex items-center gap-1.5">
              {locations.slice(0, 3).map((loc, i) => (
                <span key={i} className="text-[10px]" style={{ color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.4)' }}>
                  {i > 0 && '·'}{loc}
                </span>
              ))}
            </div>
            <span className="text-[10px]" style={{ color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.25)' }}>
              追忆 · AI记忆叙事
            </span>
          </div>
        </div>
      </motion.div>

      {/* Action buttons — outside the card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="relative z-10 flex gap-3 mt-6 w-full max-w-sm"
      >
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: '追忆', text: '看看我的追忆故事' })
            }
          }}
          className="flex-1 py-3 rounded-full text-white text-sm font-medium transition-all hover:scale-[1.02] active:scale-95"
          style={{
            backgroundColor: theme.colors.accent,
            boxShadow: `0 4px 20px ${theme.colors.accent}25`,
          }}
        >
          分享
        </button>
        <button
          onClick={reset}
          className="flex-1 py-3 rounded-full text-sm transition-all hover:scale-[1.02] active:scale-95"
          style={{
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.15)'}`,
            color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.6)',
          }}
        >
          重新开始
        </button>
      </motion.div>
    </div>
  )
}