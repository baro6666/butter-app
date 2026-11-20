# butter

butter coffee & bakery (Bostancı Sahil) müşteri uygulaması, kasa ekranı ve yönetim paneli.
Bu depo yalnız butter'a aittir; Fincosto'dan bağımsızdır.

- Kapsam ve kararlar: [`docs/kapsam.md`](docs/kapsam.md)
- Müşteri uygulaması: [`app/`](app) (Expo, iPhone + Android)
- Veritabanı ve kurallar: [`supabase/`](supabase)

## Uygulamayı denemek

```bash
cd app
npm install
npx expo start
```

Supabase bilgileri `app/.env`'de yoksa uygulama örnek veriyle açılır (SMS kodu: 123456).

## Veritabanı testleri

```bash
supabase/tests/calistir.sh
```
