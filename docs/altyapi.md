# Altyapı

## Supabase

| | |
|---|---|
| Proje | `butter` (kimlik `amcqfkcerlvjlfzllngy`) |
| Bölge | Frankfurt (eu-central-1) |
| Plan | Ücretsiz (1 hafta kullanılmazsa uyur; müşteriler kullanmaya başlayınca Pro'ya geçilmeli) |
| API adresi | `https://amcqfkcerlvjlfzllngy.supabase.co` |
| Yayımlanabilir anahtar | `sb_publishable_-VVKkinkzvf3wtd_HOurpQ_ubjuC7Tl` (uygulamaya gömülür, gizli değildir; yetkiyi RLS belirler) |

`app/.env` (depoya girmez):

```
EXPO_PUBLIC_SUPABASE_URL=https://amcqfkcerlvjlfzllngy.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_-VVKkinkzvf3wtd_HOurpQ_ubjuC7Tl
```

**Gizli anahtarlar (service_role, veritabanı şifresi) hiçbir dosyaya ve sohbete yazılmaz.**

### Yüklenenler (20 Kasım 2026)

- `supabase/migrations/20261120090000_baslangic.sql`
- `supabase/seed.sql` (1 şube, 7 kategori, 7 ürün; fiyatlar yalnız bilinenlerde)

Canlı denetim: giriş yapmadan menü okunuyor; üyeler, QR üretimi ve gizli anahtar tablosu kapalı.
Uygulamanın web derlemesi canlı veriyle açıldı (menü Supabase'ten geliyor).

Güvenlik danışmanındaki uyarılar bilinçli:
- Giriş yapmış kullanıcının çağırabildiği `SECURITY DEFINER` fonksiyonlar içeride yetki denetler (kasa fonksiyonları
  `personel_mi()`, müşteri fonksiyonları `auth.uid()`).
- `personel_mi()` / `yonetici_mi()` anonim rolde çalıştırılabilir olmalı: menü okuma politikaları bunları çağırır.
- `gizli_ayar` tablosunda politika yok: kimse doğrudan okuyamasın diye.

### Bekleyenler

- Telefonla giriş: SMS sağlayıcı bilgileri gelince (`docs/sms.md`).
- İlk yönetici ve kasiyer hesapları: yönetim paneliyle birlikte.
