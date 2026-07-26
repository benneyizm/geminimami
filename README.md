# Muhammed 🤖

Sunucudaki üyelerle doğal şekilde konuşabilen, moderasyon yapabilen samimi bir Türkçe Discord botu.

## Özellikler

- **`/konuş`** — Muhammed ile doğal, samimi bir dille sohbet et.
- **`/ping`, `/yardım`, `/avatar`, `/kullanıcı`, `/sunucu`** — Bilgi komutları.
- **`/ban`, `/kick`, `/timeout`, `/timeout-kaldır`, `/temizle`** — Moderasyon komutları.
- **Otomatik sistemler:** küfür engeli, Discord davet linki engeli, link engeli, spam engeli.
- **Hoş geldin / ayrıldı mesajları** ve **log sistemi**.
- SQLite (better-sqlite3) ile kalıcı sohbet hafızası ve moderasyon kayıtları.
- Render.com üzerinde çalışmaya hazır (Express health-check endpoint'i dahil).

## Kurulum

1. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

2. `.env.example` dosyasını `.env` olarak kopyalayıp kendi bilgilerinizi girin:
   ```bash
   cp .env.example .env
   ```

   Gerekli alanlar:
   - `TOKEN` — [Discord Developer Portal](https://discord.com/developers/applications)'dan alınan bot token'ı.
   - `CLIENT_ID` — Uygulamanızın (application) ID'si.
   - `GUILD_ID` — (Opsiyonel) Test sunucunuzun ID'si. Doldurursanız komutlar anında o sunucuda görünür.
   - `LOG_KANAL_ID`, `HOSGELDIN_KANAL_ID`, `AYRILDI_KANAL_ID` — İlgili sistemlerin çalışacağı kanal ID'leri.

3. Bot'a **Discord Developer Portal > Bot** sekmesinden şu **Privileged Gateway Intents**'leri açın:
   - Server Members Intent
   - Message Content Intent

4. Slash komutlarını Discord'a yayın:
   ```bash
   npm run deploy
   ```

5. Botu başlatın:
   ```bash
   npm start
   ```

## Render.com'a Dağıtım

1. Bu projeyi bir GitHub reposuna yükleyin.
2. Render.com'da **New > Web Service** seçin ve reponuzu bağlayın.
3. **Build Command:** `npm install`
4. **Start Command:** `npm start`
5. Environment sekmesinden `.env` içindeki tüm değişkenleri tek tek ekleyin (PORT değişkenini Render otomatik sağlar, elle eklemenize gerek yok).
6. Deploy ettikten sonra bir kere de `npm run deploy` komutunu (Render Shell üzerinden veya lokalde) çalıştırarak komutları Discord'a yaymayı unutmayın.

## Proje Yapısı

```
muhammed-bot/
├── index.js                # Giriş noktası
├── deploy-commands.js       # Slash komutlarını Discord'a yayar
├── config.js                 # Merkezi yapılandırma
├── commands/                 # Her komut ayrı dosyada
├── events/                    # Discord olay dinleyicileri
├── utils/                      # Embed, izin, log, moderasyon, konuşma motoru
├── database/                   # better-sqlite3 kurulumu ve sorguları
└── web/server.js              # Render için health-check sunucusu
```

## `/konuş` Nasıl Çalışır?

Muhammed'in konuşma motoru (`utils/konusMotoru.js`), gelen mesajı anahtar kelimelere göre
kategorilere ayırıp o kategoriye özel, samimi ve doğal cevaplar üretir. Kullanıcının önceki
mesajı SQLite veritabanında tutulur; böylece art arda aynı şeyi söylerse veya aynı konuyu
tekrar açarsa Muhammed bunu fark edip farklı tepki verir. Bot asla "ben bir yapay zekayım"
gibi cevaplar vermez — kendi karakteri olan, Türk gençlerinin diline uygun konuşan biri gibi davranır.
