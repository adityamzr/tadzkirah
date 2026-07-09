export function TranslationBlock({
  translation,
  lesson,
  reflection,
}: {
  translation?: string
  lesson?: string
  reflection?: string
}) {
  return (
    <div className="space-y-8">
      {translation && (
        <div className="space-y-3">
          <h2 className="text-[13px] font-semibold uppercase tracking-widest text-muted-foreground">Translation</h2>
          <p className="text-[17px] leading-relaxed">{translation}</p>
        </div>
      )}

      {lesson && (
        <div className="space-y-3 rounded-2xl bg-[#69C4E8]/[0.06] p-5 md:p-6 border border-[#69C4E8]/10">
          <h2 className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-widest text-[#69C4E8]">
            <span className="h-1 w-1 rounded-full bg-[#69C4E8]" />
            Lesson & Tadabbur
          </h2>
          <p className="text-[15px] leading-relaxed text-foreground/90">{lesson}</p>
        </div>
      )}

      {reflection && (
        <div className="space-y-3 rounded-2xl bg-[#C89B3C]/[0.06] p-5 md:p-6 border border-[#C89B3C]/10">
          <h2 className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-widest text-[#C89B3C]">
            <span className="h-1 w-1 rounded-full bg-[#C89B3C]" />
            Personal Reflection
          </h2>
          <p className="text-[15px] leading-relaxed italic text-foreground/80">{reflection}</p>
        </div>
      )}
    </div>
  )
}
