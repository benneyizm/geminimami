import { otomatikModKomutuOlustur } from '../utils/otomatikModKomutu.js';

const komut = otomatikModKomutuOlustur({
  komutAdi: 'link-engeli',
  aciklama: 'İzinsiz link paylaşım engelini açar veya kapatır.',
  alan: 'link_engeli',
  ozellikAdi: 'Link Engeli',
});

export const data = komut.data;
export const execute = komut.execute;
