import { Events } from 'discord.js';
import { otomatikModKontrol } from '../utils/moderation.js';
import { geminiYanitUret } from '../utils/gemini.js';

export const name = Events.MessageCreate;

export async function execute(message) {
  // ----- 1) Otomatik moderasyon kontrolü (küfür, davet, link, spam) -----
  let silindiMi = false;
  try {
    silindiMi = await otomatikModKontrol(message);
  } catch (hata) {
    console.error('[OTOMATİK MOD HATASI]', hata);
  }

  // Mesaj otomatik moderasyon tarafından silindiyse devam etme
  if (silindiMi) return;

  // Botlardan gelen mesajları yoksay (sonsuz döngüyü önler)
  if (message.author.bot) return;

  // Sadece sunucu içi mesajlarla ilgileniyoruz (DM'leri yoksay)
  if (!message.guild) return;

  // ----- 2) Muhammed'in AI sohbet özelliği: sadece belirli tetikleyicilerde çalışır -----
  try {
    const tetiklendiMi = await botTetiklendiMi(message);
    if (!tetiklendiMi) return; // Diğer mesajları görmezden gel

    const kullaniciMesaji = mesajiTemizle(message);

    // Discord'da "yazıyor..." göstergesini açarak daha doğal bir deneyim sağla
    await message.channel.sendTyping().catch(() => {});

    const cevap = await geminiYanitUret(message.author.id, kullaniciMesaji);

    await message.reply({
      content: cevap,
      allowedMentions: { repliedUser: false }, // Cevap verirken tekrar etiketleme/ping atma
    });
  } catch (hata) {
    console.error('[AI SOHBET HATASI]', hata);
    await message.reply('Şu an cevap veremedim, birazdan tekrar dener misin? 😕').catch(() => {});
  }
}

/**
 * Muhammed'in bu mesaja tepki vermesi gerekip gerekmediğini üç tetikleyiciye göre kontrol eder:
 * 1) Bot etiketlenmişse (@Muhammed)
 * 2) Mesaj "mami" kelimesiyle başlıyorsa
 * 3) Kullanıcı, botun bir mesajına yanıt (reply) veriyorsa
 */
async function botTetiklendiMi(message) {
  const botId = message.client.user.id;

  // 1) Bot etiketlenmiş mi?
  if (message.mentions.has(botId)) return true;

  // 2) Mesaj "mami" kelimesiyle mi başlıyor?
  const normalIcerik = message.content.trimStart().toLocaleLowerCase('tr-TR');
  if (normalIcerik.startsWith('mami')) return true;

  // 3) Kullanıcı botun bir mesajına yanıt mı veriyor?
  if (message.reference?.messageId) {
    const yanitlananMesaj = await message.fetchReference().catch(() => null);
    if (yanitlananMesaj?.author?.id === botId) return true;
  }

  return false;
}

/**
 * Mesaj içeriğini Gemini'ye göndermeden önce temizler:
 * - Kullanıcı/bot etiketlerini kaldırır
 * - Baştaki "mami" tetikleyici kelimesini kaldırır
 * - Fazla boşlukları sadeleştirir
 * İçerik tamamen boş kalırsa (örn. sadece "@Muhammed" yazılmışsa) genel bir selamlama döner.
 */
function mesajiTemizle(message) {
  let icerik = message.content.replace(/<@!?(\d+)>/g, '').trim();

  if (icerik.toLocaleLowerCase('tr-TR').startsWith('mami')) {
    icerik = icerik.slice('mami'.length).trim();
  }

  icerik = icerik.replace(/\s+/g, ' ').trim();

  return icerik.length > 0 ? icerik : 'selam';
}
