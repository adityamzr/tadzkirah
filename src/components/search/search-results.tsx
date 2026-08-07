"use client"

import { ContentEntry } from "@/lib/types"
import { clientSearch } from "@/lib/search"
import { SearchResultCard } from "./search-result-card"
import { useMemo, useState } from "react"
import { cn } from "@/lib/utils"

const filters = [
  { id: "all", label: "Semua" },
  { id: "quran", label: "Quran" },
  { id: "hadith", label: "Hadits" },
  { id: "dua", label: "Doa" },
  { id: "reminder", label: "Pengingat" },
  { id: "reflection", label: "Catatan" },
]

export function SearchResults({ entries, query }: { entries: ContentEntry[]; query: string }) {
  const [activeFilter, setActiveFilter] = useState("all")

  const filtered = useMemo(() => {
    return clientSearch(entries, query, activeFilter)
  }, [entries, query, activeFilter])

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: entries.length }
    for (const e of entries) {
      map[e.type] = (map[e.type] || 0) + 1
    }
    return map
  }, [entries])

  return (
    <div className="flex w-full flex-col">
      {/* Filter - compact, sticky top */}
      <div className="sticky top-0 z-10 -mx-1 flex flex-wrap items-center justify-center gap-1.5 bg-background/80 px-1 py-2 backdrop-blur-xl md:gap-2">
        {filters.map((f) => {
          const active = activeFilter === f.id
          return (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={cn(
                "inline-flex h-7 items-center gap-1 rounded-full border px-3 text-[12px] font-medium transition-all duration-200 active:scale-95 md:h-8 md:px-3.5 md:text-[13px]",
                active
                  ? "border-[#171717] bg-[#171717] text-white shadow-sm dark:border-white dark:bg-white dark:text-[#171717]"
                  : "border-border bg-card text-muted-foreground shadow-sm hover:bg-muted hover:text-foreground hover:shadow"
              )}
              aria-label={`Filter ${f.label}`}
            >
              {f.label}
              <span className={cn("text-[10px] md:text-[11px]", active ? "text-white/60 dark:text-black/50" : "text-muted-foreground/60")}>
                {f.id === "all" ? entries.length : counts[f.id] || 0}
              </span>
            </button>
          )
        })}
      </div>

      {/* Info hasil - compact */}
      <div className="mx-auto mt-3 w-full max-w-3xl md:mt-4">
        <p className="text-center text-[11px] text-muted-foreground md:text-[12px]">
          {query ? (
            <>
              <span className="font-medium text-foreground">{filtered.length}</span> hasil untuk{" "}
              <span className="font-medium text-foreground">&quot;{query}&quot;</span>
              {activeFilter !== "all" && <> di {filters.find(f=>f.id===activeFilter)?.label}</>}
            </>
          ) : (
            <>Menampilkan {filtered.length} entri • Basis pengetahuan pribadi • Mulai dari 0</>
          )}
        </p>
      </div>

      {/* Grid - responsive, smooth */}
      <div className="mx-auto mt-3 grid w-full max-w-5xl grid-cols-1 gap-3 pb-4 md:mt-4 md:grid-cols-2 md:gap-4">
        {filtered.map((entry) => (
          <div key={entry.id} className="animate-in fade-in duration-300">
            <SearchResultCard entry={entry} query={query} />
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mx-auto mt-8 flex max-w-md flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/20 p-8 text-center md:mt-12">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-muted">
            <span className="text-lg">∅</span>
          </div>
          <h3 className="mt-3 text-[14px] font-medium">Tidak ditemukan hasil yang sesuai.</h3>
          <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
            {entries.length === 0
              ? "Database masih kosong. Mulai tambahkan konten dari dashboard admin."
              : `Pencarian untuk "${query}" tidak cocok. Coba kata kunci lain.`}
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            {["sabar", "syukur", "quran", "doa"].map((tag) => (
              <span key={tag} className="rounded-full bg-muted px-2.5 py-1 text-[11px] text-muted-foreground">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
