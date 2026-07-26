import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import { basariEmbed, hataEmbed } from '../utils/embeds.js';
import { kullaniciYetkisiKontrolEt, botYetkisiKontrolEt } from '../utils/permissions.js';
import { logGonder } from '../utils/logger.js';
import { config } from '../config.js';

export const data = new SlashCommandBuilder()
  .setName('temizle')
  .setDescription('Kanaldan toplu şekilde mesaj siler.')
  .addIntegerOption((s) =>
    s.setName('adet').setDescription('Silinecek mesaj sayısı (1-100)').setRequired(true).setMinValue(1).setMaxValue(100)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages);

export async function execute(interaction) {
  if (!(await kullaniciYetkisiKontrolEt(interaction, PermissionFlagsBits.ManageMessages, 'Mesajları Yönet'))) return;
  if (!(await botYetkisiKontrolEt(interaction, PermissionFlagsBits.ManageMessages, 'Mesajları Yönet'))) return;

  const adet = interaction.options.getInteger('adet');

  try {
    const silinenler = await interaction.channel.bulkDelete(adet, true);

    await logGonder(interaction.guild, {
      baslik: '🧹 Mesajlar Temizlendi',
      aciklama: `**${interaction.channel}** kanalında ${silinenler.size} mesaj silindi.`,
      renk: config.anaRenk,
      alanlar: [{ name: 'Yetkili', value: `${interaction.user.tag}`, inline: true }],
    });

    await interaction.reply({
      embeds: [basariEmbed('Temizlendi', `${silinenler.size} mesaj başarıyla silindi. 🧹`)],
      flags: MessageFlags.Ephemeral,
    });
  } catch (hata) {
    console.error(hata);
    await interaction.reply({
      embeds: [
        hataEmbed(
          'Silinemedi',
          'Mesajlar silinirken bir hata oluştu. 14 günden eski mesajlar toplu olarak silinemez.'
        ),
      ],
      flags: MessageFlags.Ephemeral,
    });
  }
}
