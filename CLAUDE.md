# research_ai_automation

AI-driven QA automation pipeline — Playwright + Cucumber.js + TypeScript.

---

> ## ⚠️ REQUIRED FIRST ACTION
>
> Read `.claude/MANIFEST.md` using the Read tool **before doing anything**.
>
> Do not start the pipeline, generate files, or answer technical questions
> until MANIFEST and all files it references have been fully read.

---

## Instruction Structure

```
.claude/
├── MANIFEST.md       ← read first — index + reading order
├── IDENTITY.md       ← Claude's role and working principles
├── INTAKE.md         ← intake flow + input validation
├── CONVENTIONS.md    ← coding standards, locator, naming
├── PIPELINE.md       ← 3 paths, modes, output format
└── apps/
    ├── _TEMPLATE.md  ← template for new apps
    └── saucedemo.md  ← SauceDemo config
```

## Project Folder Structure

```
input/
├── prd/              ← Path A: PRD documents
└── testcases/        ← Path C: manual test cases (CSV)

output/
├── testcases-from-prd/
├── testcases-from-webexploratory/
├── gherkin/          ← staging feature files (unused by current pipeline)
├── automation/       ← staging POM + step definitions (unused by current pipeline)
└── feedback/         ← PRD feedback if below threshold

features/             ← PRODUCTION
pages/                ← PRODUCTION
step-definitions/     ← PRODUCTION
```
