# App Config — OrangeHRM

---

## App Identity

```
App Name    : orangehrm
Display Name: OrangeHRM
Base URL    : https://opensource-demo.orangehrmlive.com
Environment : production (public demo — resets daily)
```

---

## Authentication

```
Auth Required : yes
Auth Type     : form-login
Login URL     : https://opensource-demo.orangehrmlive.com/web/index.php/auth/login
```

### Test Accounts

| Role  | Username | Password | Notes                                              |
|-------|----------|----------|----------------------------------------------------|
| admin | Admin    | admin123 | Full access — use for all positive tests           |

---

## Pages / Modules

| Page name        | URL path                                      | Notes                                    |
|------------------|-----------------------------------------------|------------------------------------------|
| Login            | `/web/index.php/auth/login`                   | Username + password form                 |
| Dashboard        | `/web/index.php/dashboard/index`              | Landing page after successful login      |
| Forgot Password  | `/web/index.php/auth/requestPasswordResetCode`| Password reset request form              |
| My Info          | `/web/index.php/pim/viewPersonalDetails/empNumber/...` | Personal info module            |
| Admin            | `/web/index.php/admin/viewSystemUsers`        | Admin module — requires admin role       |

---

## Known Quirks & Limitations

- Demo site resets to default state daily — avoid persistent data creation tests
- No `data-test` attributes; use `name`, `role`, and CSS class selectors
- Login form uses OrangeHRM-specific CSS classes: `.oxd-input`, `.oxd-button`
- Error messages appear as inline text below fields (Required) and as a toast-style
  alert below the form (Invalid credentials)
- Password field is cleared on failed login; username field retains its value
- Post-login redirect lands on `/web/index.php/dashboard/index` — assert this URL

---

## Existing Automation Coverage

| Feature | Feature file                          | Step definitions                                    | POM                          |
|---------|---------------------------------------|-----------------------------------------------------|------------------------------|
| Login   | `features/orangehrm/login.feature`   | `step-definitions/orangehrm/login.steps.ts`         | `pages/OrangeHRMLoginPage.ts`|

---

## Changelog

| Date       | Change          |
|------------|-----------------|
| 2026-05-01 | Initial config  |
