import 'dotenv/config';

// .env dosyasında olması zorunlu değişkenler
const zorunluDegiskenler = ['TOKEN', 'CLIENT_ID'];
for (const anahtar of zorunluDegiskenler) {
  if (!process.env[anahtar]) {
    console.error(`[HATA] .env dosyasında "${anahtar}" değişkeni eksik. Lütfen .env.example dosyasına bakın.`);
    process.exit(1);
  }
}

export const config = {
  token: process.env.TOKEN,
  clientId: process.env.CLIENT_ID,
  guildId: process.env.GUILD_ID || null,
  logKanalId: process.env.LOG_KANAL_ID || null,
  hosgeldinKanalId: process.env.HOSGELDIN_KANAL_ID || null,
  ayrildiKanalId: process.env.AYRILDI_KANAL_ID || null,
  port: process.env.PORT || 3000,

  // Google Gemini AI ayarları (opsiyonel - tanımlı değilse AI sohbet özelliği devre dışı kalır)
  geminiApiKey: process.env.GEMINI_API_KEY || null,
  geminiModel: 'gemini-2.5-flash',
  geminiGecmisLimiti: 20, // Kullanıcı başına saklanacak maksimum mesaj sayısı

  // Bot kimliği / karakteri
  botAdi: 'Muhammed',
  anaRenk: 0x5865f2,
  hataRenk: 0xed4245,
  basariRenk: 0x57f287,
  uyariRenk: 0xfee75c,

  // Otomatik moderasyon ayarları
  otomatikMod: {
    kufurEngeli: true,
    davetEngeli: true,
    linkEngeli: true,
    spamEngeli: true,
    spamMesajLimiti: 5, // spamSureMs içinde en fazla kaç mesaj atılabilir
    spamSureMs: 6000,
    // Link engelinde göz ardı edilecek güvenilir domainler
    izinliDomainler: ['tenor.com', 'giphy.com', 'youtube.com', 'youtu.be', 'spotify.com'],
  },

  // Basit küfür/argo filtresi. Gerekirse buraya ekleme/çıkarma yapılabilir.
  yasakliKelimeler: [
    'amk', 'aq', 'oç', 'orospu', 'piç', 'yavşak', 'siktir', 'sikeyim',
    'göt herif', 'ibne', 'şerefsiz', 'ananı', 'anani', 'amına', 'amina',
  ],
};
