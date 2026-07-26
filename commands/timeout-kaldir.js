import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import { basariEmbed, hataEmbed } from '../utils/embeds.js';
import { kullaniciYetkisiKontrolEt, botYetkisiKontrolEt } from '../utils/permissions.js';
import { modLogEkle } from '../database/db.js';
import { logGonder } from '../utils/logger.js';
import { config } from '../config.js';

export const data = new SlashCommandBuilder()
  .setName('timeout-kaldır')
  .setDescription('Bir üyenin susturmasını kaldırır.')
  .addUserOption((s) => s.setName('kullanıcı').setDescription('Susturması kaldırılacak kullanıcı').setRequired(true))
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers);

export async function execute(interaction) {
  if (!(await kullaniciYetkisiKontrolEt(interaction, PermissionFlagsBits.ModerateMembers, 'Üyeleri Zaman Aşımına Uğrat'))) return;
  if (!(await botYetkisiKontrolEt(interaction, PermissionFlagsBits.ModerateMembers, 'Üyeleri Zaman Aşımına Uğrat'))) return;

  const hedefKullanici = interaction.options.getUser('kullanıcı');
  const hedefUye = await interaction.guild.members.fetch(hedefKullanici.id).catch(() => null);

  if (!hedefUye) {
    await interaction.reply({ embeds: [hataEmbed('Bulunamadı', 'Bu kullanıcı sunucuda değil.')], flags: MessageFlags.Ephemeral });
    return;
  }

  if (!hedefUye.communicationDisabledUntil) {
    await interaction.reply({
      embeds: [hataEmbed('Zaten Susturulmamış', 'Bu kullanıcı zaten susturulmuş durumda değil.')],
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  try {
    await hedefUye.timeout(null, `${interaction.user.tag} tarafından kaldırıldı`);

    modLogEkle(interaction.guild.id, hedefKullanici.id, interaction.user.id, 'TIMEOUT-KALDIR', 'Manuel kaldırma');
    await logGonder(interaction.guild, {
      baslik: '🔊 Susturma Kaldırıldı',
      aciklama: `**${hedefKullanici.tag}** kullanıcısının susturması kaldırıldı.`,
      renk: config.basariRenk,
      alanlar: [{ name: 'Yetkili', value: `${interaction.user.tag}`, inline: true }],
    });

    await interaction.reply({
      embeds: [basariEmbed('Susturma Kaldırıldı', `**${hedefKullanici.tag}** artık tekrar konuşabilir.`)],
    });
  } catch (hata) {
    console.error(hata);
    await interaction.reply({
      embeds: [hataEmbed('Bir Şeyler Ters Gitti', 'Susturma kaldırma işlemi sırasında bir hata oluştu.')],
      flags: MessageFlags.Ephemeral,
    });
  }
}
