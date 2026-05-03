# PIPELINE.md — Pipeline Modes & Execution Guide

> Read this file before running any pipeline mode.
> Ensure intake is complete (see `INTAKE.md`) and app config is loaded (`apps/[app].md`).

---

## Project Structure

```
research_ai_automation/
├── input/
│   ├── prd/                         ← Path A: PRD documents (.txt / .pdf)
│   └── testcases/                   ← Path C: manual test cases from Testmo (.csv)
│
├── output/
│   ├── testcases-from-prd/          ← CSV output from Path A (staging)
│   ├── testcases-from-webexploratory/ ← CSV output from Path B (staging)
│   └── feedback/                    ← PRD feedback .txt if below threshold
│
├── features/
│   └── [app]/                       ← Feature files per app (generate directly here)
│       └── [feature].feature
│
├── step-definitions/
│   └── [app]/                       ← Step implementations per app
│       └── [feature].steps.ts
│
├── pages/                           ← Page Object Model (shared, flat)
│   ├── BasePage.ts
│   └── [PageName]Page.ts
│
├── support/
│   ├── CustomWorld.ts
│   └── hooks.ts
├── utils/
│   └── selfHealingLocator.ts
└── test-data/
```

**Example for SauceDemo:**

```
features/saucedemo/login.feature
features/saucedemo/cart.feature
step-definitions/saucedemo/login.steps.ts
step-definitions/saucedemo/cart.steps.ts
pages/LoginPage.ts
pages/CartPage.ts
```

---

## Generate Workflow

```
Input (Path A / B / C)
          ↓
  Claude analyzes + generates
          ↓
  CSV → output/testcases-*/          (user reviews CSV before continuing)
          ↓
  Gherkin → features/[app]/          (direct to production, review via git diff)
  POM     → pages/                   (direct to production, review via git diff)
  Steps   → step-definitions/[app]/  (direct to production, review via git diff)
  package.json → script test:[feature] added
          ↓
  Run tests → if failures → debug & fix → repeat until all pass
```

**Rules:**

- CSV test cases stay staged to `output/` — user reviews before generating automation
- Gherkin, POM, and step definitions are generated directly to the per-app production folder
- File naming convention: `[feature].feature`, `[PageName]Page.ts`, `[feature].steps.ts`
- Review is done via `git diff` before committing
- Pipeline is **not complete** until all tests pass — run, debug, and fix are mandatory parts of the pipeline

---

## Core Design Pattern

```
Input (Path A / B / C)
    ↓
Claude — analyze + generate
    ↓
output/ (staging)
    ↓ user approves
Gherkin feature file (PIVOT — single source of truth)
    ↙                         ↘
Track Manual               Track Automation
Testmo CSV import          Step defs + POM
Manual tester              Playwright runner
    ↘                         ↙
       Pre-release validation
    Auto regression + exploratory
```

---

## Pipeline Overview (3 Paths)

```
Path A (PRD available)          Path B (explore web)              Path C (upload manual)
input/prd/                      URL / feature name                input/testcases/
      ↓                                ↓                                 ↓
Mode 1 → Mode 2 → Mode 3        Mode 2B → Mode 3                  Mode 3C
Analyze → CSV → Auto            Explore → CSV → Auto              CSV → Auto only
      ↓                                ↓                                 ↓
output/testcases-from-prd/      output/testcases-from-webexploratory/  features/[app]/
output/feedback/ (if PRD        features/[app]/                   step-definitions/[app]/
below threshold)                step-definitions/[app]/           pages/
                                pages/
```

---

## PRD Scoring Threshold (Path A)

A PRD is considered **APPROVED** only if it meets all of the following thresholds:

| Framework | Minimum threshold                                          |
| --------- | ---------------------------------------------------------- |
| SMART     | Min 4 of 5 criteria met per requirement                    |
| INVEST    | Min 4 of 7 criteria met per user story                     |
| MoSCoW    | All Must Have items covered with clear acceptance criteria |
| RBT       | No High likelihood × High impact items without mitigation  |
| BVA/EP    | All input fields have defined boundary values              |

