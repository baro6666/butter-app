# butter uygulaması — kapsam (ilk sürüm)

Bu belge, Kasım 2026 prototipinde kararlaştırılan ilk sürümü tanımlar.
Uygulama yalnız butter'a aittir; Fincosto'dan bağımsızdır ve başka firmalara açılmaz.

## Karar: sipariş ve ödeme yok

İlk sürümde uygulamadan sipariş verilmez, ödeme alınmaz, bakiye/cüzdan yoktur. Böylece:

- Kerzz'e sipariş aktarımı, ödeme kuruluşu, iade/iptal süreçleri gerekmez.
- Kasa ve mutfak düzeni değişmez.
- Elektronik para mevzuatı (6493) kapsamına girilmez.

Sipariş ve ödeme, üye tabanı oluştuktan sonra ayrı bir aşama olarak değerlendirilir.

## Parçalar

| Parça | Kim kullanır | Durum |
|---|---|---|
| Müşteri uygulaması (`app/`, iPhone + Android, Expo) | Müşteri | Bu PR'da iskelet ve ekranlar |
| Veritabanı ve kurallar (`supabase/`) | Hepsi | Bu PR'da şema, yetkiler ve testler |
| Kasa ekranı: "Damga ver" (web, telefon/tablet) | Kasiyer | Sonraki adım |
| Yönetim paneli (web, bilgisayar) | Yönetici | Sonraki adım |

## Müşteri uygulaması

- **Ana sayfa:** kahve kartı özeti, "fırından yeni çıktı", kampanyalar, marka tanıtımı, vitrinde öne çıkanlar, şube.
- **Menü:** kategoriler, ürünler, fiyat, vitrin durumu (Normal / Son birkaç / Fırından yeni çıktı / Tükendi).
- **Ürün sayfası:** açıklama, alerjen, kalori, damga verip vermediği, "yanına ne gider", favori.
- **Ön sipariş talebi:** bütün pasta, kutu kruvasan gibi ürünlerde. Ödeme yok; şube müşteriyi arar, ödeme teslimde.
- **Kahve kartı:** sunucuda imzalı, dakikada bir yenilenen QR; damgalar; son ziyaret puanlaması (1–5);
  gizli menü (kart bir kez dolunca açılır); arkadaşını getir (davet kodu).
- **Duyurular:** fırın, vitrin, kampanya, yeni ürün, etkinlik; okunmamış rozeti.
- **Hesap:** favoriler, bildirim izinleri (fırın, favoriler, kampanya = İYS ticari ileti izni), çıkış, **hesabı silme**
  (App Store şartı).
- **Giriş:** telefon + SMS kodu (şifre yok). İlk girişte ad, isteğe bağlı doğum günü, davet kodu, KVKK onayı,
  ayrı ve isteğe bağlı ticari ileti onayı.

Menü ve duyurular giriş yapmadan görülür; kart, favori ve talepler için üyelik gerekir.

## Kahve kartı kuralları (veritabanında, `supabase/migrations`)

- Damga yalnız kasada, personel oturumuyla, müşterinin **o anki** QR'ı okutularak verilir (`damga_ver`).
  QR `<üye>.<dakika>.<imza>` biçiminde, sunucudaki gizli anahtarla imzalı; en çok ~2 dakika geçerli.
- Aynı üyeye `tekrar_dakika` (varsayılan 10) içinde ikinci damga yalnız yönetici onayıyla.
- Damga veren kategoriler `kategoriler.damga_verir`; hedef (varsayılan 8) `kart_ayar.hedef_damga`, 3–15 arası.
- Kart dolunca 1 bedava kahve hakkı; artan damga yeni karta geçer. Hak kasada `bedava_kullandir` ile düşer.
- Davet: davet edilenin ilk damgasında ikisine de 1 damga.
- Müşteri kart, hareket ve puan tablolarına doğrudan yazamaz; yalnız fonksiyonlar değiştirir.
- Kasada müşterinin tam adı değil "Ayşe K." gösterilir.

Testler: `supabase/tests/calistir.sh` (yerel PostgreSQL'de, Supabase taklidiyle; 20 kural testi).

## Yayın için gerekenler (butter tarafı)

1. **Supabase projesi** (AB bölgesi, ör. Frankfurt). Kurulunca `app/.env` doldurulur, migration ve seed yüklenir.
2. **SMS sağlayıcı** (telefonla giriş için): Supabase'in "Send SMS" kancasıyla Türkiye'de çalışan bir sağlayıcı
   (ör. Netgsm, İleti Merkezi). Gönderici adı (başlık) başvurusu gerekir.
3. **İYS kaydı** (ticari ileti için) ve **KVKK aydınlatma metni** (adresi `app/src/ayar.ts` → `KVKK_ADRESI`).
4. **Apple Developer** (şirket hesabı, D-U-N-S numarası) ve **Google Play** geliştirici hesabı.
5. **İçerik:** ürün fotoğrafları, açıklamalar, alerjen ve kalori bilgileri; fiyatlar (Kerzz'den ya da panelden).
6. **Kerzz:** yalnız ürün listesi ve fiyatları **okumak** için erişim (sipariş aktarımı gerekmiyor).

## Sonraki adımlar

1. Kasa "Damga ver" ekranı ve yönetim paneli (web).
2. Anlık bildirimler (Expo Push): fırından çıktı, favori vitrinde, kampanya (yalnız izinli üyelere).
3. Mevsim kartı, doğum günü ikramı otomasyonu, hava durumuna göre öneri.
4. Kerzz'den ürün/fiyat aktarımı.
5. Mağaza yayını (EAS Build → TestFlight / Google Play iç test).
