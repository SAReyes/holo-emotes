import { prefixedTransform, type TalentNamingExports } from '../shared';

const READINGS: Record<string, string> = {
  'すうの圧': 'suu no atsu',
  'わらうすう': 'warau suu',
};

export default {
  'Mizumiya Su': {
    defaultPrefix: 'su',
    transform: prefixedTransform({ readings: READINGS }),
  },
} satisfies TalentNamingExports;
