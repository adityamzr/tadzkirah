# Tadzkirah — Pengingat Pribadi Al-Quran & Sunnah

> Pengingat pribadi melalui Al-Quran dan Sunnah.

Basis pengetahuan pribadi yang modern, minimalis, fokus pada bacaan. Terinspirasi **Google Search × Notion × Apple HIG**. Dibuat untuk pencarian instan ayat Al-Quran, hadits shahih, doa autentik, dan catatan pribadi.

**Sekarang dengan Dashboard Admin + Neon Postgres — tidak lagi file JSON statis di Vercel.**

**Inspirasi warna:** Masjidil Haram — Biru Langit `#69C4E8`, Hitam Ka'bah `#171717`, Emas Kiswah `#C89B3C`.
**Bahasa:** Seluruh antarmuka Bahasa Indonesia. Arab hanya untuk teks Quran/Hadits/Doa asli.

---

### ✨ Prinsip

- Tenang, damai, premium, modern, minimal
- Pencarian sebagai fitur utama
- Keterbacaan di atas dekorasi

### 🎨 Sistem Desain

- Primary `#69C4E8`, Secondary `#171717`, Accent `#C89B3C`
- BG Light `#FFFFFF`, Dark `#0D1117`, Card Dark `#161B22`
- Typography: UI `Inter` / `Geist`, Arab `Amiri` / `Noto Naskh Arabic`

### 🗄️ Arsitektur Baru — Neon Database

```
Sebelum: /content/*.json (statis, hilang di Vercel)
Sekarang: Neon Postgres (persisten, dinamis)

src/lib/db/
  schema.ts        # tabel contents (id, slug, type, title, arabic, translation, lesson JSONB, tags JSONB, etc)
  index.ts         # koneksi neon() + drizzle

src/lib/
  content.ts       # loader cerdas: jika DATABASE_URL ada → ambil dari Neon, jika tidak → fallback file JSON
  admin-content.ts # CRUD yang auto pilih DB atau file+GitHub
  admin-auth.ts    # auth password sederhana via cookie

src/app/admin/
  login/           # /admin/login
  page.tsx         # dashboard list + stats + search
  new/             # tambah konten
  edit/[id]/       # edit konten

src/app/api/admin/
  auth/            # login/logout
  content/         # CRUD API
  stats/           # statistik

scripts/
  migrate-json-to-neon.ts  # migrasi JSON lama ke Neon
```

**Loader mendukung dual mode:**

- **Mode Neon (production):** `DATABASE_URL` ter-set → semua konten dari Postgres, CRUD via dashboard langsung live
- **Mode File (fallback dev):** jika tidak ada `DATABASE_URL` → baca dari `/content/*.json` seperti sebelumnya (plug-and-play tetap jalan)

### 🧩 Skema Konten (Postgres)

```sql
CREATE TABLE contents (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL, -- quran, hadith, dua, reminder, reflection
  title TEXT NOT NULL,
  reference TEXT,
  category TEXT,
  subcategory TEXT,
  arabic TEXT,
  latin TEXT,
  translation TEXT,
  lesson JSONB, -- string atau string[]
  reflection TEXT,
  tags JSONB,
  keywords JSONB,
  related JSONB, -- array ID
  youtube JSONB, -- array {title, youtubeId, speaker, channel, duration}
  source TEXT,
  created_at TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

Wajib: `id, type, title`. Sisanya opsional, aman jika hilang.

### 🔐 Dashboard Admin

**URL:** `/admin` → redirect ke `/admin/login` jika belum login

**Fitur:**

- Login password sederhana (`ADMIN_PASSWORD` di ENV, default `tadzkirah123`)
- Dashboard: stats total, per tipe, pencarian, filter tipe
- List table dengan aksi edit/hapus
- Form lengkap:
  - ID, slug (auto dari judul), tipe
  - Judul, referensi, kategori, subkategori
  - Arab RTL, latin, terjemahan
  - Pelajaran array (tambah/hapus paragraf)
  - Catatan pribadi
  - Tags, keywords, related (chip input dengan Enter)
  - Kajian YouTube array (title, youtubeId, speaker, channel, duration)
- Simpan → langsung ke Neon DB, langsung live (tidak perlu commit GitHub lagi)
- Hapus dengan konfirmasi

**Keamanan:** Middleware melindungi `/admin/*` dan `/api/admin/*` via cookie `httpOnly` + cek password. Logout hapus cookie.

### 🔍 Pencarian

Tetap Bahasa Indonesia:
- Placeholder: `Cari ayat, hadits, doa, atau topik...`
- Filter: Semua, Quran, Hadits, Doa, Pengingat, Catatan
- Index: title, reference, category, tags, keywords, translation, lesson (array digabung), reflection, source, arabic, latin
- Empty: `Tidak ditemukan hasil yang sesuai.`

### 📖 Halaman Detail

`/[type]/[slug]` — Terjemahan, Pelajaran & Tadabbur, Catatan Pribadi, Referensi Terkait, Kajian Terkait (modal YouTube)

### 🌓 Tema

Terang / Gelap / Sistem, `localStorage`

### 🚀 Tech Stack Terbaru

- Next.js 16 App Router + TypeScript
- Tailwind v4 + shadcn/ui + Lucide
- **Neon Postgres** + `@neondatabase/serverless` + `drizzle-orm`
- Auth cookie sederhana + middleware
- Dashboard CRUD full
- Dual storage: Neon (prod) + JSON fallback (dev)

### 📦 Setup Neon Database

1. Buat project di https://neon.tech
2. Copy `DATABASE_URL` (pooled)
3. Set di `.env` lokal dan di Vercel ENV:

```
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require
ADMIN_PASSWORD=tadzkirah123
```

4. Migrasi JSON lama ke Neon (sekali saja):

```bash
npm install
DATABASE_URL=xxx npm run migrate:json
# atau
npm run migrate:json
```

Script akan buat tabel otomatis dan insert 35+ entri dari `/content`.

5. Deploy ke Vercel dengan ENV yang sama — konten akan diambil dari Neon.

### 📦 Menjalankan Lokal

```bash
# Tanpa DB (mode file JSON seperti dulu)
npm install
npm run dev
# buka http://localhost:3000
# admin di http://localhost:3000/admin (password: tadzkirah123)

# Dengan Neon
echo 'DATABASE_URL=postgresql://...' > .env
echo 'ADMIN_PASSWORD=tadzkirah123' >> .env
npm run migrate:json # pertama kali saja
npm run dev
```

### 📚 Dokumentasi

- `CONTENT_GUIDE.md` — panduan format JSON lama (tetap relevan untuk fallback)
- `content/templates/*` — template JSON
- `.env.example` — daftar ENV
- `scripts/migrate-json-to-neon.ts` — migrasi

### 🔮 Roadmap

- Paginasi & full-text search di DB (tsvector)
- Bookmark, Koleksi pribadi (sudah siap tipe `Bookmark`)
- Upload thumbnail custom
- Role user (read-only vs admin)

---

Dibuat untuk refleksi, bukan distraksi.
