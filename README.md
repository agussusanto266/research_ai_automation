# research_ai_automation

AI-driven QA automation pipeline — generates test cases and automation scripts using Claude as the agent.

**Stack:** TypeScript · Playwright · Cucumber.js · Page Object Model · Self-healing locators · Testmo

> **Panduan lengkap untuk tim:** lihat [framework_setup.md](framework_setup.md)

---

## Quick Start

```bash
npm install
npx playwright install chromium
```

Buat `.env`:

```env
BASE_URL=https://www.saucedemo.com/
SAUCEDEMO_PASSWORD=secret_sauce
HEADLESS=false
```

```bash
npm run test:sanity     # verifikasi setup
npm run test:smoke      # smoke test semua fitur
npm run test:regression # full regression
```

---

## Generate Automation Baru

Pilih path sesuai yang kamu punya:

| Path | Kapan pakai | Prompt ke Claude |
|------|-------------|-----------------|
| **A** | Punya PRD | `Mode 1 Path A: Analyze PRD at input/prd/[file].txt` |
| **B** | Punya URL, tidak ada PRD | `Mode 2+3 Path B: Explore the [page] at [URL]` |
| **C** | Punya test case manual (CSV) | `Mode 3C Path C: Generate automation from input/testcases/[file].csv` |

Detail setiap path, konvensi kode, dan troubleshooting → [framework_setup.md](framework_setup.md)

---

## Scripts

```bash
npm run test:smoke        # @smoke — semua app
npm run test:regression   # @regression — semua app
npm run test:unit         # unit test framework internal
npm run typecheck         # TypeScript check
npm run lint              # ESLint
npm run format            # Prettier auto-fix
npm run format:check      # Prettier check (dipakai CI)
```

---

## Struktur Utama

```
input/prd/              ← Path A: simpan PRD di sini
input/testcases/        ← Path C: simpan CSV manual di sini
output/                 ← Staging — review sebelum commit

features/[app]/         ← PRODUCTION: Gherkin
pages/[app]/            ← PRODUCTION: Page Object Model
step-definitions/[app]/ ← PRODUCTION: Step implementations

.claude/                ← Instruksi pipeline untuk Claude agent
```

---

## CI/CD

GitHub Actions: `lint → smoke → [regression | docker | firefox | webkit]`

Secrets yang perlu diset di GitHub: `SAUCEDEMO_PASSWORD`
Variables (per environment): `BASE_URL`, `ORANGEHRM_BASE_URL`, `TODOMVC_BASE_URL`

---

## Team Reference

| File | Isi |
|------|-----|
| [framework_setup.md](framework_setup.md) | Panduan lengkap: setup, generate, konvensi, troubleshooting |
| [.claude/CONVENTIONS.md](.claude/CONVENTIONS.md) | Standar kode POM + step definitions |
| [.claude/PIPELINE.md](.claude/PIPELINE.md) | Detail teknis setiap mode pipeline |
| [.claude/apps/saucedemo.md](.claude/apps/saucedemo.md) | Config SauceDemo: URL, credentials, coverage |
| [.claude/apps/_TEMPLATE.md](.claude/apps/_TEMPLATE.md) | Template untuk mendaftarkan app baru |
