import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import { basariEmbed, hataEmbed } from '../utils/embeds.js';
import { kullaniciYetkisiKontrolEt, botYetkisiKontrolEt, hiyerarsiKontrolEt } from '../utils/permissions.js';
import { modLogEkle } from '../database/db.js';
import { logGonder } from '../utils/logger.js';
import { config } from '../config.js';

export const data = new SlashCommandBuilder()
  .setName('ban')
  .setDescription('Bir üyeyi sunucudan yasaklar.')
  .addUserOption((s) => s.setName('kullanıcı').setDescription('Yasaklanacak kullanıcı').setRequired(true))
  .addStringOption((s) => s.setName('sebep').setDescription('Yasaklama sebebi').setRequired(false))
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers);

export async function execute(interaction) {
  if (!(await kullaniciYetkisiKontrolEt(interaction, PermissionFlagsBits.BanMembers, 'Üyeleri Yasakla'))) return;
  if (!(await botYetkisiKontrolEt(interaction, PermissionFlagsBits.BanMembers, 'Üyeleri Yasakla'))) return;

  const hedefKullanici = interaction.options.getUser('kullanıcı');
  const sebep = interaction.options.getString('sebep') || 'Belirtilmedi';
  const hedefUye = await interaction.guild.members.fetch(hedefKullanici.id).catch(() => null);

  if (hedefUye && !(await hiyerarsiKontrolEt(interaction, hedefUye))) return;

  if (hedefUye && !hedefUye.bannable) {
    await interaction.reply({
      embeds: [hataEmbed('Yasaklayamıyorum', 'Bu kullanıcıyı yasaklayamıyorum, rol hiyerarşisi engelliyor olabilir.')],
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  try {
    await interaction.guild.members.ban(hedefKullanici.id, { reason: sebep });

    modLogEkle(interaction.guild.id, hedefKullanici.id, interaction.user.id, 'BAN', sebep);
    await logGonder(interaction.guild, {
      baslik: '🔨 Üye Yasaklandı',
      aciklama: `**${hedefKullanici.tag}** yasaklandı.`,
      renk: config.hataRenk,
      alanlar: [
        { name: 'Yetkili', value: `${interaction.user.tag}`, inline: true },
        { name: 'Sebep', value: sebep, inline: true },
      ],
    });

    await interaction.reply({
      embeds: [basariEmbed('Yasaklandı', `**${hedefKullanici.tag}** sunucudan yasaklandı.\nSebep: ${sebep}`)],
    });
  } catch (hata) {
    console.error(hata);
    await interaction.reply({
      embeds: [hataEmbed('Bir Şeyler Ters Gitti', 'Yasaklama işlemi sırasında bir hata oluştu.')],
      flags: MessageFlags.Ephemeral,
    });
  }
}
