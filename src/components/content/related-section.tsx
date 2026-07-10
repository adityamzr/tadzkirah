import { ContentEntry } from "@/lib/types"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

const typeLabelId: Record<string, string> = {
  quran: "Quran",
  hadith: "Hadits",
  dua: "Doa",
  reminder: "Pengingat",
  reflection: "Catatan",
}

export function RelatedSection({ entries }: { entries: ContentEntry[] }) {
  if (!entries || entries.length === 0) return null

  return (
    <div className="space-y-4">
      <h2 className="text-[13px] font-semibold uppercase tracking-widest text-muted-foreground">Referensi Terkait</h2>
      <div className="grid gap-3 md:grid-cols-2">
        {entries.map((entry) => (
          <Link
            key={entry.id}
            href={`/${entry.type}/${entry.slug}`}
            className="group flex items-center justify-between rounded-2xl border border-border bg-card p-4 transition-all hover:border-[#69C4E8]/30 hover:shadow-sm"
          >
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                {typeLabelId[entry.type] || entry.type} • {entry.reference || entry.category}
              </p>
              <p className="mt-1 line-clamp-2 text-[14px] font-medium leading-snug group-hover:text-foreground">
                {entry.title}
              </p>
            </div>
            <div className="ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors group-hover:bg-[#69C4E8] group-hover:text-[#171717]">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
