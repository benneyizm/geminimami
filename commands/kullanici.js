import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { bilgiEmbed } from '../utils/embeds.js';

export const data = new SlashCommandBuilder()
  .setName('kullanıcı')
  .setDescription('Bir kullanıcı hakkında bilgi verir.')
  .addUserOption((secenek) =>
    secenek.setName('kullanıcı').setDescription('Bilgisini görmek istediğin kullanıcı').setRequired(false)
  );

export async function execute(interaction) {
  const secilenKullanici = interaction.options.getUser('kullanıcı');
  const hedefUye = secilenKullanici
    ? await interaction.guild.members.fetch(secilenKullanici.id).catch(() => null)
    : interaction.member;

  if (!hedefUye) {
    await interaction.reply({
      content: '❌ Bu kullanıcı sunucuda bulunamadı.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const hedefKullanici = hedefUye.user;

  const roller = hedefUye.roles.cache
    .filter((rol) => rol.id !== interaction.guild.id)
    .map((rol) => `${rol}`)
    .slice(0, 15);

  const embed = bilgiEmbed(`👤 ${hedefKullanici.username}`, '')
    .setThumbnail(hedefKullanici.displayAvatarURL({ size: 512 }))
    .addFields(
      { name: 'Etiket', value: hedefKullanici.tag, inline: true },
      { name: 'ID', value: hedefKullanici.id, inline: true },
      { name: 'Bot mu?', value: hedefKullanici.bot ? 'Evet' : 'Hayır', inline: true },
      {
        name: 'Discord\'a Katılma',
        value: `<t:${Math.floor(hedefKullanici.createdTimestamp / 1000)}:D>`,
        inline: true,
      },
      {
        name: 'Sunucuya Katılma',
        value: `<t:${Math.floor(hedefUye.joinedTimestamp / 1000)}:D>`,
        inline: true,
      },
      {
        name: `Roller (${roller.length})`,
        value: roller.length > 0 ? roller.join(' ') : 'Rolü yok',
      }
    );

  await interaction.reply({ embeds: [embed] });
}
