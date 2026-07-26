import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import { basariEmbed, hataEmbed } from '../utils/embeds.js';
import { kullaniciYetkisiKontrolEt, botYetkisiKontrolEt, hiyerarsiKontrolEt } from '../utils/permissions.js';
import { modLogEkle } from '../database/db.js';
import { logGonder } from '../utils/logger.js';
import { config } from '../config.js';

export const data = new SlashCommandBuilder()
  .setName('kick')
  .setDescription('Bir üyeyi sunucudan atar.')
  .addUserOption((s) => s.setName('kullanıcı').setDescription('Atılacak kullanıcı').setRequired(true))
  .addStringOption((s) => s.setName('sebep').setDescription('Atılma sebebi').setRequired(false))
  .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers);

export async function execute(interaction) {
  if (!(await kullaniciYetkisiKontrolEt(interaction, PermissionFlagsBits.KickMembers, 'Üyeleri At'))) return;
  if (!(await botYetkisiKontrolEt(interaction, PermissionFlagsBits.KickMembers, 'Üyeleri At'))) return;

  const hedefKullanici = interaction.options.getUser('kullanıcı');
  const sebep = interaction.options.getString('sebep') || 'Belirtilmedi';
  const hedefUye = await interaction.guild.members.fetch(hedefKullanici.id).catch(() => null);

  if (!hedefUye) {
    await interaction.reply({
      embeds: [hataEmbed('Bulunamadı', 'Bu kullanıcı sunucuda değil.')],
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (!(await hiyerarsiKontrolEt(interaction, hedefUye))) return;

  if (!hedefUye.kickable) {
    await interaction.reply({
      embeds: [hataEmbed('Atamıyorum', 'Bu kullanıcıyı atamıyorum, rol hiyerarşisi engelliyor olabilir.')],
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  try {
    await hedefUye.kick(sebep);

    modLogEkle(interaction.guild.id, hedefKullanici.id, interaction.user.id, 'KICK', sebep);
    await logGonder(interaction.guild, {
      baslik: '👢 Üye Atıldı',
      aciklama: `**${hedefKullanici.tag}** sunucudan atıldı.`,
      renk: config.uyariRenk,
      alanlar: [
        { name: 'Yetkili', value: `${interaction.user.tag}`, inline: true },
        { name: 'Sebep', value: sebep, inline: true },
      ],
    });

    await interaction.reply({
      embeds: [basariEmbed('Atıldı', `**${hedefKullanici.tag}** sunucudan atıldı.\nSebep: ${sebep}`)],
    });
  } catch (hata) {
    console.error(hata);
    await interaction.reply({
      embeds: [hataEmbed('Bir Şeyler Ters Gitti', 'Atma işlemi sırasında bir hata oluştu.')],
      flags: MessageFlags.Ephemeral,
    });
  }
}
