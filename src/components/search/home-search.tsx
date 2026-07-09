"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ContentEntry } from "@/lib/types"
import { SearchBar } from "./search-bar"
import { SearchResults } from "./search-results"

export function HomeSearch({ entries }: { entries: ContentEntry[] }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQ = searchParams.get("q") || ""

  const [query, setQuery] = useState(initialQ)

  // Update URL debounced for shareability
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
    <div className="w-full">
      <SearchBar value={query} onChange={setQuery} />
      <div className="mt-2">
        <SearchResults entries={entries} query={query} />
      </div>
    </div>
  )
}
