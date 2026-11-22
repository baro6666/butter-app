import * as AppleAuthentication from 'expo-apple-authentication';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Logo } from '../bilesenler/Logo';
import { Anahtar, Dugme, Ikon, Yazi } from '../bilesenler/ortak';
import { renk, yazi } from '../tema';
import { kaynak, ornekMod, telefonDuzelt, type GirisSonucu, type GirisYontemleri } from '../veri/kaynak';
import { useVeri } from '../veri/VeriSaglayici';

// Giriş: Apple / Google ile tek dokunuş ya da e-postaya gelen 6 haneli kod (SMS yok, ücretsiz).
// İlk girişte profil: ad, isteğe bağlı telefon ve doğum günü, davet kodu, KVKK ve ticari ileti onayı.
type Adim = 'secim' | 'eposta' | 'kod' | 'profil';

const girdi = {
  height: 52, borderRadius: 12, borderWidth: 1, borderColor: renk.cizgi, backgroundColor: renk.kart,
  paddingHorizontal: 14, fontSize: 17, fontFamily: yazi.normal, color: renk.murekkep,
} as const;

function Alan({ etiket, ...p }: { etiket: string } & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={{ gap: 6 }}>
      <Yazi tur="kucuk" style={{ fontFamily: yazi.orta }}>{etiket}</Yazi>
      <TextInput accessibilityLabel={etiket} placeholderTextColor="#8C9488" style={girdi} {...p} />
    </View>
  );
}

function SaglayiciDugmesi({ ikon, yazi: metin, onPress, koyu = false }: { ikon: React.ReactNode; yazi: string; onPress: () => void; koyu?: boolean }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress}
      style={({ pressed }) => [{
        height: 52, borderRadius: 26, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
        backgroundColor: koyu ? '#000000' : renk.kart, borderWidth: koyu ? 0 : 2, borderColor: renk.yesil,
      }, pressed && { opacity: 0.7 }]}>
      {ikon}
      <Text style={{ fontFamily: yazi.kalin, fontSize: 16, color: koyu ? '#FFFFFF' : renk.yesil }}>{metin}</Text>
    </Pressable>
  );
}

// GG.AA.YYYY → YYYY-AA-GG
function tarihCevir(g: string): string | null {
  const m = g.trim().match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})$/);
  if (!m) return null;
  const [, gun, ay, yil] = m;
  const t = new Date(Number(yil), Number(ay) - 1, Number(gun));
  return t.getDate() === Number(gun) ? `${yil}-${ay.padStart(2, '0')}-${gun.padStart(2, '0')}` : null;
}

const HATA: Record<string, string> = {
  TELEFON_KAYITLI: 'Bu telefon numarası başka bir üyelikte kayıtlı.',
  'Token has expired or is invalid': 'Kod hatalı ya da süresi dolmuş. Yeni kod isteyin.',
  'For security purposes': 'Çok sık denendi; biraz bekleyip tekrar deneyin.',
};
function hataMetni(e: unknown): string {
  const m = e instanceof Error ? e.message : String(e);
  for (const k of Object.keys(HATA)) if (m.includes(k)) return HATA[k];
  return m;
}

