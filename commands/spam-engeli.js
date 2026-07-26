import { otomatikModKomutuOlustur } from '../utils/otomatikModKomutu.js';

const komut = otomatikModKomutuOlustur({
  komutAdi: 'spam-engeli',
  aciklama: 'Spam engelini açar veya kapatır.',
  alan: 'spam_engeli',
  ozellikAdi: 'Spam Engeli',
});

export const data = komut.data;
export const execute = komut.execute;
