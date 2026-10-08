import { joinParts, splitWords, stripLeadingWord, type TalentNamingExports } from '../shared';

const WHOLE = new Set(['krosrprise', 'kronichiwa', 'kronfused', 'kropium', 'yukkronii']);
const SUB_PREFIXES = ['kronie', 'boros'];
const SELF = ['kronii', 'kro'];

const SPLIT: Record<string, string[]> = {
  megalol: ['mega', 'lol'],
  hairflip: ['hair', 'flip'],
  timetostop: ['time', 'to', 'stop'],
  whatadeal: ['what', 'a', 'deal'],
  neckcrack: ['neck', 'crack'],
  polltime: ['poll', 'time'],
};

export default {
  'Ouro Kronii': {
    defaultPrefix: 'kronii',
    transform(inner: string, separator: string, prefix: string): string {
      const key = inner.toLowerCase();
      const p = prefix.toLowerCase();
      if (WHOLE.has(key)) return joinParts(separator, p, key);
      for (const sub of SUB_PREFIXES) {
        if (key.startsWith(sub)) return joinParts(separator, p, sub, ...splitWords(key.slice(sub.length), separator, SPLIT));
      }
      let rest = inner;
      for (const self of SELF) {
        const stripped = stripLeadingWord(rest, self);
        if (stripped !== rest) {
          rest = stripped;
          break;
        }
      }
      return joinParts(separator, p, ...splitWords(rest, separator, SPLIT));
    },
  },
} satisfies TalentNamingExports;
