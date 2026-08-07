"use client"

import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  Heart, 
  Lightbulb, 
  NotebookPen, 
  Plus, 
  LogOut, 
  Home,
  Database,
  Menu,
  X,
  Search
} from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface Props {
  stats?: {
    total: number
    quran: number
    hadith: number
    dua: number
    reminder: number
    reflection: number
    dbConfigured: boolean
  }
}

const navMain = [
  { id: "dashboard", label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { id: "all", label: "Semua Konten", href: "/admin", icon: Search },
  { id: "new", label: "Tambah Baru", href: "/admin/new", icon: Plus },
]

const navTypes = [
  { id: "quran", label: "Quran", href: "/admin?type=quran", icon: BookOpen, color: "text-[#69C4E8]" },
  { id: "hadith", label: "Hadits", href: "/admin?type=hadith", icon: FileText, color: "text-foreground" },
  { id: "dua", label: "Doa", href: "/admin?type=dua", icon: Heart, color: "text-[#C89B3C]" },
  { id: "reminder", label: "Pengingat", href: "/admin?type=reminder", icon: Lightbulb, color: "text-emerald-600" },
  { id: "reflection", label: "Catatan", href: "/admin?type=reflection", icon: NotebookPen, color: "text-violet-600" },
]

export default function AdminSidebar({ stats }: Props) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const currentType = searchParams.get("type") || "all"

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" })
    router.push("/admin/login")
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-[64px] items-center gap-3 border-b border-border px-5">
        <div className="grid h-8 w-8 place-items-center rounded-full bg-[#171717] text-white dark:bg-white dark:text-black">
          <span className="font-amiri text-[16px] font-bold">ت</span>
        </div>
        <div className="leading-tight">
          <p className="text-[14px] font-semibold tracking-tight">Tadzkirah</p>
          <p className="text-[11px] text-muted-foreground">Admin Panel</p>
        </div>
      </div>

      {/* DB Status */}
      <div className="p-4">
        <div className="rounded-xl border border-border bg-muted/30 px-3 py-2.5">
          <div className="flex items-center gap-2 text-[11px] font-medium">
            <Database className="h-3.5 w-3.5" />
            {stats?.dbConfigured ? (
              <span className="text-emerald-600 dark:text-emerald-400">Neon Connected</span>
            ) : (
              <span className="text-amber-600">Mode File</span>
            )}
          </div>
          {stats && (
            <p className="mt-1 text-[11px] text-muted-foreground">{stats.total} total konten</p>
          )}
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto px-3">
        <div className="space-y-6 py-2">
          <div>
            <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Menu Utama</p>
            <div className="space-y-1">
              {navMain.map(item => {
                const Icon = item.icon
                const isActive = 
                  (item.href === "/admin" && pathname === "/admin" && currentType === "all" && item.id === "all") ||
                  (item.href === "/admin" && pathname === "/admin" && item.id === "dashboard") ||
                  (pathname === item.href && item.id !== "dashboard" && item.id !== "all") ||
                  (item.id === "dashboard" && pathname === "/admin" && !searchParams.get("type"))

                // For dashboard, active if /admin and no type or type=all and we consider dashboard as same as all? Let's make dashboard active when at /admin root
                const active = item.id === "dashboard" ? pathname === "/admin" && !searchParams.get("type") : pathname === item.href

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors",
                      active
                        ? "bg-[#171717] text-white dark:bg-white dark:text-black"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>

          <div>
            <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Kategori</p>
            <div className="space-y-1">
              {navTypes.map(item => {
                const Icon = item.icon
                const isActive = currentType === item.id && pathname === "/admin"
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center justify-between rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors",
                      isActive
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className={cn("h-4 w-4", item.color)} />
                      {item.label}
                    </span>
                    {stats && (
                      <span className="rounded-full bg-background px-2 py-0.5 text-[11px] text-muted-foreground">
                        {(stats as any)[item.id] || 0}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border p-3">
        <div className="space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Home className="h-4 w-4" />
            Kembali ke Situs
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
          >
            <LogOut className="h-4 w-4" />
            Keluar
          </button>
        </div>
        <p className="mt-3 px-3 text-[10px] leading-relaxed text-muted-foreground/60">
          Tadzkirah v1 • Neon Postgres • Mulai dari 0
        </p>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile header */}
      <div className="sticky top-0 z-30 flex h-[56px] items-center justify-between border-b border-border bg-card px-4 md:hidden">
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileOpen(true)} className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-full bg-[#171717] text-white">
              <span className="font-amiri text-[14px] font-bold">ت</span>
            </div>
            <span className="text-[14px] font-semibold">Admin</span>
          </div>
        </div>
        <Link href="/admin/new" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#171717] text-white">
          <Plus className="h-5 w-5" />
        </Link>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative flex w-[280px] flex-col bg-card shadow-xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden h-screen w-[260px] shrink-0 flex-col border-r border-border bg-card md:flex">
        <SidebarContent />
      </aside>
    </>
  )
}
