# Tadzkirah — Pengingat Pribadi Al-Quran & Sunnah

> Pengingat pribadi melalui Al-Quran dan Sunnah.

Basis pengetahuan pribadi yang modern, minimalis, fokus pada bacaan. Terinspirasi **Google Search × Notion × Apple HIG**. Dibuat untuk pencarian instan ayat Al-Quran, hadits shahih, doa autentik, dan catatan pribadi. Tanpa fitur sosial. Tanpa distraksi.

**Inspirasi warna:** Masjidil Haram — Biru Langit `#69C4E8`, Hitam Ka'bah `#171717`, Emas Kiswah `#C89B3C`.

**Bahasa:** Seluruh antarmuka dalam Bahasa Indonesia. Arab hanya untuk teks Quran/Hadits/Doa asli.

---

### ✨ Prinsip

- Tenang, damai, premium, modern, minimalis
- Tanpa ornamen tradisional, tanpa gradien berat
- Pencarian sebagai fitur utama
- Keterbacaan di atas dekorasi

### 🎨 Sistem Desain

- **Primary:** Sky Blue `#69C4E8`
- **Secondary:** Kaaba Black `#171717`
- **Accent:** Kiswah Gold `#C89B3C` — hanya aksen halus
- **BG Light:** `#FFFFFF`, **Dark:** `#0D1117`
- **Cards:** Light White, Dark `#161B22`
- **Typography:** UI `Inter` / `Geist`, Arab `Amiri` / `Noto Naskh Arabic`
- **Radius:** 16-20px, soft shadow, backdrop blur

### 📂 Arsitektur & Loader Fleksibel

```
/content
  /quran/*.json
  /hadith/*.json
  /dua/*.json
  /reminders/*.json
  /reflections/*.json
  /collections/*.json  → mendukung Format C (collection)
  **/*.json            → dipindai rekursif, dimanapun bebas
  /templates/*.json    → tidak di-index (hanya contoh)

src/
  app/
    page.tsx              # Landing mirip Google + pencarian instan
    [type]/[slug]/page.tsx # Halaman detail konten
  lib/
    content.ts            # Loader fleksibel (server-only) - scan rekursif, defaults, validasi
    search.ts             # Pencarian client (index title, reference, category, tags, keywords, translation, lesson, reflection)
    types.ts              # Skema ContentEntry
```

**Loader mendukung 3 format tanpa konfigurasi:**

- **Format A:** Single object `{...}`
- **Format B:** Array `[{...}, {...}]`
- **Format C:** Collection `{ version, title, defaults, items: [...] }` dengan pewarisan `defaults`

Tambah file JSON dimanapun di `/content` → otomatis terindeks. Tidak perlu ubah kode.

Lihat **CONTENT_GUIDE.md** untuk dokumentasi lengkap cara menambah konten.

### 🧩 Skema Konten (Ringkas)

Wajib: `id`, `type`, `title`. Sisanya opsional dan aman jika hilang.

```json
{
  "id": "quran-al-baqarah-286",
  "slug": "al-baqarah-286",
  "type": "quran",
  "title": "Allah tidak membebani seseorang...",
  "reference": "QS. Al-Baqarah: 286",
  "category": "Sabar",
  "arabic": "لَا يُكَلِّفُ...",
  "latin": "La yukallifullah...",
  "translation": "Allah tidak membebani...",
  "lesson": ["Pelajaran 1", "Pelajaran 2"],
  "reflection": "Catatan pribadi",
  "tags": ["sabar", "tawakal"],
  "keywords": ["ujian", "kemudahan"],
  "related": ["quran-al-insyirah-5-6"],
  "youtube": [{ "youtubeId": "...", "title": "...", "speaker": "..." }],
  "createdAt": "2024-01-15"
}
```

YouTube mendukung format baru `youtubeId`, `channel`, `speaker` dan format lama `id`, `url`.

### 🔍 Pengalaman Pencarian (Bahasa Indonesia)

- Search bar besar di tengah seperti Google, placeholder: `Cari ayat, hadits, doa, atau topik...`
- Filtering instan client-side
- Filter: Semua, Quran, Hadits, Doa, Pengingat, Catatan
- Keyboard: `⌘K` atau `/` untuk fokus
- URL sync `?q=sabar`
- Empty state: `Tidak ditemukan hasil yang sesuai.`
- Label: `Referensi Terkait`, `Pelajaran & Tadabbur`, `Catatan Pribadi`, `Kajian Terkait`

### 📖 Halaman Detail (Bahasa Indonesia)

- Kembali ke pencarian, Bahasa Indonesia penuh
- Arab dengan Amiri/Noto Naskh RTL
- Terjemahan, Pelajaran (array support), Catatan Pribadi
- Tag → klik untuk cari
- Referensi Terkait (resolve ID otomatis)
- Kajian Terkait dengan modal player

### 🌓 Tema

- Terang / Gelap / Sistem, disimpan di localStorage
- Label: Terang, Gelap, Sistem

### 🚀 Tech Stack

- Next.js App Router + TypeScript
- Tailwind CSS v4 + shadcn/ui
- Lucide Icons
- JSON sebagai single source of truth
- Tanpa DB, tanpa CMS, tanpa Auth
- Siap migrasi ke SQLite/PostgreSQL tanpa ubah frontend

### 📦 Cara Menambah Konten (Plug-and-Play)

1. Buat file JSON baru dimanapun di `/content`, contoh `content/doa-baru.json`
2. Isi minimal:
```json
{
  "id": "doa-tidur-baru",
  "type": "dua",
  "title": "Doa sebelum tidur"
}
```
3. Simpan → Refresh → Otomatis muncul di pencarian!

Template siap pakai ada di `/content/templates/`

Lihat **CONTENT_GUIDE.md** untuk panduan lengkap.

### 📚 Dokumentasi

- `CONTENT_GUIDE.md` — panduan lengkap format JSON, defaults, related, youtube
- `content/templates/*` — template siap copy untuk semua tipe konten

### 🔮 Ekstensibilitas Masa Depan

Bookmark, Koleksi, Filter Lanjutan, Full-text Search (FTS), Riwayat Baca, Offline, PWA — arsitektur sudah disiapkan (tipe `Bookmark`, `Collection`).

### 📦 Menjalankan

```bash
npm install
npm run dev
# buka http://localhost:3000
```

Build:

```bash
npm run build
npm run start
```

---

Dibuat untuk refleksi, bukan distraksi. Pengingat pribadi melalui Al-Quran dan Sunnah.
