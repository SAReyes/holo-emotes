import { joinParts, splitWords, stripLeadingWord, type TalentNamingExports } from '../shared';

export default {
  'Watson Amelia': {
    defaultPrefix: 'ame',
    transform(inner: string, separator: string, prefix: string): string {
      const rest = stripLeadingWord(inner, 'ame');
      return joinParts(separator, prefix.toLowerCase(), ...splitWords(rest, separator));
    },
  },
} satisfies TalentNamingExports;
