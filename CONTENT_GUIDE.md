# Panduan Konten Tadzkirah

> Sistem plug-and-play untuk menambah ayat, hadits, doa, pengingat, dan catatan pribadi hanya dengan membuat file JSON.

---

## 1. Struktur Folder

```
/content
  /quran/*.json
  /hadith/*.json
  /dua/*.json
  /reminders/*.json
  /reflections/*.json
  /collections/*.json  (opsional, bebas dimana saja)
  /templates/*.json    (tidak di-index, hanya contoh)

Semua file JSON di dalam /content akan dipindai secara rekursif,
kecuali folder /content/templates dan file yang diawali _ atau .
```

**Anda bebas membuat struktur folder apapun.**  
Contoh:
- `/content/quran/juz-30/al-ikhlas.json`
- `/content/harian/2024/doa-pagi.json`
- `/content/ustadz-adi-hidayat/kajian-sabar.json`

Semua akan otomatis terdeteksi.

---

## 2. Format JSON yang Didukung

### Format A — Single Content (1 file = 1 entri)

```json
{
  "id": "quran-al-baqarah-286",
  "slug": "al-baqarah-286",
  "type": "quran",
  "title": "Allah tidak membebani seseorang...",
  "reference": "QS. Al-Baqarah: 286",
  "arabic": "لَا يُكَلِّفُ...",
  "translation": "Allah tidak membebani..."
}
```
Diinterpretasikan sebagai **satu** entri.

### Format B — Multiple Contents (1 file = banyak entri)

```json
[
  {
    "id": "reminder-1",
    "type": "reminder",
    "title": "Pengingat 1"
  },
  {
    "id": "reminder-2",
    "type": "reminder",
    "title": "Pengingat 2"
  }
]
```
Setiap objek di dalam array menjadi entri independen.

### Format C — Collection dengan Defaults

```json
{
  "version": 1,
  "title": "Kumpulan Hadits Akhlak",
  "description": "Deskripsi koleksi (opsional, tidak di-index)",
  "defaults": {
    "type": "hadith",
    "category": "Akhlak",
    "source": "Shahih Muslim",
    "tags": ["akhlak"]
  },
  "items": [
    {
      "id": "hadith-muslim-1",
      "title": "Akhlak terbaik...",
      "reference": "HR. Muslim No. 1"
    },
    {
      "id": "hadith-muslim-2",
      "title": "Hadits kedua",
      "tags": ["akhlak", "tambahan"]
    }
  ]
}
```

- Hanya `items` yang di-index.
- `defaults` otomatis diwariskan ke setiap item.
- Item bisa override defaults.
- Mengurangi duplikasi ketika import banyak data dari sumber sama.

---

## 3. Pewarisan Metadata (Defaults)

Contoh:

```json
{
  "defaults": {
    "type": "hadith",
    "category": "Akhlak",
    "source": "Shahih Muslim"
  },
  "items": [
    { "id": "muslim-1", "title": "..." },
    { "id": "muslim-2", "title": "...", "category": "Muamalah" }
  ]
}
```

- `muslim-1` akan mendapat `type=hadith`, `category=Akhlak`, `source=Shahih Muslim`
- `muslim-2` akan override `category` menjadi `Muamalah`, tapi tetap `type=hadith`

---

## 4. Skema Standar Konten

### Wajib (3 field)

| Field | Tipe | Keterangan |
|-------|------|------------|
| `id` | string | ID unik, contoh: `quran-al-baqarah-286`, tidak boleh duplikat |
| `type` | string | Salah satu: `quran`, `hadith`, `dua`, `reminder`, `reflection` |
| `title` | string | Judul dalam Bahasa Indonesia |

> Alias diterima: `hadis` → `hadith`, `doa` → `dua`, `pengingat` → `reminder`, `catatan/refleksi` → `reflection`

### Opsional

```json
{
  "slug": "al-baqarah-286",
  "reference": "QS. Al-Baqarah: 286",
  "category": "Sabar",
  "subcategory": "Tawakal",
  "arabic": "لَا يُكَلِّفُ...",
  "latin": "La yukallifullah...",
  "translation": "Terjemahan Bahasa Indonesia",
  "lesson": ["Pelajaran 1", "Pelajaran 2"],
  "reflection": "Catatan pribadi",
  "tags": ["sabar", "tawakal"],
  "keywords": ["ujian", "kemudahan"],
  "related": ["quran-al-insyirah-5-6", "hadith-bukhari-1"],
  "youtube": [],
  "source": "Al-Quran Al-Karim",
  "createdAt": "2024-01-15",
  "updatedAt": "2024-01-16"
}
```

- `slug`: Jika kosong, otomatis dibuat dari `id` → `slugify(id)`. Gunakan untuk URL: `/{type}/{slug}`
- `reference`: Referensi resmi, contoh `QS. Al-Baqarah: 286` atau `Shahih Bukhari No. 1`
- `category` / `subcategory`: Kategori Bahasa Indonesia, bebas
- `arabic`: Teks Arab asli — tetap Arab
- `latin`: Transliterasi (opsional)
- `translation`: Terjemahan Bahasa Indonesia
- `lesson`: Bisa `string` atau `string[]`. Di UI akan dirender sebagai beberapa paragraf. Gunakan untuk Pelajaran & Tadabbur
- `reflection`: Catatan pribadi (opsional)
- `tags`: Array string, untuk filter & pencarian
- `keywords`: Array string tambahan, khusus untuk SEO/pencarian (tidak ditampilkan sebagai tag)
- `related`: Array ID konten lain, hanya ID. Akan di-resolve otomatis
- `youtube`: Array video, lihat struktur di bawah
- `source`, `createdAt`, `updatedAt`: metadata

