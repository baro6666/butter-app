# butter — müşteri uygulaması, kasa ve yönetim

butter coffee & bakery (Bostancı Sahil, SAFHA Grup Gıda) için müşteri uygulaması ve işletme araçları.
**Yalnız butter'a aittir; Fincosto'dan bağımsızdır** (Fincosto'ya kod ya da veri eklenmez). Arayüz ve iletişim dili Türkçe.
Kapsam ve kararlar: `docs/kapsam.md`.

## Yapı

- `app/` — müşteri uygulaması (Expo SDK 58, Expo Router, TypeScript). Ekranlar `app/src/app/`.
  `app/AGENTS.md`'deki Expo kurallarına uy (paket eklerken `npx expo install`).
  - `src/veri/kaynak.ts`: Supabase ayarlıysa canlı, değilse cihaz içi örnek veri (`ornekMod`, SMS kodu 123456).
  - `src/tema.ts`: marka renkleri (yeşil Pantone 350 C `#2C5234`, krem 726 C `#EDD3B5`), Jost + fiyatlarda Montserrat.
- `panel/` — kasa ("Damga ver") ve yönetim paneli (Vite + React, HashRouter; https://butter-panel.expo.app, yayın `panel/README.md`).
  Denetim: `cd panel && npm run build`.
- `supabase/functions/` — `personel-ekle` (yüklü), `sms-gonder` (SMS sağlayıcı bekliyor).
- `supabase/migrations/` — şema, RLS ve kahve kartı fonksiyonları. `supabase/seed.sql` başlangıç verisi.
- `supabase/tests/calistir.sh` — yerel PostgreSQL'de Supabase taklidiyle kural testleri.

## Kurallar

- İlk sürümde **sipariş, ödeme, bakiye yok**. Bunları eklemeden önce kullanıcıya sor.
- Damga / bedava kahve yalnız `SECURITY DEFINER` fonksiyonlarla değişir; tablolara istemciden yazma yetkisi açma.
- Kişisel veri (telefon, ad, doğum günü) işlenir: loglara, hata mesajlarına, commit'lere gerçek veri koyma.
- Fiyat, saat, istatistik uydurma; bilinmeyen değer `null` / köşeli parantezli yer tutucu.
- Değişiklikten sonra:
  - `cd app && npx tsc --noEmit && npx expo lint`
  - `supabase/tests/calistir.sh` (şemaya dokunulduysa; yeni kurala test ekle)
  - Ekran değiştiyse: `npx expo export --platform web` ile derleyip Playwright'la 390×844 ekran görüntüsüne bak.
- Değişiklikler dalda yapılır, `main`'e PR ile girer.
