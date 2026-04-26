# CONVENTIONS.md — Coding Standards & Conventions

> Baca file ini sebelum generate kode apapun (Gherkin, POM, step definitions).
> Konvensi ini berlaku untuk semua aplikasi — bukan spesifik satu app.

---

## Tech Stack

| Layer | Tool |
|---|---|
| Language | TypeScript |
| Test runner | Cucumber.js (`npm test` / `npm run test:smoke`) |
| Browser automation | Playwright (library — bukan Playwright Test) |
| Test pattern | Page Object Model (POM) |
| Locator strategy | Self-healing via `SelfHealingLocatorResolver` |
| Test management | Testmo (import via CSV) |
| Config | dotenv → `config/env.ts` |
| Report | HTML + JSON (`reports/`) |

---

## Page Object Model

Template yang benar — sesuai actual codebase:

```typescript
// pages/[PageName]Page.ts
import type { Page } from "playwright";
import { BasePage } from "./BasePage";
import type { LocatorCandidate } from "../utils/selfHealingLocator";

// Definisikan candidates di luar class (module-level const)
const ELEMENT_CANDIDATES: LocatorCandidate[] = [
  { name: "primary-testid", kind: "testId",  value: "data-test-value" },
  { name: "secondary-role", kind: "role",    role: "button", options: { name: "Label" } },
  { name: "fallback-css",   kind: "css",     value: "css-selector" }
];

export class [PageName]Page extends BasePage {
  constructor(page: Page, scenarioLogs: string[]) {
    super(page, scenarioLogs);  // resolver tersedia via this.resolver (dari BasePage)
  }

  async [action](): Promise<void> {
    const element = await this.resolver.resolve("elementName", ELEMENT_CANDIDATES);
    await element.click();
  }

  async [getValue](): Promise<string> {
    const element = await this.resolver.resolve("elementName", ELEMENT_CANDIDATES);
    return (await element.textContent())?.trim() ?? "";
  }
}
```

**Aturan POM:**
- Candidates array didefinisikan sebagai `const` di module level — bukan di dalam class atau method
- Nama candidates: `"primary-testid"`, `"secondary-[kind]"`, `"fallback-[kind]"` — konsisten
- Constructor selalu menerima `(page: Page, scenarioLogs: string[])` dan memanggil `super(page, scenarioLogs)`
- `this.resolver` tersedia dari BasePage — jangan buat resolver baru di dalam Page class
- Nama file: `PascalCasePage.ts`
- Method names: camelCase, verb-first — `login()`, `getErrorMessage()`, `isVisible()`
- Jangan expose raw selector ke step definitions

---

## CustomWorld — Cara Update

Setiap kali menambahkan Page class baru, **wajib** tambahkan properti ke `support/CustomWorld.ts`:

```typescript
// support/CustomWorld.ts
import type { CartPage } from "../pages/CartPage";     // ← tambah import
import type { CheckoutPage } from "../pages/CheckoutPage"; // ← tambah import

export class CustomWorld extends World {
  // ... existing properties ...
  cartPage?: CartPage;         // ← tambah properti
  checkoutPage?: CheckoutPage; // ← tambah properti
}
```

Tanpa ini, TypeScript akan error saat step definition mengakses `this.cartPage`.

---

## Environment Variables — Cara Import

Selalu gunakan typed loader dari `config/env.ts` — jangan akses `process.env` langsung:

```typescript
import { env } from "../config/env";

// Penggunaan:
await this.page.goto(env.baseUrl);
```

Tambahkan ke `config/env.ts` jika butuh env var baru:
```typescript
export const env = {
  baseUrl: process.env.BASE_URL ?? "https://fallback.url/",
  headless: process.env.HEADLESS === "true"
  // tambah di sini
};
```

---

## Utils yang Tersedia

### `utils/logger.ts`
Gunakan untuk log non-diagnostic di luar skenario test:

```typescript
import { logger } from "../utils/logger";

logger.info("Navigating to checkout");
logger.error("Unexpected state detected");
```

Untuk log yang muncul di diagnostics saat test gagal, gunakan `this.scenarioLogs.push(...)` bukan logger.

### `utils/dataGenerator.ts`
Gunakan untuk generate test data dinamis (bukan hardcoded):

```typescript
import { randomEmail } from "../utils/dataGenerator";

const email = randomEmail("buyer");  // → buyer+1234567890@example.test
```

---

## Gherkin / Feature Files

```gherkin
Feature: [Nama fitur — match dengan PRD section atau nama halaman]

  Background:
    Given I am on the [page name] page
    And I am logged in as "[role]"        # hanya jika fitur butuh auth

  @smoke
  Scenario Outline: [Happy path — outcome yang divalidasi]
    When I [action] with "<param>"
    Then [expected outcome] should be "<outcome>"

    Examples:
      | param | outcome |
      | ...   | ...     |

  @regression
  Scenario: [Negative / edge case]
    ...
```