> Semua field opsional aman — aplikasi tidak akan crash jika kosong.

---

## 5. Struktur YouTube

Mendukung format baru dan lama (backward compatible):

### Format Baru (disarankan)

```json
{
  "title": "Tafsir Al-Baqarah 286 - Ustadz Adi Hidayat",
  "speaker": "Ustadz Adi Hidayat",
  "channel": "Adi Hidayat Official",
  "youtubeId": "dQw4w9WgXcQ",
  "duration": "15:30",
  "description": "Penjelasan tadabbur ayat..."
}
```

### Format Lama (masih didukung)

```json
{
  "id": "dQw4w9WgXcQ",
  "title": "Judul video",
  "speaker": "Nama pemateri",
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "thumbnail": "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
  "duration": "15:30"
}
```

- `youtubeId` atau `id` wajib + `title` wajib, lainnya opsional
- Jika `youtubeId` berupa URL, akan diekstrak otomatis
- Jika `thumbnail` kosong, otomatis pakai `https://img.youtube.com/vi/{ID}/hqdefault.jpg`
- Jika kosong → section tidak dirender

---

## 6. Konten Terkait (Related)

Hanya gunakan **ID**:

```json
"related": [
  "quran-al-baqarah-286",
  "hadith-muslim-2699",
  "dua-sebelum-tidur"
]
```

Aplikasi akan resolve otomatis ke entri yang ada. Jika ID tidak ditemukan, akan diabaikan (tidak crash). Bisa juga menggunakan slug sebagai fallback.

---

## 7. Konvensi Penamaan

- **ID**: huruf kecil, pisah dengan `-`, awali dengan tipe: `quran-`, `hadith-`, `dua-`, `reminder-`, `reflection-`
  - Contoh: `quran-al-ikhlas-1-4`, `hadith-bukhari-1`, `dua-pagi-petang`
- **Slug**: sama seperti ID atau lebih pendek, akan dipakai di URL. Jika tidak diisi, pakai ID.
- **File**: Bebas, tapi disarankan `id.json`. Contoh: `content/quran/al-baqarah-286.json`
- **Folder**: Bebas, gunakan untuk organisasi pribadi.

---

## 8. Aturan Validasi

- Setiap file JSON diproses independen
- Jika 1 entri invalid → hanya entri itu di-skip, file lain tetap jalan
- **Syarat valid**: `id` (string tidak kosong) + `type` (dari daftar) + `title` (string tidak kosong)
- Jika invalid di development → warning di console: `[Tadzkirah] Entry tidak valid...`
- Jika file JSON malformed → file di-skip, warning di console, aplikasi tidak crash
- Duplikasi `id` → entri kedua di-skip, warning

---

## 9. Pencarian (Search Index)

Setiap entri valid otomatis masuk index pencarian. Field yang di-index:

- `title`
- `reference`
- `category`
- `subcategory`
- `tags`
- `keywords`
- `translation`
- `lesson` (jika array, digabung)
- `reflection`
- `source` dan `arabic`/`latin` juga (untuk pencarian Arab)

Pencarian bersifat **AND** untuk multi-kata: `"sabar tawakal"` → harus mengandung kedua kata di haystack gabungan.

Pencarian mengabaikan field yang kosong dengan aman.

---

## 10. Templates

Gunakan file di `/content/templates/` sebagai starting point:

- `quran.template.json`
- `hadith.template.json`
- `dua.template.json`
- `reminder.template.json`
- `reflection.template.json`
- `collection.template.json` (contoh Format C)
- `array.template.json` (contoh Format B)

Copy, ubah `id`, `title`, dan field lain, lalu simpan di mana saja di `/content` (bukan di `/templates`).

---

## 11. Praktik Terbaik

1. **Satu fakta, satu file** untuk kemudahan edit, atau gunakan **collection** jika banyak data sejenis
2. Gunakan `keywords` untuk istilah yang tidak ingin ditampilkan sebagai tag tapi ingin bisa dicari
3. Isi `related` dengan minimal 2-3 entri relevan untuk memperkaya navigasi
4. Untuk `lesson`, gunakan array jika pelajarannya lebih dari 1 poin
5. Selalu isi `tags` dalam Bahasa Indonesia, huruf kecil: `["sabar", "syukur", "tawakal"]`
6. Jangan gunakan karakter aneh di `id`, cukup `a-z`, `0-9`, `-`, `_`
7. Foto/thumbnail YouTube otomatis, tidak perlu isi manual kecuali custom
8. Commit file JSON langsung ke git, tidak perlu migrasi database

---

## 12. Alur Kerja Developer (Plug-and-Play)

1. Buat file baru: `content/renungan/2024-refleksi-sabar.json`
2. Isi minimal 3 field wajib:
```json
{
  "id": "reflection-sabar-2024",
  "type": "reflection",
  "title": "Apa yang kupelajari tentang sabar tahun ini"
}
```
3. Tambahkan field opsional sesuai kebutuhan
4. Simpan → Refresh browser → Otomatis muncul di pencarian & detail page
5. Tidak perlu ubah kode, tidak perlu registrasi manual, tidak perlu restart (di dev, hot reload)

---

## 13. Contoh Real (dari repo)

Lihat folder `content/quran`, `content/hadith`, `content/collections` untuk contoh nyata Format A, B, C.

- `content/quran/al-baqarah-286.json` → Format A
- `content/collections/contoh-array.json` → Format B (array)
- `content/collections/contoh-koleksi.json` → Format C (collection + defaults)

---

Selesai. Sekarang kamu bisa menambah ratusan entri hanya dengan JSON, tanpa sentuh kode.
