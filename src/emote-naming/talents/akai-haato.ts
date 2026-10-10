import { prefixedTransform, type TalentNamingExports } from '../shared';

const READINGS: Record<string, string> = {
  '焼きはあとん': 'yaki haaton',
  '最強': 'saikyou',
  '霧吹き': 'kirifuki',
  'タラン': 'taran',
};

export default {
  'Akai Haato': {
    defaultPrefix: 'haachama',
    transform: prefixedTransform({ readings: READINGS }),
  },
} satisfies TalentNamingExports;
