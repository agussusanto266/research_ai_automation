# INTAKE.md — Pipeline Intake & Input Validation

> Run this protocol BEFORE executing any pipeline.
> App config reference: `.claude/apps/[app].md`

---

## When the Protocol Is Active vs Skipped

**Active** — user starts a session without explicitly specifying a path or inputs.
Example triggers: _"start"_, _"generate test cases"_, _"help me with testing"_

**Skipped (skip steps 1–2)** — user has already provided the path and all required inputs in one message.
Example: `"Mode 1 Path A: Analyze the following PRD [...]"` → go directly to step 3.

---

## Step 1 — Path Selection

Display the following:

```
Hello! Before we start, choose a pipeline path:

  A — Path A (PRD)            Generate test cases from a PRD document
  B — Path B (Exploratory)    Generate test cases by exploring the web app
  C — Path C (Manual TC)      Automate manually created test cases

Type A, B, or C:
```

---

## Step 2 — Input Validation per Path

Validate all fields below before continuing. If any are missing → ask one by one.

> **Timing matters:** As soon as the user mentions the **target app**, read `.claude/apps/[app].md`
> using the Read tool. Credentials and quirks from that file are used for validation in this step —
> do not wait until Step 3.

### Path A — PRD

| Input        | Format                                              | Status         |
| ------------ | --------------------------------------------------- | -------------- |
| Target app   | App name — immediately load `.claude/apps/[app].md` | Required first |
| PRD          | File at `input/prd/[filename]` or pasted in chat    | Required       |
| Feature name | Short string — `login`, `checkout`, `cart`          | Required       |

> If PRD is pasted in chat → save to `input/prd/[feature]_[YYYY-MM-DD].txt` before continuing.

### Path B — Exploratory

| Input        | Format                                              | Status                                                           |
| ------------ | --------------------------------------------------- | ---------------------------------------------------------------- |
| Target app   | App name — immediately load `.claude/apps/[app].md` | Required first                                                   |
| Target URL   | Full URL of the page to explore                     | Required                                                         |
| Feature name | Short string                                        | Required                                                         |
| Credentials  | username + password                                 | Required if auth needed — pull from `apps/[app].md` if available |

### Path C — Manual Test Case

| Input         | Format                                              | Status                                |
| ------------- | --------------------------------------------------- | ------------------------------------- |
| Target app    | App name — immediately load `.claude/apps/[app].md` | Required first                        |
| CSV file path | `input/testcases/[filename].csv`                    | Required — file must already exist    |
| Target URL    | URL of the page covered by these test cases         | Required — for locator identification |

> If CSV file does not yet exist in `input/testcases/` → ask the user to upload it first, do not continue.

---

## Step 3 — Confirmation Gate

Once all inputs are collected, display the following summary before executing:

```
Summary before starting:

  Path     : [A / B / C]
  App      : [app name]
  Feature  : [feature name]
  Input    : [summary of received inputs]
  Mode     : [Mode 1+2+3 / Mode 2B+3 / Mode 3C]
  Output   :
    - output/[folder per path]/[feature]_[YYYY-MM-DD].csv        (Path A or B only — staging, review first)
    - features/[app]/[feature].feature                            (direct to production)
    - pages/[PageName]Page.ts                                     (direct to production)
    - step-definitions/[app]/[feature].steps.ts                   (direct to production)
    - package.json — script "test:[feature]" added                (auto-opens report after run)
    - output/feedback/[feature]_prd_[YYYY-MM-DD].txt              (if PRD does not pass threshold)

Proceed? (yes / no / change)
```

| Answer   | Action                                                                    |
| -------- | ------------------------------------------------------------------------- |
| `yes`    | Execute pipeline per `PIPELINE.md` (apps/[app].md already read in Step 2) |
| `no`     | Stop, ask what the user wants to change                                   |
| `change` | Return to the relevant step                                               |

---

## Quick Flow

```
User starts session
      ↓
Path + inputs already complete?
  ├── Yes → Step 3 (confirmation) → execute
  └── No
        ↓
  Step 1: Choose path (A / B / C)
        ↓
  Step 2: Validate required inputs per path
        ↓
  Step 3: Summary + confirmation
        ↓
  Execute PIPELINE.md
```
