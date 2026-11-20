// butter marka renkleri (Pantone 350 C yeşil, 726 C krem) ve yazı karakterleri
export const renk = {
  yesil: '#2C5234',
  yesilKoyu: '#24412A',
  krem: '#EDD3B5',
  kremAcik: '#E2C8A6',
  kagit: '#FAF7EC',
  kart: '#FFFDF6',
  cizgi: '#E4DDC4',
  murekkep: '#1D2A1F',
  soluk: '#4B5A4C',
  sekmeSoluk: '#5E6B60',
  fiyat: '#141414',
  yesilUstuSoluk: '#C9D3BE',
  turuncu: '#B5651D',
  rozetZemin: '#F6E3D3',
  rozetYazi: '#8A3B12',
  kapali: '#C9C2A6',
  tehlike: '#8A2F22',
};

// Jost (Futura'ya en yakın açık yazı), fiyatlar Montserrat (Futura'da ₺ yok)
export const yazi = {
  normal: 'Jost_400Regular',
  orta: 'Jost_500Medium',
  italik: 'Jost_500Medium_Italic',
  kalin: 'Jost_700Bold',
  fiyat: 'Montserrat_700Bold',
};

export function tl(n: number | null | undefined): string {
  if (n == null) return '';
  return n.toLocaleString('tr-TR', { maximumFractionDigits: 2 }) + ' ₺';
}
