import { joinParts, romanize, splitWords, stripLeadingWord, type TalentNamingExports } from '../shared';

const SPLIT: Record<string, string[]> = {
  thankyou: ['thank', 'you'],
  highspec: ['high', 'spec'],
  minus100hp: ['minus', '100hp'],
};

const READINGS: Record<string, string> = {
  '充電中': 'juudenchuu',
  'ねこたち': 'neko tachi',
  'ーー': 'oo',
};

export default {
  Roboco: {
    defaultPrefix: 'rbc',
    transform(inner: string, separator: string, prefix: string): string {
      const rest = stripLeadingWord(inner, 'rbc');
      const words = splitWords(rest, separator, SPLIT).map((w) => romanize(w, separator, READINGS));
      return joinParts(separator, prefix.toLowerCase(), ...words);
    },
  },
} satisfies TalentNamingExports;
