"use client"

import { useState, useMemo, useEffect } from "react"
import { ContentEntry } from "@/lib/types"
import { Search, Plus, Edit3, Trash2, BookOpen, FileText, Heart, Lightbulb, NotebookPen, Inbox, Sparkles } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

interface Stats {
  total: number
  quran: number
  hadith: number
  dua: number
  reminder: number
  reflection: number
  dbConfigured: boolean
}

const typeLabels: Record<string, { label: string; icon: any; color: string }> = {
  quran: { label: "Quran", icon: BookOpen, color: "bg-[#69C4E8]/15 text-[#69C4E8]" },
  hadith: { label: "Hadits", icon: FileText, color: "bg-[#171717]/10 dark:bg-white/10" },
  dua: { label: "Doa", icon: Heart, color: "bg-[#C89B3C]/15 text-[#C89B3C]" },
  reminder: { label: "Pengingat", icon: Lightbulb, color: "bg-emerald-500/10 text-emerald-600" },
  reflection: { label: "Catatan", icon: NotebookPen, color: "bg-violet-500/10 text-violet-600" },
}

export default function AdminDashboardClient({ initialContent, stats }: { initialContent: ContentEntry[]; stats: Stats }) {
  const searchParams = useSearchParams()
  const router = useRouter()

  const initialType = searchParams.get("type") || "all"
  const [query, setQuery] = useState("")
  const [filterType, setFilterType] = useState(initialType)
  const [content, setContent] = useState(initialContent)

  useEffect(() => {
    const type = searchParams.get("type") || "all"
    setFilterType(type)
  }, [searchParams])

  const handleTypeChange = (type: string) => {
    setFilterType(type)
    if (type === "all") {
      router.push("/admin")
    } else {
      router.push(`/admin?type=${type}`)
    }
  }

  const filtered = useMemo(() => {
    let list = content
    if (filterType !== "all") {
      list = list.filter(c => c.type === filterType)
    }
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(c => {
        const haystack = [
          c.title,
          c.id,
          c.reference,
          c.category,
          ...(c.tags || []),
          c.translation
        ].filter(Boolean).join(' ').toLowerCase()
        return haystack.includes(q)
      })
    }
    return list
  }, [content, query, filterType])

  const handleDelete = async (id: string) => {
    if (!confirm(`Hapus konten "${id}"? Tindakan ini tidak bisa dibatalkan.`)) return

    try {
      const res = await fetch(`/api/admin/content/${encodeURIComponent(id)}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Gagal hapus")

      setContent(prev => prev.filter(c => c.id !== id))
    } catch (e: any) {
      alert("Gagal hapus: " + (e.message || ""))
    }
  }

  // Empty state - 100vh centered, no scroll needed
  if (stats.total === 0) {
    return (
      <div className="flex h-full min-h-0 flex-col overflow-hidden">
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="w-full max-w-[640px] animate-in fade-in duration-500">
            <div className="rounded-[24px] border border-dashed border-border/60 bg-card p-8 shadow-sm md:p-12">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-muted">
                <Inbox className="h-7 w-7 text-muted-foreground" />
              </div>
              <h2 className="mt-5 text-center text-[20px] font-semibold tracking-tight">Belum ada konten</h2>
              <p className="mx-auto mt-2 max-w-md text-center text-[13px] leading-relaxed text-muted-foreground">
                Kamu memulai dari 0 seperti yang diminta. Semua konten statis lama sudah dihapus. 
                Database Neon kosong. Mulai dengan menambah konten pertama kamu.
              </p>
              <div className="mt-6 flex justify-center">
                <Link href="/admin/new" className="inline-flex items-center gap-2 rounded-full bg-[#171717] px-6 py-3 text-[13px] font-medium text-white shadow-sm transition-all hover:bg-black hover:shadow-md active:scale-[0.98] dark:bg-white dark:text-black">
                  <Plus className="h-4 w-4" /> Tambah Konten Pertama
                </Link>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-2.5 md:grid-cols-5">
                {[
                  { label: "Quran", desc: "Ayat pilihan", color: "border-[#69C4E8]/20 bg-[#69C4E8]/5" },
                  { label: "Hadits", desc: "Hadits shahih", color: "border-border bg-muted/30" },
                  { label: "Doa", desc: "Doa harian", color: "border-[#C89B3C]/20 bg-[#C89B3C]/5" },
                  { label: "Pengingat", desc: "Hikmah", color: "border-emerald-500/20 bg-emerald-500/5" },
                  { label: "Catatan", desc: "Refleksi", color: "border-violet-500/20 bg-violet-500/5" },
                ].map(item => (
                  <div key={item.label} className={`rounded-xl border p-3 text-left transition-transform hover:scale-[1.02] ${item.color}`}>
                    <p className="text-[12px] font-medium">{item.label}</p>
                    <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-[#69C4E8]/10 px-4 py-3 text-[12px] leading-relaxed">
              <p className="flex items-center gap-1.5 font-medium text-[#0D4A5E] dark:text-[#69C4E8]">
                <Sparkles className="h-3.5 w-3.5" /> Mode Neon Aktif — 100vh, tanpa scroll
              </p>
              <p className="mt-1 text-[#0D4A5E]/70 dark:text-[#69C4E8]/70">
                Konten sekarang di Neon Postgres, bukan file JSON. Dashboard ini didesain 100vh di desktop — rapi, smooth, tidak perlu scroll halaman.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      {/* Header - shrink-0, no scroll */}
      <div className="shrink-0 border-b border-border/40 bg-card/50 px-6 py-5 backdrop-blur-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[20px] font-semibold tracking-tight md:text-[22px]">Dashboard Konten</h1>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Kelola {stats.total} konten • {stats.dbConfigured ? "Neon Postgres" : "File JSON"} • 100vh layout
            </p>
          </div>
          <Link href="/admin/new" className="hidden items-center gap-2 rounded-full bg-[#171717] px-4 py-2 text-[13px] font-medium text-white shadow-sm transition-all hover:bg-black hover:shadow-md active:scale-[0.98] dark:bg-white dark:text-black md:inline-flex">
            <Plus className="h-4 w-4" /> Tambah Baru
          </Link>
        </div>

        {/* Stats - responsive grid, shrink-0 */}
        <div className="mt-5 grid grid-cols-3 gap-2 md:grid-cols-6">
          <div className="rounded-xl border border-border/60 bg-card px-3 py-3 shadow-sm md:px-4 md:py-3">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Total</p>
            <p className="mt-1 text-[18px] font-semibold">{stats.total}</p>
          </div>
          {[
            { key: 'quran', label: 'Quran' },
            { key: 'hadith', label: 'Hadits' },
            { key: 'dua', label: 'Doa' },
            { key: 'reminder', label: 'Pengingat' },
            { key: 'reflection', label: 'Catatan' },
          ].map(s => (
            <div key={s.key} className="rounded-xl border border-border/60 bg-card px-3 py-3 shadow-sm transition-all hover:shadow-md md:px-4">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{s.label}</p>
              <p className="mt-1 text-[16px] font-semibold">{(stats as any)[s.key]}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Search & Filter - shrink-0 */}
      <div className="shrink-0 border-b border-border/40 bg-card/30 px-6 py-4 backdrop-blur-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-[360px]">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Cari judul, ID, tag..."
              className="w-full rounded-full border border-border bg-card py-2.5 pl-10 pr-4 text-[14px] shadow-sm transition-all focus:border-[#69C4E8]/50 focus:outline-none focus:ring-2 focus:ring-[#69C4E8]/20"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: 'Semua' },
              { id: 'quran', label: 'Quran' },
              { id: 'hadith', label: 'Hadits' },
              { id: 'dua', label: 'Doa' },
              { id: 'reminder', label: 'Pengingat' },
              { id: 'reflection', label: 'Catatan' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => handleTypeChange(f.id)}
                className={`rounded-full border px-3 py-1.5 text-[12px] font-medium transition-all duration-200 ${
                  filterType === f.id
                    ? "border-[#171717] bg-[#171717] text-white shadow-sm dark:border-white dark:bg-white dark:text-black"
                    : "border-border bg-card text-muted-foreground shadow-sm hover:bg-muted hover:text-foreground hover:shadow"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table - flex-1, internal scroll, 100vh no outer scroll */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-3 py-3 md:px-6 md:py-4">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="flex-1 overflow-auto scrollbar-thin">
              <table className="w-full">
                <thead className="sticky top-0 z-10 border-b border-border bg-muted/50 text-left text-[11px] uppercase tracking-widest text-muted-foreground backdrop-blur-xl">
                  <tr>
                    <th className="px-5 py-3 font-medium">Konten</th>
                    <th className="hidden px-5 py-3 font-medium md:table-cell">Tipe</th>
                    <th className="hidden px-5 py-3 font-medium lg:table-cell">ID</th>
                    <th className="px-5 py-3 text-right font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filtered.map(entry => {
                    const cfg = typeLabels[entry.type] || typeLabels.reminder
                    const Icon = cfg.icon
                    return (
                      <tr key={entry.id} className="group transition-colors hover:bg-muted/40">
                        <td className="px-5 py-3.5">
                          <div className="flex items-start gap-3">
                            <div className={`mt-0.5 grid h-7 w-7 place-items-center rounded-full ${cfg.color} transition-transform group-hover:scale-105`}>
                              <Icon className="h-3.5 w-3.5" />
                            </div>
                            <div className="min-w-0">
                              <p className="line-clamp-2 max-w-[360px] text-[14px] font-medium leading-snug">{entry.title}</p>
                              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                {entry.reference && (
                                  <span className="max-w-[180px] truncate text-[11px] text-muted-foreground">{entry.reference}</span>
                                )}
                                {entry.category && (
                                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">{entry.category}</span>
                                )}
                              </div>
                              <div className="mt-1 md:hidden">
                                <span className="text-[11px] text-muted-foreground">{cfg.label} • {entry.id}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="hidden px-5 py-3.5 md:table-cell">
                          <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium">{cfg.label}</span>
                        </td>
                        <td className="hidden px-5 py-3.5 font-mono text-[11px] text-muted-foreground lg:table-cell">
                          <p className="max-w-[140px] truncate">{entry.id}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex justify-end gap-1">
                            <Link
                              href={`/admin/edit/${encodeURIComponent(entry.id)}`}
                              className="grid h-8 w-8 place-items-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-all hover:bg-[#69C4E8]/10 hover:text-[#69C4E8] hover:shadow active:scale-95"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </Link>
                            <button
                              onClick={() => handleDelete(entry.id)}
                              className="grid h-8 w-8 place-items-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-all hover:bg-red-500/10 hover:text-red-600 hover:shadow active:scale-95"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
                  <p className="text-[14px] font-medium">Tidak ada konten yang cocok</p>
                  <p className="mt-1 max-w-sm text-[13px] text-muted-foreground">Coba kata kunci lain atau ganti filter. Atau mulai tambahkan konten baru.</p>
                  <Link href="/admin/new" className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#171717] px-4 py-2 text-[13px] text-white shadow-sm transition-all hover:bg-black dark:bg-white dark:text-black">
                    <Plus className="h-4 w-4" /> Tambah Konten
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <p className="mt-3 shrink-0 text-center text-[11px] text-muted-foreground">
          Menampilkan {filtered.length} dari {content.length} • 100vh layout • Tidak scroll halaman
        </p>
      </div>
    </div>
  )
}
