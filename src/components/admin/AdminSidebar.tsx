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
import { useState, useEffect } from "react"
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

  // Prevent body scroll when mobile menu open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" })
    router.push("/admin/login")
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-[64px] shrink-0 items-center gap-3 border-b border-border/60 px-5">
        <div className="grid h-8 w-8 place-items-center rounded-full bg-[#171717] text-white shadow-sm dark:bg-white dark:text-black">
          <span className="font-amiri text-[16px] font-bold">ت</span>
        </div>
        <div className="leading-tight">
          <p className="text-[14px] font-semibold tracking-tight">Tadzkirah</p>
          <p className="text-[11px] text-muted-foreground">Admin Panel</p>
        </div>
      </div>

      {/* DB Status */}
      <div className="shrink-0 p-4">
        <div className="rounded-xl border border-border/60 bg-muted/40 px-3 py-2.5 backdrop-blur-sm transition-colors">
          <div className="flex items-center gap-2 text-[11px] font-medium">
            <Database className="h-3.5 w-3.5" />
            {stats?.dbConfigured ? (
              <span className="text-emerald-600 dark:text-emerald-400">Neon Connected</span>
            ) : (
              <span className="text-amber-600">Mode File</span>
            )}
          </div>
          {stats && (
            <p className="mt-1 text-[11px] text-muted-foreground">{stats.total} total konten • Mulai dari 0</p>
          )}
        </div>
      </div>

      {/* Nav - scrollable if needed but sidebar itself is fixed height */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 scrollbar-thin">
        <div className="space-y-6 py-2">
          <div>
            <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Menu Utama</p>
            <div className="space-y-1">
              {navMain.map(item => {
                const Icon = item.icon
                const isDashboard = item.id === "dashboard"
                const active = isDashboard
                  ? pathname === "/admin" && !searchParams.get("type")
                  : item.id === "all"
                    ? pathname === "/admin" && (currentType === "all")
                    : pathname === item.href

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
                      active
                        ? "bg-[#171717] text-white shadow-sm dark:bg-white dark:text-black"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 transition-transform group-hover:scale-105" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>

          <div>
            <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Kategori</p>
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
                      "group flex items-center justify-between rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
                      isActive
                        ? "bg-muted text-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className={cn("h-4 w-4 transition-transform group-hover:scale-105", item.color)} />
                      {item.label}
                    </span>
                    {stats && (
                      <span className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] transition-colors",
                        isActive ? "bg-background text-muted-foreground" : "bg-muted text-muted-foreground/70"
                      )}>
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
      <div className="shrink-0 border-t border-border/60 p-3">
        <div className="space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            onClick={() => setMobileOpen(false)}
          >
            <Home className="h-4 w-4" />
            Kembali ke Situs
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
          >
            <LogOut className="h-4 w-4" />
            Keluar
          </button>
        </div>
        <p className="mt-3 px-3 text-[10px] leading-relaxed text-muted-foreground/50">
          Tadzkirah v2 • 100vh • Neon
        </p>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile header - sticky, backdrop blur */}
      <div className="sticky top-0 z-30 flex h-[56px] shrink-0 items-center justify-between border-b border-border/60 bg-card/90 px-4 backdrop-blur-xl md:hidden">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMobileOpen(true)} 
            className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card shadow-sm transition-all hover:bg-muted active:scale-95"
            aria-label="Buka menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-full bg-[#171717] text-white shadow-sm">
              <span className="font-amiri text-[14px] font-bold">ت</span>
            </div>
            <span className="text-[14px] font-semibold tracking-tight">Admin</span>
          </div>
        </div>
        <Link 
          href="/admin/new" 
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#171717] text-white shadow-sm transition-all hover:bg-black active:scale-95 dark:bg-white dark:text-black"
          aria-label="Tambah konten"
        >
          <Plus className="h-5 w-5" />
        </Link>
      </div>

      {/* Mobile Drawer - smooth slide */}
      <div className={cn(
        "fixed inset-0 z-50 flex transition-all duration-300 md:hidden",
        mobileOpen ? "visible" : "invisible"
      )}>
        <div 
          className={cn(
            "fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300",
            mobileOpen ? "opacity-100" : "opacity-0"
          )} 
          onClick={() => setMobileOpen(false)} 
        />
        <div className={cn(
          "relative flex w-[280px] max-w-[85vw] flex-col bg-card shadow-2xl transition-transform duration-300 ease-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/80"
            aria-label="Tutup menu"
          >
            <X className="h-4 w-4" />
          </button>
          <SidebarContent />
        </div>
      </div>

      {/* Desktop Sidebar - fixed, 100vh, no scroll outer */}
      <aside className="hidden h-screen w-[280px] shrink-0 flex-col border-r border-border/60 bg-card md:flex">
        <SidebarContent />
      </aside>
    </>
  )
}
