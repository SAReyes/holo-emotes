import { joinParts, splitWords, stripLeadingWord, type TalentNamingExports } from '../shared';

/** The wiki abbreviates her name as "GuraSmug" or "GurNya"; "GuDuh" / "GuYum" are handled in SPLIT. */
const SELF = ['gura', 'gur'];

/**
 * Keys are the remainder after the self prefix is stripped. L/R suffixes become
 * left/right. "guWAT" is a different emote from "GuraWat", so it stays whole.
 */
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
