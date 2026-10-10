import { prefixedTransform, type TalentNamingExports } from '../shared';

const SPLIT: Record<string, string[]> = {
  zzz: ['zzz'],
};

const READINGS: Record<string, string> = {
  'ねぇ': 'nee',
  'ダークテーマ用のド': 'dark theme you no do',
  'わためいと': 'watameito',
  'わため': 'watame',
  'パリピ': 'paripi',
  'っ文字': 'ltu moji',
  'チョキ': 'choki',
  'ナンバー': 'number',
  'ドヤ顔': 'doyagao',
  '桐生ココ絵': 'kiryu coco e',
  '黄': 'ki',
  '桃': 'momo',
  '青': 'ao',
  '赤': 'aka',
  '緑': 'midori',
  '紫': 'murasaki',
  'ダブル': 'double',
  'アンコール': 'encore',
  '臭くさ': 'kusai kusa',
  '誕生日ケーキ': 'tanjoubi cake',
  'ガンギマリ': 'gangimari',
  '圧あつ': 'atsu atsu',
  'ハサミ': 'hasami',
  '嬉し涙': 'ureshi namida',
  '悲し涙': 'kanashi namida',
  'ダンス': 'dance',
  '専用': 'senyou',
  'タンバリン': 'tambourine',
  'ドラム': 'drum',
  'ベース': 'bass',
  'キッ怒': 'kiddo',
};

export default {
  'Tsunomaki Watame': {
    defaultPrefix: 'watame',
    transform: prefixedTransform({ split: SPLIT, readings: READINGS }),
  },
} satisfies TalentNamingExports;
