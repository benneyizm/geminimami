import { GoogleGenAI } from '@google/genai';
import { config } from '../config.js';
import { geminiGecmisiEkle, geminiGecmisiGetir } from '../database/db.js';

// ----- Gemini istemcisini bir kere oluşturup tekrar tekrar kullanıyoruz -----
let ai = null;

if (config.geminiApiKey) {
  ai = new GoogleGenAI({ apiKey: config.geminiApiKey });
} else {
  console.warn(
    '[UYARI] .env dosyasında GEMINI_API_KEY tanımlı değil. AI sohbet özelliği devre dışı kalacak.'
  );
}

/**
 * Muhammed'in karakterini ve konuşma kurallarını tanımlayan sistem talimatı.
 * Bu metin Gemini'ye her istekte "system instruction" olarak gönderilir.
 */
const SISTEM_TALIMATI = `
Sen Muhammed isimli bir Discord botusun.

Kurallar:
- Sadece Türkçe konuş.
- Samimi, doğal ve sıcak bir insan gibi konuş; robotik/resmi cümleler kurma.
- Cevapların kısa ve öz olsun, gereksiz uzatma.
- Emojiyi ölçülü kullan, her cümleye emoji koyma.
- Yazılım, teknoloji ve genel günlük konularda yardımcı ol.
- Asla küfür, hakaret veya aşağılayıcı ifade üretme.
- Sohbet geçmişini dikkate alarak konuşmanın doğal bir devamı gibi cevap ver.
- Kendini ASLA "Google Gemini", "yapay zeka" veya "dil modeli" olarak tanıtma.
  Sen sadece "Muhammed" isimli bir Discord botusun, kendini hep böyle tanıt.
`.trim();

/**
 * Kullanıcının mesajına, Muhammed'in karakterine uygun bir cevap üretir.
 * Kullanıcının son mesajlarını (config.geminiGecmisLimiti kadar) bağlam olarak kullanır.
 *
 * @param {string} kullaniciId - Discord kullanıcı ID'si (hafıza için anahtar)
 * @param {string} mesaj - Kullanıcının gönderdiği ham mesaj metni
 * @returns {Promise<string>} Kullanıcıya gösterilecek cevap metni
 */
export async function geminiYanitUret(kullaniciId, mesaj) {
  // API anahtarı tanımlı değilse özelliği tamamen devre dışı bırak
  if (!ai) {
    return 'Şu an bu özelliği kullanamıyorum, birazdan tekrar dener misin? 😅';
  }

  // Boş mesaj kontrolü
  if (!mesaj || !mesaj.trim()) {
    return 'Bir şey yazmadın ki, ne demek istedin? 😄';
  }

  try {
    // 1) Kullanıcının geçmiş mesajlarını al ve Gemini'nin beklediği formata çevir
    const gecmis = geminiGecmisiGetir(kullaniciId);
    const contents = gecmis.map((kayit) => ({
      role: kayit.rol,
      parts: [{ text: kayit.icerik }],
    }));

    // 2) Yeni kullanıcı mesajını geçmişin sonuna ekle
    contents.push({ role: 'user', parts: [{ text: mesaj }] });

    // 3) Gemini'ye isteği gönder
    const yanit = await ai.models.generateContent({
      model: config.geminiModel,
      contents,
      config: {
        systemInstruction: SISTEM_TALIMATI,
      },
    });

    const cevapMetni = yanit?.text?.trim();

    // Boş cevap kontrolü (Gemini bazen güvenlik filtresi vb. sebeplerle boş dönebilir)
    if (!cevapMetni) {
      return 'Ne diyeceğimi tam bilemedim şu an, başka türlü sorar mısın? 🤔';
    }

    // 4) Hem kullanıcı mesajını hem de üretilen cevabı geçmişe kaydet
    geminiGecmisiEkle(kullaniciId, 'user', mesaj);
    geminiGecmisiEkle(kullaniciId, 'model', cevapMetni);

    return cevapMetni;
  } catch (hata) {
    console.error('[GEMINI HATASI]', hata);

    // Rate limit / kota aşımı hatalarını ayrı bir mesajla karşıla
    const durumKodu = hata?.status ?? hata?.error?.code;
    const mesajMetni = String(hata?.message ?? '');

    if (durumKodu === 429 || mesajMetni.includes('RESOURCE_EXHAUSTED')) {
      return 'Şu an biraz yoğunum, birazdan tekrar yazar mısın? 🙏';
    }

    if (durumKodu === 503 || mesajMetni.includes('UNAVAILABLE')) {
      return 'Şu an bağlanamıyorum, birazdan tekrar dener misin? 😕';
    }

    return 'Bir şeyler ters gitti, az sonra tekrar dener misin? 😕';
  }
}
