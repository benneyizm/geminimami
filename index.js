import { Client, GatewayIntentBits, Partials, Collection } from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from './config.js';
import { healthSunucusuBaslat } from './web/server.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.GuildMember],
});

client.komutlar = new Collection();

// ----- Komutları yükle -----
async function komutlariYukle() {
  const komutlarKlasoru = path.join(__dirname, 'commands');
  const dosyalar = fs.readdirSync(komutlarKlasoru).filter((dosya) => dosya.endsWith('.js'));

  for (const dosya of dosyalar) {
    const dosyaYolu = path.join(komutlarKlasoru, dosya);
    const modul = await import(`file://${dosyaYolu}`);

    if ('data' in modul && 'execute' in modul) {
      client.komutlar.set(modul.data.name, modul);
    } else {
      console.warn(`[UYARI] ${dosya} dosyasında "data" veya "execute" eksik, atlanıyor.`);
    }
  }

  console.log(`📦 ${client.komutlar.size} komut yüklendi.`);
}

// ----- Olayları (events) yükle -----
async function olaylariYukle() {
  const olaylarKlasoru = path.join(__dirname, 'events');
  const dosyalar = fs.readdirSync(olaylarKlasoru).filter((dosya) => dosya.endsWith('.js'));

  for (const dosya of dosyalar) {
    const dosyaYolu = path.join(olaylarKlasoru, dosya);
    const modul = await import(`file://${dosyaYolu}`);

    if (modul.once) {
      client.once(modul.name, (...args) => modul.execute(...args));
    } else {
      client.on(modul.name, (...args) => modul.execute(...args));
    }
  }

  console.log(`🎧 ${dosyalar.length} olay dinleyicisi yüklendi.`);
}

async function baslat() {
  await komutlariYukle();
  await olaylariYukle();

  healthSunucusuBaslat(client);

  await client.login(config.token);
}

process.on('unhandledRejection', (hata) => {
  console.error('[İŞLENMEYEN HATA]', hata);
});

baslat();
