import { joinParts, type TalentNamingExports } from '../shared';

const SPLIT: Record<string, string[]> = {
  rightglow: ['right', 'glow'],
  leftglow: ['left', 'glow'],
  gonext: ['go', 'next'],
};

export default {
  "Ninomae Ina'nis": {
    defaultPrefix: 'ina',
    transform(inner: string, separator: string, prefix: string): string {
      const key = inner.toLowerCase();
      return joinParts(separator, prefix.toLowerCase(), ...(SPLIT[key] ?? [key]));
    },
  },
} satisfies TalentNamingExports;
