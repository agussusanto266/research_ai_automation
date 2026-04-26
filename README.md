# research_ai_automation

AI-driven QA automation pipeline — generate test cases dan automation scripts menggunakan Claude sebagai agent.

**Stack:** TypeScript · Playwright · Cucumber.js · Page Object Model · Self-healing locators · Testmo

---

## Quick Start

```bash
npm install
```

Buat file `.env` di root project:
```env
BASE_URL=https://www.saucedemo.com/
HEADLESS=true
```

---

## Menjalankan Test yang Sudah Ada

```bash
npm test              # semua test
npm run test:smoke    # smoke test saja (happy path)
npm run test:login    # login suite saja
npm run typecheck     # TypeScript check tanpa run test
```

---

## Generate Test Baru dengan Claude

Ada 3 jalur untuk generate automation test. Pilih berdasarkan kondisi kamu.

```
Path A → Kamu punya PRD           → Analisis PRD → CSV → Gherkin + POM + Steps
Path B → Tidak ada PRD            → Claude explore web → CSV → Gherkin + POM + Steps
Path C → Kamu punya test case CSV → Claude generate otomasi dari CSV kamu
```

> **Penting:** Semua output Claude masuk ke `output/` dulu — bukan langsung ke production.
> Kamu review dulu, baru promote ke `features/`, `pages/`, `step-definitions/`.

---

### Path A — Dari PRD

**1. Simpan PRD ke `input/prd/`**
```
input/prd/[feature]_[tanggal].txt
```

**2. Kirim ke Claude:**
```
Mode 1 Path A: Analisis PRD di input/prd/[feature]_[tanggal].txt
App: [nama-app] | Fitur: [nama-fitur]
```

**3. Claude memberi verdict:**
- **LAYAK** → lanjut ke langkah 4
- **PERLU REVISI** → baca `output/feedback/[feature]_prd_[tanggal].txt`, revisi PRD, ulangi dari langkah 2

**4. Generate test cases + automation:**
```
Mode 2 Path A: Generate test cases + Mode 3: Generate semua artefak automation
```

**Output:**
```
output/testcases-from-prd/[feature]_[tanggal].csv    ← import ke Testmo
output/gherkin/[feature]_[tanggal].feature
output/automation/[Page]Page_[tanggal].ts
output/automation/[feature].steps_[tanggal].ts
```

<details>
<summary>Contoh — SauceDemo checkout</summary>

```
# Langkah 2
Mode 1 Path A: Analisis PRD di input/prd/checkout_2026-04-26.txt
App: saucedemo | Fitur: checkout

# Langkah 4 (jika LAYAK)
Mode 2 Path A: Generate test cases + Mode 3: Generate semua artefak automation
```

Output yang dihasilkan:
```
output/testcases-from-prd/checkout_2026-04-26.csv
output/gherkin/checkout_2026-04-26.feature
output/automation/CheckoutPage_2026-04-26.ts
output/automation/checkout.steps_2026-04-26.ts
```
</details>

---

### Path B — Explore Web (tanpa PRD)

**Kirim ke Claude:**
```
Mode 2+3 Path B: Explore halaman [nama-halaman] di [url-halaman]
App: [nama-app] | Fitur: [nama-fitur]
```

**Output:**
```
output/testcases-from-webexploratory/[feature]_[tanggal].csv
output/gherkin/[feature]_[tanggal].feature
output/automation/[Page]Page_[tanggal].ts
output/automation/[feature].steps_[tanggal].ts
```

<details>
<summary>Contoh — SauceDemo cart</summary>

```
Mode 2+3 Path B: Explore halaman cart di https://www.saucedemo.com/cart.html
App: saucedemo | Fitur: cart
```

Output yang dihasilkan:
```
output/testcases-from-webexploratory/cart_2026-04-26.csv
output/gherkin/cart_2026-04-26.feature
output/automation/CartPage_2026-04-26.ts
output/automation/cart.steps_2026-04-26.ts
```
</details>

