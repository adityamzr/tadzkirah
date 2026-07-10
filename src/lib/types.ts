export type ContentType = 'quran' | 'hadith' | 'dua' | 'reminder' | 'reflection'

export interface YouTubeReference {
  // Old format
  id?: string
  // New format
  youtubeId?: string
  title: string
  speaker?: string
  channel?: string
  duration?: string
  description?: string
  // Legacy
  thumbnail?: string
  url?: string
}

export interface NormalizedYouTube {
  id: string // youtube video id for embedding
  title: string
  speaker?: string
  channel?: string
  duration?: string
  description?: string
  thumbnail?: string
  url: string
}

export interface ContentEntry {
  id: string
  slug: string
  type: ContentType
  title: string
  reference?: string
  category?: string
  subcategory?: string
  arabic?: string
  latin?: string
  translation?: string
  lesson?: string | string[]
  reflection?: string
  tags?: string[]
  keywords?: string[]
  related?: string[]
  youtube?: YouTubeReference[]
  source?: string
  createdAt?: string
  updatedAt?: string

  // allow extra flexible fields
  [key: string]: any
}

export interface CollectionFile {
  version?: number
  title?: string
  description?: string
  defaults?: Partial<ContentEntry>
  items: ContentEntry[]
}

// For future extensibility
export interface Bookmark {
  contentId: string
  createdAt: string
}

export interface Collection {
  id: string
  name: string
  contentIds: string[]
}
