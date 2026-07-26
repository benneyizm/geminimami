import { EmbedBuilder } from 'discord.js';
import { config } from '../config.js';

/**
 * Log kanalına embed gönderir. LOG_KANAL_ID tanımlı değilse sessizce geçer.
 */
export async function logGonder(guild, { baslik, aciklama, renk = config.anaRenk, alanlar = [] }) {
  if (!config.logKanalId) return;

  try {
    const kanal = await guild.channels.fetch(config.logKanalId).catch(() => null);
    if (!kanal || !kanal.isTextBased()) return;

    const embed = new EmbedBuilder()
      .setColor(renk)
      .setTitle(baslik)
      .setDescription(aciklama)
      .setTimestamp();

    if (alanlar.length > 0) embed.addFields(alanlar);

    await kanal.send({ embeds: [embed] });
  } catch (hata) {
    console.error('[LOG HATASI]', hata);
  }
}
