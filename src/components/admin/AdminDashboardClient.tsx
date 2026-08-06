"use client"

import { useState, useMemo } from "react"
import { ContentEntry } from "@/lib/types"
import { Search, Plus, Edit3, Trash2, LogOut, Database, FileJson, BookOpen, FileText, Heart, Lightbulb, NotebookPen } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

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
  const [query, setQuery] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [content, setContent] = useState(initialContent)
  const router = useRouter()

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
      alert("Berhasil dihapus!")
    } catch (e: any) {
      alert("Gagal hapus: " + (e.message || ""))
    }
  }

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: 'DELETE' })
    router.push("/admin/login")
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#0D1117]">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="mx-auto flex h-[64px] max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-[#171717] text-white dark:bg-white dark:text-black">
                <span className="font-amiri text-[16px] font-bold">ت</span>
              </div>
              <span className="font-semibold">Tadzkirah Admin</span>
            </Link>
            <span className="hidden rounded-full bg-muted px-2.5 py-1 text-[11px] text-muted-foreground md:inline">
              {stats.dbConfigured ? (
                <span className="flex items-center gap-1"><Database className="h-3 w-3" /> Neon Connected</span>
              ) : (
                <span className="flex items-center gap-1"><FileJson className="h-3 w-3" /> Mode File JSON</span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/admin/new" className="inline-flex items-center gap-1.5 rounded-full bg-[#171717] px-4 py-2 text-[13px] font-medium text-white hover:bg-black dark:bg-white dark:text-black">
              <Plus className="h-4 w-4" /> Tambah Konten
            </Link>
            <button onClick={handleLogout} className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card hover:bg-muted">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Total</p>
            <p className="mt-1 text-[24px] font-semibold">{stats.total}</p>
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
              <p className="mt-1 text-[20px] font-semibold">{(stats as any)[s.key]}</p>
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
                onClick={() => setFilterType(f.id)}
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
        </div>

        {/* Table */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-muted/30 text-left text-[11px] uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Konten</th>
                  <th className="px-5 py-3 font-medium">Tipe & Kategori</th>
                  <th className="px-5 py-3 font-medium">ID / Slug</th>
                  <th className="px-5 py-3 font-medium">Tag</th>
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
                            {entry.reference && (
                              <p className="mt-1 text-[12px] text-muted-foreground">{entry.reference}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex w-fit rounded-full bg-muted px-2.5 py-0.5 text-[11px]">{cfg.label}</span>
                          {entry.category && (
                            <span className="text-[12px] text-muted-foreground">{entry.category}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-mono text-[11px] text-muted-foreground">{entry.id}</p>
                        <p className="font-mono text-[11px] opacity-60">{entry.slug}</p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex max-w-[160px] flex-wrap gap-1">
                          {(entry.tags || []).slice(0, 3).map(tag => (
                            <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">#{tag}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1">
                          <Link
                            href={`/admin/edit/${encodeURIComponent(entry.id)}`}
                            className="grid h-8 w-8 place-items-center rounded-full border border-border bg-card text-muted-foreground hover:bg-[#69C4E8]/10 hover:text-[#69C4E8]"
                            title="Edit"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className="grid h-8 w-8 place-items-center rounded-full border border-border bg-card text-muted-foreground hover:bg-red-500/10 hover:text-red-600"
                            title="Hapus"
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
              </div>
            )}
          </div>
        </div>

        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          Menampilkan {filtered.length} dari {content.length} konten • {stats.dbConfigured ? "Neon Postgres" : "File JSON"}
        </p>
      </div>
    </div>
  )
}
