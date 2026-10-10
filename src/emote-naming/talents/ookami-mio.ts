import { prefixedTransform, type TalentNamingExports } from '../shared';

const READINGS: Record<string, string> = {
  'ハトタウロス': 'hatotaurus',
  'ミオ': 'mio',
  'みぉーん': 'mion',
  'みぉん': 'mion',
  'みぉ': 'mio',
  'の': 'no',
  'ノ': 'no',
  'タイガー': 'tiger',
  'タイガ': 'taiga',
  '助かる': 'tasukaru',
  '助': 'tasu',
  '待機': 'taiki',
  '待': 'tai',
  '機': 'ki',
  '耳': 'mimi',
  'ミオファ': 'miofa',
  '森': 'mori',
  'トマト': 'tomato',
  '泣': 'naki',
  'ウクレレ': 'ukulele',
  'ってコト': 'ttekoto',
  '魂出てる': 'tamashii deteru',
  'ダイスキ': 'daisuki',
  'カンジ': 'kanji',
  'ガーン': 'gaan',
  'おめが': 'omega',
};

export default {
  'Ookami Mio': {
    defaultPrefix: 'mio',
    transform: prefixedTransform({ strip: 'mio', readings: READINGS }),
  },
} satisfies TalentNamingExports;
