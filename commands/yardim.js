import { SlashCommandBuilder } from 'discord.js';
import { bilgiEmbed } from '../utils/embeds.js';
import { config } from '../config.js';

export const data = new SlashCommandBuilder()
  .setName('yardım')
  .setDescription('Kullanılabilir tüm komutları listeler.');

export async function execute(interaction) {
  const embed = bilgiEmbed(
    `👋 Selam, ben ${config.botAdi}!`,
    'İşte kullanabileceğin komutlar:'
  )
    .addFields(
      {
        name: '💬 Sohbet',
        value: '`/konuş` — Benimle sohbet et, doğal cevap veririm.',
      },
      {
        name: 'ℹ️ Bilgi',
        value:
          '`/ping` — Gecikmemi gösterir.\n`/avatar` — Bir kullanıcının avatarını gösterir.\n`/kullanıcı` — Kullanıcı bilgisi verir.\n`/sunucu` — Sunucu bilgisi verir.',
      },
      {
        name: '🔨 Moderasyon',
        value:
          '`/ban` — Üyeyi sunucudan yasaklar.\n`/kick` — Üyeyi sunucudan atar.\n`/timeout` — Üyeyi susturur.\n`/timeout-kaldır` — Susturmayı kaldırır.\n`/temizle` — Toplu mesaj siler.',
      },
      {
        name: '🛡️ Otomatik Sistemler',
        value:
          'Küfür, davet linki, spam ve izinsiz link engeli otomatik olarak çalışır.\n`/küfür-engeli`, `/davet-engeli`, `/link-engeli`, `/spam-engeli` — bu sistemleri aç/kapat (Sunucuyu Yönet yetkisi gerekir).',
      }
    )
    .setFooter({ text: 'Bir sorun olursa yetkililere haber ver 🙂' });

  await interaction.reply({ embeds: [embed] });
}
