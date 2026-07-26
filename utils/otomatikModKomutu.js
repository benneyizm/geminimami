import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import { basariEmbed } from './embeds.js';
import { kullaniciYetkisiKontrolEt } from './permissions.js';
import { sunucuAyariGuncelle } from '../database/db.js';

/**
 * Küfür/davet/link/spam engeli gibi aç-kapat komutlarının hepsi aynı mantığı
 * paylaştığı için tek bir fabrika fonksiyonundan üretiliyor.
 *
 * @param {Object} ayarlar
 * @param {string} ayarlar.komutAdi - Slash komutunun adı (örn: 'küfür-engeli')
 * @param {string} ayarlar.aciklama - Komutun açıklaması
 * @param {string} ayarlar.alan - Veritabanındaki ilgili sütun adı (örn: 'kufur_engeli')
 * @param {string} ayarlar.ozellikAdi - Kullanıcıya gösterilecek okunabilir isim (örn: 'Küfür Engeli')
 */
export function otomatikModKomutuOlustur({ komutAdi, aciklama, alan, ozellikAdi }) {
  const data = new SlashCommandBuilder()
    .setName(komutAdi)
    .setDescription(aciklama)
    .addStringOption((secenek) =>
      secenek
        .setName('durum')
        .setDescription(`${ozellikAdi} sistemini aç ya da kapat`)
        .setRequired(true)
        .addChoices({ name: 'Aç', value: 'ac' }, { name: 'Kapat', value: 'kapat' })
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

  async function execute(interaction) {
    if (!(await kullaniciYetkisiKontrolEt(interaction, PermissionFlagsBits.ManageGuild, 'Sunucuyu Yönet'))) {
      return;
    }

    const secim = interaction.options.getString('durum');
    const yeniDeger = secim === 'ac';

    sunucuAyariGuncelle(interaction.guild.id, alan, yeniDeger);

    await interaction.reply({
      embeds: [
        basariEmbed(
          'Ayar Güncellendi',
          `**${ozellikAdi}** sistemi artık **${yeniDeger ? 'açık ✅' : 'kapalı ❌'}**.`
        ),
      ],
      flags: MessageFlags.Ephemeral,
    });
  }

  return { data, execute };
}
