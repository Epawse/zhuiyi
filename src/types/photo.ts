import { StyleType } from './style'

export interface PhotoFile {
  id: string
  file: File
  preview: string
  exif: PhotoExif | null
  analysis: PhotoAnalysis | null
  analyzing: boolean
}

export interface PhotoExif {
  latitude?: number
  longitude?: number
  datetime?: string
  altitude?: number
  orientation?: number
  make?: string
  model?: string
}

export interface PhotoAnalysis {
  scene: string
  location_guess: string
  mood: string[]
  season: string
  time_of_day: string
  activity: string
  key_objects: string[]
  notable_detail: string
  confidence: 'high' | 'medium' | 'low'
}

export interface PhotoChapter {
  id: string
  title: string
  photos: PhotoFile[]
  startTime: Date
  endTime: Date
  centerLat: number
  centerLng: number
  narrative: ChapterNarrative | null
  generatingNarrative: boolean
}

export interface ChapterNarrative {
  text: string
  style: StyleType
}

export interface HistoryEntry {
  id: string
  createdAt: string
  style: StyleType
  chapterCount: number
  chapterSummaries: { title: string; location: string; narrativePreview: string }[]
  coverImage?: string | null
  narratives?: { title: string; text: string }[]
}