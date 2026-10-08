import { joinParts, splitWords, type TalentNamingExports } from '../shared';

/** Mixed lowercase/SHOUTED single tokens; these are the ones that read as several words. */
const SPLIT: Record<string, string[]> = {
  squeakyay: ['squeak', 'yay'],
  squeakno: ['squeak', 'no'],
  saltbae: ['salt', 'bae'],
  squarebae: ['square', 'bae'],
  whatadeal: ['what', 'a', 'deal'],
  ouiouipp: ['oui', 'oui', 'pp'],
  jdonmysoul: ['jdon', 'my', 'soul'],
  bestfriend: ['best', 'friend'],
};

export default {
  'Hakos Baelz': {
    defaultPrefix: 'bae',
    transform(inner: string, separator: string, prefix: string): string {
      return joinParts(separator, prefix.toLowerCase(), ...splitWords(inner, separator, SPLIT));
    },
  },
} satisfies TalentNamingExports;
