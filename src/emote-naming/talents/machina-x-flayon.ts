import { prefixedTransform, type TalentNamingExports } from '../shared';

const SPLIT: Record<string, string[]> = {
  liesofp: ['lies', 'of', 'p'],
  mrtrus: ['mr', 'trus'],
};

export default {
  'Machina X Flayon': {
    defaultPrefix: 'flayon',
    transform: prefixedTransform({ strip: 'Machi', split: SPLIT }),
  },
} satisfies TalentNamingExports;
