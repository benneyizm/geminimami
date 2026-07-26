import express from 'express';
import { config } from '../config.js';

export function healthSunucusuBaslat(client) {
  const app = express();

  app.get('/', (req, res) => {
    res.status(200).json({
      durum: 'çalışıyor',
      bot: config.botAdi,
      giris_yapildi: client.isReady(),
      sunucu_sayisi: client.guilds.cache.size,
    });
  });

  app.get('/saglik', (req, res) => {
    res.status(client.isReady() ? 200 : 503).send(client.isReady() ? 'OK' : 'BOT HAZIR DEĞİL');
  });

  app.listen(config.port, () => {
    console.log(`🌐 Health check sunucusu ${config.port} portunda çalışıyor.`);
  });
}
