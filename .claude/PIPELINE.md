# PIPELINE.md — Pipeline Modes & Execution Guide

> Baca file ini sebelum menjalankan mode pipeline apapun.
> Pastikan intake sudah selesai (lihat `INTAKE.md`) dan app config sudah di-load (`apps/[app].md`).

---

## Project Structure

```
research_ai_automation/
├── input/
│   ├── prd/                         ← Path A: PRD documents (.txt / .pdf)
│   └── testcases/                   ← Path C: manual test cases dari Testmo (.csv)
│
├── output/
│   ├── testcases-from-prd/          ← CSV hasil generate Path A (staging)
│   ├── testcases-from-webexploratory/ ← CSV hasil generate Path B (staging)
│   └── feedback/                    ← PRD feedback .txt jika di bawah threshold
│
├── features/
│   └── [app]/                       ← Feature files per aplikasi (langsung generate ke sini)
│       └── [feature].feature
│
├── step-definitions/
│   └── [app]/                       ← Step implementations per aplikasi
│       └── [feature].steps.ts
│
├── pages/                           ← Page Object Model (shared, flat)
│   ├── BasePage.ts
│   └── [PageName]Page.ts
│
├── support/
│   ├── CustomWorld.ts
│   └── hooks.ts
├── utils/
│   └── selfHealingLocator.ts
└── test-data/
```

**Contoh untuk SauceDemo:**
```
features/saucedemo/login.feature
features/saucedemo/cart.feature
step-definitions/saucedemo/login.steps.ts
step-definitions/saucedemo/cart.steps.ts
pages/LoginPage.ts
pages/CartPage.ts
```

---

## Generate Workflow

```
Input (Path A / B / C)
          ↓
  Claude analisis + generate
          ↓
  CSV → output/testcases-*/          (user review CSV sebelum lanjut)
          ↓
  Gherkin → features/[app]/          (langsung production, review via git diff)
  POM     → pages/                   (langsung production, review via git diff)
  Steps   → step-definitions/[app]/  (langsung production, review via git diff)
```

**Aturan:**
- CSV test cases tetap di-staging ke `output/` — user review sebelum generate automation
- Gherkin, POM, dan step definitions di-generate langsung ke folder production per-app
- Naming convention file: `[feature].feature`, `[PageName]Page.ts`, `[feature].steps.ts`
- Review dilakukan via `git diff` sebelum commit

---

## Core Design Pattern

```
Input (Path A / B / C)
    ↓
Claude — analisis + generate
    ↓
output/ (staging)
    ↓ user approve
Gherkin feature file (PIVOT — single source of truth)
    ↙                         ↘
Track Manual               Track Automation
Testmo CSV import          Step defs + POM
Manual tester              Playwright runner
    ↘                         ↙
       Pre-release validation
    Auto regression + exploratory
```

---

## Pipeline Overview (3 Path)

```
Path A (ada PRD)                Path B (explore web)              Path C (upload manual)
input/prd/                      URL / nama fitur                  input/testcases/
      ↓                                ↓                                 ↓
Mode 1 → Mode 2 → Mode 3        Mode 2B → Mode 3                  Mode 3C
Analisis → CSV → Auto            Explore → CSV → Auto              CSV → Auto only
      ↓                                ↓                                 ↓
output/testcases-from-prd/      output/testcases-from-webexploratory/  features/[app]/
output/feedback/ (jika PRD      features/[app]/                   step-definitions/[app]/
di bawah threshold)             step-definitions/[app]/           pages/
                                pages/
```

---

## PRD Scoring Threshold (Path A)

PRD dinyatakan **LAYAK** hanya jika memenuhi semua threshold berikut:

| Framework | Threshold minimum |
|---|---|
| SMART | Min 4 dari 5 criteria terpenuhi per requirement |
| INVEST | Min 4 dari 7 criteria terpenuhi per user story |
| MoSCoW | Semua Must Have ter-cover dengan acceptance criteria jelas |
| RBT | Tidak ada item High likelihood × High impact tanpa mitigasi |
| BVA/EP | Semua input field punya boundary values yang terdefinisi |

Jika **tidak memenuhi threshold** → verdict **PERLU REVISI** → generate file ke `output/feedback/`.

### Format File Feedback

```
PRD REVIEW FEEDBACK
Feature  : [nama fitur]
Tanggal  : [YYYY-MM-DD]
Verdict  : PERLU REVISI

SCORING SUMMARY
---------------
SMART  : [X]/5 — [catatan singkat]
INVEST : [X]/7 — [catatan singkat]
MoSCoW : [status]
RBT    : [status]
BVA/EP : [status]

ITEM YANG HARUS DIPERJELAS
--------------------------
1. [item spesifik]
2. [item spesifik]

Silakan revisi PRD dan jalankan ulang Mode 1.
```

---

## Path A — Mode 1: PRD Analysis

**Trigger:** `"Mode 1 Path A: Analisis PRD berikut"` atau `"Mode 1 Path A: Analisis PRD di input/prd/[filename]"`

