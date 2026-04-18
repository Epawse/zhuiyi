'use client'

import { useAppStore } from '@/store/useAppStore'
import { STYLES } from '@/types/style'
import { useEffect, useRef, useState } from 'react'
import { StyleType } from '@/types'

export function ExperiencePage() {
  const chapters = useAppStore((s) => s.chapters)
  const updateChapter = useAppStore((s) => s.updateChapter)
  const style = useAppStore((s) => s.style)
  const setStyle = useAppStore((s) => s.setStyle)
  const [activeChapter, setActiveChapter] = useState(0)
  const narrativeStarted = useRef<Set<string>>(new Set())
  const sceneStarted = useRef<Set<string>>(new Set())

  const theme = STYLES[style]

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
    chapters.forEach((chapter) => {
      if (sceneStarted.current.has(chapter.id)) return
      if (chapter.sceneImage) return
      if (chapter.generatingScene) return

      sceneStarted.current.add(chapter.id)

      const analyses = chapter.photos
        .map((p) => p.analysis)
        .filter(Boolean)

      if (analyses.length === 0) return

      const sceneDescription = analyses
        .map((a) => `${a?.scene} at ${a?.location_guess}, ${a?.time_of_day}, ${a?.season}`)
        .join('; ')

      const prompt = `${theme.scenePrompt} Scene contains: ${sceneDescription}`

      updateChapter(chapter.id, { generatingScene: true })
      fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, mode: 'scene' }),
      })
        .then((r) => r.json())
        .then((data) => {
          updateChapter(chapter.id, {
            sceneImage: data.image || null,
            generatingScene: false,
          })
        })
        .catch(() => {
          updateChapter(chapter.id, { generatingScene: false })
        })
    })
  }, [chapters, theme.scenePrompt, updateChapter])

  const currentChapter = chapters[activeChapter]

  return (
    <div
      className="min-h-screen transition-colors duration-700"
      style={{
        backgroundColor: theme.colors.background,
        color: theme.colors.text,
        fontFamily: theme.font.body,
      }}
    >
      {theme.backgroundImage && (
        <div
          className="fixed inset-0 opacity-15 bg-cover bg-center transition-opacity duration-1000"
          style={{ backgroundImage: `url(${theme.backgroundImage})` }}
        />
      )}

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {(Object.keys(STYLES) as StyleType[]).map((key) => (
            <button
              key={key}
              onClick={() => setStyle(key)}
              className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-all ${
                style === key
                  ? 'scale-105'
                  : 'opacity-60 hover:opacity-80'
              }`}
              style={{
                backgroundColor: style === key ? theme.colors.accent : theme.colors.surface,
                color: style === key ? '#fff' : theme.colors.text,
              }}
            >
              {STYLES[key].label}
            </button>
          ))}
        </div>

        {chapters.length > 1 && (
          <div className="flex gap-2 mb-6">
            {chapters.map((ch, i) => (
              <button
                key={ch.id}
                onClick={() => setActiveChapter(i)}
                className={`px-3 py-1 rounded text-sm ${
                  i === activeChapter ? 'font-bold' : 'opacity-50'
                }`}
                style={{ borderBottom: i === activeChapter ? `2px solid ${theme.colors.accent}` : 'none' }}
              >
                {ch.title}
              </button>
            ))}
          </div>
        )}

        {currentChapter && (
          <div className="space-y-8">
            {currentChapter.sceneImage && (
              <div className="rounded-2xl overflow-hidden shadow-lg">
                <img src={currentChapter.sceneImage} alt="" className="w-full" />
              </div>
            )}
            {currentChapter.generatingScene && !currentChapter.sceneImage && (
              <div
                className="rounded-2xl h-48 flex items-center justify-center animate-pulse"
                style={{ backgroundColor: theme.colors.surface }}
              >
                <span className="text-sm" style={{ color: theme.colors.textMuted }}>
                  正在生成场景图...
                </span>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2">
              {currentChapter.photos.map((photo) => (
                <div key={photo.id} className="aspect-square rounded-lg overflow-hidden">
                  <img src={photo.preview} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>

            <div className="min-h-[120px]">
              {currentChapter.narrative ? (
                <p
                  className="text-lg leading-relaxed whitespace-pre-wrap"
                  style={{ fontFamily: theme.font.heading }}
                >
                  {currentChapter.narrative.text}
                </p>
              ) : currentChapter.generatingNarrative ? (
                <p className="animate-pulse" style={{ color: theme.colors.textMuted }}>
                  记忆正在浮现...
                </p>
              ) : null}
            </div>

            {currentChapter.photos[0]?.analysis && (
              <div className="text-sm opacity-60">
                {currentChapter.photos[0].analysis.location_guess} · {currentChapter.photos[0].analysis.time_of_day}
              </div>
            )}
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={() => useAppStore.getState().setState('share')}
            className="px-6 py-2 rounded-full"
            style={{
              backgroundColor: theme.colors.accent,
              color: '#fff',
            }}
          >
            分享这段记忆
          </button>
        </div>
      </div>
    </div>
  )
}