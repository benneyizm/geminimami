import { MessageFlags } from 'discord.js';
import { hataEmbed } from './embeds.js';

/**
 * Komutu kullanan kişide gerekli yetki var mı kontrol eder.
 * Yoksa otomatik olarak güzel bir hata embedi ile cevap verir ve false döner.
 */
export async function kullaniciYetkisiKontrolEt(interaction, izin, izinAdi) {
  if (!interaction.memberPermissions?.has(izin)) {
    await interaction.reply({
      embeds: [
        hataEmbed(
          'Yetkin Yok',
          `Bu komutu kullanabilmek için **${izinAdi}** yetkisine sahip olman gerekiyor.`
        ),
      ],
      flags: MessageFlags.Ephemeral,
    });
    return false;
  }
  return true;
}

/**
 * Botun sunucuda gerekli yetkiye sahip olup olmadığını kontrol eder.
 */
export async function botYetkisiKontrolEt(interaction, izin, izinAdi) {
  const bot = interaction.guild.members.me;
  if (!bot.permissions.has(izin)) {
    await interaction.reply({
      embeds: [
        hataEmbed(
          'Benim Yetkim Yok',
          `Bu işlemi yapabilmem için sunucuda **${izinAdi}** yetkisine ihtiyacım var. Rolümü kontrol eder misin? 🙏`
        ),
      ],
      flags: MessageFlags.Ephemeral,
    });
    return false;
  }
  return true;
}

/**
 * Hedef üyenin rolünün, işlemi yapan kişinin rolünden yüksek olup olmadığını kontrol eder.
 * (Discord'un kendi hiyerarşi kısıtlamasına ek olarak daha net bir hata mesajı vermek için.)
 */
export async function hiyerarsiKontrolEt(interaction, hedefUye) {
  if (!hedefUye) return true;

  if (hedefUye.id === interaction.guild.ownerId) {
    await interaction.reply({
      embeds: [hataEmbed('Olmaz Kanka', 'Sunucu sahibine bu işlemi uygulayamam.')],
      flags: MessageFlags.Ephemeral,
    });
    return false;
  }

  if (hedefUye.id === interaction.user.id) {
    await interaction.reply({
      embeds: [hataEmbed('Kendine mi?', 'Bu işlemi kendine uygulayamazsın 😅')],
      flags: MessageFlags.Ephemeral,
    });
    return false;
  }

  const komutuKullanan = interaction.member;
  if (
    hedefUye.roles.highest.position >= komutuKullanan.roles.highest.position &&
    interaction.guild.ownerId !== komutuKullanan.id
  ) {
    await interaction.reply({
      embeds: [
        hataEmbed(
          'Yetersiz Rol',
          'Senden eşit veya daha yüksek rütbeli birine bu işlemi uygulayamazsın.'
        ),
      ],
      flags: MessageFlags.Ephemeral,
    });
    return false;
  }

  const bot = interaction.guild.members.me;
  if (hedefUye.roles.highest.position >= bot.roles.highest.position) {
    await interaction.reply({
      embeds: [
        hataEmbed(
          'Rolüm Yetmiyor',
          'Bu kişinin rolü benimkinden yüksek veya eşit olduğu için işlem yapamıyorum.'
        ),
      ],
      flags: MessageFlags.Ephemeral,
    });
    return false;
  }

  return true;
}
