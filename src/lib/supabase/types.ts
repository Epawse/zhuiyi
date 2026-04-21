export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ==========================================
// Users
// ==========================================

export interface UserRow {
  id: string
  email: string
  display_name: string
  avatar_url: string | null
  created_at: string
}

export interface UserInsert {
  id: string
  email: string
  display_name?: string
  avatar_url?: string | null
  created_at?: string
}

export interface UserUpdate {
  id?: string
  email?: string
  display_name?: string
  avatar_url?: string | null
  created_at?: string
}

// ==========================================
// Journeys
// ==========================================

export interface JourneyRow {
  id: string
  user_id: string
  style: string
  cover_image_url: string | null
  summary_text: string | null
  created_at: string
}

export interface JourneyInsert {
  id?: string
  user_id: string
  style: string
  cover_image_url?: string | null
  summary_text?: string | null
  created_at?: string
}

export interface JourneyUpdate {
  id?: string
  user_id?: string
  style?: string
  cover_image_url?: string | null
  summary_text?: string | null
  created_at?: string
}

// ==========================================
// Chapters
// ==========================================

export interface ChapterRow {
  id: string
  journey_id: string
  title: string
  narrative_text: string
  photo_urls: Json
  analyses: Json
  order_index: number
  created_at: string
}

export interface ChapterInsert {
  id?: string
  journey_id: string
  title: string
  narrative_text: string
  photo_urls?: Json
  analyses?: Json
  order_index: number
  created_at?: string
}

export interface ChapterUpdate {
  id?: string
  journey_id?: string
  title?: string
  narrative_text?: string
  photo_urls?: Json
  analyses?: Json
  order_index?: number
  created_at?: string
}

// ==========================================
// Generated Images
// ==========================================

export interface GeneratedImageRow {
  id: string
  user_id: string
  journey_id: string | null
  type: string
  storage_path: string
  prompt: string
  created_at: string
}

export interface GeneratedImageInsert {
  id?: string
  user_id: string
  journey_id?: string | null
  type: string
  storage_path: string
  prompt: string
  created_at?: string
}

export interface GeneratedImageUpdate {
  id?: string
  user_id?: string
  journey_id?: string | null
  type?: string
  storage_path?: string
  prompt?: string
  created_at?: string
}

// ==========================================
// Database
// ==========================================

export interface Database {
  public: {
    Tables: {
      users: {
        Row: UserRow
        Insert: UserInsert
        Update: UserUpdate
      }
      journeys: {
        Row: JourneyRow
        Insert: JourneyInsert
        Update: JourneyUpdate
      }
      chapters: {
        Row: ChapterRow
        Insert: ChapterInsert
        Update: ChapterUpdate
      }
      generated_images: {
        Row: GeneratedImageRow
        Insert: GeneratedImageInsert
        Update: GeneratedImageUpdate
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
  }
}