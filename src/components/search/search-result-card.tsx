"use client"

import { ContentEntry } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { BookOpen, Heart, FileText, Lightbulb, NotebookPen } from "lucide-react"

const typeConfig = {
  quran: { label: "Quran", labelId: "Quran", icon: BookOpen, color: "bg-[#69C4E8]/15 text-[#69C4E8]", dot: "bg-[#69C4E8]" },
  hadith: { label: "Hadis", labelId: "Hadits", icon: FileText, color: "bg-[#171717]/10 text-[#171717] dark:bg-white/10 dark:text-white", dot: "bg-[#171717] dark:bg-white" },
  dua: { label: "Doa", labelId: "Doa", icon: Heart, color: "bg-[#C89B3C]/15 text-[#C89B3C]", dot: "bg-[#C89B3C]" },
  reminder: { label: "Pengingat", labelId: "Pengingat", icon: Lightbulb, color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" },
  reflection: { label: "Catatan", labelId: "Catatan Pribadi", icon: NotebookPen, color: "bg-violet-500/10 text-violet-600 dark:text-violet-400", dot: "bg-violet-500" },
}

export function SearchResultCard({ entry }: { entry: ContentEntry; query?: string }) {
  const config = typeConfig[entry.type] || typeConfig.reminder
  const Icon = config.icon

  const lessonText = Array.isArray(entry.lesson) ? entry.lesson[0] : entry.lesson
  const displayText = entry.translation || lessonText

  return (
    <Link
      href={`/${entry.type}/${entry.slug}`}
      className="group flex h-full flex-col rounded-2xl border border-border bg-card p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#69C4E8]/30 hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#69C4E8]/30 md:p-5"
      aria-label={`Buka ${config.labelId}: ${entry.title}`}
    >
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full md:h-8 md:w-8", config.color)}>
            <Icon className="h-3.5 w-3.5 md:h-4 md:w-4" strokeWidth={1.8} />
          </div>
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            <Badge variant="secondary" className="shrink-0 px-2 py-0.5 text-[10px] font-medium tracking-wide">
              {config.label}
            </Badge>
            {entry.reference && (
              <span className="hidden max-w-[140px] truncate text-[11px] text-muted-foreground sm:inline md:max-w-[180px]">{entry.reference}</span>
            )}
          </div>
        </div>
        <span className={cn("mt-1.5 hidden h-1.5 w-1.5 shrink-0 rounded-full sm:block", config.dot)} />
      </div>

      <h3 className="mt-3 line-clamp-2 text-[14px] font-[550] leading-snug tracking-tight group-hover:text-foreground md:text-[15px]">
        {entry.title}
      </h3>

      {entry.arabic && (
        <p className="mt-2.5 line-clamp-2 text-right font-amiri text-[16px] leading-relaxed text-foreground/80 md:text-[17px]" dir="rtl">
          {entry.arabic.length > 100 ? entry.arabic.slice(0, 100) + "…" : entry.arabic}
        </p>
      )}

      {displayText && (
        <p className="mt-2.5 line-clamp-2 flex-1 text-[13px] leading-relaxed text-muted-foreground md:text-[13px]">
          {typeof displayText === 'string' ? displayText : ''}
        </p>
      )}

      {entry.tags && entry.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {entry.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground transition-colors group-hover:bg-muted/80"
            >
              #{tag}
            </span>
          ))}
          {entry.tags.length > 3 && (
            <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">+{entry.tags.length - 3}</span>
          )}
        </div>
      )}
    </Link>
  )
}