**Langkah:**
1. Baca PRD dari file atau chat
2. Score per framework (SMART, INVEST, MoSCoW, RBT, BVA/EP)
3. Verdict: **LAYAK** → lanjut Mode 2 | **PERLU REVISI** → generate `output/feedback/[feature]_prd_[YYYY-MM-DD].txt`

---

## Path A — Mode 2: Generate Test Cases dari PRD

**Trigger:** `"Mode 2 Path A: Generate test cases dari PRD yang sudah LAYAK"`

**Output:** `output/testcases-from-prd/[feature]_[YYYY-MM-DD].csv`

**5 teknik wajib:**
1. **EP** — bagi setiap input/state menjadi kelas valid dan invalid
2. **BVA** — test di nilai batas setiap kelas EP (min, min+1, max-1, max)
3. **ST** — identifikasi semua state UI dan test setiap transisinya
4. **DT** — untuk kombinasi kondisi, buat tabel dan jadikan test case
5. **EG** — double-click, navigasi paksa via URL, empty state, reload saat proses berjalan

---

## Path B — Mode 2B: Explore Web + Generate Test Cases

**Trigger:** `"Mode 2+3 Path B: Explore [nama fitur] di [URL] lalu generate semua artefak"`

**Langkah berurutan:**
1. Baca file existing — `pages/`, `step-definitions/[app]/`, `features/[app]/`
2. Explore web app — navigasi ke halaman target, identifikasi elemen dan flow
3. Inspeksi DOM — temukan `data-test`, `id`, `role` per elemen
4. Desain test cases menggunakan 5 teknik (EP, BVA, ST, DT, EG)
5. Generate CSV → `output/testcases-from-webexploratory/[feature]_[YYYY-MM-DD].csv`
6. Generate Gherkin → `features/[app]/[feature].feature`
7. Generate POM → `pages/[PageName]Page.ts`
8. Generate step definitions → `step-definitions/[app]/[feature].steps.ts`

---

## Path C — Mode 3C: Generate Automation dari Manual Test Cases

**Trigger:** `"Mode 3C Path C: Generate automation dari input/testcases/[filename].csv"`

**Langkah berurutan:**
1. Baca file `input/testcases/[filename].csv`
2. Baca file existing — `pages/`, `step-definitions/[app]/`, `features/[app]/`
3. Mapping test cases → Gherkin Scenario Outline
4. Explore web untuk identifikasi locators
5. Generate Gherkin → `features/[app]/[feature].feature`
6. Generate POM → `pages/[PageName]Page.ts`
7. Generate step definitions → `step-definitions/[app]/[feature].steps.ts`

**Aturan:**
- Tidak generate CSV baru — test cases sudah ada di input
- Gherkin harus mencerminkan test cases asli — tidak menambah atau mengurangi coverage
- Jika ada langkah CSV yang ambigu → tanyakan ke user sebelum generate

---

## Mode 3: Generate Automation Script (Path A & B)

**Trigger:** Selalu dipasangkan dengan Mode 2 atau 2B — tidak dijalankan sendiri.

**Output (urutan):**
1. `features/[app]/[feature].feature`
2. `pages/[PageName]Page.ts`
3. `step-definitions/[app]/[feature].steps.ts`

**Aturan:**
- Cek `features/[app]/` dan `step-definitions/[app]/` — jangan duplikat step yang sudah defined
- Ikuti `BasePage.ts` untuk self-healing pattern
- Gunakan `CustomWorld` dari `support/CustomWorld.ts` — tambah properti Page baru jika ada class baru
- Test harus bisa jalan standalone
- Tag `@smoke` untuk happy path, `@regression` untuk full suite

---

## Format Output CSV

```csv
Folder,Name,Preconditions,Step,Test Data,Expected Result,Priority,Type,Automatable
```

**Aturan:**
- Satu test case = multiple rows (multi-step format Testmo)
- Nama test case mencerminkan teknik: `"EP - valid username"`, `"BVA - max cart items"`
- Selalu cover: EP valid, EP invalid, BVA min, BVA max, state transition, error guessing
- `Automatable: Yes` untuk semua yang bisa dijadikan automation
- Folder mengikuti nama modul atau halaman aplikasi
- Priority: `High` critical path, `Medium` secondary flow, `Low` edge cases

---

## Contoh Instruksi Lengkap

### Path A
```
Mode 1 Path A: Analisis PRD di input/prd/login_prd.txt
Jika LAYAK, lanjutkan Mode 2 + Mode 3 untuk fitur "login"
```

### Path B
```
Mode 2+3 Path B: Explore halaman cart di https://[url]/cart
Fitur: "shopping-cart"
Generate CSV + Gherkin + POM + steps
```

### Path C
```
Mode 3C Path C: Generate automation dari input/testcases/checkout_manual.csv
Target URL: https://[url]/checkout
Fitur: "checkout"
```
