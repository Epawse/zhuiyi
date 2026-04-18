import { create } from 'zustand'
import { AppState, PhotoFile, PhotoChapter, StyleType } from '@/types'

interface AppStore {
  state: AppState
  setState: (state: AppState) => void

  photos: PhotoFile[]
  setPhotos: (photos: PhotoFile[]) => void
  updatePhoto: (id: string, partial: Partial<PhotoFile>) => void

  chapters: PhotoChapter[]
  setChapters: (chapters: PhotoChapter[]) => void
  updateChapter: (id: string, partial: Partial<PhotoChapter>) => void

  style: StyleType
  setStyle: (style: StyleType) => void

  customStylePrompt: string
  setCustomStylePrompt: (prompt: string) => void

  reset: () => void
}

const initialState = {
  state: 'landing' as AppState,
  photos: [],
  chapters: [],
  style: 'ancient' as StyleType,
  customStylePrompt: '',
}

export const useAppStore = create<AppStore>((set) => ({
  ...initialState,

  setState: (state) => set({ state }),

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

  setStyle: (style) => set({ style }),

  setCustomStylePrompt: (prompt) => set({ customStylePrompt: prompt }),

  reset: () => set(initialState),
}))