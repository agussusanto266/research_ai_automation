# Research AI Automation

Production-ready QA automation framework for [SauceDemo](https://www.saucedemo.com/) using:

- Playwright
- Cucumber (BDD)
- TypeScript
- Page Object Model (POM)
- Self-healing locator fallback strategy

## What This Repository Contains

This project implements resilient end-to-end automation for core login flows:

- valid login (`standard_user`)
- invalid login (wrong password)
- locked user login (`locked_out_user`)

It includes:

- clean POM design (`pages/`)
- parameterized Cucumber feature + reusable step definitions
- fallback locators (primary -> secondary -> fallback)
- failure diagnostics (screenshots + browser console logs)
- HTML/JSON report generation

## Project Structure

```text
.
|-- config/
|   `-- env.ts
|-- features/
|   |-- healthcheck.feature
|   `-- login.feature
|-- pages/
|   |-- BasePage.ts
|   |-- HomePage.ts
|   `-- LoginPage.ts
|-- step-definitions/
|   |-- healthcheck.steps.ts
|   `-- login.steps.ts
|-- support/
|   |-- CustomWorld.ts
|   `-- hooks.ts
|-- utils/
|   `-- selfHealingLocator.ts
|-- reports/
|   `-- (generated test artifacts)
|-- cucumber.js
|-- playwright.config.ts
|-- tsconfig.json
`-- package.json
```

## Prerequisites

- Node.js 18+ (recommended)
- npm

## Installation

```bash
npm install
```

## Configuration

Environment values are loaded from `.env`.

Default:

```env
BASE_URL=https://www.saucedemo.com/
```

Optional:

- `HEADLESS=true` to run browser in headless mode.

## Run Tests

Run all scenarios:

```bash
npm test
```

Run smoke scenarios:

```bash
npm run test:smoke
```

Run login suite only:

```bash
npm run test:login
```

Type-check:

```bash
npm run typecheck
```

## Reporting and Diagnostics

Generated outputs:

- `reports/report.html` and `reports/report.json` (default run)
- `reports/login-report.html` and `reports/login-report.json` (login-tag run)
- `reports/failed-*.png` (failed step screenshots)
- `reports/diagnostics-*.log` (scenario diagnostics with console logs and locator traces)
- `reports/locator-history.json` (locator usage history)

## Self-Healing Locator Strategy

Each critical UI element can have multiple locator candidates, prioritized by stability:

1. `data-test`
2. `id`
3. role-based selectors
4. stable CSS
5. xpath (last resort)

At runtime, the framework tries candidates in order and logs which one succeeds. This improves resilience when UI attributes change.

## Notes

- Codegen output is treated as input only and is refactored into maintainable POM + BDD layers.
- Avoid brittle selectors such as dynamic class chains and `nth-child` when possible.
