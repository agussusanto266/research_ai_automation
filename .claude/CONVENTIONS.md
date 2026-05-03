# CONVENTIONS.md — Coding Standards & Conventions

> Read this file before generating any code (Gherkin, POM, step definitions).
> These conventions apply to all applications — not specific to any single app.

---

## Tech Stack

| Layer              | Tool                                            |
| ------------------ | ----------------------------------------------- |
| Language           | TypeScript                                      |
| Test runner        | Cucumber.js (`npm test` / `npm run test:smoke`) |
| Browser automation | Playwright (library — not Playwright Test)      |
| Test pattern       | Page Object Model (POM)                         |
| Locator strategy   | Self-healing via `SelfHealingLocatorResolver`   |
| Test management    | Testmo (import via CSV)                         |
| Config             | dotenv → `config/env.ts`                        |
| Report             | HTML + JSON (`reports/`)                        |

---

## Page Object Model

Correct template — matching the actual codebase:

```typescript
// pages/[app]/[PageName]Page.ts
import type { Page } from "playwright";
import { BasePage } from "../BasePage";
import type { LocatorCandidate, LocatorUsage } from "../../utils/selfHealingLocator";

// Define candidates outside the class (module-level const)
const ELEMENT_CANDIDATES: LocatorCandidate[] = [
  { name: "primary-testid", kind: "testId",  value: "data-test-value" },
  { name: "secondary-role", kind: "role",    role: "button", options: { name: "Label" } },
  { name: "fallback-css",   kind: "css",     value: "css-selector" }
];

export class [PageName]Page extends BasePage {
  constructor(page: Page, scenarioLogs: string[], locatorUsages: LocatorUsage[]) {
    super(page, scenarioLogs, locatorUsages);  // resolver is available via this.resolver (from BasePage)
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
- Constructor always takes `(page: Page, scenarioLogs: string[], locatorUsages: LocatorUsage[])` and calls `super(page, scenarioLogs, locatorUsages)`
- `this.resolver` is available from BasePage — do not create a new resolver inside a Page class
- File location: `pages/[app]/[PageName]Page.ts` — never in the root `pages/` folder (BasePage is the only exception)
- File name: `PascalCasePage.ts`
- Method names: camelCase, verb-first — `login()`, `getErrorMessage()`, `isVisible()`
- Do not expose raw selectors to step definitions
- Use `this.getPage(PageClass)` in step definitions — never `new PageClass(...)` directly

---

## CustomWorld — Page Factory

Use `this.getPage(PageClass)` in step definitions — no manual property registration needed:

```typescript
// step-definitions/[app]/[feature].steps.ts
import { LoginPage } from "../../pages/saucedemo/LoginPage";
import { CustomWorld } from "../../support/CustomWorld";

Given("I open the SauceDemo login page", async function (this: CustomWorld) {
  await this.getPage(LoginPage).goto(env.baseUrl);
});

When(
  "I login with username {string} and password {string}",
  async function (this: CustomWorld, username: string, password: string) {
    await this.getPage(LoginPage).login(username, password);
  }
);
```

The factory caches the instance per class per scenario — no need to add properties to `CustomWorld.ts` when adding a new Page class.

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
  headless: process.env.HEADLESS === "true",
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

const email = randomEmail("buyer"); // → buyer+1234567890@example.test
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
// step-definitions/[app]/[feature].steps.ts
import { Given, When, Then } from "@cucumber/cucumber";
import assert from "node:assert";
import { env } from "../../config/env";
import { [PageName]Page } from "../../pages/[app]/[PageName]Page";
import { CustomWorld } from "../../support/CustomWorld";

Given("I am on the [page name] page", async function (this: CustomWorld) {
  await this.getPage([PageName]Page).goto(env.baseUrl);
});

When("I [action] with {string}", async function (this: CustomWorld, value: string) {
  await this.getPage([PageName]Page).[action](value);
});

Then("[expected outcome] should be {string}", async function (this: CustomWorld, expected: string) {
  const actual = await this.getPage([PageName]Page).[getValue]();
  assert.strictEqual(actual, expected);
});
```

**Rules:**

- File name: `[feature].steps.ts`
- Always use `this: CustomWorld` for type safety
- Use `this.getPage(PageClass)` — never `new PageClass(...)` in steps
- Use `assert.ok()` / `assert.strictEqual()` from `node:assert` — not Playwright's `expect()`
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

| Artifact        | Convention                                      | Example                                          |
| --------------- | ----------------------------------------------- | ------------------------------------------------ |
| Feature file    | `features/[app]/[feature].feature`              | `features/saucedemo/cart.feature`                |
| Page class      | `pages/[app]/[PageName]Page.ts`                 | `pages/saucedemo/CartPage.ts`                    |
| Step file       | `step-definitions/[app]/[feature].steps.ts`     | `step-definitions/saucedemo/cart.steps.ts`       |
| Candidate array | `SCREAMING_SNAKE_CASE`                          | `LOGIN_BUTTON_CANDIDATES`                        |
| CSV output      | `output/testcases-*/[feature]_[YYYY-MM-DD].csv` | `output/testcases-from-prd/login_2026-04-26.csv` |
| Method          | `camelCase`, verb-first                         | `addToCart()`, `getTotal()`                      |

---

## Known Decisions

| Decision                                          | Reason                                                              |
| ------------------------------------------------- | ------------------------------------------------------------------- |
| `assert` from `node:assert`                       | Consistency with the existing codebase                              |
| `scenarioLogs` passed to BasePage via constructor | Resolver needs the same reference to write logs                     |
| Screenshot on failure in `AfterStep`              | Capture state at the failing step, not after cleanup                |
| `reports/locator-history.json`                    | Tracks fallback usage — signals that a primary locator needs fixing |
| Parallel: 1 worker                                | Avoids race conditions; increase after the test suite is stable     |
| `env.baseUrl` from `config/env.ts`                | Typed, not raw `process.env` — reduces typos                        |

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
- Do not add page properties to `CustomWorld.ts` — use `this.getPage(PageClass)` factory
- Do not create feature files in the root `features/` — always go to `features/[app]/`
- Do not create step files in the root `step-definitions/` — always go to `step-definitions/[app]/`
- Do not create page files in the root `pages/` — always go to `pages/[app]/` (BasePage is the only exception)
