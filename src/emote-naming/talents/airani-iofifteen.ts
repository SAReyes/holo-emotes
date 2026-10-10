import { prefixedTransform, type TalentNamingExports } from '../shared';

const SPLIT: Record<string, string[]> = {
  lsleft: ['lightstick', 'left'],
  lsright: ['lightstick', 'right'],
  chiyopil: ['chiyopi', 'left'],
  chiyopir: ['chiyopi', 'right'],
  chiyopim: ['chiyopi', 'm'],
  chiyopin: ['chiyopi', 'n'],
  bigbrain: ['big', 'brain'],
  tenq: ['ten', 'q'],
  letterbi: ['letter', 'bi'],
  lettersa: ['letter', 'sa'],
  letterf: ['letter', 'f'],
};

export default {
  'Airani Iofifteen': {
    defaultPrefix: 'iofi',
    transform: prefixedTransform({ split: SPLIT }),
  },
} satisfies TalentNamingExports;
