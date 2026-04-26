# App Config — SauceDemo

---

## App Identity

```
App Name    : saucedemo
Display Name: SauceDemo
Base URL    : https://www.saucedemo.com
Environment : production (demo app — tidak ada staging)
```

---

## Authentication

```
Auth Required : yes
Auth Type     : form-login
Login URL     : https://www.saucedemo.com  (login ada di halaman utama)
```

### Test Accounts

| Role | Username | Password | Keterangan |
|---|---|---|---|
| standard | standard_user | secret_sauce | Happy path — gunakan untuk semua positive test |
| locked | locked_out_user | secret_sauce | Locked — untuk negative case login |
| problem | problem_user | secret_sauce | Valid tapi UI buggy — untuk edge case visual |
| glitch | performance_glitch_user | secret_sauce | Valid tapi response lambat — untuk timing sensitivity |

---

## Pages / Modules

| Nama halaman | URL path | Keterangan |
|---|---|---|
| Login | `/` | Form login username + password |
| Inventory | `/inventory.html` | Daftar produk, sort, filter |
| Product Detail | `/inventory-item.html?id=[n]` | Detail produk, add to cart |
| Cart | `/cart.html` | Review item sebelum checkout |
| Checkout Step 1 | `/checkout-step-one.html` | Input info pembeli |
| Checkout Step 2 | `/checkout-step-two.html` | Review order + total |
| Checkout Complete | `/checkout-complete.html` | Konfirmasi order sukses |

---

## Known Quirks & Limitations

- `problem_user` menampilkan gambar produk yang salah dan beberapa tombol tidak berfungsi — gunakan hanya untuk edge case visual, bukan happy path
- `performance_glitch_user` memiliki delay 1–5 detik pada setiap action — jangan gunakan untuk timing-sensitive test
- Tidak ada backend nyata — semua state hanya di session, refresh akan reset cart
- Tidak ada fitur search — filter hanya tersedia via dropdown sort
- `data-test` attribute tersedia di hampir semua elemen interaktif — prioritaskan `getByTestId()`

---

## Existing Automation Coverage

| Fitur | Feature file | Status |
|---|---|---|
| Login | `features/login.feature` | automated |

---

## Changelog

| Tanggal | Perubahan |
|---|---|
| 2026-04-26 | Initial config — migrasi dari CLAUDE.md |
