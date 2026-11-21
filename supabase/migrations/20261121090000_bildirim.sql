-- Anlık bildirimler (Expo Push)
-- Duyuru "bildirim" işaretliyse, yayın zamanı gelince izinli üyelerin telefonlarına gönderilir.
-- Gönderimi supabase/functions/bildirim-gonder yapar; her dakika pg_cron ile ve panelden yayında hemen tetiklenir.

alter table public.duyurular add column if not exists bildirim_gonderildi timestamptz;

-- Kime gider (izinlere göre):
--   firin            → "Fırından yeni çıktı" bildirimi açık olanlar
--   vitrin           → ürünü favorisinde olup "Favorilerim vitrinde" açık olanlar (ürün yoksa fırın izni)
--   kampanya, yeni,
--   etkinlik         → ticari ileti (İYS) onayı verenler
--   kart             → bildirim anahtarı olan tüm üyeler (bilgilendirme)
create or replace function public.bildirim_alicilari(p_duyuru uuid)
returns table (uye_id uuid, push_token text)
language sql stable security definer set search_path = '' as $$
  select u.id, u.push_token
  from public.duyurular d
  join public.uyeler u on u.push_token is not null
  where d.id = p_duyuru
    and case d.tur
      when 'firin' then u.bildirim_firin
      when 'vitrin' then case when d.urun_id is null then u.bildirim_firin
                              else u.bildirim_favori and exists (select 1 from public.favoriler f where f.uye_id = u.id and f.urun_id = d.urun_id) end
      when 'kart' then true
      else u.kampanya_izni
    end;
$$;

-- Gönderilecek duyuruları al ve aynı anda "gönderildi" işaretle (iki çağrı aynı duyuruyu iki kez göndermez)
create or replace function public.bildirim_sirasi_al()
returns setof public.duyurular
language sql volatile security definer set search_path = '' as $$
  update public.duyurular set bildirim_gonderildi = now()
  where bildirim and bildirim_gonderildi is null and yayin_zamani <= now()
    and (bitis is null or bitis > now())
    and yayin_zamani > now() - interval '1 day'
  returning *;
$$;

revoke all on function public.bildirim_alicilari(uuid) from public, anon, authenticated;
revoke all on function public.bildirim_sirasi_al() from public, anon, authenticated;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    grant execute on function public.bildirim_alicilari(uuid), public.bildirim_sirasi_al() to service_role;
  end if;
end $$;

-- Her dakika gönderim (Supabase'te pg_cron + pg_net; yerel testte bu uzantılar yoksa atlanır)
do $$
begin
  if exists (select 1 from pg_available_extensions where name = 'pg_cron')
     and exists (select 1 from pg_available_extensions where name = 'pg_net') then
    create extension if not exists pg_cron;
    create extension if not exists pg_net;
    perform cron.schedule('bildirim-gonder', '* * * * *',
      $c$select net.http_post(url := 'https://amcqfkcerlvjlfzllngy.supabase.co/functions/v1/bildirim-gonder',
                               headers := '{"Content-Type": "application/json"}'::jsonb, body := '{}'::jsonb)$c$);
  end if;
end $$;
