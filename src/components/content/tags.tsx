"use client"

import { useRouter } from "next/navigation"

export function Tags({ tags }: { tags?: string[] }) {
  const router = useRouter()
  if (!tags || tags.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => router.push(`/?q=${encodeURIComponent(tag)}`)}
          className="rounded-full border border-border bg-card px-3 py-1 text-[12px] text-muted-foreground transition-colors hover:border-[#69C4E8]/30 hover:text-foreground"
        >
          #{tag}
        </button>
      ))}
    </div>
  )
}
