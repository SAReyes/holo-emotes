import { prefixedTransform, type TalentNamingExports } from '../shared';

const READINGS: Record<string, string> = {
  'こんばんは': 'konbanwa',
  'お酒を飲みまあす': 'osake wo nomimaasu',
  'さようならでん': 'sayounara den',
  '六根清浄': 'rokkon shoujou',
  'okです': 'ok desu',
  '座布団': 'zabuton',
};

export default {
  'Juufuutei Raden': {
    defaultPrefix: 'raden',
    transform: prefixedTransform({ readings: READINGS }),
  },
} satisfies TalentNamingExports;
