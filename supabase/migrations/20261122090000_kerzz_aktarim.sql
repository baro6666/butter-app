-- Kerzz Cloud'dan ürün, kategori, fiyat ve fotoğraf aktarımı (supabase/functions/kerzz-aktar).
-- Kerzz'den gelen alanlar: ad, ad_en, fiyat, foto_url, kategori, sıra, görünürlük.
-- Panelde girilenler (vitrin durumu, açıklama, alerjen, kalori, eşlik, ön sipariş) ezilmez; açıklama ve alerjen
-- yalnız boşsa Kerzz'den doldurulur.

alter table public.kategoriler add column if not exists kerzz_id text unique;
alter table public.urunler add column if not exists kerzz_sku text;
alter table public.urunler add column if not exists kerzz_guncelleme timestamptz;
alter table public.urunler add column if not exists kerzz_aktif boolean;  -- Kerzz'deki son durum (görünürlük değişimini anlamak için)

create table if not exists public.kerzz_aktarim (
  id bigint generated always as identity primary key,
  baslangic timestamptz not null default now(),
  bitis timestamptz,
  durum text not null default 'calisiyor' check (durum in ('calisiyor', 'tamam', 'hata')),
  kategori int, eklenen int, guncellenen int, gizlenen int,
  hata text
);
alter table public.kerzz_aktarim enable row level security;
create policy "aktarim yonetici okur" on public.kerzz_aktarim for select using (public.yonetici_mi());

-- Ön sipariş kategorisi uygulamaya özel; Kerzz'de karşılığı yok, aktarım ona dokunmaz.

-- Gece aktarımı için iç anahtar (fonksiyon yalnız bu anahtarla ya da yönetici oturumuyla çalışır)
insert into public.gizli_ayar values ('kerzz_cron', encode(extensions.gen_random_bytes(24), 'hex'))
  on conflict (anahtar) do nothing;

-- Her gece 05:30 (TR) = 02:30 UTC
do $$
begin
  if exists (select 1 from pg_available_extensions where name = 'pg_cron')
     and exists (select 1 from pg_available_extensions where name = 'pg_net') then
    create extension if not exists pg_cron;
    create extension if not exists pg_net;
    perform cron.schedule('kerzz-aktar', '30 2 * * *',
      $c$select net.http_post(url := 'https://amcqfkcerlvjlfzllngy.supabase.co/functions/v1/kerzz-aktar',
           headers := jsonb_build_object('Content-Type', 'application/json',
             'x-aktar-anahtar', (select deger from public.gizli_ayar where anahtar = 'kerzz_cron')),
           body := '{}'::jsonb, timeout_milliseconds := 60000)$c$);
  end if;
end $$;
