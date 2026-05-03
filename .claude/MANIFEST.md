# MANIFEST.md — Project Index & Reading Order

> Entry point for all project instruction files.
> Read this file after CLAUDE.md, then follow the reading order below.

---

## File Index

| File                        | Purpose                                          | Change frequency |
| --------------------------- | ------------------------------------------------ | ---------------- |
| `.claude/IDENTITY.md`       | Claude's role, working principles, and tone      | Rarely           |
| `.claude/INTAKE.md`         | Intake flow, input validation, confirmation gate | Occasionally     |
| `.claude/CONVENTIONS.md`    | Coding standards, locator strategy, naming       | Rarely           |
| `.claude/PIPELINE.md`       | 3 paths, modes, output format, staging workflow  | Occasionally     |
| `.claude/apps/_TEMPLATE.md` | Template for registering a new app               | Rarely           |
| `.claude/apps/[app].md`     | App-specific config (URL, users, quirks)         | Per project      |

---

## Default Reading Order

Follow this order at the start of every new session:

```
1. MANIFEST.md      (this file)     — orientation
2. IDENTITY.md                      — internalize the role
3. INTAKE.md                        — run intake, determine path
4. apps/[app].md                    — load target app context
5. CONVENTIONS.md + PIPELINE.md     — when ready to execute
```

---

## Conditional Loading

| Condition                                             | Action                                                             |
| ----------------------------------------------------- | ------------------------------------------------------------------ |
| User mentions an app not yet in `apps/`               | Read `apps/_TEMPLATE.md`, ask user to fill in required fields      |
| User has already specified path + all required inputs | Skip INTAKE steps 1–2, go directly to step 3 (confirmation)        |
| Path C — Manual Test Case                             | Read the CSV file in `input/testcases/` as part of context loading |
| Generating code (POM, steps, Gherkin)                 | Must read `CONVENTIONS.md` before starting                         |
| Running any pipeline mode                             | Must read `PIPELINE.md` before starting                            |

---

## File Owners

| File             | Suggested owner                  |
| ---------------- | -------------------------------- |
| `IDENTITY.md`    | QA Lead / Automation Architect   |
| `INTAKE.md`      | QA Lead                          |
| `CONVENTIONS.md` | Senior QA Engineer               |
| `PIPELINE.md`    | QA Lead                          |
| `apps/[app].md`  | QA Engineer assigned to that app |
