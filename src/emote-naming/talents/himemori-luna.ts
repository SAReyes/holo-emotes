import { prefixedTransform, type TalentNamingExports } from '../shared';

const READINGS: Record<string, string> = {
  'メンバーズカード': 'members card',
};

export default {
  'Himemori Luna': {
    defaultPrefix: 'luna',
    transform: prefixedTransform({ readings: READINGS }),
  },
} satisfies TalentNamingExports;
