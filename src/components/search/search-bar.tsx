"use client"

import { Search, X, Command } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  autoFocus?: boolean
}

export function SearchBar({ value, onChange, placeholder = "Cari ayat, hadits, doa, atau topik...", autoFocus = true }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === "/" && !focused && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [focused])

  return (
    <div className={cn(
      "group relative flex items-center w-full max-w-[640px] mx-auto rounded-full border bg-card shadow-sm transition-all duration-300",
      focused ? "border-[#69C4E8]/40 shadow-[0_0_0_4px_rgba(105,196,232,0.12)] ring-0" : "border-border hover:border-border/80 hover:shadow-md"
    )}>
      <div className="pl-5 pr-3 flex items-center text-muted-foreground">
        <Search className="h-[18px] w-[18px]" strokeWidth={1.8} />
      </div>

      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="flex-1 h-[56px] bg-transparent px-0 text-[16px] md:text-[17px] placeholder:text-muted-foreground/60 focus:outline-none"
        aria-label="Cari basis pengetahuan Islam"
      />

      <div className="flex items-center gap-1.5 pr-2">
        {value ? (
          <button
            onClick={() => onChange("")}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
            aria-label="Hapus pencarian"
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          <>
            <div className="hidden md:flex items-center gap-1 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-[11px] text-muted-foreground">
              <Command className="h-3 w-3" /> K
            </div>
          </>
        )}
      </div>
    </div>
  )
}
