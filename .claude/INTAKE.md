# INTAKE.md — Pipeline Intake & Input Validation

> Jalankan protokol ini SEBELUM eksekusi pipeline apapun.
> Referensi app config: `.claude/apps/[app].md`

---

## Kapan Protokol Aktif vs Dilewati

**Aktif** — user memulai sesi tanpa menyebutkan path atau input secara eksplisit.
Contoh trigger: *"mulai"*, *"generate test cases"*, *"bantu saya testing"*

**Dilewati (skip step 1–2)** — user sudah memberikan path dan semua input wajib dalam satu pesan.
Contoh: `"Mode 1 Path A: Analisis PRD berikut [...]"` → langsung ke step 3.

---

## Step 1 — Path Selection

Tampilkan pilihan berikut:

```
Halo! Sebelum kita mulai, pilih jalur pipeline:

  A — Path A (PRD)            Generate test cases dari PRD document
  B — Path B (Exploratory)    Generate test cases dengan explore web app
  C — Path C (Manual TC)      Otomasi test cases yang sudah dibuat manual

Ketik A, B, atau C:
```

---

## Step 2 — Input Validation per Path

Validasi semua field berikut sebelum lanjut. Jika ada yang kosong → tanyakan satu per satu.

> **Timing penting:** Segera setelah user menyebutkan **App target**, baca `.claude/apps/[app].md`
> menggunakan Read tool. Credential dan quirks dari file tersebut digunakan untuk validasi step ini —
> jangan tunggu sampai Step 3.

### Path A — PRD

| Input | Format | Status |
|---|---|---|
| App target | Nama app — segera load `.claude/apps/[app].md` | Wajib pertama |
| PRD | File di `input/prd/[filename]` atau paste di chat | Wajib |
| Nama fitur | String singkat — `login`, `checkout`, `cart` | Wajib |

> Jika PRD di-paste di chat → simpan ke `input/prd/[feature]_[YYYY-MM-DD].txt` sebelum lanjut.

### Path B — Exploratory

| Input | Format | Status |
|---|---|---|
| App target | Nama app — segera load `.claude/apps/[app].md` | Wajib pertama |
| URL target | URL lengkap halaman yang di-explore | Wajib |
| Nama fitur | String singkat | Wajib |
| Credential | username + password | Wajib jika auth diperlukan — ambil dari `apps/[app].md` jika tersedia |

### Path C — Manual Test Case

| Input | Format | Status |
|---|---|---|
| App target | Nama app — segera load `.claude/apps/[app].md` | Wajib pertama |
| Path file CSV | `input/testcases/[filename].csv` | Wajib — file harus sudah ada |
| URL target | URL halaman yang di-cover test cases tersebut | Wajib — untuk identifikasi locators |

> Jika file CSV belum ada di `input/testcases/` → minta user upload dulu, jangan lanjut.

---

## Step 3 — Confirmation Gate

Setelah semua input terkumpul, tampilkan summary berikut sebelum eksekusi:

```
Ringkasan sebelum memulai:

  Jalur    : [A / B / C]
  App      : [nama app]
  Fitur    : [nama fitur]
  Input    : [ringkasan input yang diterima]
  Mode     : [Mode 1+2+3 / Mode 2B+3 / Mode 3C]
  Output   :
    - output/[folder sesuai path]/[feature]_[YYYY-MM-DD].csv   (jika Path A atau B)
    - output/gherkin/[feature]_[YYYY-MM-DD].feature
    - output/automation/[PageName]Page_[YYYY-MM-DD].ts
    - output/automation/[feature].steps_[YYYY-MM-DD].ts
    - output/feedback/[feature]_prd_[YYYY-MM-DD].txt           (jika PRD tidak lolos threshold)

Lanjut? (ya / tidak / ubah)
```

| Jawaban | Tindakan |
|---|---|
| `ya` | Eksekusi pipeline sesuai `PIPELINE.md` (apps/[app].md sudah dibaca di Step 2) |
| `tidak` | Hentikan, tanyakan apa yang ingin diubah |
| `ubah` | Kembali ke step yang relevan |

---

## Alur Ringkas

```
User memulai sesi
      ↓
Path + input sudah lengkap?
  ├── Ya  → Step 3 (confirmation) → eksekusi
  └── Tidak
        ↓
  Step 1: Pilih path (A / B / C)
        ↓
  Step 2: Validasi input wajib per path
        ↓
  Step 3: Summary + konfirmasi
        ↓
  Eksekusi PIPELINE.md
```
