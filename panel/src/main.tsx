import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Navigate, NavLink, Route, Routes } from 'react-router-dom';
import { Giris } from './Giris';
import { Kasa } from './Kasa';
import { OturumSaglayici, useOturum } from './Oturum';
import { sb } from './supabase';
import './stil.css';
import { Yonetim } from './yonetim/Yonetim';

function Logo({ boy = 28 }: { boy?: number }) {
  return (
    <svg width={boy} height={boy * 50.6 / 47.8} viewBox="0 0 47.8 50.6" role="img" aria-label="butter">
      <path fill="#EDD3B5" d="M36.61 31.73C36.38 35.27 33.30 37.97 29.76 37.73C26.22 37.50 23.53 34.43 23.77 30.89C24.00 27.34 27.07 24.65 30.61 24.89C34.15 25.12 36.84 28.19 36.61 31.73M47.72 38.43C47.73 38.23 47.66 38.03 47.50 37.89C46.33 36.87 45.72 35.40 45.82 33.86C45.87 33.22 46.03 32.60 46.31 32.03C46.35 31.95 46.37 31.87 46.38 31.78C46.40 31.41 46.12 31.10 45.76 31.07C45.58 31.07 45.46 31.07 45.34 31.06C42.63 30.88 40.58 28.53 40.76 25.82C40.85 24.46 41.48 23.22 42.53 22.35C42.62 22.26 42.70 22.14 42.76 21.96C42.78 21.78 42.72 21.58 42.62 21.41C42.56 21.35 42.46 21.28 42.35 21.22C40.19 20.37 38.83 18.24 38.99 15.91C39.00 15.65 39.04 15.39 39.10 15.13C39.16 14.82 39.01 14.53 38.75 14.39C36.47 13.24 34.01 12.57 31.44 12.40C28.88 12.23 26.37 12.56 23.98 13.40C21.66 14.20 19.55 15.43 17.70 17.05L17.60 17.14L17.60 0.10L0.07 0.10L0.07 50.27L17.60 50.27L17.60 45.48C18.83 46.58 20.19 47.51 21.68 48.25C23.94 49.39 26.39 50.05 28.94 50.22C32.96 50.49 36.88 49.50 40.27 47.36C41.91 46.33 43.37 45.06 44.63 43.59C45.89 42.11 46.92 40.44 47.67 38.65C47.70 38.58 47.72 38.51 47.72 38.43Z" />
    </svg>
  );
}

async function sifreDegistir() {
  const yeni = prompt('Yeni şifreniz (en az 8 karakter):');
  if (!yeni) return;
  if (yeni.length < 8) { alert('Şifre en az 8 karakter olmalı.'); return; }
  const r = await sb.auth.updateUser({ password: yeni });
  alert(r.error ? 'Şifre değiştirilemedi: ' + r.error.message : 'Şifreniz değiştirildi.');
}

function Uygulama() {
  const { hazir, oturum, personel, cikis } = useOturum();
  if (!hazir) return <div className="sayfa"><p className="soluk">Yükleniyor…</p></div>;
  if (!oturum) return <Giris />;
  if (!personel) {
    return (
      <div className="sayfa dar">
        <div className="kart">
          <h2>Bu hesap personel değil</h2>
          <p className="soluk">Kasa ve yönetim ekranları yalnız butter personeli içindir. Yöneticinizden hesabınızı eklemesini isteyin.</p>
          <button className="dugme cizgi" onClick={cikis}>Çıkış</button>
        </div>
      </div>
    );
  }
  const yonetici = personel.rol === 'yonetici';
  return (
    <>
      <header className="ust">
        <div className="marka"><Logo /> butter</div>
        <nav aria-label="Bölümler">
          <NavLink to="/kasa" className={({ isActive }) => (isActive ? 'etkin' : '')}>Damga ver</NavLink>
          {yonetici ? <NavLink to="/yonetim" className={({ isActive }) => (isActive ? 'etkin' : '')}>Yönetim</NavLink> : null}
        </nav>
        <div className="kim">{personel.ad} · {yonetici ? 'Yönetici' : 'Kasiyer'}
          <button className="dugme kucuk krem" onClick={sifreDegistir}>Şifre</button>
          <button className="dugme kucuk krem" onClick={cikis}>Çıkış</button></div>
      </header>
      <Routes>
        <Route path="/kasa" element={<Kasa />} />
        {yonetici ? <Route path="/yonetim/*" element={<Yonetim />} /> : null}
        <Route path="*" element={<Navigate to={yonetici ? '/yonetim' : '/kasa'} replace />} />
      </Routes>
    </>
  );
}

createRoot(document.getElementById('kok')!).render(
  <StrictMode>
    <OturumSaglayici>
      <HashRouter><Uygulama /></HashRouter>
    </OturumSaglayici>
  </StrictMode>,
);
