# research_ai_automation

AI-driven QA automation pipeline — generates test cases and automation scripts using Claude as the agent.

**Stack:** TypeScript · Playwright · Cucumber.js · Page Object Model · Self-healing locators · Testmo

---

## Quick Start

```bash
npm install
```

Create a `.env` file in the project root:
```env
BASE_URL=https://www.saucedemo.com/
HEADLESS=true
```

---

## Running Existing Tests

```bash
npm test              # run all tests
npm run test:smoke    # smoke tests only (happy path)
npm run test:login    # login suite only
npm run typecheck     # TypeScript check without running tests
```

---

## Generating New Tests with Claude

There are 3 paths for generating automation tests. Choose based on your situation.

```
Path A → You have a PRD            → Analyze PRD → CSV → Gherkin + POM + Steps
Path B → No PRD available          → Claude explores the web → CSV → Gherkin + POM + Steps
Path C → You have a test case CSV  → Claude generates automation from your CSV
```

> **Note:** All Claude output goes to `output/` first — not directly to production.
> Review it first, then promote to `features/`, `pages/`, `step-definitions/`.

---

### Path A — From a PRD

**1. Save PRD to `input/prd/`**
```
input/prd/[feature]_[date].txt
```

**2. Send to Claude:**
```
Mode 1 Path A: Analyze PRD at input/prd/[feature]_[date].txt
App: [app-name] | Feature: [feature-name]
```

**3. Claude returns a verdict:**
- **APPROVED** → continue to step 4
- **NEEDS REVISION** → read `output/feedback/[feature]_prd_[date].txt`, revise the PRD, and repeat from step 2

**4. Generate test cases + automation:**
```
Mode 2 Path A: Generate test cases + Mode 3: Generate all automation artifacts
```

**Output:**
```
output/testcases-from-prd/[feature]_[date].csv    ← import to Testmo
output/gherkin/[feature]_[date].feature
output/automation/[Page]Page_[date].ts
output/automation/[feature].steps_[date].ts
```

<details>
<summary>Example — SauceDemo checkout</summary>

```
# Step 2
Mode 1 Path A: Analyze PRD at input/prd/checkout_2026-04-26.txt
App: saucedemo | Feature: checkout

# Step 4 (if APPROVED)
Mode 2 Path A: Generate test cases + Mode 3: Generate all automation artifacts
```

Generated output:
```
output/testcases-from-prd/checkout_2026-04-26.csv
output/gherkin/checkout_2026-04-26.feature
output/automation/CheckoutPage_2026-04-26.ts
output/automation/checkout.steps_2026-04-26.ts
```
</details>

---

### Path B — Explore Web (no PRD)

**Send to Claude:**
```
Mode 2+3 Path B: Explore the [page-name] page at [page-url]
App: [app-name] | Feature: [feature-name]
```

**Output:**
```
output/testcases-from-webexploratory/[feature]_[date].csv
output/gherkin/[feature]_[date].feature
output/automation/[Page]Page_[date].ts
output/automation/[feature].steps_[date].ts
```

<details>
<summary>Example — SauceDemo cart</summary>

```
Mode 2+3 Path B: Explore the cart page at https://www.saucedemo.com/cart.html
App: saucedemo | Feature: cart
```

Generated output:
```
output/testcases-from-webexploratory/cart_2026-04-26.csv
output/gherkin/cart_2026-04-26.feature
output/automation/CartPage_2026-04-26.ts
output/automation/cart.steps_2026-04-26.ts
```
</details>

---

### Path C — From Manual Test Cases

**1. Save the CSV export from Testmo to `input/testcases/`**
```
input/testcases/[feature]_manual.csv
```

**2. Send to Claude:**
```
Mode 3C Path C: Generate automation from input/testcases/[feature]_manual.csv
App: [app-name] | URL: [page-url]
```

**Output:**
```
output/gherkin/[feature]_[date].feature
output/automation/[Page]Page_[date].ts
output/automation/[feature].steps_[date].ts
```

<details>
<summary>Example — SauceDemo checkout manual</summary>

```
Mode 3C Path C: Generate automation from input/testcases/checkout_manual.csv
App: saucedemo | URL: https://www.saucedemo.com/checkout-step-one.html
```

Generated output:
```
output/gherkin/checkout_2026-04-26.feature
output/automation/CheckoutPage_2026-04-26.ts
output/automation/checkout.steps_2026-04-26.ts
```
</details>

---

## Review & Promote to Production

Once the output has been reviewed, promote to production folders:

```
output/gherkin/[feature].feature      → features/[feature].feature
output/automation/[Page]Page.ts       → pages/[Page]Page.ts
output/automation/[feature].steps.ts  → step-definitions/[feature].steps.ts
```

After promoting, **update `support/CustomWorld.ts`** — add a property for the new Page class:

```typescript
// support/CustomWorld.ts
import type { CartPage } from "../pages/CartPage";

export class CustomWorld extends World {
  // ... existing properties ...
  cartPage?: CartPage;  // ← add this
}
```

Then run typecheck to verify there are no errors:
```bash
npm run typecheck
```

---

## Adding a New App

**1. Copy the config template:**
```
.claude/apps/_TEMPLATE.md  →  .claude/apps/[app-name].md
```

**2. Fill in all fields in the new file** (URL, auth, test accounts, known quirks).

**3. Reference the app name when prompting Claude:**
```
Mode 2+3 Path B: Explore ... App: [app-name]
```

---

## Folder Structure

```
input/
├── prd/                             ← Path A: PRD documents
└── testcases/                       ← Path C: manual CSV from Testmo

output/                              ← staging — review before promoting
├── testcases-from-prd/              ← CSV from Path A
├── testcases-from-webexploratory/   ← CSV from Path B
├── gherkin/                         ← .feature files
├── automation/                      ← POM + step definitions
└── feedback/                        ← PRD feedback if below threshold

features/                            ← PRODUCTION: Gherkin (single source of truth)
pages/                               ← PRODUCTION: Page Object Model
step-definitions/                    ← PRODUCTION: step implementations
support/                             ← CustomWorld, hooks
utils/                               ← selfHealingLocator, logger, dataGenerator
config/                              ← env loader
.claude/                             ← instructions for Claude agent
```

---

## Reports & Diagnostics

After tests run, results are stored in `reports/`:

| File | Contents |
|---|---|
| `reports/login-report.html` | HTML report per suite |
| `reports/login-report.json` | JSON report per suite |
| `reports/failed-*.png` | Screenshot at failing step |
| `reports/diagnostics-*.log` | Locator trace + browser console log |
| `reports/locator-history.json` | Fallback locator history — signals when a primary locator needs fixing |

---

## Team Reference

| File | Contents |
|---|---|
| `.claude/CONVENTIONS.md` | Coding standards, POM pattern, locator strategy |
| `.claude/PIPELINE.md` | Technical details for each pipeline mode |
| `.claude/apps/saucedemo.md` | SauceDemo config — **sample app**, not the default framework |
| `.claude/apps/_TEMPLATE.md` | Template for registering a new app |
