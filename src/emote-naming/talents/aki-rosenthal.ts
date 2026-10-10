import { prefixedTransform, type TalentNamingExports } from '../shared';

const SPLIT: Record<string, string[]> = {
  nextsc: ['next', 'sc'],
  blessyou: ['bless', 'you'],
};

const READINGS: Record<string, string> = {
  'アローナ': 'arona',
};

export default {
  'Aki Rosenthal': {
    defaultPrefix: 'aki',
    transform: prefixedTransform({ strip: 'AKIROSE', split: SPLIT, readings: READINGS }),
  },
} satisfies TalentNamingExports;
