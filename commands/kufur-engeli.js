import { otomatikModKomutuOlustur } from '../utils/otomatikModKomutu.js';

const komut = otomatikModKomutuOlustur({
  komutAdi: 'küfür-engeli',
  aciklama: 'Küfür/argo filtresini açar veya kapatır.',
  alan: 'kufur_engeli',
  ozellikAdi: 'Küfür Engeli',
});

export const data = komut.data;
export const execute = komut.execute;
