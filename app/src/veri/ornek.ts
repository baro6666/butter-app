// Supabase bağlanmadan uygulamanın açılabilmesi için örnek veri (yalnız geliştirme).
// Fiyatlar örnektir; canlıda yönetim panelinden / Kerzz'den gelir.
import type { Duyuru, Kategori, Sube, Urun } from './tipler';

export const ornekKategoriler: Kategori[] = [
  { id: 'kahve', ad: 'Kahveler', sira: 1, damga_verir: true },
  { id: 'tatli', ad: 'Tatlılar', sira: 2, damga_verir: false },
  { id: 'sandvic', ad: 'Sandviçler', sira: 3, damga_verir: false },
  { id: 'firin', ad: 'Fırın', sira: 4, damga_verir: false },
  { id: 'cay', ad: 'Çay & daha fazlası', sira: 5, damga_verir: true },
  { id: 'mesrubat', ad: 'Meşrubatlar', sira: 6, damga_verir: false },
  { id: 'onsiparis', ad: 'Ön sipariş', sira: 7, damga_verir: false },
];

let sira = 0;
function u(id: string, kategori_id: string, ad: string, ad_en: string, fiyat: number | null, ek: Partial<Urun> = {}): Urun {
  return {
    id, kategori_id, ad, ad_en, fiyat, aciklama: null, alerjenler: null, kalori: null, foto_url: null,
    eslik_urun_id: null, vitrin_durumu: 'normal', vitrin_notu: null, on_siparis: kategori_id === 'onsiparis', sira: sira++, ...ek,
  };
}

export const ornekUrunler: Urun[] = [
  u('espresso', 'kahve', 'Espresso', 'Espresso', 110, { eslik_urun_id: 'kruvasan' }),
  u('americano', 'kahve', 'Americano', 'Americano', 130, { eslik_urun_id: 'kruvasan' }),
  u('latte', 'kahve', 'Latte', 'Caffè Latte', 150, { eslik_urun_id: 'kruvasan' }),
  u('pistachio', 'kahve', 'Pistachio Latte', 'Pistachio Latte', 175, { eslik_urun_id: 'sansebastian' }),
  u('icedlatte', 'kahve', 'Soğuk Latte', 'Iced Latte', 160, { eslik_urun_id: 'brownie' }),
  u('sansebastian', 'tatli', 'San Sebastian Cheesecake', 'San Sebastian Cheesecake', 395, { vitrin_durumu: 'son', vitrin_notu: 'Son 3 dilim', eslik_urun_id: 'americano' }),
  u('ormanpasta', 'tatli', 'Orman Meyveli Çikolatalı Pasta', 'Forest Fruit Chocolate Cake', 285, { vitrin_durumu: 'son', vitrin_notu: 'Son 5 dilim', eslik_urun_id: 'americano' }),
  u('brownie', 'tatli', 'Brownie', 'Brownie', 180, { eslik_urun_id: 'latte' }),
  u('ekler', 'tatli', 'Ekler', 'Éclair', 120, { vitrin_durumu: 'son', vitrin_notu: 'Son 2', eslik_urun_id: 'espresso' }),
  u('tost', 'sandvic', 'Ekşi Mayalı Tost', 'Sourdough Toast', 260, { eslik_urun_id: 'latte' }),
  u('bagel', 'sandvic', 'Bagel', 'Bagel', 240, { eslik_urun_id: 'americano' }),
  u('kruvasan', 'firin', 'Kruvasan', 'Croissant', 120, { vitrin_durumu: 'firin', eslik_urun_id: 'latte' }),
  u('kurabiye', 'firin', 'Kurabiye', 'Cookie', 90, { eslik_urun_id: 'latte' }),
  u('chai', 'cay', 'Chai Latte', 'Chai Latte', 150, { eslik_urun_id: 'kurabiye' }),
  u('matcha', 'cay', 'Matcha Latte', 'Matcha Latte', 170, { eslik_urun_id: 'kurabiye' }),
  u('sahlep', 'cay', 'Sahlep', 'Salep', 140, { eslik_urun_id: 'kurabiye' }),
  u('su', 'mesrubat', 'Su', 'Water', 40),
  u('butuncheesecake', 'onsiparis', 'Bütün San Sebastian', 'Whole San Sebastian · 8 dilim', null),
  u('butunpasta', 'onsiparis', 'Doğum Günü Pastası', 'Birthday Cake · isim yazılır', null),
  u('kruvasankutu', 'onsiparis', 'Kruvasan Kutusu', 'Croissant Box · 12 adet', null),
];

const simdi = Date.now();
const once = (dk: number) => new Date(simdi - dk * 60000).toISOString();

export const ornekDuyurular: Duyuru[] = [
  { id: 'd1', tur: 'firin', baslik: 'Kruvasanlar sıcak', metin: 'Bu sabahın ikinci tepsisi vitrinde.', urun_id: 'kruvasan', yayin_zamani: once(10) },
  { id: 'd2', tur: 'vitrin', baslik: 'San Sebastian: son 3 dilim', metin: 'Akşama kalmadan uğrayın.', urun_id: 'sansebastian', yayin_zamani: once(60) },
  { id: 'd3', tur: 'kampanya', baslik: 'Akşam fırsatı', metin: '[Saat] sonrası günün fırın ürünlerinde kahve kartı üyelerine özel indirim.', urun_id: 'kruvasan', yayin_zamani: once(300) },
  { id: 'd4', tur: 'yeni', baslik: 'Pistachio Latte menüde', metin: 'Antep fıstıklı yeni latte.', urun_id: 'pistachio', yayin_zamani: once(1500) },
];

export const ornekSube: Sube = {
  id: 'bostanci', ad: 'Bostancı Sahil', adres: null, telefon: null, calisma_saatleri: null, enlem: null, boylam: null,
};
