import { create } from 'zustand'
import { AppState, PhotoFile, PhotoChapter, StyleType, HistoryEntry, JourneySummary } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { saveHistoryToCloud, loadHistoryFromCloud, migrateHistoryToCloud } from '@/lib/supabase/history'
import { mergeCloudAndLocalHistory } from '@/lib/supabase/history-sync'

const HISTORY_KEY = 'zhuiyi-history'
const MAX_HISTORY = 20

function loadHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
  } catch {
    return []
  }
}

function saveHistory(entries: HistoryEntry[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, MAX_HISTORY)))
}

// Hash routing helpers
const STATE_TO_HASH: Record<AppState, string> = {
  landing: '',
  processing: '#processing',
  experience: '#experience',
  share: '#share',
}

const HASH_TO_STATE: Record<string, AppState> = {
  '': 'landing',
  '#': 'landing',
  '#landing': 'landing',
  '#processing': 'processing',
  '#experience': 'experience',
  '#share': 'share',
}

function syncHash(state: AppState) {
  if (typeof window === 'undefined') return
  const hash = STATE_TO_HASH[state]
  if (window.location.hash !== hash) {
    window.history.replaceState(null, '', hash || window.location.pathname)
  }
}

interface AppStore {
  state: AppState
  setState: (state: AppState) => void

  photos: PhotoFile[]
  setPhotos: (photos: PhotoFile[]) => void
  updatePhoto: (id: string, partial: Partial<PhotoFile>) => void

  chapters: PhotoChapter[]
  setChapters: (chapters: PhotoChapter[]) => void
  updateChapter: (id: string, partial: Partial<PhotoChapter>) => void

  coverImage: string | null
  setCoverImage: (url: string | null) => void

  generatingCover: boolean
  setGeneratingCover: (v: boolean) => void

  style: StyleType
  setStyle: (style: StyleType) => void

  customStylePrompt: string
  setCustomStylePrompt: (prompt: string) => void

  summary: JourneySummary | null
  setSummary: (summary: JourneySummary | null) => void
  generatingSummary: boolean
  setGeneratingSummary: (v: boolean) => void

  history: HistoryEntry[]
  addHistory: (entry: HistoryEntry) => void
  clearHistory: () => void
  hydrate: () => void

  // Auth-aware persistence
  userId: string | null
  isLinked: boolean
  setAuth: (userId: string | null, isLinked: boolean) => void
  syncHistoryToCloud: () => Promise<void>

  // Theme
  theme: 'dark' | 'light'
  setTheme: (theme: 'dark' | 'light') => void

  reset: () => void
}

function getInitialTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark'
  const saved = localStorage.getItem('zhuiyi-theme')
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

function applyTheme(theme: 'dark' | 'light') {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('data-theme', theme)
}

