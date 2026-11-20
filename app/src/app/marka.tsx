import { router } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Logo } from '../bilesenler/Logo';
import { Dugme, Ikon, Kutu, s, Yazi } from '../bilesenler/ortak';
import { renk } from '../tema';

// Metinler marka sunumundan (Kasım 2026)
export default function Marka() {
  const ic = useSafeAreaInsets();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: renk.kagit }} contentContainerStyle={{ paddingBottom: ic.bottom + 32 }}>
      <View style={{ backgroundColor: renk.yesil, paddingTop: ic.top + 16, paddingHorizontal: 24, paddingBottom: 32, gap: 18 }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Geri" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: renk.yesilKoyu, alignItems: 'center', justifyContent: 'center' }}>
          <Ikon ad="arrow-left" renkKodu={renk.krem} />
        </Pressable>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
          <Logo boy={70} renkKodu={renk.krem} />
          <View>
            <Yazi tur="buyukBaslik" style={{ color: renk.krem, fontSize: 46, lineHeight: 48 }}>butter</Yazi>
            <Yazi style={{ color: renk.krem, letterSpacing: 5, fontSize: 14 }}>coffee & bakery</Yazi>
          </View>
        </View>
        <Yazi tur="baslik" style={{ color: renk.krem, fontSize: 24, lineHeight: 30 }}>Sahilde, gün boyu iyi kahve ve özenle seçilmiş tatlılar.</Yazi>
      </View>
      <View style={[s.kenar, { gap: 18, paddingTop: 24 }]}>
        <Yazi style={{ fontSize: 16, lineHeight: 25 }}>
          butter, Bostancı sahilinde bir kahve ve fırın markası. Espresso bazlı kahveleri, vitrin tatlılarını ve sıcak servis edilen sandviçleri tek, sade bir çizgide buluşturur.
        </Yazi>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {[
            ['Kahveler', 'Espresso’dan Pistachio Latte’ye'],
            ['22 tatlı', 'Cheesecake, pasta, brownie, ekler'],
            ['9 sandviç', 'Ekşi mayalı tost, bagel, ciabatta'],
            ['Fırın', 'Kruvasan, kek, kurabiye'],
          ].map(([b, a]) => (
            <Kutu key={b} tur="krem" style={{ flexBasis: '47%', flexGrow: 1, padding: 16, gap: 4 }}>
              <Yazi tur="kalin" style={{ fontSize: 18 }}>{b}</Yazi>
              <Yazi tur="kucuk">{a}</Yazi>
            </Kutu>
          ))}
        </View>
        <View style={{ borderTopWidth: 2, borderTopColor: renk.yesil, paddingTop: 16, gap: 6 }}>
          <Yazi tur="ust">Markanın sesi</Yazi>
          <Yazi tur="buyukBaslik" style={{ fontSize: 26 }}>Sade. Sıcak. Özenli.</Yazi>
          <Yazi>Her ürünün adı, fiyatı ve içeriği açıkça görünür; alerjen ve kalori bilgisi her ürün sayfasında.</Yazi>
        </View>
        <Kutu>
          <Yazi tur="kalin">Bostancı Sahil · 20 Ekim 2026’dan beri</Yazi>
          <Yazi>Salonda ve paket; Yemeksepeti ve Trendyol Go’da da.</Yazi>
        </Kutu>
        <Dugme yazi="Menüyü keşfet" onPress={() => router.navigate('/menu')} />
      </View>
    </ScrollView>
  );
}
