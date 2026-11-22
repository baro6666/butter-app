// Kerzz Cloud → butter: kategoriler, ürünler, fiyatlar, fotoğraflar.
// Her gece pg_cron ve paneldeki "Kerzz'den güncelle" çağırır. Kerzz bilgisi Supabase secrets'ta
// (KERZZ_KULLANICI, KERZZ_SIFRE); yalnız okuma yapılır, Kerzz'e hiçbir şey yazılmaz.
// Panelde girilenler (vitrin, açıklama, alerjen, kalori, eşlik, ön sipariş) ezilmez.
import { createClient } from 'npm:@supabase/supabase-js@2';

const API = 'https://api.kerzz.cloud/manager/api';
const RESTORAN = 'QR6BM'; // Kerzz'de "butter" (aynı hesaptaki Green Salads alınmaz)
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
// Bu adları taşıyan kategorilerdeki ürünler kahve kartına damga verir (panelden değiştirilebilir)
const DAMGA_KATEGORI = /kahve|coffee|espresso|latte|çay|cay|tea|chai|matcha|sahlep|filtre|frappe|frozen|sıcak içecek|sicak icecek/i;
// Sos, ekstra shot gibi eklentiler uygulamada ayrı ürün olarak gösterilmez (yeni kategoride; panelden açılabilir)
const GIZLI_KATEGORI = /ekstra|extra|eklenti|modif/i;
const ALERJEN: Record<string, string> = {
  gluten: 'gluten', dairy: 'süt', milk: 'süt', eggs: 'yumurta', egg: 'yumurta', nuts: 'sert kabuklu yemiş',
  peanuts: 'yer fıstığı', peanut: 'yer fıstığı', soy: 'soya', sesame: 'susam', fish: 'balık', shellfish: 'kabuklu deniz ürünü',
  mustard: 'hardal', celery: 'kereviz', sulphites: 'sülfit', sulfites: 'sülfit', lupin: 'acı bakla',
};

type Ceviri = Record<string, { name?: string; title?: string; description?: string } | string | undefined>;
interface KKategori { _id: string; isActive?: boolean; sortOrder?: number; imageUrl?: string; translations?: Ceviri; name?: string }
interface KUrun {
  _id: string; sku?: string; price?: number; imageUrl?: string; isActive?: boolean; showInApp?: boolean;
  categoryId?: string; sortOrder?: number; translations?: Ceviri; name?: string; description?: string;
  allergens?: unknown[];
}

const ad = (t: Ceviri | undefined, dil: string, yedek?: string): string | null => {
  const v = t?.[dil];
  if (typeof v === 'string') return v.trim() || null;
  return (v?.name ?? v?.title ?? yedek ?? '').trim() || null;
};
const aciklama = (t: Ceviri | undefined): string | null => {
  const v = t?.tr;
  return typeof v === 'object' && v?.description ? v.description.trim() || null : null;
};
const alerjen = (a: unknown[] | undefined): string | null => {
  if (!Array.isArray(a) || !a.length) return null;
  return a.map((x) => (typeof x === 'string' ? x : (x as { name?: string })?.name ?? '').trim())
    .filter(Boolean).map((x) => ALERJEN[x.toLowerCase()] ?? x).join(', ') || null;
};

async function kerzz(yol: string, token?: string, govde?: unknown) {
  const h: Record<string, string> = { 'Accept-Language': 'tr', 'x-lang': 'tr', 'Content-Type': 'application/json', 'x-restaurant-id': RESTORAN };
  if (token) h.Authorization = 'Bearer ' + token;
  const r = await fetch(API + yol, { method: govde ? 'POST' : 'GET', headers: h, body: govde ? JSON.stringify(govde) : undefined });
  const j = await r.json().catch(() => null);
  if (!r.ok) throw new Error(`Kerzz ${r.status} ${yol}`);
  return j && typeof j === 'object' && 'data' in j ? (j as { data: unknown }).data : j;
}

function tokenBul(o: unknown, d = 0): string | undefined {
  if (!o || typeof o !== 'object' || d > 6) return undefined;
  for (const [k, v] of Object.entries(o as Record<string, unknown>)) {
    if (k === 'accessToken' && typeof v === 'string') return v;
    const x = tokenBul(v, d + 1);
    if (x) return x;
  }
}

