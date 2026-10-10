import { prefixedTransform, type TalentNamingExports } from '../shared';

const READINGS: Record<string, string> = {
  '乾杯っ': 'kanpai',
  'ラミィ': 'lamy',
  'ひぃーん': 'hiin',
  'えらいの': 'erai no',
  'スラッシュ': 'slash',
  '雪民さん': 'yukimin san',
  '青': 'ao',
};

export default {
  'Yukihana Lamy': {
    defaultPrefix: 'lamy',
    transform: prefixedTransform({ readings: READINGS }),
  },
} satisfies TalentNamingExports;
