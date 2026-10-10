import { prefixedTransform, type TalentNamingExports } from '../shared';

const SPLIT: Record<string, string[]> = {
  ssrb01: ['ssrb', '01'],
  ssrb02: ['ssrb', '02'],
  ssrb03: ['ssrb', '03'],
  ssrbgray: ['ssrb', 'gray'],
  ssrbwhite: ['ssrb', 'white'],
  ssrbcamo: ['ssrb', 'camo'],
  ssrbpen1: ['ssrb', 'pen1'],
  ssrbtika: ['ssrb', 'tika'],
  ssrbbkouji: ['ssrb', 'bkouji'],
};

const READINGS: Record<string, string> = {
  'わらう英語': 'warau eigo',
};

export default {
  'Shishiro Botan': {
    defaultPrefix: 'botan',
    transform: prefixedTransform({ strip: 'ssrb', split: SPLIT, readings: READINGS }),
  },
} satisfies TalentNamingExports;
