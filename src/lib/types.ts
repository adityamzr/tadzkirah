export type ContentType = 'quran' | 'hadith' | 'dua' | 'reminder' | 'reflection'

export interface YouTubeReference {
  id: string // youtube video id
  title: string
  speaker?: string
  duration?: string
  thumbnail?: string
  url: string
}

export interface ContentEntry {
  id: string
  slug: string
  type: ContentType
  title: string
  reference?: string // e.g. "QS. Al-Baqarah: 286" or "Bukhari No. 1"
  category?: string // e.g. "Tawhid, Sabr, Doa"
  subcategory?: string
  arabic?: string
  latin?: string // transliteration
  translation?: string
  lesson?: string // lessons learned
  reflection?: string // personal reflection
  tags?: string[]
  related?: string[] // array of ids/slugs
  youtube?: YouTubeReference[]
  createdAt?: string
  updatedAt?: string
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
