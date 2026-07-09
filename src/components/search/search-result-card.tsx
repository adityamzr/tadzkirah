"use client"

import { ContentEntry } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { BookOpen, Heart, FileText, Lightbulb, NotebookPen } from "lucide-react"

const typeConfig = {
  quran: { label: "Quran", icon: BookOpen, color: "bg-[#69C4E8]/15 text-[#69C4E8]", dot: "bg-[#69C4E8]" },
  hadith: { label: "Hadith", icon: FileText, color: "bg-[#171717]/10 text-[#171717] dark:bg-white/10 dark:text-white", dot: "bg-[#171717] dark:bg-white" },
  dua: { label: "Du'a", icon: Heart, color: "bg-[#C89B3C]/15 text-[#C89B3C]", dot: "bg-[#C89B3C]" },
  reminder: { label: "Reminder", icon: Lightbulb, color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" },
  reflection: { label: "Reflection", icon: NotebookPen, color: "bg-violet-500/10 text-violet-600 dark:text-violet-400", dot: "bg-violet-500" },
}

export function SearchResultCard({ entry, query }: { entry: ContentEntry; query?: string }) {
  const config = typeConfig[entry.type] || typeConfig.reminder
  const Icon = config.icon

  // highlight query (simple)
  const highlight = (text: string | undefined) => {
    if (!text || !query) return text
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
    let result = text
    // naive highlight - we keep plain for accessibility, use mark only visual? keep simple
    return result
  }

  return (
    <Link
      href={`/${entry.type}/${entry.slug}`}
      className="group block rounded-2xl border border-border bg-card p-5 text-left transition-all duration-200 hover:border-[#69C4E8]/30 hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.15)] hover:translate-y-[-1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#69C4E8]/30"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className={cn("flex h-8 w-8 items-center justify-center rounded-full", config.color)}>
            <Icon className="h-4 w-4" strokeWidth={1.8} />
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-medium tracking-wide text-[10px]">
              {config.label}
            </Badge>
            {entry.reference && (
              <span className="text-[12px] text-muted-foreground hidden sm:inline">{entry.reference}</span>
            )}
          </div>
        </div>
        <span className={cn("mt-2 hidden h-1.5 w-1.5 rounded-full sm:block", config.dot)} />
      </div>

      <h3 className="mt-3.5 line-clamp-2 text-[16px] font-[550] leading-snug tracking-tight group-hover:text-foreground">
        {entry.title}
      </h3>

      {entry.arabic && (
        <p className="mt-3 line-clamp-2 text-right font-amiri text-[18px] leading-relaxed text-foreground/80" dir="rtl">
          {entry.arabic.length > 120 ? entry.arabic.slice(0, 120) + "…" : entry.arabic}
        </p>
      )}

      {(entry.translation || entry.lesson) && (
        <p className="mt-3 line-clamp-2 text-[14px] leading-relaxed text-muted-foreground">
          {highlight(entry.translation || entry.lesson)}
        </p>
      )}

      {entry.tags && entry.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {entry.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="inline-flex rounded-full bg-muted px-2.5 py-1 text-[11px] text-muted-foreground"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  )
}
