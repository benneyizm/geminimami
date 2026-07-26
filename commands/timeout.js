import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import { basariEmbed, hataEmbed } from '../utils/embeds.js';
import { kullaniciYetkisiKontrolEt, botYetkisiKontrolEt, hiyerarsiKontrolEt } from '../utils/permissions.js';
import { modLogEkle } from '../database/db.js';
import { logGonder } from '../utils/logger.js';
import { config } from '../config.js';

const MAKS_TIMEOUT_DAKIKA = 40320; // Discord'un izin verdiği maksimum (28 gün)

export const data = new SlashCommandBuilder()
  .setName('timeout')
  .setDescription('Bir üyeyi belirtilen süre boyunca susturur.')
  .addUserOption((s) => s.setName('kullanıcı').setDescription('Susturulacak kullanıcı').setRequired(true))
  .addIntegerOption((s) =>
    s.setName('süre').setDescription('Susturma süresi (dakika)').setRequired(true).setMinValue(1).setMaxValue(MAKS_TIMEOUT_DAKIKA)
  )
  .addStringOption((s) => s.setName('sebep').setDescription('Susturma sebebi').setRequired(false))
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers);

export async function execute(interaction) {
  if (!(await kullaniciYetkisiKontrolEt(interaction, PermissionFlagsBits.ModerateMembers, 'Üyeleri Zaman Aşımına Uğrat'))) return;
  if (!(await botYetkisiKontrolEt(interaction, PermissionFlagsBits.ModerateMembers, 'Üyeleri Zaman Aşımına Uğrat'))) return;

  const hedefKullanici = interaction.options.getUser('kullanıcı');
  const dakika = interaction.options.getInteger('süre');
  const sebep = interaction.options.getString('sebep') || 'Belirtilmedi';
  const hedefUye = await interaction.guild.members.fetch(hedefKullanici.id).catch(() => null);

  if (!hedefUye) {
    await interaction.reply({ embeds: [hataEmbed('Bulunamadı', 'Bu kullanıcı sunucuda değil.')], flags: MessageFlags.Ephemeral });
    return;
  }

  if (!(await hiyerarsiKontrolEt(interaction, hedefUye))) return;

  if (!hedefUye.moderatable) {
    await interaction.reply({
      embeds: [hataEmbed('Susturamıyorum', 'Bu kullanıcıyı susturamıyorum, rol hiyerarşisi engelliyor olabilir.')],
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  try {
    await hedefUye.timeout(dakika * 60 * 1000, sebep);

    modLogEkle(interaction.guild.id, hedefKullanici.id, interaction.user.id, `TIMEOUT (${dakika} dk)`, sebep);
    await logGonder(interaction.guild, {
      baslik: '🔇 Üye Susturuldu',
      aciklama: `**${hedefKullanici.tag}** ${dakika} dakika boyunca susturuldu.`,
      renk: config.uyariRenk,
      alanlar: [
        { name: 'Yetkili', value: `${interaction.user.tag}`, inline: true },
        { name: 'Sebep', value: sebep, inline: true },
      ],
    });

    await interaction.reply({
      embeds: [basariEmbed('Susturuldu', `**${hedefKullanici.tag}**, ${dakika} dakika boyunca susturuldu.\nSebep: ${sebep}`)],
    });
  } catch (hata) {
    console.error(hata);
    await interaction.reply({
      embeds: [hataEmbed('Bir Şeyler Ters Gitti', 'Susturma işlemi sırasında bir hata oluştu.')],
      flags: MessageFlags.Ephemeral,
    });
  }
}
