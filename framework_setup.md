# 🚀 Automation Framework Plan: Playwright + Cucumber (Serial Execution)

## 🛠 Tech Stack

* **Engine:** Playwright (Chromium)
* **Runner:** @cucumber/cucumber
* **Language:** TypeScript
* **Design Pattern:** Page Object Model (POM)

---

## 📁 Project Structure

* `features/` → Gherkin scenarios (.feature)
* `step-definitions/` → Step implementations
* `pages/` → Page Object classes
* `support/` → Custom World & Hooks (shared test context)
* `utils/` → Helpers (logger, data generator)
* `config/` → Configuration & environment loader
* `test-data/` → Test data (JSON / generator)
* `reports/` → Test reports (HTML, JSON)
* `.env` → Environment variables

---

## 🎯 Implementation Steps

### 1. Init Project

* Initialize npm project
* Install TypeScript
* Install Playwright

### 2. Install Dependencies

* `@cucumber/cucumber`
* `ts-node`
* `dotenv`
* `playwright`

### 3. Core Setup

* Create `cucumber.js`
* Create `playwright.config.ts`
* Create `CustomWorld.ts`
* Create `hooks.ts`

### 4. Environment Setup

* Define `BASE_URL` in `.env`
* Load environment variables using `dotenv`

### 5. Test Context

* Use Custom World to store:

  * `browser`
  * `context`
  * `page`

---

## ⚙️ Execution Strategy

* All tests run in **SERIAL mode**
* Parallel execution is disabled
* Focus: stability and deterministic execution

---

## 🧪 Cucumber Configuration

### `cucumber.js`

```js
module.exports = {
  default: {
    require: ['step-definitions/**/*.ts', 'support/**/*.ts'],
    format: [
      'progress',
      'html:reports/report.html',
      'json:reports/report.json'
    ],
    publishQuiet: true,
    parallel: 1
  }
};
```

---

## ▶️ Run Test

```bash
npx cucumber-js
```

---

## 🧩 Hooks Implementation

### `hooks.ts`

```ts
import { Before, After } from '@cucumber/cucumber';

Before(async function () {
  this.context = await this.browser.newContext();
  this.page = await this.context.newPage();
});

After(async function () {
  await this.page.close();
  await this.context.close();
});
```

---

## 🏷 Tagging Strategy

* `@smoke`
* `@regression`
* `@sanity`
* `@wip`
* `@negative`

---

## 📊 Reporting

* Generate HTML report
* Generate JSON report
* Automatically capture screenshot on failure

---

## 🧪 Test Data Strategy

* Use JSON files for static data
* Use helpers for dynamic data generation
* Avoid hardcoded values

---

## 💎 Best Practices

* Use Playwright locators (role, label, text)
* One Page Object per page
* No global/shared variables
* Centralized logging
* Consistent error handling
* Follow SOLID principles

---

## 🔮 Future Improvement (Do Not Implement Now)

* Parallel execution will be introduced after:

  * tests are stable
  * no flaky behavior
  * test data is fully isolated