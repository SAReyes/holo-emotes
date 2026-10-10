import { prefixedTransform, type TalentNamingExports } from '../shared';

export default {
  'Inugami Korone': {
    defaultPrefix: 'korone',
    transform: prefixedTransform({ strip: 'korone' }),
  },
} satisfies TalentNamingExports;
