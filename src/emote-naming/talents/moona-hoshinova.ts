import { prefixedTransform, type TalentNamingExports } from '../shared';

const SPLIT: Record<string, string[]> = {
  youcandoit: ['you', 'can', 'do', 'it'],
  cryrich: ['cry', 'rich'],
  coolmoona: ['cool', 'moona'],
  gunmoona: ['gun', 'moona'],
  lsl: ['lightstick', 'left'],
  lsr: ['lightstick', 'right'],
};

export default {
  'Moona Hoshinova': {
    defaultPrefix: 'moona',
    transform: prefixedTransform({ split: SPLIT }),
  },
} satisfies TalentNamingExports;
