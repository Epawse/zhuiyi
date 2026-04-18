'use client'

import { useAppStore } from '@/store/useAppStore'
import { STYLES } from '@/types/style'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StyleType, PhotoAnalysis } from '@/types'
import { MemoryMap } from './MemoryMap'

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

export function ExperiencePage() {
  const chapters = useAppStore((s) => s.chapters)
  const updateChapter = useAppStore((s) => s.updateChapter)
  const style = useAppStore((s) => s.style)
  const setStyle = useAppStore((s) => s.setStyle)
  const coverImage = useAppStore((s) => s.coverImage)
  const setCoverImage = useAppStore((s) => s.setCoverImage)
  const generatingCover = useAppStore((s) => s.generatingCover)
  const setGeneratingCover = useAppStore((s) => s.setGeneratingCover)
  const [activeChapter, setActiveChapter] = useState(0)
  const narrativeStarted = useRef<Set<string>>(new Set())
  const coverStarted = useRef(false)

  const theme = STYLES[style]
  const isDark = style === 'cyber'
  const isAncient = style === 'ancient'

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

  const currentChapter = chapters[activeChapter]

  const bgBase = isDark ? '#0a0a0f' : isAncient ? '#F5F0E8' : '#FAF8F5'
  const textBase = isDark ? '#E0E0E0' : isAncient ? '#2C2C2C' : '#5C3D2E'

  return (
    <div
      className="min-h-screen transition-colors duration-1000 noise-overlay"
      style={{ backgroundColor: bgBase, color: textBase }}
    >
      {theme.backgroundImage && (
        <div
          className="fixed inset-0 opacity-25 bg-cover bg-center transition-opacity duration-1500"
          style={{ backgroundImage: `url(${theme.backgroundImage})` }}
        />
      )}

      {/* Dark overlay for readability */}
      {theme.backgroundImage && (
        <div
          className="fixed inset-0 transition-opacity duration-1000"
          style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.15)' }}
        />
      )}

      {/* Full-bleed hero cover image */}
      {coverImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative w-full"
          style={{ height: '60vh' }}
        >
          <img
            src={coverImage}
            alt="记忆长卷"
            className="w-full h-full object-cover"
          />
          {/* Gradient overlay at bottom for text readability */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to top, ${bgBase} 0%, ${bgBase}99 5%, transparent 40%, transparent 80%, ${bgBase}33 100%)`,
            }}
          />
        </motion.div>
      )}

      {/* Cover placeholder while generating */}
      {generatingCover && !coverImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full flex items-center justify-center"
          style={{ height: '40vh', backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : theme.colors.surface }}
        >
          <span className="text-sm animate-pulse" style={{ color: isDark ? 'rgba(255,255,255,0.3)' : theme.colors.textMuted }}>
            记忆长卷正在浮现...
          </span>
        </motion.div>
      )}

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">
        {/* Style switcher */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex gap-2 mb-8 overflow-x-auto pb-2"
        >
          {(Object.keys(STYLES) as StyleType[]).filter(k => k !== 'custom').map((key) => {
            const s = STYLES[key]
            const isActive = style === key
            return (
              <motion.button
                key={key}
                onClick={() => setStyle(key)}
                className="relative px-4 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors"
                style={{
                  fontFamily: s.id === 'ancient' ? 'var(--font-noto-serif), serif' : s.id === 'cyber' ? 'var(--font-jetbrains), monospace' : 'inherit',
                  color: isActive ? (isDark ? '#00FFD4' : s.colors.accent) : (isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'),
                  border: `1px solid ${isActive ? (isDark ? 'rgba(0,255,212,0.3)' : `${s.colors.accent}40`) : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)')}`,
                  backgroundColor: isActive ? (isDark ? 'rgba(0,255,212,0.08)' : `${s.colors.accent}15`) : 'transparent',
                }}
                whileHover={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                }}
                whileTap={{ scale: 0.97 }}
              >
                {s.label}
              </motion.button>
            )
          })}
        </motion.div>

        {/* Memory constellation map */}
        <MemoryMap chapters={chapters} style={style} />

        {/* Chapter tabs */}
        {chapters.length > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex gap-3 mb-8"
          >
            {chapters.map((ch, i) => (
              <button
                key={ch.id}
                onClick={() => setActiveChapter(i)}
                className="px-3 py-1 rounded-lg text-sm transition-all"
                style={{
                  fontWeight: i === activeChapter ? 600 : 400,
                  opacity: i === activeChapter ? 1 : 0.4,
                  borderBottom: i === activeChapter ? `2px solid ${theme.colors.accent}` : '2px solid transparent',
                }}
              >
                {ch.title}
              </button>
            ))}
          </motion.div>
        )}

        {/* Chapter content */}
        {currentChapter && (
          <div className="space-y-8">
            {/* Chapter title with decorative accent */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div
                className="w-12 h-0.5 mb-3"
                style={{ backgroundColor: theme.colors.accent }}
              />
              <h2
                className="text-2xl md:text-3xl font-bold"
                style={{ fontFamily: theme.font.heading, color: textBase }}
              >
                {currentChapter.title}
              </h2>
            </motion.div>

            {/* Photo grid - polaroid/scattered style */}
            <div className="flex flex-wrap justify-center gap-3">
              {currentChapter.photos.map((photo, i) => {
                // Deterministic slight rotation per photo
                const rotations = [-2, 1.5, -1, 2, -1.5, 1, -2.5, 2, 0.5, -1]
                const rotation = rotations[i % rotations.length]
                return (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, y: 20, rotate: 0 }}
                    animate={{ opacity: 1, y: 0, rotate: rotation }}
                    transition={{ duration: 0.6, delay: i * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                    className="w-28 md:w-36"
                    style={{
                      boxShadow: `0 8px 30px ${isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.15)'}, 0 2px 8px ${isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.08)'}`,
                    }}
                  >
                    <div
                      className="p-2"
                      style={{
                        backgroundColor: isDark ? 'rgba(255,255,255,0.9)' : '#fff',
                        boxShadow: `inset 0 0 0 1px rgba(0,0,0,0.05)`,
                      }}
                    >
                      <img
                        src={photo.preview}
                        alt=""
                        className="w-full aspect-square object-cover"
                      />
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Narrative with glass card container */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="rounded-2xl p-6 md:p-8"
              style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.6)',
                backdropFilter: 'blur(24px) saturate(120%)',
                WebkitBackdropFilter: 'blur(24px) saturate(120%)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
              }}
            >
              <div className="min-h-[120px]">
                {currentChapter.narrative ? (
                  <NarrativeBlock text={currentChapter.narrative.text} fontFamily={theme.font.heading} />
                ) : currentChapter.generatingNarrative ? (
                  <p className="animate-pulse text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.3)' : theme.colors.textMuted }}>
                    记忆正在浮现...
                  </p>
                ) : null}
              </div>

              {currentChapter.photos[0]?.analysis && (
                <div className="text-sm mt-4 opacity-50" style={{ fontFamily: theme.font.body }}>
                  {currentChapter.photos[0].analysis.location_guess} · {currentChapter.photos[0].analysis.time_of_day}
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* Share CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 text-center pb-8"
        >
          <button
            onClick={() => useAppStore.getState().setState('share')}
            className="px-8 py-3 rounded-full text-sm font-medium transition-all hover:scale-105 active:scale-95"
            style={{
              backgroundColor: theme.colors.accent,
              color: '#fff',
              boxShadow: `0 4px 24px ${theme.colors.accent}30`,
            }}
          >
            分享这段记忆
          </button>
        </motion.div>
      </div>
    </div>
  )
}