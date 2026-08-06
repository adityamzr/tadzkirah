"use client"

import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "./theme-provider"
import { useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-label="Ganti tema"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        title="Ganti tema"
      >
        {resolvedTheme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 z-20 min-w-[160px] rounded-xl border border-border bg-card p-1.5 shadow-xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
            {[
              { id: "light", label: "Terang", icon: Sun },
              { id: "dark", label: "Gelap", icon: Moon },
              { id: "system", label: "Sistem", icon: Monitor },
            ].map((opt) => {
              const Icon = opt.icon
              const active = theme === opt.id
              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    setTheme(opt.id as any)
                    setOpen(false)
                  }}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                    active
                      ? "bg-[#69C4E8]/10 text-[#69C4E8]"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {opt.label}
                  {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#69C4E8]" />}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
