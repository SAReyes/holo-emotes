import { prefixedTransform, type TalentNamingExports } from '../shared';

const READINGS: Record<string, string> = {
  '高い酒': 'takai sake',
  'アオパン': 'aopan',
  'カクテル': 'cocktail',
  'シャンパンタワー': 'champagne tower',
  'ホクロ': 'hokuro',
  'クラゲくん': 'kurage kun',
};

export default {
  'Hiodoshi Ao': {
    defaultPrefix: 'ao',
    transform: prefixedTransform({ readings: READINGS }),
  },
} satisfies TalentNamingExports;
