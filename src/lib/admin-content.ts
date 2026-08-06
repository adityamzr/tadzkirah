import "server-only"
import { ContentEntry } from './types'
import { getDatabase, isDatabaseConfigured, schema } from './db'
import { eq, sql } from 'drizzle-orm'

// For fallback file operations when DB not configured
import fs from 'fs'
import path from 'path'
import { getFilePathForEntry, commitFileToGitHub, deleteFileFromGitHub, isGitHubConfigured } from './github'

const CONTENT_ROOT = path.join(process.cwd(), 'content')

function findFilePathByIdFile(id: string): string | null {
  // simplified file search for fallback
  if (!fs.existsSync(CONTENT_ROOT)) return null
  const walk = (dir: string, list: string[] = []): string[] => {
    const files = fs.readdirSync(dir)
    for (const file of files) {
      const fp = path.join(dir, file)
      if (file.startsWith('_') || file.startsWith('.')) continue
      const stat = fs.statSync(fp)
      if (stat.isDirectory()) {
        if (file === 'templates') continue
        walk(fp, list)
      } else if (file.endsWith('.json')) {
        list.push(fp)
      }
    }
    return list
  }

  const files = walk(CONTENT_ROOT)
  for (const filePath of files) {
    try {
      const raw = fs.readFileSync(filePath, 'utf-8')
      const data = JSON.parse(raw)
      if (data && typeof data === 'object' && Array.isArray(data.items)) {
        if (data.items.some((item: any) => item.id === id)) return filePath
      } else if (Array.isArray(data)) {
        if (data.some((item: any) => item.id === id)) return filePath
      } else if (data && data.id === id) {
        return filePath
      }
    } catch { continue }
  }
  return null
}

// DB operations
export async function createContentDB(entry: ContentEntry): Promise<{ success: boolean; error?: string }> {
  if (!isDatabaseConfigured()) {
    return { success: false, error: "Database tidak dikonfigurasi" }
  }

  try {
    const db = getDatabase()
    if (!db) return { success: false, error: "Gagal koneksi DB" }

    const slug = entry.slug || entry.id

    // Check exists
    const existing = await db.select().from(schema.contents).where(eq(schema.contents.id, entry.id))
    if (existing.length > 0) {
      return { success: false, error: `ID ${entry.id} sudah ada` }
    }

    const slugExists = await db.select().from(schema.contents).where(eq(schema.contents.slug, slug))
    if (slugExists.length > 0) {
      return { success: false, error: `Slug ${slug} sudah ada` }
    }

    await db.insert(schema.contents).values({
      id: entry.id,
      slug,
      type: entry.type,
      title: entry.title,
      reference: entry.reference || null,
      category: entry.category || null,
      subcategory: entry.subcategory || null,
      arabic: entry.arabic || null,
      latin: entry.latin || null,
      translation: entry.translation || null,
      lesson: entry.lesson || null,
      reflection: entry.reflection || null,
      tags: entry.tags || null,
      keywords: entry.keywords || null,
      related: entry.related || null,
      youtube: entry.youtube || null,
      source: entry.source || null,
      createdAt: entry.createdAt || new Date().toISOString().split('T')[0],
    })

    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message || String(e) }
  }
}

