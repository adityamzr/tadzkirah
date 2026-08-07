/**
 * Migrate existing JSON content in /content to Neon Postgres
 * Usage: DATABASE_URL=xxx npx tsx scripts/migrate-json-to-neon.ts
 */

import fs from 'fs'
import path from 'path'
import { neon } from '@neondatabase/serverless'

const CONTENT_ROOT = path.join(process.cwd(), 'content')

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

function parseFile(filePath: string): any[] {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8')
    const data = JSON.parse(raw)
    if (data && typeof data === 'object' && Array.isArray(data.items)) {
      const defaults = data.defaults || {}
      return data.items.map((item: any) => ({ ...defaults, ...item }))
    }
    if (Array.isArray(data)) return data
    return [data]
  } catch (e) {
    console.warn(`Gagal baca ${filePath}`, e)
    return []
  }
}

async function main() {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    console.error("DATABASE_URL tidak di-set")
    process.exit(1)
  }

  const sql = neon(dbUrl)

  console.log("Membuat tabel jika belum ada...")
  await sql`
    CREATE TABLE IF NOT EXISTS contents (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      reference TEXT,
      category TEXT,
      subcategory TEXT,
      arabic TEXT,
      latin TEXT,
      translation TEXT,
      lesson JSONB,
      reflection TEXT,
      tags JSONB,
      keywords JSONB,
      related JSONB,
      youtube JSONB,
      source TEXT,
      created_at TEXT,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

  console.log("Mengumpulkan konten dari /content...")
  const files = walk(CONTENT_ROOT)
  const allEntries: any[] = []
  const seen = new Set<string>()

  for (const file of files) {
    const entries = parseFile(file)
    for (const e of entries) {
      if (!e.id || !e.type || !e.title) {
        console.warn(`Skip invalid entry di ${file}:`, e)
        continue
      }
      if (seen.has(e.id)) {
        console.warn(`Duplikat ID ${e.id} di ${file}, skip`)
        continue
      }
      seen.add(e.id)
      allEntries.push(e)
    }
  }

  console.log(`Ditemukan ${allEntries.length} entri valid`)

  let inserted = 0
  let skipped = 0

  for (const entry of allEntries) {
    const slug = entry.slug || entry.id
    try {
      await sql`
        INSERT INTO contents (
          id, slug, type, title, reference, category, subcategory,
          arabic, latin, translation, lesson, reflection,
          tags, keywords, related, youtube, source, created_at
        ) VALUES (
          ${entry.id},
          ${slug},
          ${entry.type},
          ${entry.title},
          ${entry.reference || null},
          ${entry.category || null},
          ${entry.subcategory || null},
          ${entry.arabic || null},
          ${entry.latin || null},
          ${entry.translation || null},
          ${entry.lesson ? JSON.stringify(entry.lesson) : null}::jsonb,
          ${entry.reflection || null},
          ${entry.tags ? JSON.stringify(entry.tags) : null}::jsonb,
          ${entry.keywords ? JSON.stringify(entry.keywords) : null}::jsonb,
          ${entry.related ? JSON.stringify(entry.related) : null}::jsonb,
          ${entry.youtube ? JSON.stringify(entry.youtube) : null}::jsonb,
          ${entry.source || null},
          ${entry.createdAt || null}
        )
        ON CONFLICT (id) DO UPDATE SET
          slug = EXCLUDED.slug,
          type = EXCLUDED.type,
          title = EXCLUDED.title,
          reference = EXCLUDED.reference,
          category = EXCLUDED.category,
          subcategory = EXCLUDED.subcategory,
          arabic = EXCLUDED.arabic,
          latin = EXCLUDED.latin,
          translation = EXCLUDED.translation,
          lesson = EXCLUDED.lesson,
          reflection = EXCLUDED.reflection,
          tags = EXCLUDED.tags,
          keywords = EXCLUDED.keywords,
          related = EXCLUDED.related,
          youtube = EXCLUDED.youtube,
          source = EXCLUDED.source,
          updated_at = NOW()
      `
      inserted++
      console.log(`✓ ${entry.id} (${entry.type})`)
    } catch (e) {
      console.error(`✗ Gagal insert ${entry.id}:`, e)
      skipped++
    }
  }

  console.log(`\nSelesai! ${inserted} berhasil, ${skipped} gagal`)
  console.log(`Total di DB sekarang:`)
  const count = await sql`SELECT COUNT(*) as total, type FROM contents GROUP BY type`
  console.log(count)
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
