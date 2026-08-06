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

  // Form states
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

  // Auto slug from title if not edit
  useEffect(() => {
    if (!isEdit && form.title && !form.slug) {
      setForm(prev => ({ ...prev, slug: slugify(form.title || "") }))
    }
  }, [form.title, isEdit, form.slug])

  // Auto ID from slug if not edit
  useEffect(() => {
    if (!isEdit && form.slug && !form.id) {
      const prefix = form.type ? `${form.type}-` : ""
      setForm(prev => ({ ...prev, id: `${prefix}${form.slug}` }))
    }
  }, [form.slug, form.type, isEdit, form.id])

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
      // Prepare lesson
      const cleanedLessons = lessonArray.map(l => l.trim()).filter(Boolean)
      let finalLesson: any = undefined
      if (cleanedLessons.length === 1) finalLesson = cleanedLessons[0]
      else if (cleanedLessons.length > 1) finalLesson = cleanedLessons

      // Clean youtube
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

      if (!res.ok) {
        throw new Error(data.error || "Gagal menyimpan")
      }

      router.push("/admin")
      router.refresh()
    } catch (err: any) {
      setError(err.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <Link href="/admin" className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-[13px] text-muted-foreground hover:bg-muted">
        <ArrowLeft className="h-4 w-4" /> Kembali ke dashboard
      </Link>

      <div className="rounded-[24px] border border-border bg-card p-6 md:p-8">
        <h1 className="text-[22px] font-semibold tracking-tight">
          {isEdit ? "Edit Konten" : "Tambah Konten Baru"}
        </h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          {isEdit ? `Mengedit ${initialData?.id} — semua perubahan langsung tersimpan ke Neon Database` : "Buat konten baru, akan langsung tersimpan ke Neon Database dan live di Vercel"}
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* ID, Slug, Type */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium uppercase tracking-widest text-muted-foreground">ID *</label>
              <input
                value={form.id}
                onChange={e => setField('id', e.target.value)}
                placeholder="quran-al-baqarah-286"
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-[14px] focus:border-[#69C4E8]/50 focus:outline-none focus:ring-2 focus:ring-[#69C4E8]/20"
                required
                disabled={isEdit}
              />
              <p className="text-[11px] text-muted-foreground">Unik, tidak boleh duplikat</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium uppercase tracking-widest text-muted-foreground">Slug</label>
              <input
                value={form.slug}
                onChange={e => setField('slug', e.target.value)}
                placeholder="al-baqarah-286"
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-[14px] focus:border-[#69C4E8]/50 focus:outline-none focus:ring-2 focus:ring-[#69C4E8]/20"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium uppercase tracking-widest text-muted-foreground">Tipe *</label>
              <select
                value={form.type}
                onChange={e => setField('type', e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-[14px] focus:border-[#69C4E8]/50 focus:outline-none focus:ring-2 focus:ring-[#69C4E8]/20"
              >
                {typeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium uppercase tracking-widest text-muted-foreground">Judul (Bahasa Indonesia) *</label>
            <input
              value={form.title}
              onChange={e => setField('title', e.target.value)}
              placeholder="Allah tidak membebani seseorang melainkan sesuai kesanggupannya"
              className="w-full rounded-xl border border-border bg-background px-3.5 py-3 text-[15px] font-medium focus:border-[#69C4E8]/50 focus:outline-none focus:ring-2 focus:ring-[#69C4E8]/20"
              required
            />
          </div>

          {/* Reference, Category, Subcategory */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium uppercase tracking-widest text-muted-foreground">Referensi</label>
              <input
                value={form.reference}
                onChange={e => setField('reference', e.target.value)}
                placeholder="QS. Al-Baqarah: 286 atau Shahih Bukhari No. 1"
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-[14px] focus:border-[#69C4E8]/50 focus:outline-none focus:ring-2 focus:ring-[#69C4E8]/20"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium uppercase tracking-widest text-muted-foreground">Kategori</label>
              <input
                value={form.category}
                onChange={e => setField('category', e.target.value)}
                placeholder="Sabar, Syukur, Tauhid, Akhlak"
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-[14px] focus:border-[#69C4E8]/50 focus:outline-none focus:ring-2 focus:ring-[#69C4E8]/20"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium uppercase tracking-widest text-muted-foreground">Subkategori (Opsional)</label>
              <input
                value={form.subcategory}
                onChange={e => setField('subcategory', e.target.value)}
                placeholder="Tawakal, Ikhlas"
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-[14px] focus:border-[#69C4E8]/50 focus:outline-none focus:ring-2 focus:ring-[#69C4E8]/20"
              />
            </div>
          </div>

          {/* Arabic */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium uppercase tracking-widest text-muted-foreground">Teks Arab (Tetap Arab)</label>
            <textarea
              value={form.arabic}
              onChange={e => setField('arabic', e.target.value)}
              placeholder="لَا يُكَلِّفُ اللَّهُ..."
              dir="rtl"
              rows={3}
              className="w-full rounded-xl border border-border bg-background px-3.5 py-3 text-right font-amiri text-[18px] leading-relaxed focus:border-[#69C4E8]/50 focus:outline-none focus:ring-2 focus:ring-[#69C4E8]/20"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium uppercase tracking-widest text-muted-foreground">Latin / Transliterasi</label>
              <input
                value={form.latin}
                onChange={e => setField('latin', e.target.value)}
                placeholder="La yukallifullahu nafsan illa wus'aha"
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-[14px] italic focus:border-[#69C4E8]/50 focus:outline-none focus:ring-2 focus:ring-[#69C4E8]/20"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium uppercase tracking-widest text-muted-foreground">Sumber</label>
              <input
                value={form.source}
                onChange={e => setField('source', e.target.value)}
                placeholder="Al-Quran Al-Karim, Shahih Bukhari"
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-[14px] focus:border-[#69C4E8]/50 focus:outline-none focus:ring-2 focus:ring-[#69C4E8]/20"
              />
            </div>
          </div>

          {/* Translation */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium uppercase tracking-widest text-muted-foreground">Terjemahan (Bahasa Indonesia)</label>
            <textarea
              value={form.translation}
              onChange={e => setField('translation', e.target.value)}
              placeholder="Allah tidak membebani seseorang melainkan sesuai kesanggupannya..."
              rows={3}
              className="w-full rounded-xl border border-border bg-background px-3.5 py-3 text-[14px] leading-relaxed focus:border-[#69C4E8]/50 focus:outline-none focus:ring-2 focus:ring-[#69C4E8]/20"
            />
          </div>

          {/* Lesson array */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[12px] font-medium uppercase tracking-widest text-muted-foreground">Pelajaran & Tadabbur (Bisa banyak paragraf)</label>
              <button type="button" onClick={() => setLessonArray([...lessonArray, ""])} className="inline-flex items-center gap-1 rounded-full bg-[#69C4E8]/10 px-3 py-1 text-[11px] font-medium text-[#69C4E8] hover:bg-[#69C4E8]/20">
                <Plus className="h-3 w-3" /> Tambah Paragraf
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
                  className="flex-1 rounded-xl border border-border bg-background px-3.5 py-2.5 text-[14px] leading-relaxed focus:border-[#69C4E8]/50 focus:outline-none focus:ring-2 focus:ring-[#69C4E8]/20"
                />
                {lessonArray.length > 1 && (
                  <button type="button" onClick={() => setLessonArray(lessonArray.filter((_, i) => i !== idx))} className="grid h-10 w-10 place-items-center rounded-xl border border-border text-muted-foreground hover:bg-red-50 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Reflection */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium uppercase tracking-widest text-muted-foreground">Catatan Pribadi (Opsional)</label>
            <textarea
              value={form.reflection}
              onChange={e => setField('reflection', e.target.value)}
              placeholder="Catatan pribadi, pengalaman, refleksi jujur..."
              rows={3}
              className="w-full rounded-xl border border-border bg-[#C89B3C]/5 px-3.5 py-3 text-[14px] italic leading-relaxed focus:border-[#C89B3C]/30 focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/20"
            />
          </div>

          {/* Tags */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-[12px] font-medium uppercase tracking-widest text-muted-foreground">Tags</label>
              <div className="flex gap-2">
                <input
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag('tags', tagInput, setTagInput) } }}
                  placeholder="sabar + Enter"
                  className="flex-1 rounded-full border border-border bg-background px-3.5 py-2 text-[13px] focus:border-[#69C4E8]/50 focus:outline-none focus:ring-2 focus:ring-[#69C4E8]/20"
                />
                <button type="button" onClick={() => addTag('tags', tagInput, setTagInput)} className="grid h-9 w-9 place-items-center rounded-full bg-muted hover:bg-muted/80">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(form.tags || []).map((tag, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px]">
                    #{tag}
                    <button type="button" onClick={() => removeTag('tags', idx)}><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[12px] font-medium uppercase tracking-widest text-muted-foreground">Keywords (SEO)</label>
              <div className="flex gap-2">
                <input
                  value={keywordInput}
                  onChange={e => setKeywordInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag('keywords', keywordInput, setKeywordInput) } }}
                  placeholder="ujian + Enter"
                  className="flex-1 rounded-full border border-border bg-background px-3.5 py-2 text-[13px] focus:border-[#69C4E8]/50 focus:outline-none focus:ring-2 focus:ring-[#69C4E8]/20"
                />
                <button type="button" onClick={() => addTag('keywords', keywordInput, setKeywordInput)} className="grid h-9 w-9 place-items-center rounded-full bg-muted hover:bg-muted/80">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(form.keywords || []).map((kw, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px]">
                    {kw}
                    <button type="button" onClick={() => removeTag('keywords', idx)}><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[12px] font-medium uppercase tracking-widest text-muted-foreground">Related (ID)</label>
              <div className="flex gap-2">
                <input
                  value={relatedInput}
                  onChange={e => setRelatedInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag('related', relatedInput, setRelatedInput) } }}
                  placeholder="quran-al-baqarah-286"
                  className="flex-1 rounded-full border border-border bg-background px-3.5 py-2 text-[13px] focus:border-[#69C4E8]/50 focus:outline-none focus:ring-2 focus:ring-[#69C4E8]/20"
                />
                <button type="button" onClick={() => addTag('related', relatedInput, setRelatedInput)} className="grid h-9 w-9 place-items-center rounded-full bg-muted hover:bg-muted/80">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(form.related || []).map((rel, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 rounded-full bg-[#69C4E8]/10 px-2.5 py-1 text-[11px] text-[#69C4E8]">
                    {rel}
                    <button type="button" onClick={() => removeTag('related', idx)}><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* YouTube */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[12px] font-medium uppercase tracking-widest text-muted-foreground">Kajian Terkait (YouTube)</label>
              <button type="button" onClick={addYoutube} className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-[11px] font-medium hover:bg-muted/80">
                <Plus className="h-3 w-3" /> Tambah Video
              </button>
            </div>

            {youtubeList.map((yt, idx) => (
              <div key={idx} className="rounded-xl border border-border bg-muted/20 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[12px] font-medium">Video {idx + 1}</span>
                  <button type="button" onClick={() => removeYoutube(idx)} className="text-[11px] text-red-600 hover:underline">Hapus</button>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <input value={yt.title} onChange={e => updateYoutube(idx, 'title', e.target.value)} placeholder="Judul kajian *" className="rounded-lg border border-border bg-background px-3 py-2 text-[13px]" />
                  <input value={yt.youtubeId} onChange={e => updateYoutube(idx, 'youtubeId', e.target.value)} placeholder="YouTube ID (misal dQw4w9WgXcQ) *" className="rounded-lg border border-border bg-background px-3 py-2 font-mono text-[13px]" />
                  <input value={yt.speaker} onChange={e => updateYoutube(idx, 'speaker', e.target.value)} placeholder="Pemateri" className="rounded-lg border border-border bg-background px-3 py-2 text-[13px]" />
                  <input value={yt.channel} onChange={e => updateYoutube(idx, 'channel', e.target.value)} placeholder="Channel" className="rounded-lg border border-border bg-background px-3 py-2 text-[13px]" />
                  <input value={yt.duration} onChange={e => updateYoutube(idx, 'duration', e.target.value)} placeholder="Durasi (12:34)" className="rounded-lg border border-border bg-background px-3 py-2 text-[13px]" />
                  <input value={yt.description} onChange={e => updateYoutube(idx, 'description', e.target.value)} placeholder="Deskripsi singkat" className="rounded-lg border border-border bg-background px-3 py-2 text-[13px]" />
                </div>
              </div>
            ))}

            {youtubeList.length === 0 && (
              <p className="text-[12px] text-muted-foreground">Belum ada kajian terkait. Klik Tambah Video untuk menambah.</p>
            )}
          </div>

          {/* Error & Submit */}
          {error && (
            <div className="rounded-xl bg-red-500/10 px-4 py-3 text-[13px] text-red-600">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Link href="/admin" className="flex-1 rounded-full border border-border bg-card py-3 text-center text-[14px] font-medium hover:bg-muted">
              Batal
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#171717] py-3 text-[14px] font-medium text-white hover:bg-black disabled:opacity-50 dark:bg-white dark:text-black"
            >
              <Save className="h-4 w-4" />
              {loading ? "Menyimpan..." : isEdit ? "Update Konten" : "Simpan Konten"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
