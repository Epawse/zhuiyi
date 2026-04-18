'use client'

import { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { UploadArea } from './UploadArea'
import { STYLES } from '@/types/style'
import { StyleType, HistoryEntry } from '@/types'

export function LandingPage() {
  const setStyle = useAppStore((s) => s.setStyle)
  const style = useAppStore((s) => s.style)
  const history = useAppStore((s) => s.history)
  const clearHistory = useAppStore((s) => s.clearHistory)
  const [showHistory, setShowHistory] = useState(false)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative">
      {history.length > 0 && (
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur shadow-sm hover:shadow-md transition-all text-sm text-gray-600 hover:text-gray-900"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
          历史记录
          <span className="bg-black text-white text-xs rounded-full px-1.5 py-0.5">{history.length}</span>
        </button>
      )}

      {showHistory && history.length > 0 && (
        <div className="absolute top-14 right-4 w-80 max-h-[70vh] overflow-y-auto bg-white/95 backdrop-blur rounded-2xl shadow-xl p-4 z-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">历史记录</h3>
            <button onClick={clearHistory} className="text-xs text-gray-400 hover:text-red-400 transition-colors">
              清空
            </button>
          </div>
          <div className="space-y-2">
            {history.map((entry) => (
              <HistoryCard key={entry.id} entry={entry} />
            ))}
          </div>
        </div>
      )}

      <h1 className="text-4xl md:text-6xl font-serif mb-4 text-center">
        追忆
      </h1>
      <p className="text-lg text-gray-500 mb-12 text-center max-w-md">
        上传照片，让AI唤醒你的记忆
      </p>

      <UploadArea />

      <div className="mt-12 flex flex-wrap justify-center gap-3">
        {(Object.keys(STYLES) as StyleType[]).map((key) => {
          const s = STYLES[key]
          return (
            <button
              key={key}
              onClick={() => setStyle(key)}
              className={`px-4 py-2 rounded-full text-sm transition-all ${
                style === key
                  ? 'bg-black text-white scale-105'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s.label}
            </button>
          )
        })}
      </div>

      <p className="mt-8 text-xs text-gray-400">
        选择风格后上传照片开始 →
      </p>
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

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl transition-colors hover:shadow-sm cursor-pointer"
      style={{ backgroundColor: theme.colors.surface }}
    >
      <div
        className="w-2 h-10 rounded-full flex-shrink-0"
        style={{ backgroundColor: theme.colors.accent }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-sm">
          <span style={{ color: theme.colors.text }}>{theme.label}</span>
          <span className="text-xs" style={{ color: theme.colors.textMuted }}>
            {entry.chapterCount} 篇章 · {timeStr}
          </span>
        </div>
        {entry.chapterSummaries[0] && (
          <p className="text-xs truncate mt-0.5" style={{ color: theme.colors.textMuted }}>
            {entry.chapterSummaries[0].narrativePreview || entry.chapterSummaries[0].location}
          </p>
        )}
      </div>
    </div>
  )
}