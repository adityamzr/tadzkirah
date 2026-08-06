"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Lock, Eye, EyeOff } from "lucide-react"

export default function AdminLoginPage() {
  const [password, setPassword] = useState("")
  const [show, setShow] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Password salah")
        return
      }

      router.push("/admin")
      router.refresh()
    } catch (err: any) {
      setError("Gagal login: " + (err.message || ""))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F9FAFB] p-5 dark:bg-[#0D1117]">
      <div className="w-full max-w-[380px] rounded-[24px] border border-border bg-card p-8 shadow-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#171717] text-white dark:bg-white dark:text-black">
            <Lock className="h-5 w-5" />
          </div>
          <h1 className="mt-4 text-[22px] font-semibold tracking-tight">Masuk Admin</h1>
          <p className="mt-1.5 text-[13px] text-muted-foreground">
            Tadzkirah — Dashboard pengelolaan konten
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[13px] font-medium">Password Admin</label>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password admin"
                className="w-full rounded-full border border-border bg-background px-4 py-3 pr-11 text-[14px] focus:border-[#69C4E8]/50 focus:outline-none focus:ring-2 focus:ring-[#69C4E8]/20"
                required
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-muted"
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Default: <code>tadzkirah123</code> — ganti di ENV <code>ADMIN_PASSWORD</code> di Vercel
            </p>
          </div>

          {error && (
            <div className="rounded-xl bg-red-500/10 px-4 py-3 text-[13px] text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#171717] py-3 text-[14px] font-medium text-white transition-colors hover:bg-black disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-white/90"
          >
            {loading ? "Memeriksa..." : "Masuk ke Dashboard"}
          </button>
        </form>

        <div className="mt-8 rounded-xl bg-muted/50 p-3 text-[11px] leading-relaxed text-muted-foreground">
          <p className="font-medium text-foreground">Mode Neon Database:</p>
          <p>Jika <code>DATABASE_URL</code> ter-set di Vercel, semua perubahan disimpan langsung ke Neon Postgres dan langsung live. Tidak perlu GitHub lagi.</p>
        </div>
      </div>
    </div>
  )
}
