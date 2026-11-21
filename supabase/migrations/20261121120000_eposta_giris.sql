-- Giriş SMS yerine Apple / Google / e-posta koduyla (ücretsiz). Telefon numarası artık isteğe bağlı profil alanı.

alter table public.uyeler add column if not exists eposta text;

drop function if exists public.uye_ol(text, date, text, boolean);

create or replace function public.uye_ol(p_ad text, p_dogum_gunu date default null, p_davet_kodu text default null,
                                         p_kampanya_izni boolean default false, p_telefon text default null)
returns public.uyeler
language plpgsql security definer set search_path = '' as $$
declare
  v_uye public.uyeler;
  v_davet uuid;
  v_tel text;
  v_kullanici auth.users;
begin
  if auth.uid() is null then raise exception 'OTURUM_YOK'; end if;
  select * into v_kullanici from auth.users where id = auth.uid();
  -- Telefon: girişten (SMS) ya da profilden; yalnız Türkiye cep numarası, 90XXXXXXXXXX
  v_tel := coalesce(nullif(v_kullanici.phone, ''), regexp_replace(coalesce(p_telefon, ''), '\D', '', 'g'));
  v_tel := case
    when v_tel ~ '^905\d{9}$' then v_tel
    when v_tel ~ '^05\d{9}$' then '9' || v_tel
    when v_tel ~ '^5\d{9}$' then '90' || v_tel
    else null end;
  if v_tel is not null and exists (select 1 from public.uyeler where telefon = v_tel and id <> auth.uid()) then
    raise exception 'TELEFON_KAYITLI';
  end if;
  if p_davet_kodu is not null and length(trim(p_davet_kodu)) > 0 then
    select id into v_davet from public.uyeler where davet_kodu = upper(trim(p_davet_kodu)) and id <> auth.uid();
  end if;
  insert into public.uyeler (id, ad, telefon, eposta, dogum_gunu, davet_eden, kampanya_izni, kampanya_izni_tarih)
  values (auth.uid(), nullif(trim(p_ad), ''), v_tel, nullif(v_kullanici.email, ''),
          p_dogum_gunu, v_davet, coalesce(p_kampanya_izni, false),
          case when p_kampanya_izni then now() end)
  on conflict (id) do update set ad = coalesce(excluded.ad, public.uyeler.ad)
  returning * into v_uye;
  insert into public.kartlar (uye_id) values (auth.uid()) on conflict do nothing;
  return v_uye;
end $$;

revoke execute on function public.uye_ol(text, date, text, boolean, text) from public, anon;
grant execute on function public.uye_ol(text, date, text, boolean, text) to authenticated;
