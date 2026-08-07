import { getAllContent, getContentBySlug, getRelatedContent } from "@/lib/content"
import { ContentHeader } from "@/components/content/content-header"
import { ArabicText } from "@/components/content/arabic-text"
import { TranslationBlock } from "@/components/content/translation-block"
import { Tags } from "@/components/content/tags"
import { RelatedSection } from "@/components/content/related-section"
import { YouTubeSection } from "@/components/content/youtube-section"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface Props {
  params: Promise<{ type: string; slug: string }>
}

export async function generateStaticParams() {
  const all = await getAllContent()
  return all.map((e) => ({
    type: e.type,
    slug: e.slug,
  }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const entry = await getContentBySlug(slug)
  if (!entry) return {}
  const desc = entry.translation || (Array.isArray(entry.lesson) ? entry.lesson[0] : entry.lesson) || entry.title
  return {
    title: `${entry.title} — Tadzkirah`,
    description: typeof desc === 'string' ? desc : entry.title,
  }
}

export default async function ContentPage({ params }: Props) {
  const { type, slug } = await params
  const entry = await getContentBySlug(slug)

  if (!entry || entry.type !== type) {
    notFound()
  }

  const related = await getRelatedContent(entry)

  return (
    <div className="flex min-h-[calc(100vh-56px)] flex-col md:h-[calc(100vh-56px)] md:overflow-hidden">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-3xl px-5 py-6 md:px-6 md:py-8">
            <Link
              href="/"
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-[13px] text-muted-foreground shadow-sm transition-all hover:bg-muted hover:text-foreground hover:shadow active:scale-[0.98] md:mb-8"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Kembali ke pencarian
            </Link>

            <article className="space-y-6 animate-in fade-in duration-500 md:space-y-8">
              <ContentHeader entry={entry} />

              <ArabicText arabic={entry.arabic} latin={entry.latin} />

              <TranslationBlock translation={entry.translation} lesson={entry.lesson} reflection={entry.reflection} />

              <div className="border-t border-border/60 pt-5 md:pt-6">
                <Tags tags={entry.tags} />
              </div>

              {related.length > 0 && (
                <div className="border-t border-border/60 pt-6 md:pt-8">
                  <RelatedSection entries={related} />
                </div>
              )}

              <div className="border-t border-border/60 pt-6 md:pt-8">
                <YouTubeSection videos={entry.youtube} />
              </div>

              <div className="flex items-center justify-between border-t border-border/60 pt-6 text-[13px]">
                <span className="text-muted-foreground">Basis pengetahuan pribadi</span>
                <Link href="/" className="font-medium text-[#69C4E8] transition-colors hover:text-[#69C4E8]/80">
                  Cari lagi →
                </Link>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  )
}
