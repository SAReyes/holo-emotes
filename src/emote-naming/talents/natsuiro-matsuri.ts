import { prefixedTransform, type TalentNamingExports } from '../shared';

const READINGS: Record<string, string> = {
  '虚無な感じ': 'kyomu na kanji',
  '待つりす': 'matsurisu',
  '待つり': 'matsuri',
  'まつりす': 'matsurisu',
  'かんぱい': 'kanpai',
  'のもじ': 'no moji',
};

export default {
  'Natsuiro Matsuri': {
    defaultPrefix: 'matsuri',
    transform: prefixedTransform({ strip: 'まつり', readings: READINGS }),
  },
} satisfies TalentNamingExports;
