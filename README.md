# research_ai_automation

> Repo ini menggunakan **Claude AI** sebagai agent untuk membuat test automation secara otomatis — mulai dari analisis kebutuhan sampai menghasilkan kode siap pakai.

---

## Apa yang dilakukan repo ini?

1. **Kamu kasih input** — bisa berupa dokumen PRD, URL halaman, atau file test case manual (CSV)
2. **Claude menganalisis dan merancang** — menghasilkan test case dengan 5 teknik pengujian (EP, BVA, State Transition, Decision Table, Error Guessing)
3. **Claude menulis kodenya** — Gherkin feature files, Page Object Model, dan step definitions — langsung siap dijalankan

**Stack:** TypeScript · Playwright · Cucumber.js · Page Object Model · Self-healing locators

---

## Aplikasi yang sudah punya test automation

| Aplikasi  | URL                                           | Coverage                                          |
| --------- | --------------------------------------------- | ------------------------------------------------- |
| SauceDemo | https://www.saucedemo.com                     | Login, Inventory, Cart, Checkout, Product Detail  |
| OrangeHRM | https://opensource-demo.orangehrmlive.com     | Login, Dashboard, Employee                        |
| TodoMVC   | https://todomvc.com/examples/react/dist       | Add, Complete, Filter, Delete todo                |

---

## Setup Pertama Kali

**Prasyarat:** Node.js >= 20 ([download](https://nodejs.org))

```bash
# 1. Clone repo
git clone <repo-url>
cd research_ai_automation

# 2. Install dependencies
npm install
npx playwright install chromium

# 3. Buat file .env
```

Isi file `.env`:

```env
BASE_URL=https://www.saucedemo.com/
ORANGEHRM_BASE_URL=https://opensource-demo.orangehrmlive.com
TODOMVC_BASE_URL=https://todomvc.com/examples/react/dist
SAUCEDEMO_PASSWORD=secret_sauce
HEADLESS=false
```

Verifikasi setup berhasil:

```bash
npm run test:sanity
```

---

## Menjalankan Test

```bash
npm run test:sanity     # 1 test tercepat — verifikasi setup
npm run test:smoke      # semua happy path (cepat, ~2 menit)
npm run test:regression # full suite termasuk edge case
```

Untuk satu fitur tertentu:

```bash
npm run test:login              # login SauceDemo
npm run test:cart               # cart SauceDemo
npm run test:checkout-step1     # form billing
npm run test:checkout-step2     # order review
npm run test:checkout-complete  # konfirmasi pesanan
npm run test:inventory          # product list
npm run test:product-detail     # halaman detail produk
npm run test:orangehrm          # semua test OrangeHRM
npm run test:todo               # semua test TodoMVC
```

---

## Generate Automation Baru dengan Claude

Buka Claude Code di terminal, lalu pilih salah satu path:

| Situasi                          | Prompt ke Claude                                                                |
| -------------------------------- | ------------------------------------------------------------------------------- |
| Punya dokumen PRD / spesifikasi  | `Mode 1 Path A: Analyze PRD at input/prd/[nama-file].txt`                       |
| Hanya punya URL halaman          | `Mode 2+3 Path B: Explore the [nama halaman] at [URL]`                          |
| Punya test case manual (CSV)     | `Mode 3C Path C: Generate automation from input/testcases/[nama-file].csv`      |

Panduan lengkap setiap path, konvensi kode, dan cara tambah aplikasi baru → **[framework_setup.md](framework_setup.md)**

---

## Scripts Lainnya

```bash
npm run typecheck       # cek TypeScript, harus 0 error sebelum commit
npm run lint            # cek ESLint
npm run format          # auto-format semua file
npm run format:check    # cek format (dipakai CI)
npm run test:unit       # unit test framework internal
npm run allure:report   # generate Allure report
npm run allure:open     # buka Allure report di browser
```

---

## CI/CD

GitHub Actions berjalan otomatis setiap push. Pipeline: `lint → smoke → [regression | docker-build | firefox | webkit]`

Secret yang perlu diset di GitHub: `SAUCEDEMO_PASSWORD`
Variables (per environment): `BASE_URL`, `ORANGEHRM_BASE_URL`, `TODOMVC_BASE_URL`

---

## Dokumen Referensi

| File                                                    | Isi                                                         |
| ------------------------------------------------------- | ----------------------------------------------------------- |
| [framework_setup.md](framework_setup.md)                | Panduan lengkap: setup, generate, konvensi, troubleshooting |
| [.claude/CONVENTIONS.md](.claude/CONVENTIONS.md)        | Standar kode POM + step definitions                         |
| [.claude/PIPELINE.md](.claude/PIPELINE.md)              | Detail teknis setiap mode pipeline                          |
| [.claude/apps/saucedemo.md](.claude/apps/saucedemo.md)  | Config SauceDemo: URL, credentials, coverage                |
