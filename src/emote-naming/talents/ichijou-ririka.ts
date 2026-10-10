import { prefixedTransform, type TalentNamingExports } from '../shared';

const SPLIT: Record<string, string[]> = {
  goodjob: ['good', 'job'],
};

export default {
  'Ichijou Ririka': {
    defaultPrefix: 'ririka',
    transform: prefixedTransform({ split: SPLIT }),
  },
} satisfies TalentNamingExports;