Deno.serve(async (istek) => {
  if (istek.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const yanit = (durum: number, govde: unknown) =>
    new Response(JSON.stringify(govde), { status: durum, headers: { ...CORS, 'Content-Type': 'application/json' } });

  // Yetki: gece görevinin iç anahtarı ya da panelden aktif yönetici oturumu
  const anahtar = istek.headers.get('x-aktar-anahtar');
  let izin = false;
  if (anahtar) {
    const { data } = await sb.from('gizli_ayar').select('deger').eq('anahtar', 'kerzz_cron').maybeSingle();
    izin = !!data && data.deger === anahtar;
  } else {
    const cagiran = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: istek.headers.get('Authorization') ?? '' } } });
    const { data } = await cagiran.rpc('yonetici_mi');
    izin = data === true;
  }
  if (!izin) return yanit(403, { hata: 'Bu işlem için yönetici olmalısınız.' });

  // Aynı anda iki aktarım olmasın
  const { data: suren } = await sb.from('kerzz_aktarim').select('id').eq('durum', 'calisiyor')
    .gt('baslangic', new Date(Date.now() - 5 * 60_000).toISOString()).limit(1);
  if (suren?.length) return yanit(409, { hata: 'Aktarım zaten sürüyor, birazdan tekrar bakın.' });

  const { data: kayit } = await sb.from('kerzz_aktarim').insert({}).select('id').single();
  const bitir = (alanlar: Record<string, unknown>) => sb.from('kerzz_aktarim').update({ ...alanlar, bitis: new Date().toISOString() }).eq('id', kayit!.id);

  try {
    const giris = await kerzz('/auth/business/login', undefined, {
      identifier: Deno.env.get('KERZZ_KULLANICI'), password: Deno.env.get('KERZZ_SIFRE'), redirectUri: 'https://admin.kerzz.cloud',
    });
    const token = tokenBul(giris);
    if (!token) throw new Error('Kerzz girişi başarısız (kullanıcı adı / şifre?)');

    const menu = (await kerzz('/menu/with-inheritance', token)) as { items?: KUrun[]; categories?: KKategori[] };
    const kategoriler = menu.categories ?? [];
    const urunler = menu.items ?? [];
    if (!urunler.length) throw new Error('Kerzz menüsü boş döndü');
    const simdi = new Date().toISOString();

    // Kategoriler: Kerzz kimliğiyle eşle; yeni olanlara k_<kimlik> kimliği
    const { data: mevcutKat } = await sb.from('kategoriler').select('id, kerzz_id, damga_verir');
    const katHarita = new Map<string, string>();
    for (const k of kategoriler) {
      const var_ = (mevcutKat ?? []).find((m) => m.kerzz_id === k._id);
      const id = var_?.id ?? `k_${k._id}`;
      const kAd = ad(k.translations, 'tr', k.name) ?? 'Kategori';
      const satir: Record<string, unknown> = { id, kerzz_id: k._id, ad: kAd, sira: k.sortOrder ?? 0 };
      // Görünürlük ve damga ilk aktarımda belirlenir; sonra panelden yönetilir (Kerzz'de pasifse gizlenir)
      if (!var_) {
        satir.damga_verir = DAMGA_KATEGORI.test(kAd);
        satir.gorunur = k.isActive !== false && !GIZLI_KATEGORI.test(kAd);
      } else if (k.isActive === false) satir.gorunur = false;
      const { error } = await sb.from('kategoriler').upsert(satir, { onConflict: 'id' });
      if (error) throw new Error('Kategori yazılamadı: ' + error.message);
      katHarita.set(k._id, id);
    }

    // Ürünler: Kerzz kimliği (kerzz_kodu) ile eşle
    const { data: mevcut } = await sb.from('urunler').select('id, kerzz_kodu, aciklama, alerjenler, kerzz_aktif');
    const mevcutHarita = new Map((mevcut ?? []).filter((m) => m.kerzz_kodu).map((m) => [m.kerzz_kodu as string, m]));
    let eklenen = 0, guncellenen = 0;
    const kerzzIdleri = new Set<string>();
    for (const u of urunler) {
      const kategori = u.categoryId ? katHarita.get(u.categoryId) : undefined;
      if (!kategori) continue; // kategorisi olmayan / değiştirici ürünler
      kerzzIdleri.add(u._id);
      const eski = mevcutHarita.get(u._id);
      const aktif = u.isActive !== false && u.showInApp !== false;
      const satir: Record<string, unknown> = {
        kerzz_kodu: u._id, kerzz_sku: u.sku ?? null, kerzz_guncelleme: simdi,
        kategori_id: kategori,
        ad: ad(u.translations, 'tr', u.name) ?? u.sku ?? 'Ürün',
        ad_en: ad(u.translations, 'en'),
        fiyat: typeof u.price === 'number' ? u.price : null,
        foto_url: u.imageUrl || null,
        sira: u.sortOrder ?? 0,
        kerzz_aktif: aktif,
      };
      // Görünürlük yalnız ilk aktarımda ya da Kerzz'de aktif/pasif değişince Kerzz'e uyar; aksi hâlde panel kararı kalır
      if (!eski || eski.kerzz_aktif !== aktif) satir.gorunur = aktif;
      if (!eski?.aciklama) satir.aciklama = aciklama(u.translations);
      if (!eski?.alerjenler) satir.alerjenler = alerjen(u.allergens);
      if (eski) {
        const { error } = await sb.from('urunler').update(satir).eq('id', eski.id);
        if (error) throw new Error('Ürün güncellenemedi: ' + error.message);
        guncellenen++;
      } else {
        const { error } = await sb.from('urunler').insert(satir);
        if (error) throw new Error('Ürün eklenemedi: ' + error.message);
        eklenen++;
      }
    }

    // Kerzz'de artık olmayanları ve Kerzz öncesi elle girilmiş örnekleri gizle (ön sipariş ürünleri hariç)
    const gizlenecek = (mevcut ?? []).filter((m) => !m.kerzz_kodu || !kerzzIdleri.has(m.kerzz_kodu as string)).map((m) => m.id);
    let gizlenen = 0;
    if (gizlenecek.length) {
      const { data } = await sb.from('urunler').update({ gorunur: false }).in('id', gizlenecek).eq('on_siparis', false).eq('gorunur', true).select('id');
      gizlenen = data?.length ?? 0;
    }
    // Kerzz'e bağlı olmayan eski kategorileri gizle (ön sipariş hariç)
    await sb.from('kategoriler').update({ gorunur: false }).is('kerzz_id', null).neq('id', 'onsiparis');

    await bitir({ durum: 'tamam', kategori: kategoriler.length, eklenen, guncellenen, gizlenen });
    return yanit(200, { kategori: kategoriler.length, eklenen, guncellenen, gizlenen });
  } catch (e) {
    const hata = e instanceof Error ? e.message : String(e);
    await bitir({ durum: 'hata', hata });
    return yanit(500, { hata });
  }
});
