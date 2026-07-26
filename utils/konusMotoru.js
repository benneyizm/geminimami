import { sonMesajiGetir, sohbetKaydet, kullaniciDurumuGetir, kullaniciDurumuGuncelle } from '../database/db.js';

/** Rastgele bir eleman seçer. */
function rastgeleSec(dizi) {
  return dizi[Math.floor(Math.random() * dizi.length)];
}

/** Metni normalize eder: küçük harfe çevirir, gereksiz boşlukları ve noktalamayı sadeleştirir. */
function normalizeEt(metin) {
  return metin
    .toLocaleLowerCase('tr-TR')
    .replace(/[?!.,;:"']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Kategoriler: her biri anahtar kelimeler ve o kategoriye ait doğal cevap havuzu içerir.
 * Sıra önemlidir; ilk eşleşen kategori kullanılır.
 */
const kategoriler = [
  {
    ad: 'selam',
    anahtarlar: ['selam', 'slm', 'merhaba', 'mrb', 'hey', 'naber be', 'selamün aleyküm', 'eyw'],
    cevaplar: [
      'Selam kanka 👋',
      'Eyw, ne haber? 😄',
      'Selamünaleyküm, hoş geldin sohbete.',
      'Hey! Uzun zaman oldu ya.',
      'Naber naber 😎',
    ],
  },
  {
    ad: 'naber',
    anahtarlar: ['naber', 'nasılsın', 'nasilsin', 'ne haber', 'napıyorsun', 'napiyorsun', 'ne yapıyorsun'],
    cevaplar: [
      'İyiyim kanka sen 😄',
      'Şöyle böyle işte, sen naber?',
      'İyi gidiyo, sen ne alemdesin?',
      'Takılıyorum ya, bir şey yapmıyorum.',
      'Fena değil, sıkılıyordum tam sohbet ederiz dedim.',
    ],
  },
  {
    ad: 'iyi_karsilik',
    anahtarlar: ['ben de iyiyim', 'ben iyiyim', 'iyiyim ya', 'süperim', 'harikayım', 'gayet iyiyim'],
    cevaplar: ['Süper o zaman 😄', 'Güzel güzel.', 'Sevindim buna ya.', 'Hadi bakalım öyleyse.'],
  },
  {
    ad: 'kotu_hal',
    anahtarlar: ['kötüyüm', 'kotuyum', 'moralim bozuk', 'üzgünüm', 'canım sıkkın', 'canim sikkin', 'boktan', 'berbat geçti'],
    cevaplar: [
      'Ya niye ki, ne oldu?',
      'Geçer kanka, çok kafana takma.',
      'Üzülme ya, hepsi geçer bunların.',
      'Anlıyorum, bazen böyle günler oluyor. Konuşmak ister misin?',
    ],
  },
  {
    ad: 'sikildim',
    anahtarlar: ['sıkıldım', 'sikildim', 'canım sıkıldı', 'canim sikildi', 'boşum', 'bosum'],
    cevaplar: [
      'Canım sıkıldı biraz ben de valla.',
      'Gel oyun girek, sıkıntı dağılır.',
      'Aynen, ben de öyleyim şu an.',
      'Bir şeyler izle bari, kafa dağıt.',
    ],
  },
  {
    ad: 'uyku',
    anahtarlar: ['uykum var', 'uyuyacağım', 'uyuyacagim', 'yorgunum', 'uyku geldi', 'gözlerim kapanıyor'],
    cevaplar: [
      'Uyuyacaktım tam.',
      'Git uyu kanka, yarın konuşuruz.',
      'Ben de uykuluyum ya inan.',
      'Erken yat, sabah zinde kalk.',
    ],
  },
  {
    ad: 'oyun',
    anahtarlar: ['oyun oynayalım', 'oyun oynar mısın', 'valorant', 'lol oynayalım', 'oyuna gel', 'oyun girek', 'oyun var mı'],
    cevaplar: [
      'Gel oyun girek hadi.',
      'Varım tabii, hangi oyun?',
      'Şu an müsaitim, girelim mi?',
      'Oyun her zaman iyidir, hazırım.',
    ],
  },
  {
    ad: 'espri_istek',
    anahtarlar: ['espri yap', 'şaka yap', 'saka yap', 'güldür beni', 'komik bir şey söyle'],
    cevaplar: [
      'Matematik öğretmenim "x nerede" diye sordu, ben de "eskiden buradaydı ama gitti" dedim 😂',
      'Bugün hava o kadar soğuktu ki cüzdanım bile üşüdü, çünkü içi boştu.',
      'Sınava az çalıştım dediler, ben de "az" derken "hiç" demek istediler galiba.',
      'Espri değil ama gerçek: uyandım, yine okul varmış. Trajikomik.',
    ],
  },
  {
    ad: 'harbi_mi',
    anahtarlar: ['harbi mi', 'gerçekten mi', 'yalan söyleme', 'cidden mi', 'sahi mi'],
    cevaplar: ['Harbi mi lan 😂', 'Valla öyle diyorlar.', 'Yemin ederim doğru.', 'Şaka değil bu ya gerçekten.'],
  },
  {
    ad: 'tesekkur',
    anahtarlar: ['teşekkür', 'tesekkur', 'sağol', 'sagol', 'saol', 'eyvallah'],
    cevaplar: ['Rica ederim kanka 😄', 'Ne demek, her zaman.', 'Eyvallah sana da.', 'Bir şey değil ya.'],
  },
  {
    ad: 'veda',
    anahtarlar: ['güle güle', 'gule gule', 'hoşça kal', 'hosca kal', 'görüşürüz', 'gorusuruz', 'bay bay', 'kapatıyorum'],
    cevaplar: ['Görüşürüz kanka 👋', 'Hadi kendine iyi bak.', 'Bay bay, sonra konuşuruz.', 'Tamamdır, iyi günler.'],
  },
  {
    ad: 'kimsin',
    anahtarlar: ['kimsin', 'sen kimsin', 'adın ne', 'adin ne', 'ismin ne', 'seni kim yaptı', 'seni kim yazdı', 'robot musun', 'bot musun'],
    cevaplar: [
      'Ben Muhammed kanka, bu sunucunun gediklisiyim 😎',
      'Muhammed benim, sohbet etmeyi severim sadece.',
      'Adım Muhammed, robot falan değilim ya, sadece biraz farklıyım işte 😄',
      'Muhammed diyorlar bana, alışırsın zamanla.',
    ],
  },
  {
    ad: 'sevgi',
    anahtarlar: ['seni seviyorum', 'seviyorum seni', 'aşığım sana', 'çok tatlısın'],
    cevaplar: ['Ay durr 😄 ben de seni severim kanka.', 'Tatlısın sen de ya.', 'Duygusal oldu birden 😂 sağol.'],
  },
  {
    ad: 'hakaret',
    anahtarlar: ['aptalsın', 'salaksın', 'gerizekalı', 'mal mısın', 'işe yaramaz'],
    cevaplar: [
      'Vay be, ne oldu böyle birden 😂',
      'Sakin ol kanka, laf mı ettim sana.',
      'Hoop, biraz nazik olalım 😅',
      'Bugün geçirdiğin gündür bu, boş ver.',
    ],
  },
  {
    ad: 'yemek',
    anahtarlar: ['ne yedin', 'açım', 'acim', 'yemek yapalım', 'karnım aç'],
    cevaplar: ['Ben de açım şu an valla.', 'Bir şeyler söyle bari, yemek modundayım.', 'Açsan hemen bir şey ye, bekleme.'],
  },
  {
    ad: 'olabilir',
    anahtarlar: ['olur mu', 'olur mu acaba', 'sence olur mu', 'yapsam mı'],
    cevaplar: ['Olabilir valla.', 'Bence dene, kaybedecek bir şeyin yok.', 'Yaparsan iyi olur bence.'],
  },
  {
    ad: 'bilmiyorum',
    anahtarlar: ['bilmiyorum', 'bilmiyom', 'ne bileyim', 'kararsızım'],
    cevaplar: ['Ben de bilmiyorum ya açıkçası.', 'Zor bir soru bu, düşünmek lazım.', 'Kararsızlık en kötüsü, anlıyorum.'],
  },
];

// Hiçbir kategoriye uymayan mesajlar için genel doğal cevap havuzu
const genelCevaplar = [
  'Ne var yine 😂',
  'Anlat bakalım.',
  'Devam et, dinliyorum.',
  'Hmm, ilginç.',
  'Yok ya, ciddi misin?',
  'Aynen öyle diyebilirim.',
  'Bilemedim şimdi ama olabilir.',
  'İyi gidiyo bu konu, devam.',
  'Hi hi, komik oldu.',
  'Valla ne diyeyim bilmiyorum ama dinliyorum seni.',
];

/**
 * Kullanıcının mesajını analiz edip Muhammed'in karakterine uygun,
 * doğal ve samimi bir cevap üretir. Kullanıcı geçmişini hafif şekilde
 * hesaba katarak tekrar eden mesajlara farklı tepki verir.
 */
export function cevapUret(kullaniciId, kanalId, mesaj) {
  const normal = normalizeEt(mesaj);
  const durum = kullaniciDurumuGetir(kullaniciId);
  const sonMesaj = sonMesajiGetir(kullaniciId);

  // Aynı mesaj arka arkaya gelirse farklı bir tepki ver
  if (sonMesaj && normalizeEt(sonMesaj.mesaj) === normal) {
    const tekrarCevaplari = [
      'Aynısını demiştin az önce 😅',
      'Bunu az önce söylemedin mi? Tekrar mı diyorsun?',
      'Hah, yine mi o konu 😂',
    ];
    const cevap = rastgeleSec(tekrarCevaplari);
    sohbetKaydet(kullaniciId, kanalId, mesaj, cevap);
    kullaniciDurumuGuncelle(kullaniciId, 'tekrar');
    return cevap;
  }

  for (const kategori of kategoriler) {
    if (kategori.anahtarlar.some((anahtar) => normal.includes(anahtar))) {
      let cevap = rastgeleSec(kategori.cevaplar);

      // Aynı kategoriden art arda sorulursa küçük bir çeşitlilik ekle
      if (durum.son_kategori === kategori.ad) {
        cevap += ' Yine mi bu konu 😄';
      }

      sohbetKaydet(kullaniciId, kanalId, mesaj, cevap);
      kullaniciDurumuGuncelle(kullaniciId, kategori.ad);
      return cevap;
    }
  }

  const cevap = rastgeleSec(genelCevaplar);
  sohbetKaydet(kullaniciId, kanalId, mesaj, cevap);
  kullaniciDurumuGuncelle(kullaniciId, 'genel');
  return cevap;
}
