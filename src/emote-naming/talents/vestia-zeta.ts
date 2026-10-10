import { prefixedTransform, type TalentNamingExports } from '../shared';

const SPLIT: Record<string, string[]> = {
  zetamin: ['zetamin'],
  o7zeta: ['o7'],
  gitgud: ['git', 'gud'],
  angrybazo: ['angry', 'bazo'],
};

export default {
  'Vestia Zeta': {
    defaultPrefix: 'zeta',
    transform: prefixedTransform({ strip: 'zeta', split: SPLIT }),
  },
} satisfies TalentNamingExports;
