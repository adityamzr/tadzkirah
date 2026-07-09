import { ContentEntry } from "./types"

// Pure client-safe search
export function clientSearch(entries: ContentEntry[], query: string, typeFilter?: string): ContentEntry[] {
  const q = query.trim().toLowerCase()
  if (!q) {
    if (typeFilter && typeFilter !== 'all') {
      return entries.filter(e => e.type === typeFilter).slice(0, 20)
    }
    return entries.slice(0, 20)
  }

  return entries.filter((entry) => {
    if (typeFilter && typeFilter !== 'all' && entry.type !== typeFilter) return false
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
    const terms = q.split(/\s+/).filter(Boolean)
    return terms.every(t => haystack.includes(t))
  })
}
