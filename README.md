# Tadzkirah — Personal Islamic Knowledge Base

> A personal reminder through the Quran and Sunnah.

Modern, minimalist, reading-focused personal knowledge base inspired by **Google Search × Notion × Apple HIG**. Built for instant searching of Quran verses, authentic Hadith, Du'a, and personal reflections. No social features. No distractions.

**Color inspiration:** Masjidil Haram — Sky Blue `#69C4E8`, Kaaba Black `#171717`, Kiswah Gold `#C89B3C`.

---

### ✨ Principles

- Calm, peaceful, premium, modern, minimal
- No traditional ornaments, no heavy gradients
- Search-first. Everything else is secondary.
- Readability over decoration

### 🎨 Design System

- **Primary:** Sky Blue `#69C4E8`
- **Secondary:** Kaaba Black `#171717`
- **Accent:** Kiswah Gold `#C89B3C` — subtle only
- **Background Light:** `#FFFFFF`, **Dark:** `#0D1117`
- **Cards:** Light White, Dark `#161B22`
- **Typography:** UI `Inter` / `Geist`, Arabic `Amiri` / `Noto Naskh Arabic`
- **Radius:** 16-20px, soft shadows, backdrop blur

### 📂 Architecture

```
content/
  quran/*.json
  hadith/*.json
  dua/*.json
  reminders/*.json
  reflections/*.json

src/
  app/
    page.tsx              # Google-like landing + instant search
    [type]/[slug]/page.tsx # Content detail
  components/
    ui/                   # button, input, badge, card
    search/               # SearchBar, SearchResults, ResultCard
    content/              # ArabicText, Translation, Lessons, Related, YouTube
    layout/               # ThemeProvider, ThemeToggle
  lib/
    types.ts              # ContentEntry schema
    content.ts            # FS loader (server-only)
    search.ts             # Client search
```

### 🧩 JSON Schema

Every entry is a human-readable JSON file:

```json
{
  "id": "quran-al-baqarah-286",
  "slug": "al-baqarah-286",
  "type": "quran",
  "title": "Allah does not burden a soul...",
  "reference": "QS. Al-Baqarah: 286",
  "category": "Sabr",
  "arabic": "لَا يُكَلِّفُ...",
  "latin": "La yukallifullah...",
  "translation": "Allah does not burden...",
  "lesson": "This verse is a personal anchor...",
  "reflection": "When overwhelmed...",
  "tags": ["sabr", "tawakkul"],
  "related": ["quran-al-insyirah-5-6"],
  "youtube": [{ "id": "...", "title": "...", "speaker": "...", "url": "..." }],
  "createdAt": "2024-01-15"
}
```

Optional fields are safely ignored. Ready for future migration to SQLite/PostgreSQL without frontend changes.

### 🔍 Search Experience

- Large centered search bar (like Google)
- Instant client-side filtering across title, arabic, translation, lesson, tags, reference, category
- Filters: All, Quran, Hadith, Du'a, Reminders, Reflections
- Keyboard: `⌘K` or `/` to focus
- URL sync `?q=sabr` for shareability
- Lazy, fast, minimal JS

### 📖 Content Detail

Each page supports:

- Title, reference, category
- Arabic with Amiri/Noto Naskh (RTL)
- Latin transliteration (optional)
- Translation
- Lesson & Personal Reflection blocks
- Tags → clickable to search
- Related references as cards
- Optional YouTube discussions with modal player

### 🌓 Theme

- Light / Dark / System preference
- Persisted in localStorage
- `ThemeProvider` with class strategy

### 🚀 Tech Stack

- Next.js App Router + TypeScript
- Tailwind CSS v4 + shadcn/ui patterns
- Lucide Icons
- JSON as single source of truth
- No DB, no CMS, no Auth

### 🔮 Future Extensibility (prepared, not implemented)

Bookmarks, Favorites, Collections, Advanced Filters, Full-text search (SQLite FTS), Reading History, Offline Support, PWA.

Architecture already supports these via `Bookmark`, `Collection` types and flexible schema.

### 📦 Getting Started

```bash
npm install
npm run dev
# open http://localhost:3000
```

Build:

```bash
npm run build
npm run start
```

### ✅ Deliverables

- Complete landing page (Logo, Name, Tagline, Search)
- Responsive layout (mobile reading comfort)
- Design system (colors, typography)
- Light & Dark theme
- Search interface + results
- Content detail page
- Related content + YouTube sections
- Flexible JSON architecture
- Component-based structure
- Clean folder organization

---

Built for reflection, not distraction.
