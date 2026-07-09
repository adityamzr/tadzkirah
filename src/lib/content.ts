import "server-only"
import fs from 'fs'
import path from 'path'
import { ContentEntry } from './types'

const CONTENT_ROOT = path.join(process.cwd(), 'content')

function readJsonFile(filePath: string): ContentEntry | ContentEntry[] | null {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8')
    const data = JSON.parse(raw)
    return data
  } catch {
    return null
  }
}

function walk(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList
  const files = fs.readdirSync(dir)
  for (const file of files) {
    const fp = path.join(dir, file)
    const stat = fs.statSync(fp)
    if (stat.isDirectory()) {
      walk(fp, fileList)
    } else if (file.endsWith('.json')) {
      fileList.push(fp)
    }
  }
  return fileList
}

let cachedContent: ContentEntry[] | null = null

export function getAllContent(): ContentEntry[] {
  if (cachedContent) return cachedContent

  const files = walk(CONTENT_ROOT)
  const entries: ContentEntry[] = []

  for (const filePath of files) {
    const data = readJsonFile(filePath)
    if (!data) continue
    if (Array.isArray(data)) {
      entries.push(...data)
    } else {
      entries.push(data as ContentEntry)
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
  return entries
}

export function getContentBySlug(slug: string): ContentEntry | undefined {
  return getAllContent().find((c) => c.slug === slug)
}

export function getContentById(id: string): ContentEntry | undefined {
  return getAllContent().find((c) => c.id === id)
}

export function getRelatedContent(entry: ContentEntry): ContentEntry[] {
  if (!entry.related || entry.related.length === 0) return []
  const all = getAllContent()
  return entry.related
    .map((rel) => all.find((c) => c.id === rel || c.slug === rel))
    .filter(Boolean) as ContentEntry[]
}

export function searchContent(query: string, filters?: { type?: string }): ContentEntry[] {
  const q = query.trim().toLowerCase()
  if (!q) return getAllContent().slice(0, 12)

  const all = getAllContent()
  return all.filter((entry) => {
    if (filters?.type && filters.type !== 'all' && entry.type !== filters.type) return false

    const haystack = [
      entry.title,
      entry.translation,
      entry.arabic,
      entry.latin,
      entry.reference,
      entry.category,
      entry.subcategory,
      entry.lesson,
      entry.reflection,
      ...(entry.tags || []),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return haystack.includes(q)
  })
}

export type { ContentEntry } from './types'
