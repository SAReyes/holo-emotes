import { joinParts, splitCamelCaseWords, stripLeadingWord, type TalentNamingExports } from '../shared';

const SPLIT: Record<string, string[]> = {
  swirlyeyes: ['swirly', 'eyes'],
};

export default {
  'Koseki Bijou': {
    defaultPrefix: 'bijou',
    transform(inner: string, separator: string, prefix: string): string {
      const rest = stripLeadingWord(inner, 'bijou');
      const key = rest.toLowerCase();
      let words: string[];
      if (SPLIT[key]) {
        words = SPLIT[key];
      } else if (key.startsWith('pebble')) {
        words = ['pebble', splitCamelCaseWords(rest.slice(6), separator).toLowerCase()];
      } else {
        words = [splitCamelCaseWords(rest, separator).toLowerCase()];
      }
      return joinParts(separator, prefix.toLowerCase(), ...words);
    },
  },
} satisfies TalentNamingExports;
