import { prefixedTransform, type TalentNamingExports } from '../shared';

const SPLIT: Record<string, string[]> = {
  lightblue: ['light', 'blue'],
  lightred: ['light', 'red'],
};

export default {
  'Amane Kanata': {
    defaultPrefix: 'kanata',
    transform: prefixedTransform({ strip: 'kanata', split: SPLIT }),
  },
} satisfies TalentNamingExports;
