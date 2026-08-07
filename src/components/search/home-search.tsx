"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ContentEntry } from "@/lib/types"
import { SearchBar } from "./search-bar"
import { SearchResults } from "./search-results"

export function HomeSearch({ entries }: { entries: ContentEntry[] }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQ = searchParams.get("q") || ""

  const [query, setQuery] = useState(initialQ)

  useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams(window.location.search)
      if (query) params.set("q", query)
      else params.delete("q")
      const newUrl = params.toString() ? `/?${params.toString()}` : "/"
      router.replace(newUrl, { scroll: false })
    }, 300)
    return () => clearTimeout(t)
  }, [query, router])

  return (
    <div className="flex w-full flex-1 flex-col overflow-hidden">
      <div className="shrink-0">
        <SearchBar value={query} onChange={setQuery} />
      </div>
      <div className="mt-3 flex min-h-0 flex-1 flex-col overflow-hidden md:mt-4">
        <div className="flex-1 overflow-y-auto rounded-[20px] scrollbar-thin md:px-1">
          <SearchResults entries={entries} query={query} />
        </div>
      </div>
    </div>
  )
}
