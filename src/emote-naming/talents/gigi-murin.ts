import type { TalentNamingExports } from '../shared';

const EXACT: Record<string, string> = {
  grem: 'gigi-grem',
  frewup: 'gigi-frew-up',
  stopfight: 'gigi-stop-fight',
};

const PREFIXES: [string, string][] = [
  ['gigi', 'gigi-'],
  ['popo', 'gigi-popo-'],
  ['grem', 'gigi-grem-'],
];

export default {
  'Gigi Murin': (inner: string): string => {
    const key = inner.toLowerCase();
    if (EXACT[key]) return EXACT[key];
    for (const [prefix, replacement] of PREFIXES) {
      if (key.startsWith(prefix)) {
        return replacement + key.slice(prefix.length);
      }
    }
    return `gigi-${key}`;
  },
} satisfies TalentNamingExports;
