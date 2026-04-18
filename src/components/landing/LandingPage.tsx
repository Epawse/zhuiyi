'use client'

import { useAppStore } from '@/store/useAppStore'
import { UploadArea } from './UploadArea'
import { STYLES } from '@/types/style'
import { StyleType } from '@/types'

export function LandingPage() {
  const setStyle = useAppStore((s) => s.setStyle)
  const style = useAppStore((s) => s.style)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
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