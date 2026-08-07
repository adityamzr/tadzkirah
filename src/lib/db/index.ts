import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "./schema"

function getDb() {
  const url = process.env.DATABASE_URL
  if (!url) {
    return null
  }

  const sql = neon(url)
  const db = drizzle(sql, { schema })
  return db
}

// Singleton
let dbInstance: ReturnType<typeof getDb> | null = null

export function getDatabase() {
  if (dbInstance) return dbInstance
  dbInstance = getDb()
  return dbInstance
}

export function isDatabaseConfigured(): boolean {
  return !!process.env.DATABASE_URL
}

export { schema }
