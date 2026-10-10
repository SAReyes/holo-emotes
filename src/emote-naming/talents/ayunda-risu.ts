import { prefixedTransform, type TalentNamingExports } from '../shared';

const SPLIT: Record<string, string[]> = {
  lightstick: ['light', 'stick'],
  elmustacho: ['el', 'mustacho'],
  letrubrown: ['letter', 'u', 'brown'],
  letupink: ['letter', 'u', 'pink'],
  nesoberisu: ['nesobe', 'risu'],
  emojipo: ['emoji', 'po'],
  emojipi: ['emoji', 'pi'],
  risuheart: ['risu', 'heart'],
};

export default {
  'Ayunda Risu': {
    defaultPrefix: 'risu',
    transform: prefixedTransform({ split: SPLIT }),
  },
} satisfies TalentNamingExports;
