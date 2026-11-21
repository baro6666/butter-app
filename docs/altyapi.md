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
- `supabase/migrations/20261121090000_bildirim.sql` (21 Kasım 2026)

Canlı denetim: giriş yapmadan menü okunuyor; üyeler, QR üretimi ve gizli anahtar tablosu kapalı.
Uygulamanın web derlemesi canlı veriyle açıldı (menü Supabase'ten geliyor).

Güvenlik danışmanındaki uyarılar bilinçli:
- Giriş yapmış kullanıcının çağırabildiği `SECURITY DEFINER` fonksiyonlar içeride yetki denetler (kasa fonksiyonları
  `personel_mi()`, müşteri fonksiyonları `auth.uid()`).
- `personel_mi()` / `yonetici_mi()` anonim rolde çalıştırılabilir olmalı: menü okuma politikaları bunları çağırır.
- `gizli_ayar` tablosunda politika yok: kimse doğrudan okuyamasın diye.

### Edge Functions

- `personel-ekle`: yönetici panelden kasiyer / yönetici ekler (e-posta + geçici şifre; çağıranın yönetici olduğu
  sunucuda denetlenir). Yüklendi.
- `bildirim-gonder`: zamanı gelen "bildirim" işaretli duyuruları izinli üyelere Expo Push ile gönderir. Her dakika
  `pg_cron` (iş adı `bildirim-gonder`) ve panel yayından hemen sonra çağırır. Yüklendi.
- `sms-gonder`: SMS sağlayıcı bilgileri gelince yüklenecek (`docs/sms.md`).

### İlk yönetici hesabı

Panelde personeli yönetici ekler; ilk yönetici bir kez elle açılır:
1. Supabase → Authentication → Users → **Add user** → kendi e-postanız ve **kendi seçtiğiniz** şifre
   ("Auto confirm" işaretli). Şifre kimseyle paylaşılmaz.
2. Bu kullanıcıyı personel tablosuna yönetici olarak eklemek (Claude ya da SQL editörü):
   `insert into personel (kullanici_id, ad, rol, sube_id) select id, '<Ad Soyad>', 'yonetici', (select id from subeler limit 1) from auth.users where email = '<e-posta>';`

### Bekleyenler

- Telefonla giriş: SMS sağlayıcı bilgileri gelince (`docs/sms.md`).

## Panel adresi

https://butter-panel.expo.app (Expo hosting, proje `@baro6/butter-panel`). Yayın: `panel/README.md`.
