import { Badge } from "@/components/ui/badge"
import { ContentEntry } from "@/lib/types"
import { BookOpen, FileText, Heart, Lightbulb, NotebookPen, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

const map = {
  quran: { label: "Quran", icon: BookOpen },
  hadith: { label: "Hadith", icon: FileText },
  dua: { label: "Du'a", icon: Heart },
  reminder: { label: "Reminder", icon: Lightbulb },
  reflection: { label: "Reflection", icon: NotebookPen },
}

export function ContentHeader({ entry }: { entry: ContentEntry }) {
  const config = map[entry.type]
  const Icon = config.icon

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-[11px]">
          <Icon className="h-3.5 w-3.5" />
          {config.label}
        </Badge>
        {entry.category && (
          <Badge variant="outline" className="px-3 py-1">
            {entry.category}
          </Badge>
        )}
        {entry.subcategory && (
          <Badge variant="outline" className="px-3 py-1 opacity-60">
            {entry.subcategory}
          </Badge>
        )}
      </div>

      <h1 className="text-balance text-[26px] font-semibold leading-tight tracking-tight md:text-[32px] lg:text-[36px]">
        {entry.title}
      </h1>

      {entry.reference && (
        <p className="text-[14px] font-medium tracking-wide text-muted-foreground">
          <span className="inline-flex items-center rounded-full bg-muted px-3 py-1">{entry.reference}</span>
        </p>
      )}

      {entry.createdAt && (
        <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          Last reflected {new Date(entry.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </div>
      )}
    </div>
  )
}
