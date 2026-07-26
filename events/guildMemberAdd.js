import { Events, EmbedBuilder } from 'discord.js';
import { config } from '../config.js';

export const name = Events.GuildMemberAdd;

export async function execute(uye) {
  if (!config.hosgeldinKanalId) return;

  try {
    const kanal = await uye.guild.channels.fetch(config.hosgeldinKanalId).catch(() => null);
    if (!kanal || !kanal.isTextBased()) return;

    const embed = new EmbedBuilder()
      .setColor(config.basariRenk)
      .setTitle('🎉 Hoş geldin!')
      .setDescription(
        `Selam ${uye}, aramıza hoş geldin kanka! Umarım burada güzel vakit geçirirsin 😄\n\nŞu an sunucuda **${uye.guild.memberCount}.** kişisin.`
      )
      .setThumbnail(uye.user.displayAvatarURL({ size: 512 }))
      .setTimestamp();

    await kanal.send({ content: `${uye}`, embeds: [embed] });
  } catch (hata) {
    console.error('[HOŞ GELDİN HATASI]', hata);
  }
}
