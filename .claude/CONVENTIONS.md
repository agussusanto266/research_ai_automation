# CONVENTIONS.md — Coding Standards & Conventions

> Read this file before generating any code (Gherkin, POM, step definitions).
> These conventions apply to all applications — not specific to any single app.

---

## Tech Stack

| Layer | Tool |
|---|---|
| Language | TypeScript |
| Test runner | Cucumber.js (`npm test` / `npm run test:smoke`) |
| Browser automation | Playwright (library — not Playwright Test) |
| Test pattern | Page Object Model (POM) |
| Locator strategy | Self-healing via `SelfHealingLocatorResolver` |
| Test management | Testmo (import via CSV) |
| Config | dotenv → `config/env.ts` |
| Report | HTML + JSON (`reports/`) |

---

## Page Object Model

Correct template — matching the actual codebase:

```typescript
// pages/[PageName]Page.ts
import type { Page } from "playwright";
import { BasePage } from "./BasePage";
import type { LocatorCandidate } from "../utils/selfHealingLocator";

// Define candidates outside the class (module-level const)
const ELEMENT_CANDIDATES: LocatorCandidate[] = [
  { name: "primary-testid", kind: "testId",  value: "data-test-value" },
  { name: "secondary-role", kind: "role",    role: "button", options: { name: "Label" } },
  { name: "fallback-css",   kind: "css",     value: "css-selector" }
];

export class [PageName]Page extends BasePage {
  constructor(page: Page, scenarioLogs: string[]) {
    super(page, scenarioLogs);  // resolver is available via this.resolver (from BasePage)
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

**POM Rules:**
- Candidates array must be defined as a `const` at module level — not inside a class or method
- Candidate names follow the pattern: `"primary-testid"`, `"secondary-[kind]"`, `"fallback-[kind]"` — consistent
- Constructor always takes `(page: Page, scenarioLogs: string[])` and calls `super(page, scenarioLogs)`
- `this.resolver` is available from BasePage — do not create a new resolver inside a Page class
- File name: `PascalCasePage.ts`
- Method names: camelCase, verb-first — `login()`, `getErrorMessage()`, `isVisible()`
- Do not expose raw selectors to step definitions

---

## CustomWorld — How to Update

Every time a new Page class is added, **must** add a property to `support/CustomWorld.ts`:

```typescript
// support/CustomWorld.ts
import type { CartPage } from "../pages/CartPage";          // ← add import
import type { CheckoutPage } from "../pages/CheckoutPage";  // ← add import

export class CustomWorld extends World {
  // ... existing properties ...
  cartPage?: CartPage;         // ← add property
  checkoutPage?: CheckoutPage; // ← add property
}
```

Without this, TypeScript will error when a step definition accesses `this.cartPage`.

---

## Environment Variables — How to Import

Always use the typed loader from `config/env.ts` — do not access `process.env` directly:

```typescript
import { env } from "../config/env";

// Usage:
await this.page.goto(env.baseUrl);
```

Add to `config/env.ts` if a new env var is needed:
```typescript
export const env = {
  baseUrl: process.env.BASE_URL ?? "https://fallback.url/",
  headless: process.env.HEADLESS === "true"
  // add here
};
```

---

## Available Utils

### `utils/logger.ts`
Use for non-diagnostic logs outside test scenarios:

```typescript
import { logger } from "../utils/logger";

logger.info("Navigating to checkout");
logger.error("Unexpected state detected");
```

For logs that appear in diagnostics when a test fails, use `this.scenarioLogs.push(...)` instead of logger.

### `utils/dataGenerator.ts`
Use to generate dynamic test data (not hardcoded):

```typescript
import { randomEmail } from "../utils/dataGenerator";

