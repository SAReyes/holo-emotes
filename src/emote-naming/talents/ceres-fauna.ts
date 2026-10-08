import { joinParts, splitWords, type TalentNamingExports } from '../shared';

const SPLIT: Record<string, string[]> = {
  hugsnail: ['hug', 'snail'],
  pinklight: ['pink', 'light'],
  greenlight: ['green', 'light'],
  nemusmug: ['nemu', 'smug'],
};

export default {
  'Ceres Fauna': {
    defaultPrefix: 'fauna',
    transform(inner: string, separator: string, prefix: string): string {
      return joinParts(separator, prefix.toLowerCase(), ...splitWords(inner, separator, SPLIT));
    },
  },
} satisfies TalentNamingExports;