export async function updateContentDB(id: string, updates: Partial<ContentEntry>): Promise<{ success: boolean; error?: string }> {
  if (!isDatabaseConfigured()) {
    return { success: false, error: "Database tidak dikonfigurasi" }
  }

  try {
    const db = getDatabase()
    if (!db) return { success: false, error: "Gagal koneksi DB" }

    const existing = await db.select().from(schema.contents).where(eq(schema.contents.id, id))
    if (existing.length === 0) {
      return { success: false, error: `ID ${id} tidak ditemukan` }
    }

    const updateData: any = {}
    if (updates.slug !== undefined) updateData.slug = updates.slug
    if (updates.type !== undefined) updateData.type = updates.type
    if (updates.title !== undefined) updateData.title = updates.title
    if (updates.reference !== undefined) updateData.reference = updates.reference
    if (updates.category !== undefined) updateData.category = updates.category
    if (updates.subcategory !== undefined) updateData.subcategory = updates.subcategory
    if (updates.arabic !== undefined) updateData.arabic = updates.arabic
    if (updates.latin !== undefined) updateData.latin = updates.latin
    if (updates.translation !== undefined) updateData.translation = updates.translation
    if (updates.lesson !== undefined) updateData.lesson = updates.lesson
    if (updates.reflection !== undefined) updateData.reflection = updates.reflection
    if (updates.tags !== undefined) updateData.tags = updates.tags
    if (updates.keywords !== undefined) updateData.keywords = updates.keywords
    if (updates.related !== undefined) updateData.related = updates.related
    if (updates.youtube !== undefined) updateData.youtube = updates.youtube
    if (updates.source !== undefined) updateData.source = updates.source
    if (updates.createdAt !== undefined) updateData.createdAt = updates.createdAt
    updateData.updatedAt = new Date()

    await db.update(schema.contents).set(updateData).where(eq(schema.contents.id, id))

    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message || String(e) }
  }
}

export async function deleteContentDB(id: string): Promise<{ success: boolean; error?: string }> {
  if (!isDatabaseConfigured()) {
    return { success: false, error: "Database tidak dikonfigurasi" }
  }

  try {
    const db = getDatabase()
    if (!db) return { success: false, error: "Gagal koneksi DB" }

    await db.delete(schema.contents).where(eq(schema.contents.id, id))

    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message || String(e) }
  }
}

// Unified functions that auto-pick DB or file + GitHub
export async function createContent(entry: ContentEntry): Promise<{ success: boolean; error?: string; filePath?: string; github?: any }> {
  // If DB configured, use DB
  if (isDatabaseConfigured()) {
    const res = await createContentDB(entry)
    return res
  }

  // Fallback to file + GitHub (old logic simplified)
  try {
    const slug = entry.slug || entry.id
    const filePath = getFilePathForEntry({ type: entry.type, slug, id: entry.id })
    const fullPath = path.join(process.cwd(), filePath)

    if (fs.existsSync(fullPath)) {
      return { success: false, error: `File sudah ada: ${filePath}` }
    }

    const dir = path.dirname(fullPath)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

    const contentToSave: any = {
      id: entry.id,
      slug,
      type: entry.type,
      title: entry.title,
      reference: entry.reference || undefined,
      category: entry.category || undefined,
      subcategory: entry.subcategory || undefined,
      arabic: entry.arabic || undefined,
      latin: entry.latin || undefined,
      translation: entry.translation || undefined,
      lesson: entry.lesson || undefined,
      reflection: entry.reflection || undefined,
      tags: entry.tags,
      keywords: entry.keywords,
      related: entry.related,
      youtube: entry.youtube,
      source: entry.source,
      createdAt: entry.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    }
    Object.keys(contentToSave).forEach(k => contentToSave[k] === undefined && delete contentToSave[k])

    const jsonContent = JSON.stringify(contentToSave, null, 2)

    let localSuccess = false
    try {
      fs.writeFileSync(fullPath, jsonContent, 'utf-8')
      localSuccess = true
    } catch (e) {
      console.warn("Gagal tulis lokal:", e)
    }

    let githubResult = null
    if (isGitHubConfigured()) {
      githubResult = await commitFileToGitHub(filePath, jsonContent, `content: tambah ${entry.id}`)
      if (!githubResult.success && !localSuccess) {
        return { success: false, error: githubResult.error }
      }
    }

    return { success: true, filePath, github: githubResult }
  } catch (e: any) {
    return { success: false, error: e.message || String(e) }
  }
}

