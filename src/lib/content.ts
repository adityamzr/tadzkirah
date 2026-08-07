import "server-only"
import fs from 'fs'
import path from 'path'
import { ContentEntry, CollectionFile } from './types'
import { getDatabase, isDatabaseConfigured, schema } from './db'
import { sql } from 'drizzle-orm'

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
    return JSON.parse(raw)
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
    if (file.startsWith('_') || file.startsWith('.')) continue
    const stat = fs.statSync(fp)
    if (stat.isDirectory()) {
      if (file === 'templates') continue
      walk(fp, fileList)
    } else if (file.endsWith('.json')) {
      fileList.push(fp)
    }
  }
  return fileList
}

function isValidEntry(entry: any): boolean {
  return !!(entry && entry.id && entry.type && entry.title)
}

function normalizeEntry(raw: any, filePath?: string): ContentEntry | null {
  if (!isValidEntry(raw)) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[Tadzkirah] Entry tidak valid di ${filePath || 'unknown'}:`, raw)
    }
    return null
  }

  const slug = raw.slug && String(raw.slug).trim() ? String(raw.slug).trim() : slugify(String(raw.id))
  let rawType = String(raw.type).toLowerCase().trim()
  if (rawType === "hadis") rawType = "hadith"
  if (rawType === "doa") rawType = "dua"
  if (rawType === "pengingat") rawType = "reminder"
  if (rawType === "catatan" || rawType === "refleksi") rawType = "reflection"

  const allowed = ['quran', 'hadith', 'dua', 'reminder', 'reflection']
  if (!allowed.includes(rawType)) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[Tadzkirah] Tipe tidak dikenal '${raw.type}' di ${filePath}`)
    }
    return null
  }

  const toArray = (v: any): string[] | undefined => {
    if (!v) return undefined
    if (Array.isArray(v)) return v.filter(Boolean).map(String)
    if (typeof v === 'string') return [v]
    return undefined
  }

  const entry: ContentEntry = {
    ...raw,
    id: String(raw.id).trim(),
    slug,
    type: rawType as any,
    title: String(raw.title).trim(),
    reference: raw.reference ? String(raw.reference) : undefined,
    category: raw.category ? String(raw.category) : undefined,
    subcategory: raw.subcategory ? String(raw.subcategory) : undefined,
    arabic: raw.arabic ? String(raw.arabic) : undefined,
    latin: raw.latin ? String(raw.latin) : undefined,
    translation: raw.translation ? String(raw.translation) : undefined,
    lesson: raw.lesson,
    reflection: raw.reflection ? String(raw.reflection) : undefined,
    tags: toArray(raw.tags),
    keywords: toArray(raw.keywords),
    related: toArray(raw.related),
    youtube: raw.youtube && Array.isArray(raw.youtube) ? raw.youtube : undefined,
    source: raw.source ? String(raw.source) : undefined,
    createdAt: raw.createdAt ? String(raw.createdAt) : undefined,
    updatedAt: raw.updatedAt ? String(raw.updatedAt) : undefined,
  }

  return entry
}

function parseCollectionFile(data: any, filePath: string): ContentEntry[] {
  const out: ContentEntry[] = []
  if (data && typeof data === 'object' && Array.isArray(data.items)) {
    const defaults = data.defaults || {}
    for (const rawItem of data.items) {
      const merged = { ...defaults, ...rawItem }
      const normalized = normalizeEntry(merged, filePath)
      if (normalized) out.push(normalized)
    }
    return out
  }
  if (Array.isArray(data)) {
    for (const raw of data) {
      const normalized = normalizeEntry(raw, filePath)
      if (normalized) out.push(normalized)
    }
    return out
  }
  if (typeof data === 'object') {
    const normalized = normalizeEntry(data, filePath)
    if (normalized) out.push(normalized)
  }
  return out
}

// DB mapping
function mapDbRowToEntry(row: any): ContentEntry {
  return {
    id: row.id,
    slug: row.slug,
    type: row.type as any,
    title: row.title,
    reference: row.reference || undefined,
    category: row.category || undefined,
    subcategory: row.subcategory || undefined,
    arabic: row.arabic || undefined,
    latin: row.latin || undefined,
    translation: row.translation || undefined,
    lesson: row.lesson || undefined,
    reflection: row.reflection || undefined,
    tags: row.tags || undefined,
    keywords: row.keywords || undefined,
    related: row.related || undefined,
    youtube: row.youtube || undefined,
    source: row.source || undefined,
    createdAt: row.createdAt || undefined,
    updatedAt: row.updatedAt ? new Date(row.updatedAt).toISOString().split('T')[0] : undefined,
  }
}

let cachedFileContent: ContentEntry[] | null = null

