import { prefixedTransform, type TalentNamingExports } from '../shared';

export default {
  'Kazama Iroha': {
    defaultPrefix: 'iroha',
    transform: prefixedTransform({ strip: 'iroha' }),
  },
} satisfies TalentNamingExports;
