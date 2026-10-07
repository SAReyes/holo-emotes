import { joinParts, splitCamelCaseWords, stripLeadingWord, type TalentNamingExports } from '../shared';

export default {
  'Nerissa Ravencroft': {
    defaultPrefix: 'rissa',
    transform(inner: string, separator: string, prefix: string): string {
      // Mixed style: "RissaLove", "KiraKira", "HWA", "bonk"
      const rest = stripLeadingWord(inner, 'Rissa');
      return joinParts(separator, prefix.toLowerCase(), splitCamelCaseWords(rest, separator).toLowerCase());
    },
  },
} satisfies TalentNamingExports;
