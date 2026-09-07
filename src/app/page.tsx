import { getAllContent } from "@/lib/content"
import { HomeSearch } from "@/components/search/home-search"
import { Suspense } from "react"

export default async function HomePage() {
  const allContent = await getAllContent()

  return (
    <div className="flex min-h-[calc(100vh-56px)] flex-col md:h-[calc(100vh-56px)] md:overflow-hidden">
      {/* Hero - centered, 100vh feel on desktop */}
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 py-6 md:overflow-hidden md:py-8">
        <div className="flex shrink-0 flex-col items-center text-center">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-[#171717] text-white shadow-sm dark:bg-white dark:text-[#171717] md:h-11 md:w-11">
              <span className="font-amiri text-[22px] font-bold leading-none md:text-[24px]">ت</span>
            </div>
            <h1 className="text-[28px] font-semibold tracking-tight md:text-[36px]">Tadzkirah</h1>
          </div>

          <p className="mt-3 max-w-md text-balance text-[15px] leading-relaxed text-muted-foreground md:text-[16px]">
            Pengingat pribadi melalui Al-Quran dan Sunnah.
          </p>

          <p className="mt-1.5 text-[12px] text-muted-foreground/70 md:text-[13px]">
            {allContent.length} referensi • Pencarian instan • 100vh • Tanpa scroll halaman
          </p>
        </div>

        {/* Search area - flex-1 with internal scroll on desktop */}
        <div className="mt-6 flex min-h-0 flex-1 flex-col md:mt-8 md:overflow-hidden">
          <Suspense fallback={
            <div className="mx-auto w-full max-w-[640px] h-[56px] animate-pulse rounded-full bg-muted" />
          }>
            <HomeSearch entries={allContent} />
          </Suspense>
        </div>
      </div>

      {/* Info - hide on desktop to keep 100vh no scroll, show on mobile or as small footer */}
      <div className="shrink-0 border-t border-border/30 bg-card/50 px-5 py-3 backdrop-blur-sm md:hidden">
        <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">Bukan platform sosial.</span> Basis pengetahuan pribadi untuk refleksi hening.
        </p>
      </div>

      {/* Desktop footer - inside 100vh, no scroll */}
      <div className="hidden shrink-0 border-t border-border/20 px-5 py-2.5 text-center md:block">
        <p className="text-[11px] text-muted-foreground/60">
          Bukan platform sosial • Biru Langit #69C4E8 • Hitam Ka'bah #171717 • Emas Kiswah #C89B3C • Neon Postgres • 100vh
        </p>
      </div>
    </div>
  )
}
