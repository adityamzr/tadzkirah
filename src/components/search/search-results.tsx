"use client"

import { ContentEntry } from "@/lib/types"
import { clientSearch } from "@/lib/search"
import { SearchResultCard } from "./search-result-card"
import { useMemo, useState } from "react"
import { cn } from "@/lib/utils"

const filters = [
  { id: "all", label: "All" },
  { id: "quran", label: "Quran" },
  { id: "hadith", label: "Hadith" },
  { id: "dua", label: "Du'a" },
  { id: "reminder", label: "Reminders" },
  { id: "reflection", label: "Reflections" },
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
    <div className="w-full">
      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2 md:mt-8">
        {filters.map((f) => {
          const active = activeFilter === f.id
          return (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-medium transition-all",
                active
                  ? "border-[#171717] bg-[#171717] text-white dark:border-white dark:bg-white dark:text-[#171717] shadow-sm"
                  : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {f.label}
              <span className={cn("text-[11px]", active ? "text-white/60 dark:text-black/50" : "text-muted-foreground/60")}>
                {f.id === "all" ? entries.length : counts[f.id] || 0}
              </span>
            </button>
          )
        })}
      </div>

      {/* Results info */}
      <div className="mx-auto mt-8 max-w-3xl">
        <p className="text-center text-[13px] text-muted-foreground">
          {query ? (
            <>
              <span className="font-medium text-foreground">{filtered.length}</span> results for{" "}
              <span className="font-medium text-foreground">&quot;{query}&quot;</span>
              {activeFilter !== "all" && <> in {activeFilter}</>}
            </>
          ) : (
            <>Showing {filtered.length} recent entries • Personal knowledge base</>
          )}
        </p>
      </div>

      {/* Grid */}
      <div className="mx-auto mt-6 grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
        {filtered.map((entry) => (
          <SearchResultCard key={entry.id} entry={entry} query={query} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mx-auto mt-16 max-w-md text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <span className="text-lg">∅</span>
          </div>
          <h3 className="mt-4 text-[15px] font-medium">No results found</h3>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
            Try different keywords, check transliteration, or browse by category. Your search for &quot;{query}&quot; didn&apos;t match any entries.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-1.5">
            {["sabr", "tawakkul", "shukr", "quran", "dua"].map((tag) => (
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
