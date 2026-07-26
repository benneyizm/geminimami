import { PermissionFlagsBits } from 'discord.js';
import { config } from '../config.js';
import { logGonder } from './logger.js';
import { sunucuAyarlariGetir } from '../database/db.js';

// Kullanıcı başına spam takibi için hafızada tutulan mesaj zaman damgaları
const spamHafizasi = new Map(); // kullaniciId -> [timestamp, timestamp, ...]

const davetRegex = /(discord\.gg\/|discord(?:app)?\.com\/invite\/)[a-zA-Z0-9-]+/i;
const linkRegex = /(https?:\/\/[^\s]+)/gi;

function moderatorMu(uye) {
  return (
    uye.permissions.has(PermissionFlagsBits.ManageMessages) ||
    uye.permissions.has(PermissionFlagsBits.Administrator)
  );
}

function icerikKufurIceriyorMu(icerik) {
  const normal = icerik.toLocaleLowerCase('tr-TR');
  return config.yasakliKelimeler.some((kelime) => normal.includes(kelime));
}

function linkIzinliMi(url) {
  return config.otomatikMod.izinliDomainler.some((domain) => url.includes(domain));
}

async function ihlalUyarisiGonder(message, sebep) {
  try {
    const uyari = await message.channel.send(
      `${message.author}, mesajın kaldırıldı. Sebep: **${sebep}** 🙅‍♂️`
    );
    setTimeout(() => uyari.delete().catch(() => {}), 6000);
  } catch {
    // kanal izinleri yetersizse sessizce geç
  }
}

/**
 * Gelen mesajı otomatik moderasyon kurallarına göre kontrol eder.
 * İhlal varsa mesajı siler, kullanıcıyı uyarır ve log kanalına bildirir.
 * @returns {Promise<boolean>} true dönerse mesaj silindi demektir (başka işlem yapılmamalı).
 */
export async function otomatikModKontrol(message) {
  if (message.author.bot) return false;
  if (!message.guild) return false;
  if (moderatorMu(message.member)) return false;

  const ayar = config.otomatikMod;
  const sunucuAyari = sunucuAyarlariGetir(message.guild.id);
  const icerik = message.content;

  // 1) Küfür / argo engeli
  if (sunucuAyari.kufur_engeli && icerikKufurIceriyorMu(icerik)) {
    await message.delete().catch(() => {});
    await ihlalUyarisiGonder(message, 'Uygunsuz kelime kullanımı');
    await logGonder(message.guild, {
      baslik: '🚫 Küfür Filtresi',
      aciklama: `**${message.author.tag}** adlı kullanıcının mesajı küfür filtresine takıldığı için silindi.`,
      renk: config.hataRenk,
      alanlar: [{ name: 'Kanal', value: `${message.channel}`, inline: true }],
    });
    return true;
  }

  // 2) Discord davet linki engeli
  if (sunucuAyari.davet_engeli && davetRegex.test(icerik)) {
    await message.delete().catch(() => {});
    await ihlalUyarisiGonder(message, 'Discord daveti paylaşmak yasak');
    await logGonder(message.guild, {
      baslik: '🚫 Davet Linki Engeli',
      aciklama: `**${message.author.tag}** bir Discord daveti paylaşmaya çalıştı.`,
      renk: config.hataRenk,
      alanlar: [{ name: 'Kanal', value: `${message.channel}`, inline: true }],
    });
    return true;
  }

  // 3) Genel link engeli (izinli domainler hariç)
  if (sunucuAyari.link_engeli) {
    const linkler = icerik.match(linkRegex);
    if (linkler && linkler.some((url) => !linkIzinliMi(url))) {
      await message.delete().catch(() => {});
      await ihlalUyarisiGonder(message, 'İzinsiz link paylaşımı');
      await logGonder(message.guild, {
        baslik: '🚫 Link Engeli',
        aciklama: `**${message.author.tag}** izinsiz bir link paylaştı.`,
        renk: config.hataRenk,
        alanlar: [{ name: 'Kanal', value: `${message.channel}`, inline: true }],
      });
      return true;
    }
  }

  // 4) Spam engeli
  if (sunucuAyari.spam_engeli) {
    const simdi = Date.now();
    const gecmis = (spamHafizasi.get(message.author.id) || []).filter(
      (t) => simdi - t < ayar.spamSureMs
    );
    gecmis.push(simdi);
    spamHafizasi.set(message.author.id, gecmis);

    if (gecmis.length > ayar.spamMesajLimiti) {
      await message.delete().catch(() => {});
      await ihlalUyarisiGonder(message, 'Spam yapma dostum 😅');
      await logGonder(message.guild, {
        baslik: '🚫 Spam Engeli',
        aciklama: `**${message.author.tag}** kısa sürede çok fazla mesaj attığı için mesajları siliniyor.`,
        renk: config.hataRenk,
        alanlar: [{ name: 'Kanal', value: `${message.channel}`, inline: true }],
      });
      return true;
    }
  }

  return false;
}
