import { prefixedTransform, type TalentNamingExports } from '../shared';

const READINGS: Record<string, string> = {
  'マイク': 'mic',
  'アザラシ': 'azarashi',
};

export default {
  'Momosuzu Nene': {
    defaultPrefix: 'nene',
    transform: prefixedTransform({ readings: READINGS }),
  },
} satisfies TalentNamingExports;
