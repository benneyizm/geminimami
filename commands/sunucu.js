import { SlashCommandBuilder, ChannelType } from 'discord.js';
import { bilgiEmbed } from '../utils/embeds.js';

export const data = new SlashCommandBuilder()
  .setName('sunucu')
  .setDescription('Bu sunucu hakkında bilgi verir.');

export async function execute(interaction) {
  const sunucu = interaction.guild;
  await sunucu.fetch();

  const sahip = await sunucu.fetchOwner();
  const toplamUye = sunucu.memberCount;
  const metinKanalSayisi = sunucu.channels.cache.filter((k) => k.type === ChannelType.GuildText).size;
  const sesKanalSayisi = sunucu.channels.cache.filter((k) => k.type === ChannelType.GuildVoice).size;

  const embed = bilgiEmbed(`🏠 ${sunucu.name}`, '')
    .setThumbnail(sunucu.iconURL({ size: 512 }) || null)
    .addFields(
      { name: 'Sahibi', value: `${sahip.user.tag}`, inline: true },
      { name: 'Üye Sayısı', value: `${toplamUye}`, inline: true },
      { name: 'Rol Sayısı', value: `${sunucu.roles.cache.size}`, inline: true },
      { name: 'Metin Kanalları', value: `${metinKanalSayisi}`, inline: true },
      { name: 'Ses Kanalları', value: `${sesKanalSayisi}`, inline: true },
      { name: 'Boost Seviyesi', value: `${sunucu.premiumTier}`, inline: true },
      {
        name: 'Oluşturulma Tarihi',
        value: `<t:${Math.floor(sunucu.createdTimestamp / 1000)}:D>`,
      }
    );

  await interaction.reply({ embeds: [embed] });
}
