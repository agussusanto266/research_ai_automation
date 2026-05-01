# App Config Template

> Copy this file, rename it to `[app-name].md`, then fill in all fields.
> Fields marked [REQUIRED] must be completed before the pipeline can run.

---

## App Identity

```
App Name    : [REQUIRED] short app name, e.g. "saucedemo", "tokopedia-seller"
Display Name: [REQUIRED] full name, e.g. "SauceDemo", "Tokopedia Seller Center"
Base URL    : [REQUIRED] e.g. https://www.example.com
Environment : [REQUIRED] staging / production / local
```

---

## Authentication

```
Auth Required : [REQUIRED] yes / no
Auth Type     : form-login / oauth / api-key / none
Login URL     : [if different from Base URL]
```

### Test Accounts

| Role | Username | Password | Notes |
|---|---|---|---|
| [role] | [username] | [password] | [e.g. "Happy path — use for all positive tests"] |
| [role] | [username] | [password] | [e.g. "Locked — use for negative login cases"] |

> Do not store production credentials here. This file is for test accounts only.

---

## Pages / Modules

List the main pages or modules to be tested.

| Page name | URL path | Notes |
|---|---|---|
| [Name] | `/[path]` | [brief description] |
| [Name] | `/[path]` | [brief description] |

---

## Known Quirks & Limitations

Document app-specific behavior that needs to be known when generating test cases or automation.

- [ ] [example: "Submit button is disabled for 2 seconds after page load — do not assert too quickly"]
- [ ] [example: "API response is slow in staging — add timeout to BasePage if needed"]
- [ ] [example: "user X shows buggy UI — use only for visual edge cases, not happy path"]

---

## Existing Automation Coverage

Update this section every time a new feature is automated.

| Feature | Feature file | Step definitions | POM |
|---|---|---|---|
| [feature name] | `features/[app]/[file].feature` | `step-definitions/[app]/[file].steps.ts` | `pages/[Name]Page.ts` |

---

## Changelog

| Date | Change |
|---|---|
| [YYYY-MM-DD] | Initial config |
