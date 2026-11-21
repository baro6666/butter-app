# Müşteri girişi (ücretsiz): Apple, Google, e-posta kodu

SMS yok. Uygulama, Supabase'te açık olan yöntemleri kendisi görür (`/auth/v1/settings`) ve yalnız onların düğmesini
gösterir: bir yöntem açılınca uygulamayı güncellemeye gerek yoktur.

Supabase ayarları (kod 6 hane, 10 dk; site adresi, dönüş adresleri `butter://`, `exp://`) Claude tarafından yapıldı.

## 1. E-posta kodu — Brevo (ücretsiz, günde 300 e-posta) — ÇALIŞIYOR (21.11.2026)

Durum: Brevo SMTP Supabase'e bağlı; Türkçe 6 haneli kod şablonu yüklü; saatlik sınır 100. Gönderen şimdilik
`t.barandinc@gmail.com` (Brevo'da doğrulanmış). Brevo'da SMTP için IP engeli kapalı (Supabase IP'leri sabit değil).
Kalan: `buttercoffeebakery.com` alan adının Brevo'da doğrulanması (DNS Cloudflare'de, sosyal medya ekibinin hesabında;
brevo-code TXT + DKIM kayıtları). Doğrulanınca Supabase'te gönderen adresi `baran@buttercoffeebakery.com` yapılır.
Alan adının e-postası Hostinger'da (MX, SPF); bu kayıtlara dokunulmaz.


Supabase'in kendi e-posta servisi saatte birkaç e-postayla sınırlı ve şablon değiştirilemiyor; Brevo bağlanmalı.

1. brevo.com → ücretsiz hesap.
2. **Senders, Domains & Dedicated IPs → Senders → Add a sender**: gönderen adı `butter`, e-posta (alan adı varsa
   `uygulama@...`; yoksa kendi adresiniz). Gelen doğrulama e-postasına tıklayın.
3. **SMTP & API → SMTP** sekmesi: "Generate a new SMTP key". Ekranda SMTP sunucusu (`smtp-relay.brevo.com`, port 587),
   giriş (login) ve anahtar görünür.
4. Supabase → butter → **Authentication → Emails → SMTP Settings** → "Enable custom SMTP": gönderen adres ve ad,
   host `smtp-relay.brevo.com`, port `587`, kullanıcı adı = Brevo SMTP login, şifre = SMTP anahtarı → Save.
   (Anahtar yalnız bu ekrana girilir; sohbete yazılmaz.)
5. Claude'a "SMTP tamam" deyin: Türkçe, 6 haneli kodlu e-posta şablonlarını yükler ve dener.

## 2. Google ile giriş

1. console.cloud.google.com → yeni proje `butter`.
2. **APIs & Services → OAuth consent screen**: External, uygulama adı `butter`, destek e-postası; kapsamlar: email,
   profile. Yayın durumu: "In production".
3. **Credentials → Create credentials → OAuth client ID → Web application**:
   Authorized redirect URI: `https://amcqfkcerlvjlfzllngy.supabase.co/auth/v1/callback`
4. Çıkan **Client ID** ve **Client secret**'ı Supabase → **Authentication → Sign In / Providers → Google**'a girin,
   etkinleştirin.

## 3. Apple ile giriş (iPhone)

1. developer.apple.com → Certificates, Identifiers & Profiles → **Identifiers** → `com.butter.app` (yoksa oluşturun)
   → **Sign In with Apple** yeteneğini açın.
2. Supabase → **Authentication → Sign In / Providers → Apple** → etkinleştirin; "Client IDs" alanına `com.butter.app`
   (uygulama içi yerel giriş için bu yeterli; web girişi kullanılmıyor).
3. Not: Apple ile giriş Expo Go'da değil, TestFlight / App Store derlemesinde çalışır.