function getAllContentFromFiles(): ContentEntry[] {
  if (cachedFileContent) return cachedFileContent

  const files = walk(CONTENT_ROOT)
  const entries: ContentEntry[] = []
  const seen = new Set<string>()

  for (const filePath of files) {
    const data = readJsonFile(filePath)
    if (!data) continue
    try {
      const parsed = parseCollectionFile(data, filePath)
      for (const e of parsed) {
        if (seen.has(e.id)) {
          if (process.env.NODE_ENV !== 'production') {
            console.warn(`[Tadzkirah] ID duplikat '${e.id}' di ${filePath}`)
          }
          continue
        }
        seen.add(e.id)
        entries.push(e)
      }
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[Tadzkirah] Gagal proses ${filePath}`, err)
      }
    }
  }

  entries.sort((a, b) => {
    const da = a.updatedAt || a.createdAt || ''
    const db = b.updatedAt || b.createdAt || ''
    if (da && db) return db.localeCompare(da)
    return a.title.localeCompare(b.title)
  })

  cachedFileContent = entries
  return entries
}

export async function getAllContent(): Promise<ContentEntry[]> {
  // If DB configured, try DB first
  if (isDatabaseConfigured()) {
    try {
      const db = getDatabase()
      if (db) {
        const rows = await db.select().from(schema.contents)
        const mapped = rows.map(mapDbRowToEntry)
        mapped.sort((a, b) => {
          const da = a.updatedAt || a.createdAt || ''
          const dbv = b.updatedAt || b.createdAt || ''
          if (da && dbv) return dbv.localeCompare(da)
          return a.title.localeCompare(b.title)
        })
        // If DB has data, return it
        if (mapped.length > 0) {
          return mapped
        }
        // If DB empty, fallback to files (for first migration)
        console.log("[Tadzkirah] DB kosong, fallback ke file JSON")
      }
    } catch (e) {
      console.warn("[Tadzkirah] Gagal ambil dari Neon, fallback ke file:", e)
    }
  }

  // Fallback to files (sync)
  return getAllContentFromFiles()
}

export async function getContentBySlug(slug: string): Promise<ContentEntry | undefined> {
  if (isDatabaseConfigured()) {
    try {
      const db = getDatabase()
      if (db) {
        const rows = await db.select().from(schema.contents).where(sql`${schema.contents.slug} = ${slug}`)
        if (rows.length > 0) return mapDbRowToEntry(rows[0])
      }
    } catch (e) {
      console.warn("[Tadzkirah] getBySlug DB error, fallback file", e)
    }
  }

  const all = getAllContentFromFiles()
  return all.find(c => c.slug === slug)
}

export async function getContentById(id: string): Promise<ContentEntry | undefined> {
  if (isDatabaseConfigured()) {
    try {
      const db = getDatabase()
      if (db) {
        const rows = await db.select().from(schema.contents).where(sql`${schema.contents.id} = ${id}`)
        if (rows.length > 0) return mapDbRowToEntry(rows[0])
      }
    } catch (e) {
      console.warn("[Tadzkirah] getById DB error, fallback file", e)
    }
  }

  const all = getAllContentFromFiles()
  return all.find(c => c.id === id)
}

export async function getRelatedContent(entry: ContentEntry): Promise<ContentEntry[]> {
  if (!entry.related || entry.related.length === 0) return []
  const related: ContentEntry[] = []
  for (const relId of entry.related) {
    const found = await getContentById(relId) || await getContentBySlug(relId)
    if (found) related.push(found)
  }
  return related
}

export function getNormalizedYouTube(entry: ContentEntry) {
  if (!entry.youtube) return []
  return entry.youtube.map((raw: any) => {
    if (!raw || typeof raw !== 'object') return null
    let videoId = raw.youtubeId || raw.id || ""
    if (!videoId && raw.url) {
      const m = raw.url.match(/(?:v=|\.be\/|embed\/)([A-Za-z0-9_-]{6,})/)
      if (m) videoId = m[1]
    }
    if (videoId.includes('youtube.com') || videoId.includes('youtu.be')) {
      const m = videoId.match(/(?:v=|\.be\/|embed\/)([A-Za-z0-9_-]{6,})/)
      if (m) videoId = m[1]
    }
    if (!videoId || !raw.title) return null
    return {
      id: videoId,
      title: raw.title,
      speaker: raw.speaker,
      channel: raw.channel,
      duration: raw.duration,
      description: raw.description,
      thumbnail: raw.thumbnail || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      url: raw.url || `https://www.youtube.com/watch?v=${videoId}`,
    }
  }).filter(Boolean) as any[]
}

export async function searchContent(query: string, filters?: { type?: string }): Promise<ContentEntry[]> {
  const all = await getAllContent()
  const q = query.trim().toLowerCase()
  if (!q) return all.slice(0, 12)

  return all.filter(entry => {
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
    ].filter(Boolean).join(' ').toLowerCase()
    return haystack.includes(q)
  })
}

// Keep sync version for backward compat where needed (admin with files)
export function getAllContentSync(): ContentEntry[] {
  return getAllContentFromFiles()
}