---

### Path C — Dari Test Cases Manual

**1. Simpan CSV export dari Testmo ke `input/testcases/`**
```
input/testcases/[feature]_manual.csv
```

**2. Kirim ke Claude:**
```
Mode 3C Path C: Generate automation dari input/testcases/[feature]_manual.csv
App: [nama-app] | URL: [url-halaman]
```

**Output:**
```
output/gherkin/[feature]_[tanggal].feature
output/automation/[Page]Page_[tanggal].ts
output/automation/[feature].steps_[tanggal].ts
```

<details>
<summary>Contoh — SauceDemo checkout manual</summary>

```
Mode 3C Path C: Generate automation dari input/testcases/checkout_manual.csv
App: saucedemo | URL: https://www.saucedemo.com/checkout-step-one.html
```

Output yang dihasilkan:
```
output/gherkin/checkout_2026-04-26.feature
output/automation/CheckoutPage_2026-04-26.ts
output/automation/checkout.steps_2026-04-26.ts
```
</details>

---

## Review & Promote ke Production

Setelah output selesai direview, promote ke production folders:

```
output/gherkin/[feature].feature      → features/[feature].feature
output/automation/[Page]Page.ts       → pages/[Page]Page.ts
output/automation/[feature].steps.ts  → step-definitions/[feature].steps.ts
```

Setelah promote, **update `support/CustomWorld.ts`** — tambahkan properti untuk Page class baru:

```typescript
// support/CustomWorld.ts
import type { CartPage } from "../pages/CartPage";

export class CustomWorld extends World {
  // ... existing properties ...
  cartPage?: CartPage;  // ← tambahkan ini
}
```

Lalu jalankan typecheck untuk memastikan tidak ada error:
```bash
npm run typecheck
```

---

## Menambah App Baru

**1. Salin template config:**
```
.claude/apps/_TEMPLATE.md  →  .claude/apps/[app-name].md
```

**2. Isi semua field di file baru** (URL, auth, test accounts, known quirks).

**3. Sebut nama app saat prompting ke Claude:**
```
Mode 2+3 Path B: Explore ... App: [app-name]
```

---

## Struktur Folder

```
input/
├── prd/                             ← Path A: dokumen PRD
└── testcases/                       ← Path C: CSV manual dari Testmo

output/                              ← staging — review sebelum promote
├── testcases-from-prd/              ← CSV dari Path A
├── testcases-from-webexploratory/   ← CSV dari Path B
├── gherkin/                         ← .feature files
├── automation/                      ← POM + step definitions
└── feedback/                        ← feedback PRD jika tidak lolos threshold

features/                            ← PRODUCTION: Gherkin (single source of truth)
pages/                               ← PRODUCTION: Page Object Model
step-definitions/                    ← PRODUCTION: step implementations
support/                             ← CustomWorld, hooks
utils/                               ← selfHealingLocator, logger, dataGenerator
config/                              ← env loader
.claude/                             ← instruksi untuk Claude agent
```

---

## Laporan & Diagnostics

Setelah test berjalan, hasil tersimpan di `reports/`:

| File | Isi |
|---|---|
| `reports/login-report.html` | HTML report per suite |
| `reports/login-report.json` | JSON report per suite |
| `reports/failed-*.png` | Screenshot saat step gagal |
| `reports/diagnostics-*.log` | Locator trace + browser console log |
| `reports/locator-history.json` | History fallback locator — sinyal jika primary locator perlu diperbaiki |

---

## Referensi untuk Tim

| File | Isi |
|---|---|
| `.claude/CONVENTIONS.md` | Coding standards, POM pattern, locator strategy |
| `.claude/PIPELINE.md` | Detail teknis setiap mode pipeline |
| `.claude/apps/saucedemo.md` | Config SauceDemo — **sample app**, bukan default framework |
| `.claude/apps/_TEMPLATE.md` | Template untuk mendaftarkan app baru |