const email = randomEmail("buyer");  // → buyer+1234567890@example.test
```

---

## Gherkin / Feature Files

```gherkin
Feature: [Feature name — matches PRD section or page name]

  Background:
    Given I am on the [page name] page
    And I am logged in as "[role]"        # only if the feature requires auth

  @smoke
  Scenario Outline: [Happy path — outcome being validated]
    When I [action] with "<param>"
    Then [expected outcome] should be "<outcome>"

    Examples:
      | param | outcome |
      | ...   | ...     |

  @regression
  Scenario: [Negative / edge case]
    ...
```

**Rules:**
- Use English for all Gherkin
- File name: `kebab-case.feature`
- One feature file per feature/module
- Tag `@smoke` for happy path, `@regression` for full suite
- Use `Scenario Outline` + `Examples` for data-driven tests
- Do not hardcode credentials in Gherkin — use parameters from `Examples` or `test-data/`

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

**Rules:**
- File name: `[feature].steps.ts`
- Always use `this: CustomWorld` for type safety
- Use `assert.ok()` / `assert.strictEqual()` from `node:assert` — not Playwright's `expect()`
- Always assert that the Page is initialized before use (`assert.ok(this.cartPage, ...)`)
- Check existing step definitions — reuse if a similar step is already defined
- Steps must be generic and reusable

---

## Locator Priority (for filling LocatorCandidate[])

```
1. testId    → kind: "testId",  value: "data-test-attr"
2. id        → kind: "id",      value: "element-id"
3. role      → kind: "role",    role: "button", options: { name: "Submit" }
4. label     → kind: "label",   value: "Field label text"
5. css       → kind: "css",     value: "stable-css-selector"
6. xpath     → kind: "xpath",   value: "//xpath"   ← last resort
```

Do not use: `nth-child`, dynamic classes, position-based selectors.

---

## Naming Conventions

| Artifact | Convention | Example |
|---|---|---|
| Feature file | `features/[app]/[feature].feature` | `features/saucedemo/cart.feature` |
| Page class | `pages/[PageName]Page.ts` | `pages/CartPage.ts` |
| Step file | `step-definitions/[app]/[feature].steps.ts` | `step-definitions/saucedemo/cart.steps.ts` |
| Candidate array | `SCREAMING_SNAKE_CASE` | `LOGIN_BUTTON_CANDIDATES` |
| CSV output | `output/testcases-*/[feature]_[YYYY-MM-DD].csv` | `output/testcases-from-prd/login_2026-04-26.csv` |
| Method | `camelCase`, verb-first | `addToCart()`, `getTotal()` |

---

## Known Decisions

| Decision | Reason |
|---|---|
| `assert` from `node:assert` | Consistency with the existing codebase |
| `scenarioLogs` passed to BasePage via constructor | Resolver needs the same reference to write logs |
| Screenshot on failure in `AfterStep` | Capture state at the failing step, not after cleanup |
| `reports/locator-history.json` | Tracks fallback usage — signals that a primary locator needs fixing |
| Parallel: 1 worker | Avoids race conditions; increase after the test suite is stable |
| `env.baseUrl` from `config/env.ts` | Typed, not raw `process.env` — reduces typos |

---

## What NOT to Do

- Do not create a new `SelfHealingLocatorResolver` inside a Page class — it is already available via `this.resolver`
- Do not use `nth-child` or dynamic classes as locator candidates
- Do not expose selector strings to step definitions — all element access goes through POM methods
- Do not create a new step definition if a similar one already exists
- Do not hardcode URLs or credentials — use `env.baseUrl` and `test-data/`
- Do not add `page.waitForTimeout()` — use Playwright's auto-wait
- Do not generate files without reading these conventions first
- Do not generate test cases without applying all 5 techniques (EP, BVA, ST, DT, EG)
- Do not generate CSV test cases directly to `input/` — CSV output always goes to `output/testcases-*/`
- Do not forget to update `CustomWorld.ts` when adding a new Page class
- Do not create feature files in the root `features/` — always go to `features/[app]/`
- Do not create step files in the root `step-definitions/` — always go to `step-definitions/[app]/`
