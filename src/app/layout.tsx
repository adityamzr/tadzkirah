import type { Metadata } from "next";
import { Geist, Inter, Amiri, Noto_Naskh_Arabic } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  display: "swap",
});

const notoNaskh = Noto_Naskh_Arabic({
  variable: "--font-noto-naskh",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tadzkirah — Personal Islamic Knowledge Base",
  description:
    "A personal reminder through the Quran and Sunnah. Search Quran verses, authentic Hadith, Du'a, and personal lessons.",
  keywords: ["quran", "hadith", "dua", "islamic", "tadzkirah", "reminder"],
  authors: [{ name: "Tadzkirah" }],
  openGraph: {
    title: "Tadzkirah",
    description: "A personal reminder through the Quran and Sunnah.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${inter.variable} ${amiri.variable} ${notoNaskh.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-inter">
        <ThemeProvider>
          {/* Minimal Header - only theme toggle */}
          <header className="sticky top-0 z-30 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
            <div className="mx-auto flex h-[56px] max-w-6xl items-center justify-between px-5 md:px-8">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-[#171717] text-white dark:bg-white dark:text-[#171717]">
                  <span className="font-amiri text-[18px] font-bold leading-none">ت</span>
                </div>
                <span className="text-[15px] font-semibold tracking-tight">Tadzkirah</span>
              </Link>
              <div className="flex items-center gap-3">
                <nav className="hidden items-center gap-1 text-[13px] text-muted-foreground md:flex">
                  <span className="rounded-full bg-muted px-3 py-1">Personal knowledge base</span>
                </nav>
                <ThemeToggle />
              </div>
            </div>
          </header>

          <main className="flex-1">{children}</main>

          <footer className="mt-auto border-t border-border/40 py-8">
            <div className="mx-auto max-w-6xl px-5 text-center md:px-8">
              <p className="text-[12px] text-muted-foreground">
                Tadzkirah — A personal reminder through the Quran and Sunnah. Built for reflection, not distraction.
              </p>
              <p className="mt-2 text-[11px] text-muted-foreground/60">
                Data stored locally in JSON • No tracking • Fast searching
              </p>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
