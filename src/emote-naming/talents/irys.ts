import { joinParts, splitWords, stripLeadingWord, type TalentNamingExports } from '../shared';

/** Keys are the remainder after "irys". Paired l/r emotes become left/right. */
const SPLIT: Record<string, string[]> = {
  wingl: ['wing', 'left'],
  wingr: ['wing', 'right'],
  blooml: ['bloom', 'left'],
  bloomr: ['bloom', 'right'],
  glooml: ['gloom', 'left'],
  gloomr: ['gloom', 'right'],
  bloompat: ['bloom', 'pat'],
  gloompat: ['gloom', 'pat'],
  socool: ['so', 'cool'],
};

export default {
  IRyS: {
    defaultPrefix: 'irys',
    transform(inner: string, separator: string, prefix: string): string {
      const rest = stripLeadingWord(inner, 'irys');
      return joinParts(separator, prefix.toLowerCase(), ...splitWords(rest, separator, SPLIT));
    },
  },
} satisfies TalentNamingExports;