export async function updateContent(id: string, updates: Partial<ContentEntry>): Promise<{ success: boolean; error?: string; filePath?: string; github?: any }> {
  if (isDatabaseConfigured()) {
    return await updateContentDB(id, updates)
  }

  // Fallback file logic - simplified
  try {
    const filePath = findFilePathByIdFile(id)
    if (!filePath) return { success: false, error: `Konten ${id} tidak ditemukan` }

    const raw = fs.readFileSync(filePath, 'utf-8')
    const data = JSON.parse(raw)

    let existingEntry: any = null
    let isCollection = false
    let collectionData: any = null
    let entryIndex = -1
    let finalContent: string
    let targetFilePath = filePath

    if (data && typeof data === 'object' && Array.isArray(data.items)) {
      isCollection = true
      collectionData = data
      entryIndex = data.items.findIndex((item: any) => item.id === id)
      existingEntry = data.items[entryIndex]
    } else if (Array.isArray(data)) {
      entryIndex = data.findIndex((item: any) => item.id === id)
      existingEntry = data[entryIndex]
    } else {
      existingEntry = data
    }

    if (!existingEntry) return { success: false, error: `Entry ${id} tidak ditemukan` }

    const merged = { ...existingEntry, ...updates, updatedAt: new Date().toISOString().split('T')[0] }

    if (isCollection) {
      collectionData.items[entryIndex] = merged
      finalContent = JSON.stringify(collectionData, null, 2)
    } else if (Array.isArray(data)) {
      data[entryIndex] = merged
      finalContent = JSON.stringify(data, null, 2)
    } else {
      finalContent = JSON.stringify(merged, null, 2)
    }

    // Rename if slug changed
    if (!isCollection && !Array.isArray(data) && updates.slug && updates.slug !== existingEntry.slug) {
      const newFilePath = path.join(path.dirname(filePath), `${updates.slug}.json`)
      try {
        fs.unlinkSync(filePath)
        targetFilePath = newFilePath
      } catch {}
    }

    try {
      fs.writeFileSync(targetFilePath, finalContent, 'utf-8')
    } catch (e) {
      console.warn("Gagal tulis lokal:", e)
    }

    let githubResult = null
    if (isGitHubConfigured()) {
      const relativePath = path.relative(process.cwd(), targetFilePath)
      githubResult = await commitFileToGitHub(relativePath, finalContent, `content: update ${id}`)
    }

    return { success: true, filePath: path.relative(process.cwd(), targetFilePath), github: githubResult }
  } catch (e: any) {
    return { success: false, error: e.message || String(e) }
  }
}

export async function deleteContent(id: string): Promise<{ success: boolean; error?: string; github?: any }> {
  if (isDatabaseConfigured()) {
    return await deleteContentDB(id)
  }

  try {
    const filePath = findFilePathByIdFile(id)
    if (!filePath) return { success: false, error: `Konten ${id} tidak ditemukan` }

    const raw = fs.readFileSync(filePath, 'utf-8')
    const data = JSON.parse(raw)

    let finalContent: string | null = null
    let shouldDeleteFile = false

    if (data && typeof data === 'object' && Array.isArray(data.items)) {
      const filtered = data.items.filter((item: any) => item.id !== id)
      if (filtered.length === 0) shouldDeleteFile = true
      else {
        data.items = filtered
        finalContent = JSON.stringify(data, null, 2)
      }
    } else if (Array.isArray(data)) {
      const filtered = data.filter((item: any) => item.id !== id)
      if (filtered.length === 0) shouldDeleteFile = true
      else finalContent = JSON.stringify(filtered, null, 2)
    } else {
      shouldDeleteFile = true
    }

    try {
      if (shouldDeleteFile) fs.unlinkSync(filePath)
      else if (finalContent) fs.writeFileSync(filePath, finalContent, 'utf-8')
    } catch (e) {
      console.warn("Gagal hapus/tulis lokal:", e)
    }

    let githubResult = null
    if (isGitHubConfigured()) {
      const relativePath = path.relative(process.cwd(), filePath)
      const { deleteFileFromGitHub } = await import('./github')
      if (shouldDeleteFile) {
        githubResult = await deleteFileFromGitHub(relativePath, `content: hapus ${id}`)
      } else if (finalContent) {
        githubResult = await commitFileToGitHub(relativePath, finalContent, `content: hapus item ${id} dari koleksi`)
      }
    }

    return { success: true, github: githubResult }
  } catch (e: any) {
    return { success: false, error: e.message || String(e) }
  }
}
