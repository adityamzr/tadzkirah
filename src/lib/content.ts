import "server-only"
import fs from 'fs'
import path from 'path'
import { ContentEntry, CollectionFile, NormalizedYouTube, YouTubeReference } from './types'

const CONTENT_ROOT = path.join(process.cwd(), 'content')

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function readJsonFile(filePath: string): any | null {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8')
    const data = JSON.parse(raw)
    return data
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[Tadzkirah] Gagal membaca JSON: ${filePath}`, e)
    }
    return null
  }
}

function walk(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList
  const files = fs.readdirSync(dir)
  for (const file of files) {
    const fp = path.join(dir, file)
    // Skip templates folder and node_modules etc
    if (file.startsWith('_') || file.startsWith('.')) continue
    const stat = fs.statSync(fp)
    if (stat.isDirectory()) {
      // Skip templates dir intentionally? Templates should not be indexed if they contain placeholder
      if (file === 'templates') continue
      walk(fp, fileList)
    } else if (file.endsWith('.json')) {
      fileList.push(fp)
    }
  }
  return fileList
}

function isValidEntry(entry: any): entry is ContentEntry {
  return (
    entry &&
    typeof entry === 'object' &&
    typeof entry.id === 'string' &&
    entry.id.trim().length > 0 &&
    typeof entry.type === 'string' &&
    entry.type.trim().length > 0 &&
    typeof entry.title === 'string' &&
    entry.title.trim().length > 0
  )
}

function normalizeYouTube(raw: YouTubeReference): NormalizedYouTube | null {
  if (!raw || typeof raw !== 'object') return null

  // Determine video id
  let videoId = raw.youtubeId || raw.id || ''
  // If id is full url, extract
  if (!videoId && raw.url) {
    const m = raw.url.match(/(?:v=|\.be\/|embed\/)([A-Za-z0-9_-]{6,})/)
    if (m) videoId = m[1]
  }
  // If videoId looks like url, extract again
  if (videoId.includes('youtube.com') || videoId.includes('youtu.be')) {
    const m = videoId.match(/(?:v=|\.be\/|embed\/)([A-Za-z0-9_-]{6,})/)
    if (m) videoId = m[1]
  }

  if (!videoId || !raw.title) return null

  const url = raw.url || `https://www.youtube.com/watch?v=${videoId}`
  const thumb = raw.thumbnail || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`

  return {
    id: videoId,
    title: raw.title,
    speaker: raw.speaker,
    channel: raw.channel,
    duration: raw.duration,
    description: raw.description,
    thumbnail: thumb,
    url,
  }
}

function normalizeEntry(raw: any, filePath?: string): ContentEntry | null {
  if (!isValidEntry(raw)) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[Tadzkirah] Entry tidak valid (id, type, title wajib) di ${filePath || 'unknown'}:`, raw)
    }
    return null
  }

  // Auto slug if missing
  const slug = raw.slug && typeof raw.slug === 'string' && raw.slug.trim() ? raw.slug.trim() : slugify(raw.id)

  // Normalize type
  let rawType = String(raw.type).toLowerCase().trim()
  // Allow alternative naming
  if (rawType === "hadis") rawType = "hadith"
  if (rawType === "doa") rawType = "dua"
  if (rawType === "pengingat") rawType = "reminder"
  if (rawType === "catatan" || rawType === "refleksi") rawType = "reflection"
  let type = rawType as ContentEntry['type']

  const allowedTypes = ['quran', 'hadith', 'dua', 'reminder', 'reflection']
  if (!allowedTypes.includes(type)) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[Tadzkirah] Tipe tidak dikenal '${raw.type}' di ${filePath}, skip.`)
    }
    return null
  }

  // Normalize lesson: allow string or array
  let lesson = raw.lesson
  // keep as is, we handle rendering both

  // Normalize tags, keywords, related, youtube to arrays
  const toArray = (v: any): string[] | undefined => {
    if (!v) return undefined
    if (Array.isArray(v)) return v.filter(Boolean).map(String)
    if (typeof v === 'string') return [v]
    return undefined
  }

  // Keep compatibility for lesson as string
  const tags = toArray(raw.tags)
  const keywords = toArray(raw.keywords)
  const related = toArray(raw.related)

  // Youtube: normalize but keep original format for storage, but also provide normalized later
  let youtube: YouTubeReference[] | undefined
  if (raw.youtube && Array.isArray(raw.youtube)) {
    youtube = raw.youtube.filter(Boolean)
  }

  const entry: ContentEntry = {
    ...raw,
    id: String(raw.id).trim(),
    slug,
    type: type as any,
    title: String(raw.title).trim(),
    reference: raw.reference ? String(raw.reference) : undefined,
    category: raw.category ? String(raw.category) : undefined,
    subcategory: raw.subcategory ? String(raw.subcategory) : undefined,
    arabic: raw.arabic ? String(raw.arabic) : undefined,
    latin: raw.latin ? String(raw.latin) : undefined,
    translation: raw.translation ? String(raw.translation) : undefined,
    lesson,
    reflection: raw.reflection ? String(raw.reflection) : undefined,
    tags,
    keywords,
    related,
    youtube,
    source: raw.source ? String(raw.source) : undefined,
    createdAt: raw.createdAt ? String(raw.createdAt) : undefined,
    updatedAt: raw.updatedAt ? String(raw.updatedAt) : undefined,
  }

  return entry
}

function parseCollectionFile(data: any, filePath: string): ContentEntry[] {
  const out: ContentEntry[] = []

  // Format C: Collection with items
  if (data && typeof data === 'object' && Array.isArray(data.items)) {
    const collection = data as CollectionFile
    const defaults = collection.defaults || {}

    for (const rawItem of collection.items) {
      // Merge defaults + item (item overrides)
      const merged = { ...defaults, ...rawItem }
      const normalized = normalizeEntry(merged, filePath)
      if (normalized) out.push(normalized)
    }
    return out
  }

  // Format B: Array
  if (Array.isArray(data)) {
    for (const raw of data) {
      const normalized = normalizeEntry(raw, filePath)
      if (normalized) out.push(normalized)
    }
    return out
  }

  // Format A: Single object
  if (typeof data === 'object') {
    const normalized = normalizeEntry(data, filePath)
    if (normalized) out.push(normalized)
  }

  return out
}

let cachedContent: ContentEntry[] | null = null
let cachedBySlug: Map<string, ContentEntry> | null = null
let cachedById: Map<string, ContentEntry> | null = null

export function getAllContent(): ContentEntry[] {
  if (cachedContent) return cachedContent

  const files = walk(CONTENT_ROOT)
  const entries: ContentEntry[] = []
  const seenIds = new Set<string>()

  for (const filePath of files) {
    const data = readJsonFile(filePath)
    if (!data) continue

    try {
      const parsed = parseCollectionFile(data, filePath)
      for (const e of parsed) {
        if (seenIds.has(e.id)) {
          if (process.env.NODE_ENV !== 'production') {
            console.warn(`[Tadzkirah] ID duplikat '${e.id}' di ${filePath}, skip duplikat.`)
          }
          continue
        }
        seenIds.add(e.id)
        entries.push(e)
      }
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[Tadzkirah] Gagal memproses ${filePath}`, err)
      }
      continue
    }
  }

  // Sort by updatedAt desc, then title
  entries.sort((a, b) => {
    const dateA = a.updatedAt || a.createdAt || ''
    const dateB = b.updatedAt || b.createdAt || ''
    if (dateA && dateB) return dateB.localeCompare(dateA)
    return a.title.localeCompare(b.title)
  })

  cachedContent = entries
  cachedBySlug = new Map(entries.map((e) => [e.slug, e]))
  cachedById = new Map(entries.map((e) => [e.id, e]))

  return entries
}

