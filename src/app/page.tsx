import { getAllContent } from "@/lib/content"
import { HomeSearch } from "@/components/search/home-search"
import { Suspense } from "react"

export default async function HomePage() {
  const allContent = await getAllContent()

  return (
    <div className="flex min-h-[calc(100vh-112px)] flex-col">
      {/* Hero Search Section */}
      <div className="mx-auto w-full max-w-6xl px-5 pb-16 pt-12 md:pt-20 lg:pt-28">
        {/* Logo + Nama + Tagline */}
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-[#171717] text-white shadow-sm dark:bg-white dark:text-[#171717] md:h-12 md:w-12">
              <span className="font-amiri text-[26px] font-bold leading-none md:text-[28px]">ت</span>
            </div>
            <h1 className="text-[32px] font-semibold tracking-tight md:text-[40px]">Tadzkirah</h1>
          </div>

          <p className="mt-4 max-w-md text-balance text-[16px] leading-relaxed text-muted-foreground md:text-[17px]">
            Pengingat pribadi melalui Al-Quran dan Sunnah.
          </p>

          <p className="mt-2 text-[13px] text-muted-foreground/70">
            {allContent.length} referensi autentik • Pencarian instan • Pelajaran pribadi
          </p>
        </div>

        {/* Pencarian */}
        <div className="mt-10 md:mt-12">
          <Suspense fallback={
            <div className="mx-auto max-w-[640px] h-[56px] animate-pulse rounded-full bg-muted" />
          }>
            <HomeSearch entries={allContent} />
          </Suspense>
        </div>
      </div>

      {/* Info minimalis */}
      <div className="mx-auto w-full max-w-3xl px-5 pb-12 text-center">
        <div className="rounded-2xl border border-dashed border-border/80 bg-muted/30 p-5">
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">Bukan platform sosial.</span> Bukan aplikasi Al-Quran. Bukan komunitas.
            <br className="hidden md:block" />
            Ini adalah basis pengetahuan pribadi — dibuat untuk refleksi hening, pengingat harian, dan pencarian cepat.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2 text-[11px]">
            <span className="rounded-full bg-card border border-border px-2.5 py-1">Biru Langit #69C4E8</span>
            <span className="rounded-full bg-card border border-border px-2.5 py-1">Hitam Ka'bah #171717</span>
            <span className="rounded-full bg-card border border-border px-2.5 py-1">Emas Kiswah #C89B3C</span>
          </div>
        </div>
      </div>
    </div>
  )
}
