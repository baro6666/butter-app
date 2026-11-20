-- Başlangıç verisi: kategoriler, şube ve marka sunumundaki ürünlerden bir kısmı.
-- Fiyat yalnız bilinenlerde dolu; diğerleri yönetim panelinden ya da Kerzz aktarımıyla girilecek.
insert into public.subeler (ad) values ('Bostancı Sahil');

insert into public.kategoriler (id, ad, sira, damga_verir) values
  ('kahve', 'Kahveler', 1, true),
  ('tatli', 'Tatlılar', 2, false),
  ('sandvic', 'Sandviçler', 3, false),
  ('firin', 'Fırın', 4, false),
  ('cay', 'Çay & daha fazlası', 5, true),
  ('mesrubat', 'Meşrubatlar', 6, false),
  ('onsiparis', 'Ön sipariş', 7, false);

insert into public.urunler (kategori_id, ad, ad_en, fiyat, sira, on_siparis) values
  ('kahve', 'Espresso', 'Espresso', null, 1, false),
  ('kahve', 'Pistachio Latte', 'Pistachio Latte', null, 4, false),
  ('tatli', 'San Sebastian Cheesecake', 'San Sebastian Cheesecake', 395, 10, false),
  ('tatli', 'Orman Meyveli Çikolatalı Pasta', 'Forest Fruit Chocolate Cake', null, 11, false),
  ('firin', 'Kruvasan', 'Croissant', null, 20, false),
  ('mesrubat', 'Su', 'Water', 40, 30, false),
  ('onsiparis', 'Bütün San Sebastian', 'Whole San Sebastian', null, 40, true);