export function getContentBySlug(slug: string): ContentEntry | undefined {
  if (!cachedBySlug) getAllContent()
  return cachedBySlug!.get(slug)
}

export function getContentById(id: string): ContentEntry | undefined {
  if (!cachedById) getAllContent()
  return cachedById!.get(id)
}

export function getRelatedContent(entry: ContentEntry): ContentEntry[] {
  if (!entry.related || entry.related.length === 0) return []
  return entry.related
    .map((rel) => getContentById(rel) || getContentBySlug(rel))
    .filter(Boolean) as ContentEntry[]
}

export function getNormalizedYouTube(entry: ContentEntry): NormalizedYouTube[] {
  if (!entry.youtube) return []
  return entry.youtube.map(normalizeYouTube).filter(Boolean) as NormalizedYouTube[]
}

export function searchContent(query: string, filters?: { type?: string }): ContentEntry[] {
  const q = query.trim().toLowerCase()
  if (!q) return getAllContent().slice(0, 12)

  const all = getAllContent()
  return all.filter((entry) => {
    if (filters?.type && filters.type !== 'all' && entry.type !== filters.type) return false

    const lessonText = Array.isArray(entry.lesson) ? entry.lesson.join(' ') : entry.lesson || ''
    const haystack = [
      entry.title,
      entry.translation,
      entry.arabic,
      entry.latin,
      entry.reference,
      entry.category,
      entry.subcategory,
      lessonText,
      entry.reflection,
      ...(entry.tags || []),
      ...(entry.keywords || []),
      entry.source || '',
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return haystack.includes(q)
  })
}

// Utility for templates validation
export function validateContent(entry: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  if (!entry) errors.push('Entry kosong')
  if (!entry?.id) errors.push('ID wajib')
  if (!entry?.type) errors.push('type wajib (quran | hadith | dua | reminder | reflection)')
  if (!entry?.title) errors.push('title wajib')
  return { valid: errors.length === 0, errors }
}

export type { ContentEntry, NormalizedYouTube } from './types'
