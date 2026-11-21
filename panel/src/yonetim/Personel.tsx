import { useState } from 'react';
import { useOturum } from '../Oturum';
import { al, hataMetni, sb } from '../supabase';
import { Durum, useYukle } from './ortak';

interface P { kullanici_id: string; ad: string; rol: 'kasiyer' | 'yonetici'; aktif: boolean; olusturma: string }

export function Personel() {
  const { personel: ben } = useOturum();
  const { veri, hata, yukleniyor, yenile } = useYukle(async () =>
    al(await sb.from('personel').select('kullanici_id, ad, rol, aktif, olusturma').order('olusturma')) as P[]);
  const [ad, setAd] = useState('');
  const [eposta, setEposta] = useState('');
  const [rol, setRol] = useState<'kasiyer' | 'yonetici'>('kasiyer');
  const [bekliyor, setBekliyor] = useState(false);
  const [mesaj, setMesaj] = useState<{ tur: 'tamam' | 'hata'; metin: string } | null>(null);
  const [sifreKutusu, setSifreKutusu] = useState<{ ad: string; eposta?: string; sifre: string } | null>(null);
  const [kopyalandi, setKopyalandi] = useState(false);

  const ekle = async () => {
    // Neden eklenemediğini açıkça söyle (düğme pasif kalıp sessizce beklemesin)
    const temizEposta = eposta.trim().toLowerCase();
    if (!ad.trim()) { setMesaj({ tur: 'hata', metin: 'Ad soyad yazın.' }); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(temizEposta)) { setMesaj({ tur: 'hata', metin: 'Geçerli bir e-posta yazın (ör. ad@ornek.com).' }); return; }
    setBekliyor(true); setMesaj(null);
    try {
      const r = await sb.functions.invoke('personel-ekle', { body: { ad: ad.trim(), eposta: temizEposta, rol } });
      if (r.error) throw new Error((await r.error.context?.json?.().catch(() => null))?.hata ?? r.error.message);
      const { gecici_sifre } = r.data as { gecici_sifre: string };
      setKopyalandi(false);
      setSifreKutusu({ ad: ad.trim(), eposta: temizEposta, sifre: gecici_sifre });
      setMesaj({ tur: 'tamam', metin: `${ad.trim()} eklendi.` });
      setAd(''); setEposta(''); yenile();
    } catch (e) { setMesaj({ tur: 'hata', metin: hataMetni(e) }); } finally { setBekliyor(false); }
  };
  const sifreSifirla = async (p: P) => {
    if (!confirm(`${p.ad} için yeni geçici şifre oluşturulsun mu? Eski şifresi geçersiz olur.`)) return;
    setMesaj(null);
    try {
      const r = await sb.functions.invoke('personel-ekle', { body: { islem: 'sifre_sifirla', kullanici_id: p.kullanici_id } });
      if (r.error) throw new Error((await r.error.context?.json?.().catch(() => null))?.hata ?? r.error.message);
      setKopyalandi(false);
      setSifreKutusu({ ad: p.ad, sifre: (r.data as { gecici_sifre: string }).gecici_sifre });
    } catch (e) { setMesaj({ tur: 'hata', metin: hataMetni(e) }); }
  };
  const durumDegis = async (p: P) => {
    try { al(await sb.from('personel').update({ aktif: !p.aktif }).eq('kullanici_id', p.kullanici_id).select('kullanici_id')); yenile(); }
    catch (e) { setMesaj({ tur: 'hata', metin: hataMetni(e) }); }
  };
  const rolDegis = async (p: P, r: P['rol']) => {
    try { al(await sb.from('personel').update({ rol: r }).eq('kullanici_id', p.kullanici_id).select('kullanici_id')); yenile(); }
    catch (e) { setMesaj({ tur: 'hata', metin: hataMetni(e) }); }
  };

  return (
    <>
      <h1>Personel</h1>
      {sifreKutusu ? (
        <div className="kart" role="alertdialog" aria-label="Geçici şifre" style={{ background: 'var(--yesil)', color: 'var(--krem)', borderColor: 'var(--yesil)' }}>
          <h2 style={{ color: 'var(--krem)' }}>{sifreKutusu.ad} için geçici şifre</h2>
          {sifreKutusu.eposta ? <p>Giriş e-postası: <b>{sifreKutusu.eposta}</b></p> : null}
          <div className="satir">
            <code style={{ fontSize: 28, fontWeight: 700, letterSpacing: 2, background: 'var(--krem)', color: 'var(--yesil)', borderRadius: 12, padding: '10px 16px', userSelect: 'all' }}>{sifreKutusu.sifre}</code>
            <button className="dugme krem" onClick={async () => { try { await navigator.clipboard.writeText(sifreKutusu.sifre); setKopyalandi(true); } catch { setKopyalandi(false); } }}>{kopyalandi ? 'Kopyalandı' : 'Kopyala'}</button>
          </div>
          <p style={{ color: '#C9D3BE', fontSize: 14 }}>Bu şifre yalnız şimdi gösteriliyor ve hiçbir yerde saklanmıyor. Kişiye kendiniz iletin; ilk girişte sağ üstteki “Şifre” düğmesiyle değiştirmesini isteyin. Kaybolursa “Şifre sıfırla” ile yenisi alınır.</p>
          <button className="dugme cizgi" style={{ borderColor: 'var(--krem)', color: 'var(--krem)', alignSelf: 'flex-start' }} onClick={() => setSifreKutusu(null)}>İlettim, kapat</button>
        </div>
      ) : null}
      <div className="satir" style={{ alignItems: 'flex-start' }}>
        <form className="kart" style={{ flex: '1 1 340px' }} onSubmit={(e) => { e.preventDefault(); ekle(); }} noValidate>
          <h2>Personel ekle</h2>
          <label className="alan">Ad soyad<input autoComplete="off" value={ad} onChange={(e) => setAd(e.target.value)} /></label>
          <label className="alan">E-posta (giriş için)<input type="email" autoComplete="off" value={eposta} onChange={(e) => setEposta(e.target.value)} /></label>
          <div className="secim" role="group" aria-label="Rol">
            <button type="button" aria-pressed={rol === 'kasiyer'} onClick={() => setRol('kasiyer')}>Kasiyer</button>
            <button type="button" aria-pressed={rol === 'yonetici'} onClick={() => setRol('yonetici')}>Yönetici</button>
          </div>
          <p className="soluk">Kasiyer yalnız “Damga ver” ekranını görür. Yönetici tüm paneli görür ve 10 dakika kuralını onaylayabilir.</p>
          {mesaj ? <p className={`mesaj ${mesaj.tur}`} role="status">{mesaj.metin}</p> : null}
          <button type="submit" className="dugme" disabled={bekliyor}>{bekliyor ? 'Ekleniyor…' : 'Ekle'}</button>
        </form>
        <div className="kart tablo-kutu" style={{ flex: '1 1 460px' }}>
          <Durum hata={hata} yukleniyor={yukleniyor && !veri} />
          <table>
            <thead><tr><th>Ad</th><th>Rol</th><th>İşlem</th></tr></thead>
            <tbody>
              {veri?.map((p) => {
                const kendim = p.kullanici_id === ben?.kullanici_id;
                return (
                  <tr key={p.kullanici_id}>
                    <td><b>{p.ad}</b>{kendim ? ' (siz)' : ''}</td>
                    <td>
                      <select aria-label={`${p.ad} rolü`} value={p.rol} disabled={kendim} onChange={(e) => rolDegis(p, e.target.value as P['rol'])}>
                        <option value="kasiyer">Kasiyer</option><option value="yonetici">Yönetici</option>
                      </select>
                    </td>
                    <td>
                      {kendim ? <span className="rozet yesil">Aktif</span> : (
                        <span className="satir" style={{ gap: 6, flexWrap: 'nowrap' }}>
                          <button className={`dugme kucuk ${p.aktif ? 'cizgi' : ''}`} onClick={() => durumDegis(p)}>{p.aktif ? 'Pasif yap' : 'Aktif yap'}</button>
                          <button className="dugme kucuk cizgi" onClick={() => sifreSifirla(p)}>Şifre sıfırla</button>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
