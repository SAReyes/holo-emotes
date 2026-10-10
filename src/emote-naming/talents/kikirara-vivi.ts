import { prefixedTransform, type TalentNamingExports } from '../shared';

const READINGS: Record<string, string> = {
  'ヴィヴィ': 'vivi',
};

export default {
  'Kikirara Vivi': {
    defaultPrefix: 'vivi',
    transform: prefixedTransform({ readings: READINGS }),
  },
} satisfies TalentNamingExports;
