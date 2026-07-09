import { cn } from "@/lib/utils"

export function ArabicText({ arabic, latin }: { arabic?: string; latin?: string }) {
  if (!arabic) return null
  return (
    <div className="rounded-[20px] border border-border bg-card p-6 md:p-8">
      <p
        dir="rtl"
        lang="ar"
        className="text-right font-amiri text-[24px] leading-[2] tracking-wide md:text-[28px] md:leading-[2.1]"
      >
        {arabic}
      </p>
      {latin && (
        <p className="mt-6 border-t border-border pt-5 font-geist text-[14px] italic leading-relaxed text-muted-foreground">
          {latin}
        </p>
      )}
    </div>
  )
}
