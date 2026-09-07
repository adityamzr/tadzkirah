"use client"

import { useState, useEffect } from "react"
import { ContentEntry } from "@/lib/types"
import { useRouter } from "next/navigation"
import { Save, X, Plus, Trash2, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Props {
  initialData?: ContentEntry
  isEdit?: boolean
}

const typeOptions = [
  { value: "quran", label: "Quran" },
  { value: "hadith", label: "Hadits" },
  { value: "dua", label: "Doa" },
  { value: "reminder", label: "Pengingat" },
  { value: "reflection", label: "Catatan Pribadi" },
]

function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function ContentForm({ initialData, isEdit = false }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [form, setForm] = useState<Partial<ContentEntry>>({
    id: initialData?.id || "",
    slug: initialData?.slug || "",
    type: initialData?.type || "quran",
    title: initialData?.title || "",
    reference: initialData?.reference || "",
    category: initialData?.category || "",
    subcategory: initialData?.subcategory || "",
    arabic: initialData?.arabic || "",
    latin: initialData?.latin || "",
    translation: initialData?.translation || "",
    lesson: initialData?.lesson || "",
    reflection: initialData?.reflection || "",
    tags: initialData?.tags || [],
    keywords: initialData?.keywords || [],
    related: initialData?.related || [],
    youtube: initialData?.youtube || [],
    source: initialData?.source || "",
    createdAt: initialData?.createdAt || new Date().toISOString().split('T')[0],
  })

  const [lessonArray, setLessonArray] = useState<string[]>(() => {
    if (!initialData?.lesson) return [""]
    if (Array.isArray(initialData.lesson)) return initialData.lesson.length > 0 ? initialData.lesson : [""]
    return [initialData.lesson as string]
  })

  const [tagInput, setTagInput] = useState("")
  const [keywordInput, setKeywordInput] = useState("")
  const [relatedInput, setRelatedInput] = useState("")
  const [youtubeList, setYoutubeList] = useState<any[]>(() => {
    if (!initialData?.youtube) return []
    return initialData.youtube.map((yt: any) => ({
      title: yt.title || "",
      speaker: yt.speaker || "",
      channel: yt.channel || "",
      youtubeId: yt.youtubeId || yt.id || "",
      duration: yt.duration || "",
      description: yt.description || "",
    }))
  })

  useEffect(() => {
    if (!isEdit && form.title && !form.slug) {
      setForm(prev => ({ ...prev, slug: slugify(form.title || "") }))
    }
  }, [form.title, isEdit])

  useEffect(() => {
    if (!isEdit && form.slug && !form.id) {
      const prefix = form.type ? `${form.type}-` : ""
      setForm(prev => ({ ...prev, id: `${prefix}${form.slug}` }))
    }
  }, [form.slug, form.type, isEdit])

  const setField = (key: keyof ContentEntry, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const addTag = (type: 'tags' | 'keywords' | 'related', value: string, setter: any) => {
    const trimmed = value.trim()
    if (!trimmed) return
    const current = (form[type] as string[]) || []
    if (current.includes(trimmed)) return
    setField(type, [...current, trimmed])
    setter("")
  }

  const removeTag = (type: 'tags' | 'keywords' | 'related', index: number) => {
    const current = [...((form[type] as string[]) || [])]
    current.splice(index, 1)
    setField(type, current)
  }

  const addYoutube = () => {
    setYoutubeList([...youtubeList, { title: "", speaker: "", channel: "", youtubeId: "", duration: "", description: "" }])
  }

  const updateYoutube = (idx: number, key: string, value: string) => {
    const copy = [...youtubeList]
    copy[idx] = { ...copy[idx], [key]: value }
    setYoutubeList(copy)
  }

  const removeYoutube = (idx: number) => {
    setYoutubeList(youtubeList.filter((_, i) => i !== idx))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const cleanedLessons = lessonArray.map(l => l.trim()).filter(Boolean)
      let finalLesson: any = undefined
      if (cleanedLessons.length === 1) finalLesson = cleanedLessons[0]
      else if (cleanedLessons.length > 1) finalLesson = cleanedLessons

      const cleanedYoutube = youtubeList
        .map(yt => {
          const cleaned: any = {}
          if (yt.title.trim()) cleaned.title = yt.title.trim()
          if (yt.speaker.trim()) cleaned.speaker = yt.speaker.trim()
          if (yt.channel.trim()) cleaned.channel = yt.channel.trim()
          if (yt.youtubeId.trim()) cleaned.youtubeId = yt.youtubeId.trim()
          if (yt.duration.trim()) cleaned.duration = yt.duration.trim()
          if (yt.description.trim()) cleaned.description = yt.description.trim()
          return cleaned
        })
        .filter(yt => yt.title && yt.youtubeId)

      const payload: any = {
        id: form.id?.trim(),
        slug: form.slug?.trim() || slugify(form.id || form.title || ""),
        type: form.type,
        title: form.title?.trim(),
        reference: form.reference?.trim() || undefined,
        category: form.category?.trim() || undefined,
        subcategory: form.subcategory?.trim() || undefined,
        arabic: form.arabic?.trim() || undefined,
        latin: form.latin?.trim() || undefined,
        translation: form.translation?.trim() || undefined,
        lesson: finalLesson,
        reflection: form.reflection?.trim() || undefined,
        tags: form.tags && form.tags.length > 0 ? form.tags : undefined,
        keywords: form.keywords && form.keywords.length > 0 ? form.keywords : undefined,
        related: form.related && form.related.length > 0 ? form.related : undefined,
        youtube: cleanedYoutube.length > 0 ? cleanedYoutube : undefined,
        source: form.source?.trim() || undefined,
        createdAt: form.createdAt || undefined,
      }

      if (!payload.id || !payload.type || !payload.title) {
        throw new Error("ID, tipe, dan judul wajib diisi")
      }

      const method = isEdit ? "PUT" : "POST"
      const url = isEdit ? `/api/admin/content/${encodeURIComponent(initialData!.id)}` : "/api/admin/content"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan")

      router.push("/admin")
      router.refresh()
    } catch (err: any) {
      setError(err.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      {/* Header - sticky, shrink-0, 100vh layout no scroll */}
      <div className="shrink-0 border-b border-border/40 bg-card/80 px-6 py-4 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-4">
          <Link href="/admin" className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-[13px] text-muted-foreground shadow-sm transition-all hover:bg-muted hover:text-foreground active:scale-[0.98]">
            <ArrowLeft className="h-4 w-4" /> Kembali
          </Link>
          <div className="hidden items-center gap-2 text-[11px] text-muted-foreground md:flex">
            <span className="rounded-full bg-muted px-2.5 py-1">100vh • No outer scroll</span>
            <span className="rounded-full bg-[#69C4E8]/10 px-2.5 py-1 text-[#69C4E8]">Neon</span>
          </div>
        </div>
        <div className="mt-4">
          <h1 className="text-[20px] font-semibold tracking-tight md:text-[22px]">
            {isEdit ? "Edit Konten" : "Tambah Konten Baru"}
          </h1>
          <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">
            {isEdit ? `Mengedit ${initialData?.id} — perubahan langsung tersimpan ke Neon Database` : "Form responsif, 100vh di desktop dengan scroll internal yang smooth. Isi minimal ID, tipe, judul."}
          </p>
        </div>
      </div>

      {/* Scrollable form area - flex-1 overflow-y-auto */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto px-4 py-6 md:px-6">
          <div className="mx-auto w-full max-w-3xl">
            <div className="rounded-[20px] border border-border bg-card p-5 shadow-sm md:rounded-[24px] md:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* ID, Slug, Type */}
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">ID *</label>
                    <input
                      value={form.id}
                      onChange={e => setField('id', e.target.value)}
                      placeholder="quran-al-baqarah-286"
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-[14px] shadow-sm transition-all focus:border-[#69C4E8]/50 focus:outline-none focus:ring-2 focus:ring-[#69C4E8]/20"
                      required
                      disabled={isEdit}
                    />
                    <p className="text-[11px] text-muted-foreground">Unik, tidak boleh duplikat</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">Slug</label>
                    <input
                      value={form.slug}
                      onChange={e => setField('slug', e.target.value)}
                      placeholder="al-baqarah-286"
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-[14px] shadow-sm transition-all focus:border-[#69C4E8]/50 focus:outline-none focus:ring-2 focus:ring-[#69C4E8]/20"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">Tipe *</label>
                    <select
                      value={form.type}
                      onChange={e => setField('type', e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-[14px] shadow-sm transition-all focus:border-[#69C4E8]/50 focus:outline-none focus:ring-2 focus:ring-[#69C4E8]/20"
                    >
                      {typeOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">Judul (Bahasa Indonesia) *</label>
                  <input
                    value={form.title}
                    onChange={e => setField('title', e.target.value)}
                    placeholder="Allah tidak membebani seseorang melainkan sesuai kesanggupannya"
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-3 text-[15px] font-medium shadow-sm transition-all focus:border-[#69C4E8]/50 focus:outline-none focus:ring-2 focus:ring-[#69C4E8]/20"
                    required
                  />
                </div>

                {/* Reference, Category */}
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">Referensi</label>
                    <input
                      value={form.reference}
                      onChange={e => setField('reference', e.target.value)}
                      placeholder="QS. Al-Baqarah: 286"
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-[14px] shadow-sm focus:border-[#69C4E8]/50 focus:outline-none focus:ring-2 focus:ring-[#69C4E8]/20"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">Kategori</label>
                    <input
                      value={form.category}
                      onChange={e => setField('category', e.target.value)}
                      placeholder="Sabar, Syukur, Tauhid"
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-[14px] shadow-sm focus:border-[#69C4E8]/50 focus:outline-none focus:ring-2 focus:ring-[#69C4E8]/20"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">Subkategori</label>
                    <input
                      value={form.subcategory}
                      onChange={e => setField('subcategory', e.target.value)}
                      placeholder="Tawakal, Ikhlas"
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-[14px] shadow-sm focus:border-[#69C4E8]/50 focus:outline-none focus:ring-2 focus:ring-[#69C4E8]/20"
                    />
                  </div>
                </div>

                {/* Arabic */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">Teks Arab (Tetap Arab)</label>
                  <textarea
                    value={form.arabic}
                    onChange={e => setField('arabic', e.target.value)}
                    placeholder="لَا يُكَلِّفُ اللَّهُ..."
                    dir="rtl"
                    rows={3}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-3 text-right font-amiri text-[18px] leading-relaxed shadow-sm focus:border-[#69C4E8]/50 focus:outline-none focus:ring-2 focus:ring-[#69C4E8]/20"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">Latin / Transliterasi</label>
                    <input
                      value={form.latin}
                      onChange={e => setField('latin', e.target.value)}
                      placeholder="La yukallifullahu nafsan illa wus'aha"
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-[14px] italic shadow-sm focus:border-[#69C4E8]/50 focus:outline-none focus:ring-2 focus:ring-[#69C4E8]/20"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">Sumber</label>
                    <input
                      value={form.source}
                      onChange={e => setField('source', e.target.value)}
                      placeholder="Al-Quran Al-Karim"
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-[14px] shadow-sm focus:border-[#69C4E8]/50 focus:outline-none focus:ring-2 focus:ring-[#69C4E8]/20"
                    />
                  </div>
                </div>

                {/* Translation */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">Terjemahan (Bahasa Indonesia)</label>
                  <textarea
                    value={form.translation}
                    onChange={e => setField('translation', e.target.value)}
                    placeholder="Allah tidak membebani..."
                    rows={3}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-3 text-[14px] leading-relaxed shadow-sm focus:border-[#69C4E8]/50 focus:outline-none focus:ring-2 focus:ring-[#69C4E8]/20"
                  />
                </div>

                {/* Lesson */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">Pelajaran & Tadabbur</label>
                    <button type="button" onClick={() => setLessonArray([...lessonArray, ""])} className="inline-flex items-center gap-1 rounded-full bg-[#69C4E8]/10 px-3 py-1 text-[11px] font-medium text-[#69C4E8] transition-colors hover:bg-[#69C4E8]/20">
                      <Plus className="h-3 w-3" /> Tambah
                    </button>
                  </div>
                  {lessonArray.map((lesson, idx) => (
                    <div key={idx} className="flex gap-2">
                      <textarea
                        value={lesson}
                        onChange={e => {
                          const copy = [...lessonArray]
                          copy[idx] = e.target.value
                          setLessonArray(copy)
                        }}
                        placeholder={`Pelajaran ${idx + 1}...`}
                        rows={2}
                        className="flex-1 rounded-xl border border-border bg-background px-3.5 py-2.5 text-[14px] leading-relaxed shadow-sm focus:border-[#69C4E8]/50 focus:outline-none focus:ring-2 focus:ring-[#69C4E8]/20"
                      />
                      {lessonArray.length > 1 && (
                        <button type="button" onClick={() => setLessonArray(lessonArray.filter((_, i) => i !== idx))} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border text-muted-foreground shadow-sm transition-colors hover:bg-red-50 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Reflection */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">Catatan Pribadi</label>
                  <textarea
                    value={form.reflection}
                    onChange={e => setField('reflection', e.target.value)}
                    placeholder="Catatan pribadi..."
                    rows={3}
                    className="w-full rounded-xl border border-border bg-[#C89B3C]/5 px-3.5 py-3 text-[14px] italic leading-relaxed shadow-sm focus:border-[#C89B3C]/30 focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/20"
                  />
                </div>

                {/* Tags grid responsive */}
                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    { key: 'tags' as const, label: 'Tags', placeholder: 'sabar + Enter', input: tagInput, setInput: setTagInput },
                    { key: 'keywords' as const, label: 'Keywords', placeholder: 'ujian + Enter', input: keywordInput, setInput: setKeywordInput },
                    { key: 'related' as const, label: 'Related ID', placeholder: 'quran-al-baqarah-286', input: relatedInput, setInput: setRelatedInput },
                  ].map(col => (
                    <div key={col.key} className="space-y-2">
                      <label className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">{col.label}</label>
                      <div className="flex gap-2">
                        <input
                          value={col.input}
                          onChange={e => col.setInput(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); const trimmed = col.input.trim(); if (trimmed) { const curr = (form[col.key] as string[]) || []; if (!curr.includes(trimmed)) setField(col.key, [...curr, trimmed]); col.setInput("") } } }}
                          placeholder={col.placeholder}
                          className="flex-1 rounded-full border border-border bg-background px-3.5 py-2 text-[13px] shadow-sm focus:border-[#69C4E8]/50 focus:outline-none focus:ring-2 focus:ring-[#69C4E8]/20"
                        />
                        <button type="button" onClick={() => { const trimmed = col.input.trim(); if (!trimmed) return; const curr = (form[col.key] as string[]) || []; if (curr.includes(trimmed)) return; setField(col.key, [...curr, trimmed]); col.setInput("") }} className="grid h-9 w-9 place-items-center rounded-full bg-muted shadow-sm transition-colors hover:bg-muted/80 active:scale-95">
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(form[col.key] as string[] || []).map((val, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] shadow-sm">
                            {col.key === 'tags' ? `#${val}` : val}
                            <button type="button" onClick={() => { const curr = [...((form[col.key] as string[]) || [])]; curr.splice(idx, 1); setField(col.key, curr) }}><X className="h-3 w-3" /></button>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* YouTube */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">Kajian Terkait (YouTube)</label>
                    <button type="button" onClick={addYoutube} className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-[11px] font-medium shadow-sm transition-colors hover:bg-muted/80">
                      <Plus className="h-3 w-3" /> Tambah Video
                    </button>
                  </div>

                  {youtubeList.map((yt, idx) => (
                    <div key={idx} className="rounded-xl border border-border bg-muted/20 p-4 shadow-sm">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-[12px] font-medium">Video {idx + 1}</span>
                        <button type="button" onClick={() => removeYoutube(idx)} className="text-[11px] text-red-600 hover:underline">Hapus</button>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <input value={yt.title} onChange={e => updateYoutube(idx, 'title', e.target.value)} placeholder="Judul kajian *" className="rounded-lg border border-border bg-background px-3 py-2 text-[13px] shadow-sm" />
                        <input value={yt.youtubeId} onChange={e => updateYoutube(idx, 'youtubeId', e.target.value)} placeholder="YouTube ID *" className="rounded-lg border border-border bg-background px-3 py-2 font-mono text-[13px] shadow-sm" />
                        <input value={yt.speaker} onChange={e => updateYoutube(idx, 'speaker', e.target.value)} placeholder="Pemateri" className="rounded-lg border border-border bg-background px-3 py-2 text-[13px] shadow-sm" />
                        <input value={yt.channel} onChange={e => updateYoutube(idx, 'channel', e.target.value)} placeholder="Channel" className="rounded-lg border border-border bg-background px-3 py-2 text-[13px] shadow-sm" />
                      </div>
                    </div>
                  ))}

                  {youtubeList.length === 0 && (
                    <p className="text-[12px] text-muted-foreground">Belum ada kajian. Klik Tambah Video.</p>
                  )}
                </div>

                {error && (
                  <div className="rounded-xl bg-red-500/10 px-4 py-3 text-[13px] text-red-600">
                    {error}
                  </div>
                )}

                {/* Sticky footer on mobile, normal on desktop */}
                <div className="sticky bottom-0 -mx-5 mt-8 flex gap-3 border-t border-border/60 bg-card/90 px-5 py-4 backdrop-blur-xl md:static md:mx-0 md:border-0 md:bg-transparent md:px-0 md:py-0">
                  <Link href="/admin" className="flex flex-1 items-center justify-center rounded-full border border-border bg-card py-3 text-center text-[14px] font-medium shadow-sm transition-all hover:bg-muted active:scale-[0.98]">
                    Batal
                  </Link>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#171717] py-3 text-[14px] font-medium text-white shadow-sm transition-all hover:bg-black hover:shadow-md active:scale-[0.98] disabled:opacity-50 dark:bg-white dark:text-black"
                  >
                    <Save className="h-4 w-4" />
                    {loading ? "Menyimpan..." : isEdit ? "Update" : "Simpan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
