import { REST, Routes } from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from './config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function komutlariYukle() {
  const komutlar = [];
  const komutlarKlasoru = path.join(__dirname, 'commands');
  const dosyalar = fs.readdirSync(komutlarKlasoru).filter((dosya) => dosya.endsWith('.js'));

  for (const dosya of dosyalar) {
    const dosyaYolu = path.join(komutlarKlasoru, dosya);
    const modul = await import(`file://${dosyaYolu}`);

    if ('data' in modul && 'execute' in modul) {
      komutlar.push(modul.data.toJSON());
    } else {
      console.warn(`[UYARI] ${dosya} dosyasında "data" veya "execute" eksik, atlanıyor.`);
    }
  }

  return komutlar;
}

async function komutlariYay() {
  const komutlar = await komutlariYukle();
  const rest = new REST().setToken(config.token);

  try {
    console.log(`🔄 ${komutlar.length} slash komutu Discord'a yayılıyor...`);

    let sonuc;
    if (config.guildId) {
      // Belirli bir sunucuya anlık yayma (test için ideal)
      sonuc = await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), {
        body: komutlar,
      });
      console.log(`✅ ${sonuc.length} komut, ${config.guildId} ID'li sunucuya başarıyla yayıldı.`);
    } else {
      // Global yayma (tüm sunucularda görünmesi ~1 saat sürebilir)
      sonuc = await rest.put(Routes.applicationCommands(config.clientId), { body: komutlar });
      console.log(`✅ ${sonuc.length} komut global olarak başarıyla yayıldı.`);
    }
  } catch (hata) {
    console.error('❌ Komutlar yayılırken bir hata oluştu:', hata);
    process.exit(1);
  }
}

komutlariYay();
