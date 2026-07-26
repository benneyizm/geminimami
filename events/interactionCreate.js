import { Events, MessageFlags } from 'discord.js';
import { hataEmbed } from '../utils/embeds.js';

export const name = Events.InteractionCreate;

export async function execute(interaction) {
  if (!interaction.isChatInputCommand()) return;

  const komut = interaction.client.komutlar.get(interaction.commandName);
  if (!komut) {
    console.warn(`[UYARI] Bilinmeyen komut çalıştırılmaya çalışıldı: ${interaction.commandName}`);
    return;
  }

  try {
    await komut.execute(interaction);
  } catch (hata) {
    console.error(`[KOMUT HATASI] /${interaction.commandName} çalıştırılırken hata oluştu:`, hata);

    const hataEmbedi = hataEmbed(
      'Bir Şeyler Ters Gitti',
      'Komutu çalıştırırken beklenmedik bir hatayla karşılaştım. Birazdan tekrar dener misin?'
    );

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ embeds: [hataEmbedi], flags: MessageFlags.Ephemeral }).catch(() => {});
    } else {
      await interaction.reply({ embeds: [hataEmbedi], flags: MessageFlags.Ephemeral }).catch(() => {});
    }
  }
}
