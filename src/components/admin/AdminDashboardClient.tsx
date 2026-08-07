"use client"

import { useState, useMemo, useEffect } from "react"
import { ContentEntry } from "@/lib/types"
import { Search, Plus, Edit3, Trash2, BookOpen, FileText, Heart, Lightbulb, NotebookPen, Inbox } from "lucide-react"
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

  // Sync filter with URL
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
      // alert("Berhasil dihapus!")
    } catch (e: any) {
      alert("Gagal hapus: " + (e.message || ""))
    }
  }

  // Empty state when starting from 0
  if (stats.total === 0) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="rounded-[24px] border border-dashed border-border bg-card p-12 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-muted">
            <Inbox className="h-7 w-7 text-muted-foreground" />
          </div>
          <h2 className="mt-5 text-[18px] font-semibold tracking-tight">Belum ada konten</h2>
          <p className="mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-muted-foreground">
            Kamu memulai dari 0 seperti yang diminta. Semua konten statis lama sudah dihapus. 
            Sekarang database Neon kosong. Mulai dengan menambah konten pertama kamu.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/admin/new" className="inline-flex items-center gap-2 rounded-full bg-[#171717] px-5 py-2.5 text-[13px] font-medium text-white hover:bg-black dark:bg-white dark:text-black">
              <Plus className="h-4 w-4" /> Tambah Konten Pertama
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-5">
            {[
              { label: "Quran", desc: "Ayat pilihan" },
              { label: "Hadits", desc: "Hadits shahih" },
              { label: "Doa", desc: "Doa harian" },
              { label: "Pengingat", desc: "Hikmah harian" },
              { label: "Catatan", desc: "Refleksi pribadi" },
            ].map(item => (
              <div key={item.label} className="rounded-xl border border-border bg-muted/30 p-3 text-left">
                <p className="text-[12px] font-medium">{item.label}</p>
                <p className="text-[11px] text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-[#69C4E8]/10 p-4 text-[12px] leading-relaxed text-[#69C4E8]">
          <p className="font-medium text-[#0D4A5E] dark:text-[#69C4E8]">Mode Neon Aktif</p>
          <p className="mt-1 text-[#0D4A5E]/80 dark:text-[#69C4E8]/80">
            Konten sekarang disimpan di Neon Postgres, bukan file JSON. Setiap simpan dari dashboard langsung tersimpan permanen dan live di Vercel. 
            Kamu bisa mulai dari 0 dan build database pengetahuanmu sendiri.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-[22px] font-semibold tracking-tight">Dashboard Konten</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Kelola {stats.total} konten • {stats.dbConfigured ? "Tersimpan di Neon Postgres" : "Mode File JSON"} • Mulai dari 0
        </p>
      </div>

      {/* Stats cards - simple */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Total</p>
          <p className="mt-1 text-[22px] font-semibold">{stats.total}</p>
        </div>
        {[
          { key: 'quran', label: 'Quran' },
          { key: 'hadith', label: 'Hadits' },
          { key: 'dua', label: 'Doa' },
          { key: 'reminder', label: 'Pengingat' },
          { key: 'reflection', label: 'Catatan' },
        ].map(s => (
          <div key={s.key} className="rounded-2xl border border-border bg-card p-4">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{s.label}</p>
            <p className="mt-1 text-[18px] font-semibold">{(stats as any)[s.key]}</p>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Cari judul, ID, tag, kategori..."
            className="w-full rounded-full border border-border bg-card py-2.5 pl-10 pr-4 text-[14px] focus:border-[#69C4E8]/50 focus:outline-none focus:ring-2 focus:ring-[#69C4E8]/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-2">
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
                className={`rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
                  filterType === f.id
                    ? "border-[#171717] bg-[#171717] text-white dark:border-white dark:bg-white dark:text-black"
                    : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <Link href="/admin/new" className="ml-1 hidden items-center gap-1.5 rounded-full bg-[#69C4E8] px-4 py-1.5 text-[13px] font-medium text-[#171717] hover:bg-[#69C4E8]/90 md:inline-flex">
            <Plus className="h-4 w-4" /> Baru
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-muted/30 text-left text-[11px] uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Konten</th>
                <th className="px-5 py-3 font-medium hidden md:table-cell">Tipe</th>
                <th className="px-5 py-3 font-medium hidden lg:table-cell">ID / Slug</th>
                <th className="px-5 py-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filtered.map(entry => {
                const cfg = typeLabels[entry.type] || typeLabels.reminder
                const Icon = cfg.icon
                return (
                  <tr key={entry.id} className="group hover:bg-muted/30">
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 grid h-7 w-7 place-items-center rounded-full ${cfg.color}`}>
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="line-clamp-2 max-w-[320px] text-[14px] font-medium leading-snug">{entry.title}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            {entry.reference && (
                              <span className="text-[11px] text-muted-foreground">{entry.reference}</span>
                            )}
                            {entry.category && (
                              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">{entry.category}</span>
                            )}
                          </div>
                          <div className="mt-1.5 flex md:hidden">
                            <span className="text-[11px] text-muted-foreground">{cfg.label} • {entry.id}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-[11px]">{cfg.label}</span>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <p className="font-mono text-[11px] text-muted-foreground">{entry.id}</p>
                      <p className="font-mono text-[10px] opacity-50">{entry.slug}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1">
                        <Link
                          href={`/admin/edit/${encodeURIComponent(entry.id)}`}
                          className="grid h-8 w-8 place-items-center rounded-full border border-border bg-card text-muted-foreground hover:bg-[#69C4E8]/10 hover:text-[#69C4E8]"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="grid h-8 w-8 place-items-center rounded-full border border-border bg-card text-muted-foreground hover:bg-red-500/10 hover:text-red-600"
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
            <div className="px-5 py-16 text-center">
              <p className="text-[14px] font-medium">Tidak ada konten yang cocok</p>
              <p className="mt-1 text-[13px] text-muted-foreground">Coba kata kunci lain atau ganti filter</p>
              <Link href="/admin/new" className="mt-4 inline-flex rounded-full bg-[#171717] px-4 py-2 text-[13px] text-white dark:bg-white dark:text-black">
                Tambah Konten Baru
              </Link>
            </div>
          )}
        </div>
      </div>

      <p className="mt-4 text-center text-[11px] text-muted-foreground">
        Menampilkan {filtered.length} dari {content.length} konten • Mulai dari 0 • Neon Postgres
      </p>
    </div>
  )
}