If **threshold is not met** → verdict **NEEDS REVISION** → generate file to `output/feedback/`.

### Feedback File Format

```
PRD REVIEW FEEDBACK
Feature  : [feature name]
Date     : [YYYY-MM-DD]
Verdict  : NEEDS REVISION

SCORING SUMMARY
---------------
SMART  : [X]/5 — [brief note]
INVEST : [X]/7 — [brief note]
MoSCoW : [status]
RBT    : [status]
BVA/EP : [status]

ITEMS THAT NEED CLARIFICATION
------------------------------
1. [specific item]
2. [specific item]

Please revise the PRD and re-run Mode 1.
```

---

## Path A — Mode 1: PRD Analysis

**Trigger:** `"Mode 1 Path A: Analyze the following PRD"` or `"Mode 1 Path A: Analyze PRD at input/prd/[filename]"`

**Steps:**

1. Read PRD from file or chat
2. Score per framework (SMART, INVEST, MoSCoW, RBT, BVA/EP)
3. Verdict: **APPROVED** → continue to Mode 2 | **NEEDS REVISION** → generate `output/feedback/[feature]_prd_[YYYY-MM-DD].txt`

---

## Path A — Mode 2: Generate Test Cases from PRD

**Trigger:** `"Mode 2 Path A: Generate test cases from an APPROVED PRD"`

**Output:** `output/testcases-from-prd/[feature]_[YYYY-MM-DD].csv`

**5 required techniques:**

1. **EP** — divide each input/state into valid and invalid equivalence classes
2. **BVA** — test at boundary values of each EP class (min, min+1, max-1, max)
3. **ST** — identify all UI states and test every transition
4. **DT** — for condition combinations, create a table and turn each row into a test case
5. **EG** — double-click, force navigation via URL, empty state, reload while process is running

---

## Path B — Mode 2B: Explore Web + Generate Test Cases

**Trigger:** `"Mode 2+3 Path B: Explore [feature name] at [URL] then generate all artifacts"`

**Ordered steps:**

1. Read existing files — `pages/`, `step-definitions/[app]/`, `features/[app]/`
2. Explore web app — navigate to target page, identify elements and flow
3. Inspect DOM — find `data-test`, `id`, `role` per element
4. Design test cases using 5 techniques (EP, BVA, ST, DT, EG)
5. Generate CSV → `output/testcases-from-webexploratory/[feature]_[YYYY-MM-DD].csv`
6. Generate Gherkin → `features/[app]/[feature].feature`
7. Generate POM → `pages/[PageName]Page.ts`
8. Generate step definitions → `step-definitions/[app]/[feature].steps.ts`
9. Update `package.json` — add script `test:[feature]` with auto-open report
10. **Run Post-Generation Validation** — see section below

---

## Path C — Mode 3C: Generate Automation from Manual Test Cases

**Trigger:** `"Mode 3C Path C: Generate automation from input/testcases/[filename].csv"`

**Ordered steps:**

1. Read file `input/testcases/[filename].csv`
2. Read existing files — `pages/`, `step-definitions/[app]/`, `features/[app]/`
3. Map test cases → Gherkin Scenario Outline
4. Explore web to identify locators
5. Generate Gherkin → `features/[app]/[feature].feature`
6. Generate POM → `pages/[PageName]Page.ts`
7. Generate step definitions → `step-definitions/[app]/[feature].steps.ts`
8. Update `package.json` — add script `test:[feature]` with auto-open report
9. **Run Post-Generation Validation** — see section below

**Rules:**

- Do not generate a new CSV — test cases already exist in input
- Gherkin must reflect the original test cases — do not add or remove coverage
- If any CSV step is ambiguous → ask the user before generating
- **Must add runner script to `package.json`** every time automation is generated for a new feature (same format as Mode 3)

---

## Mode 3: Generate Automation Script (Path A & B)

**Trigger:** Always paired with Mode 2 or 2B — not run standalone.

**Output (in order):**

