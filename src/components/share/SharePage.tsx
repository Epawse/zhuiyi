'use client'

import { useAppStore } from '@/store/useAppStore'
import { STYLES } from '@/types/style'

export function SharePage() {
  const chapters = useAppStore((s) => s.chapters)
  const style = useAppStore((s) => s.style)
  const backgroundUrl = useAppStore((s) => s.styleBackgroundImage)
  const theme = STYLES[style]
  const reset = useAppStore((s) => s.reset)

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: theme.colors.background, color: theme.colors.text }}
    >
      <div className="max-w-md w-full">
        {backgroundUrl && (
          <div
            className="absolute inset-0 opacity-10 bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundUrl})` }}
          />
        )}

        <div className="relative z-10 rounded-2xl p-8 shadow-xl" style={{ backgroundColor: theme.colors.surface }}>
          <h2 className="text-2xl font-serif mb-4" style={{ fontFamily: theme.font.heading }}>
            追忆 · {theme.label}
          </h2>

          {chapters.map((chapter) => (
            <div key={chapter.id} className="mb-6">
              {chapter.narrative && (
                <p
                  className="text-sm leading-relaxed mb-2"
                  style={{ fontFamily: theme.font.body, color: theme.colors.text }}
                >
                  {chapter.narrative.text}
                </p>
              )}
              <div className="flex gap-1 overflow-x-auto">
                {chapter.photos.slice(0, 4).map((photo) => (
                  <div key={photo.id} className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                    <img src={photo.preview} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: '追忆', text: '看看我的追忆故事' })
                }
              }}
              className="flex-1 py-2 rounded-full text-white text-sm"
              style={{ backgroundColor: theme.colors.accent }}
            >
              分享
            </button>
            <button
              onClick={reset}
              className="flex-1 py-2 rounded-full text-sm border"
              style={{ borderColor: theme.colors.textMuted, color: theme.colors.textMuted }}
            >
              重新开始
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}