import { joinParts, splitCamelCaseWords, stripLeadingWord, type TalentNamingExports } from '../shared';

const SPLIT: Record<string, string[]> = {
  novelbonk: ['novel', 'bonk'],
  giftlove: ['gift', 'love'],
  facepaw: ['face', 'paw'],
};

export default {
  'Shiori Novella': {
    defaultPrefix: 'shiori',
    transform(inner: string, separator: string, prefix: string): string {
      const rest = stripLeadingWord(inner, 'shiori');
      const words = SPLIT[rest.toLowerCase()] ?? [splitCamelCaseWords(rest, separator).toLowerCase()];
      return joinParts(separator, prefix.toLowerCase(), ...words);
    },
  },
} satisfies TalentNamingExports;
