import { prefixedTransform, type TalentNamingExports } from '../shared';

const SPLIT: Record<string, string[]> = {
  bigx: ['big', 'x'],
  bigo: ['big', 'o'],
  itsfine: ['its', 'fine'],
  thumbsup: ['thumbs', 'up'],
  meloncube: ['melon', 'cube'],
  sosad: ['so', 'sad'],
};

export default {
  'Pavolia Reine': {
    defaultPrefix: 'reine',
    transform: prefixedTransform({ split: SPLIT }),
  },
} satisfies TalentNamingExports;
