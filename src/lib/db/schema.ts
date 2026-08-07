import { pgTable, text, timestamp, jsonb } from "drizzle-orm/pg-core"

export const contents = pgTable("contents", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  type: text("type").notNull(), // quran, hadith, dua, reminder, reflection
  title: text("title").notNull(),
  reference: text("reference"),
  category: text("category"),
  subcategory: text("subcategory"),
  arabic: text("arabic"),
  latin: text("latin"),
  translation: text("translation"),
  lesson: jsonb("lesson").$type<string | string[]>(), // bisa string atau array
  reflection: text("reflection"),
  tags: jsonb("tags").$type<string[]>(),
  keywords: jsonb("keywords").$type<string[]>(),
  related: jsonb("related").$type<string[]>(),
  youtube: jsonb("youtube").$type<any[]>(),
  source: text("source"),
  createdAt: text("created_at"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export type ContentRow = typeof contents.$inferSelect
export type NewContentRow = typeof contents.$inferInsert