export const useAppStore = create<AppStore>((set, get) => ({
  state: 'landing' as AppState,
  photos: [] as PhotoFile[],
  chapters: [] as PhotoChapter[],
  coverImage: null as string | null,
  generatingCover: false,
  style: 'ancient' as StyleType,
  customStylePrompt: '',
  summary: null as JourneySummary | null,
  generatingSummary: false,
  history: [] as HistoryEntry[],

  // Auth-aware persistence fields
  userId: null as string | null,
  isLinked: false,

  // Theme
  theme: 'dark' as 'dark' | 'light',

  setState: (state) => {
    set({ state })
    syncHash(state)
  },

  setPhotos: (photos) => set({ photos }),
  updatePhoto: (id, partial) =>
    set((s) => ({
      photos: s.photos.map((p) => (p.id === id ? { ...p, ...partial } : p)),
    })),

  setChapters: (chapters) => set({ chapters }),
  updateChapter: (id, partial) =>
    set((s) => ({
      chapters: s.chapters.map((c) => (c.id === id ? { ...c, ...partial } : c)),
    })),

  setCoverImage: (url) => set({ coverImage: url }),
  setGeneratingCover: (v) => set({ generatingCover: v }),

  setStyle: (style) => set({ style }),
  setCustomStylePrompt: (prompt) => set({ customStylePrompt: prompt }),

  setSummary: (summary) => set({ summary }),
  setGeneratingSummary: (v) => set({ generatingSummary: v }),

  addHistory: (entry) => {
    const current = get().history
    // Dedup check: skip if entry with same id already exists
    if (current.some((h) => h.id === entry.id)) return
    const history = [entry, ...current].slice(0, MAX_HISTORY)
    saveHistory(history)
    set({ history })

    // If user is linked, also save to Supabase (fire-and-forget)
    const { isLinked, userId } = get()
    if (isLinked && userId) {
      const supabase = createClient()
      // Fire-and-forget: don't await, don't block UI
      saveHistoryToCloud(supabase, userId, entry, entry.coverImage || undefined).catch((err) => {
        console.error('[store] Failed to save history to cloud:', err)
      })
    }
  },

  clearHistory: () => {
    saveHistory([])
    set({ history: [] })
  },

  setAuth: (userId, isLinked) => {
    set({ userId, isLinked })
  },

  setTheme: (theme) => {
    applyTheme(theme)
    localStorage.setItem('zhuiyi-theme', theme)
    set({ theme })
  },

  syncHistoryToCloud: async () => {
    const { isLinked, userId } = get()
    if (!isLinked || !userId) return

    try {
      const localEntries = get().history
      const supabase = createClient()
      const result = await migrateHistoryToCloud(supabase, userId)

      // After migration, reload history from Supabase (server = truth)
      const cloudEntries = await loadHistoryFromCloud(supabase, userId)
      if (cloudEntries.length > 0) {
        // A partial migration must not erase the local entries that failed to
        // reach the cloud. Cloud rows win by stable ID; unmatched local rows
        // remain available for the next idempotent retry.
        const history = result.failed > 0
          ? mergeCloudAndLocalHistory(cloudEntries, localEntries, MAX_HISTORY)
          : cloudEntries
        set({ history })
        saveHistory(history)
      }
    } catch (err) {
      console.error('[store] syncHistoryToCloud failed:', err)
    }
  },

  hydrate: () => {
    const saved = loadHistory()
    set({
      history: saved,
    })

    // If user is linked, fetch from Supabase and merge
    const { isLinked, userId } = get()
    if (isLinked && userId) {
      const supabase = createClient()
      loadHistoryFromCloud(supabase, userId).then((cloudEntries) => {
        if (cloudEntries.length > 0) {
          // Server = truth for linked users
          set({ history: cloudEntries })
          saveHistory(cloudEntries)
        }
      }).catch((err) => {
        console.error('[store] Failed to load cloud history:', err)
      })
    }
  },

  reset: () => set({
    state: 'landing' as AppState,
    photos: [] as PhotoFile[],
    chapters: [] as PhotoChapter[],
    coverImage: null,
    generatingCover: false,
    customStylePrompt: '',
    summary: null,
    generatingSummary: false,
    history: get().history,
  }),
}))

if (typeof window !== 'undefined') {
  // Hydrate from localStorage immediately (not deferred)
  useAppStore.getState().hydrate()

  // Initialize theme
  const initialTheme = getInitialTheme()
  useAppStore.setState({ theme: initialTheme })
  applyTheme(initialTheme)

  // Listen for system theme changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: light)')
  mediaQuery.addEventListener('change', (e) => {
    const saved = localStorage.getItem('zhuiyi-theme')
    // Only auto-switch if user hasn't manually set a preference
    if (!saved) {
      const newTheme = e.matches ? 'light' : 'dark'
      useAppStore.setState({ theme: newTheme })
      applyTheme(newTheme)
    }
  })

  // Listen for back/forward navigation
  window.addEventListener('hashchange', () => {
    const hashState = HASH_TO_STATE[window.location.hash] || 'landing'
    const currentState = useAppStore.getState().state
    if (hashState !== currentState) {
      useAppStore.setState({ state: hashState })
    }
  })
}
