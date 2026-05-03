# Framework Setup & Usage Guide

> Panduan lengkap untuk tim: setup pertama kali, generate automation baru, tambah aplikasi, dan jalankan test.

---

## Daftar Isi

1. [Apa yang dilakukan repo ini](#1-apa-yang-dilakukan-repo-ini)
2. [Prerequisites](#2-prerequisites)
3. [Setup Pertama Kali](#3-setup-pertama-kali)
4. [Menjalankan Test yang Sudah Ada](#4-menjalankan-test-yang-sudah-ada)
5. [Generate Automation Baru dengan Claude](#5-generate-automation-baru-dengan-claude)
   - [Path A — Kamu punya PRD](#path-a--kamu-punya-prd)
   - [Path B — Tidak ada PRD, langsung eksplorasi web](#path-b--tidak-ada-prd-langsung-eksplorasi-web)
   - [Path C — Kamu punya test case manual (CSV)](#path-c--kamu-punya-test-case-manual-csv)
6. [Setelah Generate: Review & Commit](#6-setelah-generate-review--commit)
7. [Menambahkan Aplikasi Baru](#7-menambahkan-aplikasi-baru)
8. [Konvensi Kode (Cheatsheet)](#8-konvensi-kode-cheatsheet)
9. [Struktur Folder](#9-struktur-folder)
10. [CI/CD Pipeline](#10-cicd-pipeline)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. Apa yang dilakukan repo ini

Repo ini adalah **AI-driven QA automation pipeline**. Claude bertindak sebagai agent yang:

- Menganalisis PRD atau meng-explore web app untuk merancang test case
- Menghasilkan test case dalam format CSV (siap import ke Testmo)
- Menghasilkan otomasi: Gherkin feature files, Page Object Model (POM), dan step definitions

Stack teknis:

| Layer | Tool |
|-------|------|
| Language | TypeScript |
| Browser automation | Playwright (library mode) |
| Test runner | Cucumber.js BDD |
| Locator strategy | Self-healing (`SelfHealingLocatorResolver`) |
| Test management | Testmo (import via CSV) |
| Reports | HTML + JSON + Allure |

---

## 2. Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js | >= 20 (cek dengan `node -v`) |
| npm | >= 10 |
| Claude Code CLI | Terbaru (`npm install -g @anthropic-ai/claude-code`) |

---

## 3. Setup Pertama Kali

```bash
# 1. Clone repo
git clone <repo-url>
cd research_ai_automation

# 2. Install dependencies
npm install

# 3. Install Playwright browsers
npx playwright install chromium
```

Buat file `.env` di root project:

```env
# URL aplikasi yang akan ditest
BASE_URL=https://www.saucedemo.com/
ORANGEHRM_BASE_URL=https://opensource-demo.orangehrmlive.com
TODOMVC_BASE_URL=https://todomvc.com/examples/react/dist

# Kredensial (jangan commit file ini)
SAUCEDEMO_PASSWORD=secret_sauce

# Opsi browser
HEADLESS=false          # true = tanpa tampilan browser
BROWSER=chromium        # chromium | firefox | webkit
```

Verifikasi setup:

```bash
npm run typecheck       # harus clean, tidak ada error
npm run lint            # harus 0 errors
npm run test:sanity     # jalankan 1 test cepat
```

---

## 4. Menjalankan Test yang Sudah Ada

```bash
npm run test:smoke      # smoke test semua aplikasi (happy path, cepat)
npm run test:regression # full regression suite
npm run test:sanity     # 1 test paling dasar (untuk verifikasi setup)
npm run test:unit       # unit test framework internal

# Per fitur
npm run test:login      # login SauceDemo
npm run test:cart       # cart SauceDemo
npm run test:checkout   # checkout SauceDemo

# Cek kualitas kode
npm run typecheck       # TypeScript check
npm run lint            # ESLint check
npm run format:check    # Prettier check
npm run format          # Auto-format semua file
```

Reports tersimpan di `reports/` — file HTML langsung bisa dibuka di browser.

---

## 5. Generate Automation Baru dengan Claude

Ada **3 path** tergantung apa yang kamu punya. Pilih satu:

```
Punya PRD?                    → Path A
Tidak ada PRD, ada URL?       → Path B
Punya test case manual (CSV)? → Path C
```

Semua path menghasilkan output yang sama: **CSV test case + Gherkin + POM + Step Definitions**.

---

### Path A — Kamu punya PRD

**Kapan dipakai:** Ada dokumen PRD / spesifikasi fitur.

**Langkah-langkah:**

**1. Simpan PRD ke folder `input/prd/`**

```
input/prd/[nama-fitur]_[tanggal].txt
```

Contoh: `input/prd/checkout_2026-05-03.txt`

**2. Buka Claude Code, kirim prompt ini:**

```
Mode 1 Path A: Analyze PRD at input/prd/checkout_2026-05-03.txt
App: saucedemo | Feature: checkout
```

Claude akan menganalisis PRD menggunakan 5 framework (SMART, INVEST, MoSCoW, RBT, BVA/EP) dan memberikan verdict:

- **APPROVED** → lanjut ke langkah 3
- **NEEDS REVISION** → baca file di `output/feedback/`, revisi PRD, ulangi langkah 2

**3. Generate test cases + automation:**

```
Mode 2 Path A: Generate test cases + Mode 3: Generate all automation artifacts
App: saucedemo | Feature: checkout
```

**Output yang dihasilkan:**

```
output/testcases-from-prd/checkout_2026-05-03.csv   ← review dulu, lalu import ke Testmo
features/saucedemo/checkout.feature                  ← langsung ke production
pages/saucedemo/CheckoutPage.ts                      ← langsung ke production
step-definitions/saucedemo/checkout.steps.ts         ← langsung ke production
```

---

### Path B — Tidak ada PRD, langsung eksplorasi web

**Kapan dipakai:** Tidak ada PRD, tapi kamu tahu URL halaman yang mau ditest.

**Prompt ke Claude:**

```
Mode 2+3 Path B: Explore the cart page at https://www.saucedemo.com/cart.html
App: saucedemo | Feature: cart
```

Claude akan:
1. Membuka URL tersebut
2. Meng-inspect DOM (mencari `data-test`, `id`, `role`)
3. Merancang test case menggunakan 5 teknik (EP, BVA, ST, DT, EG)
4. Menghasilkan semua artefak otomasi

**Output yang dihasilkan:**

```
output/testcases-from-webexploratory/cart_2026-05-03.csv
features/saucedemo/cart.feature
pages/saucedemo/CartPage.ts
step-definitions/saucedemo/cart.steps.ts
```

---

### Path C — Kamu punya test case manual (CSV)

**Kapan dipakai:** Tim QA sudah punya test case manual (dari Testmo atau file CSV lain) dan ingin di-otomasi.

**1. Simpan CSV ke `input/testcases/`**

Format kolom CSV yang diharapkan:

```
Folder,Name,Preconditions,Step,Test Data,Expected Result,Priority,Type,Automatable
```

Contoh: `input/testcases/checkout_manual.csv`

**2. Kirim prompt:**

```
Mode 3C Path C: Generate automation from input/testcases/checkout_manual.csv
App: saucedemo | URL: https://www.saucedemo.com/checkout-step-one.html
```

**Output yang dihasilkan:**

```
features/saucedemo/checkout.feature
pages/saucedemo/CheckoutPage.ts
step-definitions/saucedemo/checkout.steps.ts
```

> Path C tidak menghasilkan CSV baru — karena test case manual sudah ada di `input/`.

---

## 6. Setelah Generate: Review & Commit

Setelah Claude selesai generate, ikuti langkah ini sebelum commit:

**1. Review CSV test case** (Path A dan B)

Buka file di `output/testcases-*/` — pastikan coverage sesuai ekspektasi sebelum import ke Testmo.

**2. Review kode yang dihasilkan**

```bash
git diff
```

Periksa:
- Feature file: skenario sudah cover happy path (`@smoke`) dan edge case (`@regression`)?
- POM: locator candidates pakai `data-test` sebagai prioritas pertama?
- Step definitions: menggunakan `this.getPage(PageClass)` (bukan `new PageClass(...)`)?

**3. Jalankan test yang baru di-generate**

```bash
# Ganti [feature] dengan nama fitur, misalnya: checkout, cart, login
npm run test:[feature]

# Atau jalankan langsung dengan tag
npx cucumber-js --tags "@[feature]" --format progress
```

**4. Typecheck dan lint**

```bash
npm run typecheck
npm run lint
```

**5. Commit jika semua hijau**

```bash
git add features/saucedemo/checkout.feature \
        pages/saucedemo/CheckoutPage.ts \
        step-definitions/saucedemo/checkout.steps.ts
git commit -m "Add checkout automation (Path A)"
```

> **Catatan:** File di `output/` tidak perlu di-commit — itu staging area untuk review saja.

---

## 7. Menambahkan Aplikasi Baru

Jika ingin generate automation untuk aplikasi selain yang sudah ada (SauceDemo, OrangeHRM, TodoMVC):

**1. Copy template config:**

```bash
cp .claude/apps/_TEMPLATE.md .claude/apps/[nama-app].md
```

**2. Isi semua field di file tersebut:**

```markdown
App Name    : nama-app
Display Name: Nama Tampilan
Base URL    : https://app.example.com

Auth Required : yes / no
Login URL     : https://app.example.com/login
Test Accounts :
  | Role    | Username | Password | Notes |
  | admin   | admin    | pass123  | Full access |

Pages / Modules:
  | Page name | URL path | Notes |
  | Login     | /login   | Form login |

Known Quirks:
  - Deskripsi bug atau keterbatasan yang perlu diketahui
```

**3. Tambahkan env var di `config/env.ts`:**

```typescript
export const env = {
  // ... existing ...
  namaAppBaseUrl: process.env.NAMAAPP_BASE_URL ?? "https://app.example.com",
};
```

**4. Tambahkan ke `.env`:**

```env
NAMAAPP_BASE_URL=https://app.example.com
```

**5. Sekarang bisa generate:**

```
Mode 2+3 Path B: Explore the login page at https://app.example.com/login
App: nama-app | Feature: login
```

---

## 8. Konvensi Kode (Cheatsheet)

> Bagian ini untuk developer yang ingin menulis atau mengedit kode secara manual — bukan via Claude.

### Page Object Model

```typescript
// File: pages/[app]/[PageName]Page.ts
import type { Page } from "playwright";
import { BasePage } from "../BasePage";
import type { LocatorCandidate, LocatorUsage } from "../../utils/selfHealingLocator";

// Kandidat locator HARUS di module level (bukan di dalam class)
const LOGIN_BUTTON_CANDIDATES: LocatorCandidate[] = [
  { name: "primary-testid", kind: "testId", value: "login-button" },
  { name: "secondary-role", kind: "role",   role: "button", options: { name: /sign in/i } },
  { name: "fallback-css",   kind: "css",    value: ".login-btn" },
];

export class LoginPage extends BasePage {
  constructor(page: Page, scenarioLogs: string[], locatorUsages: LocatorUsage[]) {
    super(page, scenarioLogs, locatorUsages);
  }

  override async goto(baseUrl: string): Promise<void> {
    await this.page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  }

  async clickLogin(): Promise<void> {
    const btn = await this.resolver.resolve("loginButton", LOGIN_BUTTON_CANDIDATES);
    await btn.click();
  }

  async getErrorMessage(): Promise<string> {
    const el = await this.resolver.resolve("errorMessage", ERROR_CANDIDATES);
    return (await el.textContent())?.trim() ?? "";
  }
}
```

**Aturan wajib:**
- File selalu di `pages/[app]/`, **bukan** di `pages/` root (kecuali `BasePage.ts`)
- Locator candidates: `const` di module level — **bukan** di dalam class atau method
- Prioritas locator: `testId` → `id` → `role` → `label` → `css` → `xpath` (xpath hanya last resort)
- Jangan buat `SelfHealingLocatorResolver` baru — pakai `this.resolver` yang sudah ada dari BasePage
- Jangan expose selector string ke step definitions — semua akses elemen harus lewat method POM

### Step Definitions

```typescript
// File: step-definitions/[app]/[feature].steps.ts
import { Given, When, Then } from "@cucumber/cucumber";
import assert from "node:assert";
import { env } from "../../config/env";
import { LoginPage } from "../../pages/saucedemo/LoginPage";
import { CustomWorld } from "../../support/CustomWorld";

Given("I open the login page", async function (this: CustomWorld) {
  // Pakai getPage() — JANGAN new LoginPage(...)
  await this.getPage(LoginPage).goto(env.baseUrl);
});

When("I login with {string} and {string}", async function (
  this: CustomWorld,
  username: string,
  password: string
) {
  await this.getPage(LoginPage).login(username, password);
});

Then("I should be on the inventory page", async function (this: CustomWorld) {
  const isSuccess = await this.getPage(LoginPage).isLoginSuccessful();
  assert.ok(isSuccess, "Expected to be on inventory page after login");
});
```

**Aturan wajib:**
- Selalu `this: CustomWorld` untuk type safety
- Pakai `this.getPage(PageClass)` — factory otomatis handle lazy-init dan cache per scenario
- **Tidak perlu** tambah property di `CustomWorld.ts` ketika buat Page class baru
- Pakai `assert` dari `node:assert` — **bukan** Playwright's `expect()`
- Cek dulu step yang sudah ada — jangan buat duplikat

### Tags Gherkin

| Tag | Kapan dipakai |
|-----|---------------|
| `@smoke` | Happy path — wajib untuk semua fitur |
| `@regression` | Full suite termasuk edge case dan negative test |
| `@sanity` | Test paling basic, hanya untuk verifikasi setup |
| `@slow` | Scenario yang butuh timeout lebih lama (misal: `performance_glitch_user`) |
| `@no-retry` | Jangan di-retry jika gagal (misal: test yang bersifat destructive) |
| `@visual` | Scenario dengan visual regression screenshot compare |
| `@a11y` | Scenario dengan accessibility (WCAG 2.1 AA) check |
| `@data-teardown` | Scenario yang perlu cleanup data — daftarkan via `world.registerDataTeardown(fn)` |

### Penamaan File

| Artefak | Konvensi | Contoh |
|---------|----------|--------|
| Feature file | `features/[app]/[feature].feature` | `features/saucedemo/cart.feature` |
| Page class | `pages/[app]/[PageName]Page.ts` | `pages/saucedemo/CartPage.ts` |
| Step file | `step-definitions/[app]/[feature].steps.ts` | `step-definitions/saucedemo/cart.steps.ts` |
| Locator array | `SCREAMING_SNAKE_CASE` | `ADD_TO_CART_CANDIDATES` |
| Method | `camelCase`, verb-first | `addToCart()`, `getTotal()`, `isVisible()` |

---

## 9. Struktur Folder

```
research_ai_automation/
│
├── input/
│   ├── prd/                    ← Path A: simpan PRD di sini (.txt / .pdf)
│   └── testcases/              ← Path C: simpan CSV manual di sini
│
├── output/                     ← STAGING — review dulu sebelum commit
│   ├── testcases-from-prd/
│   ├── testcases-from-webexploratory/
│   └── feedback/               ← Feedback PRD jika tidak lolos threshold
│
├── features/                   ← PRODUCTION
│   ├── saucedemo/
│   ├── orangehrm/
│   └── todomvc/
│
├── pages/                      ← PRODUCTION
│   ├── BasePage.ts             ← Base class — jangan diubah sembarangan
│   ├── saucedemo/
│   │   ├── LoginPage.ts
│   │   ├── CartPage.ts
│   │   └── ...
│   ├── orangehrm/
│   └── todomvc/
│
├── step-definitions/           ← PRODUCTION
│   ├── common/                 ← Steps lintas app (auth, dll)
│   ├── saucedemo/
│   ├── orangehrm/
│   └── todomvc/
│
├── support/
│   ├── CustomWorld.ts          ← Context per scenario + getPage() factory
│   ├── hooks.ts                ← Before/After lifecycle
│   ├── visual.ts               ← Visual regression helper
│   ├── accessibility.ts        ← A11y check
│   └── sessionCache.ts         ← Session/login cache
│
├── utils/
│   ├── selfHealingLocator.ts   ← Resolver + fallback + history tracker
│   ├── dataGenerator.ts        ← Random test data (email, name, zip, phone, dll)
│   └── logger.ts
│
├── config/
│   └── env.ts                  ← Typed env loader — SELALU pakai ini, bukan process.env
│
├── test-data/
│   └── saucedemo-users.ts      ← Credential test per app
│
├── tests/unit/                 ← Unit test framework internal
│
├── .claude/                    ← Instruksi untuk Claude agent
│   ├── MANIFEST.md
│   ├── IDENTITY.md
│   ├── INTAKE.md
│   ├── CONVENTIONS.md
│   ├── PIPELINE.md
│   └── apps/
│       ├── _TEMPLATE.md
│       ├── saucedemo.md
│       ├── orangehrm.md
│       └── todomvc.md
│
├── .github/
│   ├── workflows/test.yml      ← CI pipeline (5 jobs)
│   └── CODEOWNERS              ← Review enforcement per area
│
└── reports/                    ← Output test (tidak di-commit)
```

---

## 10. CI/CD Pipeline

Pipeline berjalan otomatis di GitHub Actions setiap push ke `main` atau `develop`:

```
┌─────────────────────────────────────────┐
│  lint                                   │
│  ESLint + Prettier + TypeScript check   │
└───────────────────┬─────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  smoke (Chromium)                       │
│  Semua scenario @smoke                  │
└──────┬──────────────┬────────┬──────────┘
       ↓              ↓        ↓        ↓
  regression     docker    firefox   webkit
  @regression    sanity    @smoke    @smoke
```

**Setup CI di GitHub:**

1. Tambahkan Repository Secret:
   - `SAUCEDEMO_PASSWORD` = nilai password

2. Tambahkan Repository Variables (per environment `production` / `staging`):
   - `BASE_URL`
   - `ORANGEHRM_BASE_URL`
   - `TODOMVC_BASE_URL`

---

## 11. Troubleshooting

### Test gagal: `locator.click: Element not found`

Locator candidate tidak cocok dengan DOM. Langkah debug:
1. Buka browser manual ke URL yang sama
2. DevTools → inspect element → cari `data-test`, `id`, atau `role`
3. Update `LocatorCandidate[]` di POM yang bersangkutan

Lihat `reports/locator-history.json` — jika `candidateName` sering bukan `primary-*`, itu sinyal locator utama sudah stale.

### TypeScript error setelah generate

```bash
npm run typecheck
```

Yang sering terjadi:
- Import path salah → periksa path ke `pages/[app]/PageName`
- Method tidak ada di POM → sesuaikan nama method antara step definitions dan POM

### Test flaky (kadang pass, kadang fail)

- Jangan pakai `waitForTimeout()` — gunakan Playwright auto-wait
- Scenario yang lambat: tambahkan tag `@slow` (timeout naik ke 90 detik)
- Visual test terlalu ketat: turunkan `allowedDiffPercent` saat memanggil `compareScreenshot()`

### Kredensial tidak dikenali di CI

Pastikan `SAUCEDEMO_PASSWORD` sudah diset sebagai Repository Secret. Pipeline akan hard-fail jika secret ini tidak ada ketika `CI=true`.

### Format error saat `npm run format:check`

```bash
npm run format     # auto-fix semua file
git diff           # review perubahan
git add -A && git commit -m "style: apply prettier formatting"
```

---

## Quick Reference — Prompt ke Claude

| Situasi | Prompt yang dikirim ke Claude |
|---------|-------------------------------|
| Analisis PRD | `Mode 1 Path A: Analyze PRD at input/prd/[file].txt` |
| Generate dari PRD yang APPROVED | `Mode 2 Path A: Generate test cases + Mode 3: Generate all automation artifacts` |
| Eksplorasi halaman + generate semua | `Mode 2+3 Path B: Explore the [page] at [URL]` |
| Otomasi dari CSV manual | `Mode 3C Path C: Generate automation from input/testcases/[file].csv` |
| Cek coverage yang sudah ada | Tanyakan langsung: `What features are already automated for saucedemo?` |
