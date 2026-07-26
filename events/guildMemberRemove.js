import { Events, EmbedBuilder } from 'discord.js';
import { config } from '../config.js';

export const name = Events.GuildMemberRemove;

export async function execute(uye) {
  if (!config.ayrildiKanalId) return;

  try {
    const kanal = await uye.guild.channels.fetch(config.ayrildiKanalId).catch(() => null);
    if (!kanal || !kanal.isTextBased()) return;

    const embed = new EmbedBuilder()
      .setColor(config.uyariRenk)
      .setTitle('👋 Görüşürüz')
      .setDescription(`**${uye.user.tag}** sunucudan ayrıldı. Yolun açık olsun kanka.`)
      .setThumbnail(uye.user.displayAvatarURL({ size: 512 }))
      .setTimestamp();

    await kanal.send({ embeds: [embed] });
  } catch (hata) {
    console.error('[AYRILDI MESAJI HATASI]', hata);
  }
}
