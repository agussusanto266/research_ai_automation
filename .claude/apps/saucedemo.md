# App Config — SauceDemo

---

## App Identity

```
App Name    : saucedemo
Display Name: SauceDemo
Base URL    : https://www.saucedemo.com
Environment : production (demo app — no staging environment)
```

---

## Authentication

```
Auth Required : yes
Auth Type     : form-login
Login URL     : https://www.saucedemo.com  (login is on the home page)
```

### Test Accounts

| Role     | Username                | Password     | Notes                                                       |
| -------- | ----------------------- | ------------ | ----------------------------------------------------------- |
| standard | standard_user           | secret_sauce | Happy path — use for all positive tests                     |
| locked   | locked_out_user         | secret_sauce | Locked — use for negative login cases                       |
| problem  | problem_user            | secret_sauce | Valid but buggy UI — use for visual edge cases only         |
| glitch   | performance_glitch_user | secret_sauce | Valid but slow responses — avoid for timing-sensitive tests |

---

## Pages / Modules

| Page name         | URL path                      | Notes                             |
| ----------------- | ----------------------------- | --------------------------------- |
| Login             | `/`                           | Username + password login form    |
| Inventory         | `/inventory.html`             | Product list with sort and filter |
| Product Detail    | `/inventory-item.html?id=[n]` | Product detail, add to cart       |
| Cart              | `/cart.html`                  | Review items before checkout      |
| Checkout Step 1   | `/checkout-step-one.html`     | Enter buyer information           |
| Checkout Step 2   | `/checkout-step-two.html`     | Review order + total              |
| Checkout Complete | `/checkout-complete.html`     | Order success confirmation        |

---

## Known Quirks & Limitations

- `problem_user` displays wrong product images and some buttons do not work — use only for visual edge cases, not happy path
- `performance_glitch_user` has a 1–5 second delay on every action — do not use for timing-sensitive tests
- No real backend — all state is session-only, refreshing will reset the cart
- No search feature — filtering is only available via the sort dropdown
- `data-test` attributes are available on almost all interactive elements — prioritize `getByTestId()`

---

## Existing Automation Coverage

| Feature           | Feature file                                   | Step definitions                                        | POM                                      |
| ----------------- | ---------------------------------------------- | ------------------------------------------------------- | ---------------------------------------- |
| Healthcheck       | `features/saucedemo/healthcheck.feature`       | `step-definitions/saucedemo/healthcheck.steps.ts`       | —                                        |
| Login             | `features/saucedemo/login.feature`             | `step-definitions/saucedemo/login.steps.ts`             | `pages/saucedemo/LoginPage.ts`           |
| Inventory         | `features/saucedemo/inventory.feature`         | `step-definitions/saucedemo/inventory.steps.ts`         | `pages/saucedemo/InventoryPage.ts`       |
| Cart              | `features/saucedemo/cart.feature`              | `step-definitions/saucedemo/cart.steps.ts`              | `pages/saucedemo/CartPage.ts`            |
| Checkout Step 1   | `features/saucedemo/checkout-step1.feature`    | `step-definitions/saucedemo/checkout.steps.ts`          | `pages/saucedemo/CheckoutPage.ts`        |
| Checkout Step 2   | `features/saucedemo/checkout-step2.feature`    | `step-definitions/saucedemo/checkout.steps.ts`          | `pages/saucedemo/CheckoutPage.ts`        |
| Checkout Complete | `features/saucedemo/checkout-complete.feature` | `step-definitions/saucedemo/checkout-complete.steps.ts` | `pages/saucedemo/CheckoutCompletePage.ts`|
| Product Detail    | `features/saucedemo/product-detail.feature`    | `step-definitions/saucedemo/product-detail.steps.ts`    | `pages/saucedemo/ProductDetailPage.ts`   |

---

## Changelog

| Date       | Change                                   |
| ---------- | ---------------------------------------- |
| 2026-04-26 | Initial config — migrated from CLAUDE.md |
