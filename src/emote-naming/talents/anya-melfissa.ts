import { prefixedTransform, type TalentNamingExports } from '../shared';

const SPLIT: Record<string, string[]> = {
  thisisfine: ['this', 'is', 'fine'],
  glowkris: ['glow', 'kris'],
  nicetry: ['nice', 'try'],
  onduty: ['on', 'duty'],
};

export default {
  'Anya Melfissa': {
    defaultPrefix: 'anya',
    transform: prefixedTransform({ split: SPLIT }),
  },
} satisfies TalentNamingExports;
