import { create } from 'zustand'
import { AppState, PhotoFile, PhotoChapter, StyleType, HistoryEntry } from '@/types'

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

  history: HistoryEntry[]
  addHistory: (entry: HistoryEntry) => void
  clearHistory: () => void
  hydrate: () => void

  reset: () => void
}

export const useAppStore = create<AppStore>((set, get) => ({
  state: 'landing' as AppState,
  photos: [] as PhotoFile[],
  chapters: [] as PhotoChapter[],
  coverImage: null as string | null,
  generatingCover: false,
  style: 'ancient' as StyleType,
  customStylePrompt: '',
  history: [] as HistoryEntry[],

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

  addHistory: (entry) => {
    const history = [entry, ...get().history].slice(0, MAX_HISTORY)
    saveHistory(history)
    set({ history })
  },

  clearHistory: () => {
    saveHistory([])
    set({ history: [] })
  },

  hydrate: () => {
    const saved = loadHistory()
    const hashState = HASH_TO_STATE[window.location.hash] || 'landing'
    set({
      history: saved,
      state: hashState as AppState,
    })
  },

  reset: () => set({
    state: 'landing' as AppState,
    photos: [] as PhotoFile[],
    chapters: [] as PhotoChapter[],
    coverImage: null,
    generatingCover: false,
    customStylePrompt: '',
    history: get().history,
  }),
}))

if (typeof window !== 'undefined') {
  // Hydrate from localStorage + hash on load
  requestAnimationFrame(() => {
    useAppStore.getState().hydrate()
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