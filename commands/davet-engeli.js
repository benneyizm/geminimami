import { otomatikModKomutuOlustur } from '../utils/otomatikModKomutu.js';

const komut = otomatikModKomutuOlustur({
  komutAdi: 'davet-engeli',
  aciklama: 'Discord davet linki paylaşım engelini açar veya kapatır.',
  alan: 'davet_engeli',
  ozellikAdi: 'Davet Linki Engeli',
});

export const data = komut.data;
export const execute = komut.execute;
