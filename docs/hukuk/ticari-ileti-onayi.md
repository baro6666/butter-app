# Ticari elektronik ileti onayı (uygulamadaki onay kutusunun metni)

> **TASLAK.** Avukat kontrolünden geçmeli. Uygulamada KVKK onayından **ayrı** ve **isteğe bağlı** sorulur.

"[SAFHA Grup Gıda unvanı] tarafından, butter markasının kampanya, indirim ve yeni ürünleri hakkında cep telefonu
numarama SMS ve uygulama bildirimi yoluyla ticari elektronik ileti gönderilmesine onay veriyorum. Onayımı istediğim
zaman uygulamadaki Hesap → Bildirimler ekranından ya da iletilerdeki ret bağlantısıyla geri alabilirim."

Notlar:
- Onay verilen tarih veritabanında tutulur (`uyeler.kampanya_izni_tarih`).
- Onaylar ve retler **İYS'ye (İleti Yönetim Sistemi)** bildirilmelidir. Firma İYS'ye kayıtlı olmalı; SMS sağlayıcıların
  çoğu (Netgsm vb.) İYS entegrasyonu sunar. Doğrulama kodu SMS'leri bilgilendirme iletisidir, İYS onayı gerektirmez.