**Aturan:**
- Gunakan Bahasa Inggris untuk semua Gherkin
- Nama file: `kebab-case.feature`
- Satu feature file per fitur/modul
- Tag `@smoke` untuk happy path, `@regression` untuk full suite
- Gunakan `Scenario Outline` + `Examples` untuk data-driven tests
- Jangan hardcode credential di Gherkin — gunakan parameter dari `Examples` atau `test-data/`

---

## Step Definitions

```typescript
// step-definitions/[feature].steps.ts
import { Given, When, Then } from "@cucumber/cucumber";
import assert from "node:assert";
import { env } from "../config/env";
import { [PageName]Page } from "../pages/[PageName]Page";
import { CustomWorld } from "../support/CustomWorld";

Given("I am on the [page name] page", async function (this: CustomWorld) {
  this.[pageName]Page = new [PageName]Page(this.page, this.scenarioLogs);
  await this.[pageName]Page.goto(env.baseUrl);
});

When("I [action] with {string}", async function (this: CustomWorld, value: string) {
  assert.ok(this.[pageName]Page, "[PageName]Page is not initialized");
  await this.[pageName]Page.[action](value);
});

Then("[expected outcome] should be {string}", async function (this: CustomWorld, expected: string) {
  assert.ok(this.[pageName]Page, "[PageName]Page is not initialized");
  const actual = await this.[pageName]Page.[getValue]();
  assert.strictEqual(actual, expected);
});
```

**Aturan:**
- Nama file: `[feature].steps.ts`
- Selalu gunakan `this: CustomWorld` untuk type safety
- Gunakan `assert.ok()` / `assert.strictEqual()` dari `node:assert` — bukan `expect()` Playwright
- Selalu assert bahwa Page sudah diinisialisasi sebelum digunakan (`assert.ok(this.cartPage, ...)`)
- Cek step-definitions yang sudah ada — reuse jika step serupa sudah defined
- Step harus generic dan reusable

---

## Locator Priority (untuk mengisi LocatorCandidate[])

```
1. testId    → kind: "testId",  value: "data-test-attr"
2. id        → kind: "id",      value: "element-id"
3. role      → kind: "role",    role: "button", options: { name: "Submit" }
4. label     → kind: "label",   value: "Field label text"
5. css       → kind: "css",     value: "stable-css-selector"
6. xpath     → kind: "xpath",   value: "//xpath"   ← last resort
```

Jangan gunakan: `nth-child`, dynamic class, selector berbasis posisi.

---

## Naming Conventions

| Artefak | Convention | Contoh |
|---|---|---|
| Feature file | `features/[app]/[feature].feature` | `features/saucedemo/cart.feature` |
| Page class | `pages/[PageName]Page.ts` | `pages/CartPage.ts` |
| Step file | `step-definitions/[app]/[feature].steps.ts` | `step-definitions/saucedemo/cart.steps.ts` |
| Candidate array | `SCREAMING_SNAKE_CASE` | `LOGIN_BUTTON_CANDIDATES` |
| CSV output | `output/testcases-*/[feature]_[YYYY-MM-DD].csv` | `output/testcases-from-prd/login_2026-04-26.csv` |
| Method | `camelCase`, verb-first | `addToCart()`, `getTotal()` |

---

## Known Decisions

| Keputusan | Alasan |
|---|---|
| `assert` dari `node:assert` | Konsistensi dengan codebase yang ada |
| `scenarioLogs` di-pass ke BasePage via constructor | Resolver butuh reference yang sama untuk menulis log |
| Screenshot on failure di `AfterStep` | Tangkap state saat langkah gagal, bukan setelah cleanup |
| `reports/locator-history.json` | Tracking fallback usage — sinyal locator primary perlu diperbaiki |
| Parallel: 1 worker | Menghindari race condition; naikkan setelah test suite stabil |
| `env.baseUrl` dari `config/env.ts` | Typed, bukan raw `process.env` — mengurangi typo |

---

## What NOT to Do

- Jangan buat `SelfHealingLocatorResolver` baru di dalam Page class — sudah tersedia via `this.resolver`
- Jangan gunakan `nth-child` atau dynamic class sebagai locator candidate
- Jangan expose selector string ke step definitions — semua akses elemen lewat POM method
- Jangan buat step definition baru jika step serupa sudah ada
- Jangan hardcode URL atau credential — gunakan `env.baseUrl` dan `test-data/`
- Jangan tambahkan `page.waitForTimeout()` — gunakan auto-wait Playwright
- Jangan generate file tanpa baca konvensi ini terlebih dahulu
- Jangan generate test cases tanpa menerapkan minimal 5 teknik (EP, BVA, ST, DT, EG)
- Jangan generate CSV test cases langsung ke `input/` — CSV output selalu ke `output/testcases-*/`
- Jangan lupa update `CustomWorld.ts` saat menambah Page class baru
- Jangan buat feature file di root `features/` — selalu ke `features/[app]/`
- Jangan buat step file di root `step-definitions/` — selalu ke `step-definitions/[app]/`
