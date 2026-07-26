import { SlashCommandBuilder } from 'discord.js';
import { bilgiEmbed } from '../utils/embeds.js';

export const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Botun gecikme süresini gösterir.');

export async function execute(interaction) {
  const baslangic = Date.now();
  await interaction.reply({ content: '🏓 Ölçülüyor...' });

  const gecikme = Date.now() - baslangic;
  const apiGecikme = Math.round(interaction.client.ws.ping);

  await interaction.editReply({
    content: '',
    embeds: [
      bilgiEmbed(
        '🏓 Pong!',
        `Mesaj gecikmesi: **${gecikme}ms**\nAPI gecikmesi: **${apiGecikme}ms**\n\nGayet iyi durumdayım valla 😄`
      ),
    ],
  });
}
