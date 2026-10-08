import { joinParts, splitWords, stripLeadingWord, type TalentNamingExports } from '../shared';

const SELF = ['gura', 'gur'];

const SPLIT: Record<string, string[]> = {
  guduh: ['duh'],
  guyum: ['yum'],
  guwat: ['guwat'],
  bloopyayl: ['bloop', 'yay', 'left'],
  bloopyayr: ['bloop', 'yay', 'right'],
  eyel: ['eye', 'left'],
  eyer: ['eye', 'right'],
  redowo: ['red', 'owo'],
};

export default {
  'Gawr Gura': {
    defaultPrefix: 'gura',
    transform(inner: string, separator: string, prefix: string): string {
      let rest = inner;
      for (const self of SELF) {
        const stripped = stripLeadingWord(rest, self);
        if (stripped !== rest) {
          rest = stripped;
          break;
        }
      }
      return joinParts(separator, prefix.toLowerCase(), ...splitWords(rest, separator, SPLIT));
    },
  },
} satisfies TalentNamingExports;
