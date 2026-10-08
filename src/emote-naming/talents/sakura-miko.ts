import { joinParts, splitWords, stripLeadingWord, type TalentNamingExports } from '../shared';

const SPLIT: Record<string, string[]> = {
  doya35p: ['doya', '35p'],
  miko35p: ['miko', '35p'],
  genkai35p: ['genkai', '35p'],
  taiyaki35p: ['taiyaki', '35p'],
  mikopipipi: ['miko', 'pipipi'],
  nakimiko: ['naki', 'miko'],
  fxmiko: ['fx', 'miko'],
  penmikop: ['pen', 'mikop'],
  kouhomikop: ['kouho', 'mikop'],
};

export default {
  'Sakura Miko': {
    defaultPrefix: 'miko',
    transform(inner: string, separator: string, prefix: string): string {
      const rest = stripLeadingWord(inner, 'miko');
      return joinParts(separator, prefix.toLowerCase(), ...splitWords(rest, separator, SPLIT));
    },
  },
} satisfies TalentNamingExports;