export default function Giris() {
  const v = useVeri();
  const ic = useSafeAreaInsets();
  const [adim, setAdim] = useState<Adim>('secim');
  const [yontem, setYontem] = useState<GirisYontemleri | null>(null);
  const [eposta, setEposta] = useState('');
  const [kod, setKod] = useState('');
  const [ad, setAd] = useState('');
  const [telefon, setTelefon] = useState('');
  const [dogum, setDogum] = useState('');
  const [davet, setDavet] = useState('');
  const [kampanya, setKampanya] = useState(false);
  const [kvkk, setKvkk] = useState(false);
  const [bekliyor, setBekliyor] = useState(false);
  const [hata, setHata] = useState<string | null>(null);

  useEffect(() => { kaynak.girisYontemleri().then(setYontem); }, []);

  const epostaGecerli = /^\S+@\S+\.\S+$/.test(eposta.trim());
  const telGecerli = !telefon.trim() || !!telefonDuzelt(telefon);
  const dogumGecerli = !dogum.trim() || !!tarihCevir(dogum);

  async function calistir(is: () => Promise<void>) {
    setBekliyor(true); setHata(null);
    try { await is(); } catch (e) { setHata(hataMetni(e)); } finally { setBekliyor(false); }
  }
  const kapat = () => (router.canGoBack() ? router.back() : router.replace('/'));
  const bitir = async () => { await v.oturumYenile(); kapat(); };
  const sonra = async (s: GirisSonucu | null) => {
    if (!s) return; // vazgeçti
    if (s.kayitli) await bitir();
    else { if (s.ad) setAd(s.ad); setAdim('profil'); }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: renk.kagit }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: ic.top + 24, paddingBottom: ic.bottom + 24, gap: 18 }} keyboardShouldPersistTaps="handled">
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Logo boy={44} />
          <Dugme yazi="Kapat" tur="metin" onPress={kapat} />
        </View>

        {adim === 'secim' ? (
          <>
            <Yazi tur="buyukBaslik">Aramıza katılın</Yazi>
            <Yazi>Kahve kartınız, favorileriniz ve bildirimler için. Şifre yok. Zaten üyeyseniz aynı yolla girin.</Yazi>
            {yontem?.apple && Platform.OS === 'ios' ? (
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                cornerRadius={26}
                style={{ height: 52 }}
                onPress={() => calistir(async () => sonra(await kaynak.appleGiris()))}
              />
            ) : null}
            {yontem?.google ? (
              <SaglayiciDugmesi ikon={<Text style={{ fontFamily: yazi.kalin, fontSize: 18, color: renk.yesil }}>G</Text>}
                yazi="Google ile devam et" onPress={() => calistir(async () => sonra(await kaynak.googleGiris()))} />
            ) : null}
            <SaglayiciDugmesi ikon={<Ikon ad="mail" boy={20} />} yazi="E-postayla devam et" onPress={() => { setHata(null); setAdim('eposta'); }} />
            {ornekMod ? <Yazi tur="kucuk">Örnek veri modu: e-posta kodu 123456.</Yazi> : null}
          </>
        ) : null}

        {adim === 'eposta' ? (
          <>
            <Yazi tur="buyukBaslik">E-posta adresiniz</Yazi>
            <Yazi>Size 6 haneli bir giriş kodu göndereceğiz.</Yazi>
            <Alan etiket="E-posta" value={eposta} onChangeText={setEposta} placeholder="ornek@eposta.com" keyboardType="email-address"
              autoCapitalize="none" autoComplete="email" textContentType="emailAddress" />
            <Dugme yazi="Kod gönder" devreDisi={!epostaGecerli} bekliyor={bekliyor}
              onPress={() => calistir(async () => { await kaynak.epostaGonder(eposta.trim().toLowerCase()); setKod(''); setAdim('kod'); })} />
            <Dugme yazi="Diğer yollar" tur="metin" onPress={() => setAdim('secim')} />
          </>
        ) : null}

        {adim === 'kod' ? (
          <>
            <Yazi tur="buyukBaslik">Kodu yazın</Yazi>
            <Yazi>{eposta.trim()} adresine gelen 6 haneli kod. Gelen kutusunda yoksa istenmeyen (spam) klasörüne bakın.</Yazi>
            <Alan etiket="Giriş kodu" value={kod} onChangeText={(t) => setKod(t.replace(/\D/g, '').slice(0, 6))} keyboardType="number-pad"
              autoComplete="one-time-code" textContentType="oneTimeCode" placeholder="••••••" />
            <Dugme yazi="Devam" devreDisi={kod.length !== 6} bekliyor={bekliyor}
              onPress={() => calistir(async () => sonra({ kayitli: await kaynak.epostaDogrula(eposta.trim().toLowerCase(), kod) }))} />
            <Dugme yazi="Kodu yeniden gönder" tur="metin" onPress={() => calistir(async () => { await kaynak.epostaGonder(eposta.trim().toLowerCase()); })} />
          </>
        ) : null}

        {adim === 'profil' ? (
          <>
            <Yazi tur="buyukBaslik">Sizi tanıyalım</Yazi>
            <Alan etiket="Adınız" value={ad} onChangeText={setAd} autoComplete="name" textContentType="name" placeholder="Ad Soyad" />
            <Alan etiket="Cep telefonu (isteğe bağlı; ön siparişte sizi aramak için)" value={telefon} onChangeText={setTelefon}
              placeholder="05xx xxx xx xx" keyboardType="phone-pad" autoComplete="tel" textContentType="telephoneNumber" />
            {!telGecerli ? <Yazi tur="kucuk" style={{ color: renk.tehlike }}>Telefonu 05xx xxx xx xx biçiminde yazın ya da boş bırakın.</Yazi> : null}
            <Alan etiket="Doğum gününüz (isteğe bağlı, tatlı ikramı için)" value={dogum} onChangeText={setDogum} placeholder="GG.AA.YYYY" keyboardType="numbers-and-punctuation" />
            {!dogumGecerli ? <Yazi tur="kucuk" style={{ color: renk.tehlike }}>Tarihi GG.AA.YYYY biçiminde yazın.</Yazi> : null}
            <Alan etiket="Davet kodu (varsa)" value={davet} onChangeText={(t) => setDavet(t.toUpperCase())} autoCapitalize="characters" placeholder="ör. 4F2A9C" />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Yazi style={{ flex: 1 }}>Kampanya ve fırsatlardan bildirim ve e-postayla haberdar olmak istiyorum (ticari ileti onayı).</Yazi>
              <Anahtar etiket="Ticari ileti onayı" acik={kampanya} onChange={setKampanya} />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Yazi style={{ flex: 1 }}>KVKK aydınlatma metnini okudum; üyelik için bilgilerimin işlenmesini kabul ediyorum.</Yazi>
              <Anahtar etiket="KVKK onayı" acik={kvkk} onChange={setKvkk} />
            </View>
            <Dugme yazi="Üyeliği tamamla" devreDisi={!ad.trim() || !kvkk || !telGecerli || !dogumGecerli} bekliyor={bekliyor}
              onPress={() => calistir(async () => {
                await kaynak.uyeOl({
                  ad: ad.trim(), dogumGunu: dogum.trim() ? tarihCevir(dogum) : null, davetKodu: davet.trim() || null,
                  kampanyaIzni: kampanya, telefon: telefon.trim() ? telefonDuzelt(telefon) : null,
                });
                await bitir();
              })} />
          </>
        ) : null}

        {hata ? <Yazi style={{ color: renk.tehlike }}>{hata}</Yazi> : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
