import { joinParts, type TalentNamingExports } from '../shared';

/** Compound words the wiki writes as one token; everything else is prefix + word. */
const SPLIT: Record<string, string[]> = {
  bluestick: ['blue', 'stick'],
  redstick: ['red', 'stick'],
  vewynoice: ['vewy', 'noice'],
  dingdong: ['ding', 'dong'],
  warcry: ['war', 'cry'],
  eyel: ['eye', 'left'],
  eyer: ['eye', 'right'],
};

export default {
  'Elizabeth Rose Bloodflame': {
    defaultPrefix: 'liz',
    transform(inner: string, separator: string, prefix: string): string {
      const key = inner.toLowerCase();
      const words = SPLIT[key] ?? [key];
      return joinParts(separator, prefix.toLowerCase(), ...words);
    },
  },
} satisfies TalentNamingExports;
