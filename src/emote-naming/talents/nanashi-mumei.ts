import { joinParts, splitWords, type TalentNamingExports } from '../shared';

/** Lowercase compounds; camel splitting handles "colonSmile", "friendHap". L/R become left/right. */
const SPLIT: Record<string, string[]> = {
  thumbsup: ['thumbs', 'up'],
  thisisfine: ['this', 'is', 'fine'],
  takomum: ['tako', 'mum'],
  glowstickl: ['glowstick', 'left'],
  glowstickr: ['glowstick', 'right'],
};

export default {
  'Nanashi Mumei': {
    defaultPrefix: 'mumei',
    transform(inner: string, separator: string, prefix: string): string {
      return joinParts(separator, prefix.toLowerCase(), ...splitWords(inner, separator, SPLIT));
    },
  },
} satisfies TalentNamingExports;
