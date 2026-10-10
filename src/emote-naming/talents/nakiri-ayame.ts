import { prefixedTransform, type TalentNamingExports } from '../shared';

const SPLIT: Record<string, string[]> = {
  goodgame: ['good', 'game'],
  otunakiri: ['otu', 'nakiri'],
  konnakiri: ['kon', 'nakiri'],
  poyoyonaki: ['poyoyo', 'naki'],
  poyoyolove: ['poyoyo', 'love'],
};

export default {
  'Nakiri Ayame': {
    defaultPrefix: 'ayame',
    transform: prefixedTransform({ split: SPLIT }),
  },
} satisfies TalentNamingExports;
