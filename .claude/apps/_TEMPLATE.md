# App Config Template

> Salin file ini, rename ke `[app-name].md`, lalu isi semua field.
> Field bertanda [WAJIB] harus diisi sebelum pipeline bisa dijalankan.

---

## App Identity

```
App Name    : [WAJIB] nama singkat app, e.g. "saucedemo", "tokopedia-seller"
Display Name: [WAJIB] nama lengkap, e.g. "SauceDemo", "Tokopedia Seller Center"
Base URL    : [WAJIB] e.g. https://www.example.com
Environment : [WAJIB] staging / production / local
```

---

## Authentication

```
Auth Required : [WAJIB] yes / no
Auth Type     : form-login / oauth / api-key / none
Login URL     : [jika berbeda dari Base URL]
```

### Test Accounts

| Role | Username | Password | Keterangan |
|---|---|---|---|
| [role] | [username] | [password] | [e.g. "Happy path — gunakan untuk semua positive test"] |
| [role] | [username] | [password] | [e.g. "Locked — untuk negative case login"] |

> Jangan simpan credential production di sini. File ini untuk test accounts saja.

---

## Pages / Modules

Daftarkan halaman atau modul utama yang akan di-test.

| Nama halaman | URL path | Keterangan |
|---|---|---|
| [Nama] | `/[path]` | [deskripsi singkat] |
| [Nama] | `/[path]` | [deskripsi singkat] |

---

## Known Quirks & Limitations

Catat perilaku khusus app ini yang perlu diketahui saat generate test cases atau automation.

- [ ] [contoh: "Tombol submit disabled selama 2 detik setelah page load — jangan assert terlalu cepat"]
- [ ] [contoh: "API response lambat di staging — tambah timeout di BasePage jika diperlukan"]
- [ ] [contoh: "user X menampilkan UI buggy — hanya gunakan untuk edge case visual, bukan happy path"]

---

## Existing Automation Coverage

Update bagian ini setiap kali ada fitur baru yang sudah di-automate.

| Fitur | Feature file | Status |
|---|---|---|
| [nama fitur] | `features/[file].feature` | automated / partial / manual only |

---

## Changelog

| Tanggal | Perubahan |
|---|---|
| [YYYY-MM-DD] | Initial config |
