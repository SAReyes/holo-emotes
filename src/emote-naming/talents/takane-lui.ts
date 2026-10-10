import { prefixedTransform, type TalentNamingExports } from '../shared';

const SPLIT: Record<string, string[]> = {
  goodgame: ['good', 'game'],
  socool: ['so', 'cool'],
};

export default {
  'Takane Lui': {
    defaultPrefix: 'lui',
    transform: prefixedTransform({ split: SPLIT }),
  },
} satisfies TalentNamingExports;
