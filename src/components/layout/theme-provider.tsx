"use client"

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark" | "system"

interface ThemeContextType {
  theme: Theme
  resolvedTheme: "light" | "dark"
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system")
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("tadzkirah-theme") as Theme | null
    if (saved) setThemeState(saved)
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const root = window.document.documentElement
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches

    let resolved: "light" | "dark" = "light"
    if (theme === "system") {
      resolved = systemDark ? "dark" : "light"
    } else {
      resolved = theme
    }

    setResolvedTheme(resolved)
    root.classList.remove("light", "dark")
    root.classList.add(resolved)
    root.setAttribute("data-theme", resolved)
    localStorage.setItem("tadzkirah-theme", theme)

    // listen for system change if in system mode
    if (theme === "system") {
      const mql = window.matchMedia("(prefers-color-scheme: dark)")
      const handler = (e: MediaQueryListEvent) => {
        const newResolved = e.matches ? "dark" : "light"
        setResolvedTheme(newResolved)
        root.classList.remove("light", "dark")
        root.classList.add(newResolved)
      }
      mql.addEventListener("change", handler)
      return () => mql.removeEventListener("change", handler)
    }
  }, [theme, mounted])

  const setTheme = (t: Theme) => {
    setThemeState(t)
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider")
  return ctx
}
