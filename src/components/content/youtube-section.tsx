"use client"

import { YouTubeReference } from "@/lib/types"
import { Play, Clock, User } from "lucide-react"
import { useState } from "react"

export function YouTubeSection({ videos }: { videos?: YouTubeReference[] }) {
  const [active, setActive] = useState<YouTubeReference | null>(null)

  if (!videos || videos.length === 0) return null

  const getThumb = (v: YouTubeReference) => {
    if (v.thumbnail) return v.thumbnail
    // try extract id from youtube url
    const match = v.url.match(/(?:v=|\.be\/)([A-Za-z0-9_-]+)/)
    const id = match ? match[1] : v.id
    return `https://img.youtube.com/vi/${id}/hqdefault.jpg`
  }

  return (
    <div className="space-y-4">
      <h2 className="text-[13px] font-semibold uppercase tracking-widest text-muted-foreground">Discussions</h2>

      <div className="grid gap-4 md:grid-cols-2">
        {videos.map((video) => (
          <button
            key={video.id}
            onClick={() => setActive(video)}
            className="group flex gap-3.5 rounded-2xl border border-border bg-card p-3 text-left transition-all hover:border-[#69C4E8]/30 hover:shadow-sm text-start"
          >
            <div className="relative h-[84px] w-[120px] shrink-0 overflow-hidden rounded-xl bg-muted">
              <img
                src={getThumb(video)}
                alt={video.title}
                className="h-full w-full object-cover transition-transform group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 grid place-items-center bg-black/20 backdrop-blur-[0.5px] transition-colors group-hover:bg-black/30">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-white/95 text-black shadow">
                  <Play className="ml-0.5 h-4 w-4 fill-black" />
                </div>
              </div>
              {video.duration && (
                <div className="absolute bottom-1 right-1 rounded bg-black/80 px-1.5 py-0.5 text-[10px] text-white">
                  {video.duration}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1 py-0.5">
              <p className="line-clamp-2 text-[14px] font-medium leading-snug group-hover:text-foreground">
                {video.title}
              </p>
              {video.speaker && (
                <div className="mt-1.5 flex items-center gap-1 text-[12px] text-muted-foreground">
                  <User className="h-3 w-3" />
                  {video.speaker}
                </div>
              )}
              {video.duration && (
                <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {video.duration}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {active && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setActive(null)}>
          <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-black shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="aspect-video w-full">
              <iframe
                src={`https://www.youtube.com/embed/${active.id}?autoplay=1`}
                title={active.title}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="flex items-center justify-between bg-[#161B22] p-4">
              <div>
                <p className="text-[14px] font-medium text-white">{active.title}</p>
                {active.speaker && <p className="text-[12px] text-white/60">{active.speaker}</p>}
              </div>
              <button onClick={() => setActive(null)} className="rounded-full bg-white/10 px-4 py-1.5 text-[12px] text-white hover:bg-white/20">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
