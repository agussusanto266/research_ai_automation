# research_ai_automation

AI-driven QA automation pipeline — Playwright + Cucumber.js + TypeScript.

---

> ## ⚠️ TINDAKAN PERTAMA WAJIB
>
> Baca `.claude/MANIFEST.md` menggunakan Read tool **sebelum melakukan apapun**.
>
> Jangan mulai pipeline, generate file, atau menjawab pertanyaan teknis
> sebelum MANIFEST dan file-file yang dirujuknya selesai dibaca.

---

## Struktur Instruksi

```
.claude/
├── MANIFEST.md       ← baca pertama — index + reading order
├── IDENTITY.md       ← peran dan prinsip kerja Claude
├── INTAKE.md         ← intake flow + input validation
├── CONVENTIONS.md    ← coding standards, locator, naming
├── PIPELINE.md       ← 3 path, modes, output format
└── apps/
    ├── _TEMPLATE.md  ← template untuk app baru
    └── saucedemo.md  ← config SauceDemo
```

## Struktur Folder Project

```
input/
├── prd/              ← Path A: PRD documents
└── testcases/        ← Path C: manual test cases (CSV)

output/
├── testcases-from-prd/
├── testcases-from-webexploratory/
├── gherkin/          ← staging feature files
├── automation/       ← staging POM + step defs
└── feedback/         ← PRD feedback jika di bawah threshold

features/             ← PRODUCTION
pages/                ← PRODUCTION
step-definitions/     ← PRODUCTION
```
