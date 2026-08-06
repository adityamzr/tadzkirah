import { ContentEntry } from "./types"

// Pure client-safe search - supports Bahasa Indonesia
export function clientSearch(entries: ContentEntry[], query: string, typeFilter?: string): ContentEntry[] {
  const q = query.trim().toLowerCase()
  if (!q) {
    if (typeFilter && typeFilter !== 'all') {
      return entries.filter(e => e.type === typeFilter).slice(0, 20)
    }
    return entries.slice(0, 20)
  }

  const terms = q.split(/\s+/).filter(Boolean)

  return entries.filter((entry) => {
    if (typeFilter && typeFilter !== 'all' && entry.type !== typeFilter) return false

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

    return terms.every(t => haystack.includes(t))
  })
}

// Helper untuk highlight di UI (opsional)
export function getSearchScore(entry: ContentEntry, query: string): number {
  if (!query.trim()) return 0
  const q = query.toLowerCase()
  let score = 0
  if (entry.title.toLowerCase().includes(q)) score += 10
  if (entry.tags?.some(tag => tag.toLowerCase().includes(q))) score += 5
  if (entry.keywords?.some(k => k.toLowerCase().includes(q))) score += 5
  if (entry.reference?.toLowerCase().includes(q)) score += 3
  return score
}
