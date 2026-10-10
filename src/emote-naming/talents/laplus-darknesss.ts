import { prefixedTransform, type TalentNamingExports } from '../shared';

const READINGS: Record<string, string> = {
  'カラス': 'karasu',
  'アセアセ': 'asease',
  '勝利の': 'shouri no',
  '敗北の': 'haiboku no',
  'ドヤガオ': 'doyagao',
  'イカリノカオ': 'ikari no kao',
  '怒りの': 'ikari no',
  'いい声': 'ii koe',
  'げーみんぐ': 'gaming',
  'ぎむの': 'gimu no',
};

export default {
  'La+ Darknesss': {
    defaultPrefix: 'laplus',
    transform: prefixedTransform({ readings: READINGS }),
  },
} satisfies TalentNamingExports;
