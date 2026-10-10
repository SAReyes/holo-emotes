import { prefixedTransform, type TalentNamingExports } from '../shared';

const SPLIT: Record<string, string[]> = {
  kobonk: ['kobonk'],
  q3q: ['q3q'],
  lightleft: ['light', 'left'],
  lightright: ['light', 'right'],
  kletter: ['letter', 'k'],
  oletter: ['letter', 'o'],
  bletter: ['letter', 'b'],
  onfire: ['on', 'fire'],
};

export default {
  'Kobo Kanaeru': {
    defaultPrefix: 'kobo',
    transform: prefixedTransform({ strip: 'kobo', split: SPLIT }),
  },
} satisfies TalentNamingExports;
