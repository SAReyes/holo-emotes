import { prefixedTransform, type TalentNamingExports } from '../shared';

const SPLIT: Record<string, string[]> = {
  aletters: ['letter', 'a'],
  eletters: ['letter', 'e'],
  kletters: ['letter', 'k'],
  lletters: ['letter', 'l'],
  hammerleft: ['hammer', 'left'],
  hammeright: ['hammer', 'right'],
  smallnt: ['small', 'nt'],
  minluck: ['min', 'luck'],
  ggez: ['gg', 'ez'],
};

export default {
  'Kaela Kovalskia': {
    defaultPrefix: 'kaela',
    transform: prefixedTransform({ split: SPLIT }),
  },
} satisfies TalentNamingExports;
