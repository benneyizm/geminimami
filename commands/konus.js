import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { cevapUret } from '../utils/konusMotoru.js';
import { hataEmbed } from '../utils/embeds.js';

export const data = new SlashCommandBuilder()
  .setName('konuş')
  .setDescription('Muhammed ile sohbet et.')
  .addStringOption((s) =>
    s.setName('mesaj').setDescription('Muhammed\'e ne söylemek istiyorsun?').setRequired(true).setMaxLength(300)
  );

export async function execute(interaction) {
  const mesaj = interaction.options.getString('mesaj');

  if (!mesaj.trim()) {
    await interaction.reply({
      embeds: [hataEmbed('Boş Mesaj', 'Bir şeyler yazsana, boş mesaj gönderemem ki 😄')],
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  try {
    const cevap = cevapUret(interaction.user.id, interaction.channelId, mesaj);
    await interaction.reply({ content: cevap });
  } catch (hata) {
    console.error('[/konuş HATASI]', hata);
    await interaction.reply({
      embeds: [hataEmbed('Bir Şeyler Ters Gitti', 'Şu an cevap veremedim, tekrar dener misin?')],
      flags: MessageFlags.Ephemeral,
    });
  }
}
