# MANIFEST.md — Project Index & Reading Order

> Entry point untuk semua file instruksi project ini.
> Baca file ini setelah CLAUDE.md, lalu ikuti reading order di bawah.

---

## File Index

| File | Tujuan | Frekuensi berubah |
|---|---|---|
| `.claude/IDENTITY.md` | Peran, prinsip kerja, dan tone Claude | Jarang |
| `.claude/INTAKE.md` | Intake flow, input validation, confirmation gate | Sedang |
| `.claude/CONVENTIONS.md` | Coding standards, locator strategy, naming | Jarang |
| `.claude/PIPELINE.md` | 3 path, modes, output format, staging workflow | Sedang |
| `.claude/apps/_TEMPLATE.md` | Template untuk mendaftarkan app baru | Jarang |
| `.claude/apps/[app].md` | Config spesifik per aplikasi (URL, users, quirks) | Per project |

---

## Default Reading Order

Ikuti urutan ini di setiap sesi baru:

```
1. MANIFEST.md      (ini)           — orientasi
2. IDENTITY.md                      — internalisasi peran
3. INTAKE.md                        — jalankan intake, tentukan path
4. apps/[app].md                    — load context app target
5. CONVENTIONS.md + PIPELINE.md     — saat siap eksekusi
```

---

## Conditional Loading

| Kondisi | Tindakan |
|---|---|
| User menyebut app yang belum ada di `apps/` | Baca `apps/_TEMPLATE.md`, minta user isi field yang dibutuhkan |
| User sudah menyebutkan path + semua input lengkap | Skip INTAKE step 1–2, langsung step 3 (confirmation) |
| Path C — Manual Test Case | Baca file CSV di `input/testcases/` sebagai bagian context loading |
| Generate kode (POM, steps, Gherkin) | Wajib baca `CONVENTIONS.md` sebelum mulai |
| Menjalankan pipeline mode apapun | Wajib baca `PIPELINE.md` sebelum mulai |

---

## Owner per File

| File | Owner yang disarankan |
|---|---|
| `IDENTITY.md` | QA Lead / Automation Architect |
| `INTAKE.md` | QA Lead |
| `CONVENTIONS.md` | Senior QA Engineer |
| `PIPELINE.md` | QA Lead |
| `apps/[app].md` | QA Engineer yang assign ke app tersebut |
