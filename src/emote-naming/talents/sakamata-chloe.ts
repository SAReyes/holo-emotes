import { prefixedTransform, type TalentNamingExports } from '../shared';

const READINGS: Record<string, string> = {
  '激アツ': 'geki atsu',
  '助かる': 'tasukaru',
  '寿司っ': 'sushi',
  '勝ち確': 'kachikaku',
  'フラグ': 'flag',
};

export default {
  'Sakamata Chloe': {
    defaultPrefix: 'chloe',
    transform: prefixedTransform({ readings: READINGS }),
  },
} satisfies TalentNamingExports;