1. `features/[app]/[feature].feature`
2. `pages/[PageName]Page.ts`
3. `step-definitions/[app]/[feature].steps.ts`
4. `package.json` — add new runner script (see rules below)
5. **Run Post-Generation Validation** — see section below

**Rules:**

- Check `features/[app]/` and `step-definitions/[app]/` — do not duplicate already-defined steps
- Follow `BasePage.ts` for the self-healing pattern
- Use `CustomWorld` from `support/CustomWorld.ts` — add a new Page property if a new class is created
- Tests must be able to run standalone
- Tag `@smoke` for happy path, `@regression` for full suite
- **Must add runner script to `package.json`** every time automation is generated for a new feature:
  ```json
  "test:[feature]": "cucumber-js --tags \"@[feature]\" --format progress --format html:reports/[feature]-report.html --format json:reports/[feature]-report.json && open-cli reports/[feature]-report.html"
  ```
  Replace `[feature]` with the feature name in `kebab-case` (e.g. `checkout-complete`, `cart`, `login`).
  Report auto-open uses `open-cli` (already installed as a devDependency).

---

## Post-Generation Validation (Required — all automation-generating modes)

> Applies after Mode 3, Mode 2B step 10, and Mode 3C step 9.
> Pipeline is **not declared complete** until all tests pass.

**Steps:**

1. Run tests for the newly generated feature:
   ```bash
   npx cucumber-js --tags "@[feature]" --format progress
   ```
2. Evaluate results:
   - **All pass** → done, report to user
   - **Any failure / error** → continue to debug step
3. Debug failure — identify root cause from error message + stack trace:
   | Symptom | Common root cause | Fix |
   |---|---|---|
   | `Cannot read properties of undefined` | Page not initialized in step | Add initialization in `Given` step |
   | `locator.click: Element not found` | Wrong or stale locator candidates | Update `LocatorCandidate[]` in POM |
   | `Step not defined` | Step in Gherkin has no implementation | Add the missing step definition |
   | TypeScript compile error | Type mismatch, wrong import, missing property | Fix type error before re-running |
   | `Timeout` | Element slow to appear or navigation not complete | Add a more stable locator candidate; do not use `waitForTimeout` |
4. Fix the relevant files (POM, step definitions, or Gherkin if there is ambiguity)
5. Re-run tests after fix — repeat steps 2–4 until all pass
6. Report final results to user:
   - Number of scenarios passed / failed
   - List of fixes applied (if any)
   - Command to open the report: `npm run test:[feature]`

**Debug rules:**

- Do not change the expected test outcome to avoid a failure — fix the implementation, not the assertion
- If a locator is not found → update `LocatorCandidate[]` in the POM, do not hardcode a selector in the step definition
- If a step is undefined → add the step definition, do not modify the Gherkin text
- If there is a TypeScript error → must fix before running; `tsc --noEmit` can be used for a quick check
- Maximum **3 debug iterations** per failure — if still failing after 3 attempts, stop and report to the user with detailed root cause and steps already tried

---

## CSV Output Format

```csv
Folder,Name,Preconditions,Step,Test Data,Expected Result,Priority,Type,Automatable
```

**Rules:**

- One test case = multiple rows (Testmo multi-step format)
- Test case names reflect the technique: `"EP - valid username"`, `"BVA - max cart items"`
- Always cover: EP valid, EP invalid, BVA min, BVA max, state transition, error guessing
- `Automatable: Yes` for all candidates that can be automated
- Folder follows the module or page name in the application
- Priority: `High` critical path, `Medium` secondary flow, `Low` edge cases

---

## Full Instruction Examples

### Path A

```
Mode 1 Path A: Analyze PRD at input/prd/login_prd.txt
If APPROVED, continue with Mode 2 + Mode 3 for the "login" feature
```

### Path B

```
Mode 2+3 Path B: Explore the cart page at https://[url]/cart
Feature: "shopping-cart"
Generate CSV + Gherkin + POM + steps
```

### Path C

```
Mode 3C Path C: Generate automation from input/testcases/checkout_manual.csv
Target URL: https://[url]/checkout
Feature: "checkout"
```
