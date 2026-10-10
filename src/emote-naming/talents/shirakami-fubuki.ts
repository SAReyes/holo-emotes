import { prefixedTransform, type TalentNamingExports } from '../shared';

export default {
  'Shirakami Fubuki': {
    defaultPrefix: 'fbk',
    transform: prefixedTransform({ strip: 'FBK' }),
  },
} satisfies TalentNamingExports;
