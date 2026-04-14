import { type TalentNamingExports } from '../shared';

function joinParts(separator: string, ...parts: string[]): string {
  const filtered = parts.filter((x) => x.length > 0);
  if (!separator) return filtered.join('');
  return filtered.join(separator);
}

function buildExact(separator: string, prefix: string): Record<string, string> {
  const p = prefix.toLowerCase();
  const sep = separator;
  return {
    grem: joinParts(sep, p, 'grem'),
    frewup: joinParts(sep, p, 'frew', 'up'),
    stopfight: joinParts(sep, p, 'stop', 'fight'),
  };
}

function buildPrefixes(separator: string, prefix: string): [string, string][] {
  const p = prefix.toLowerCase();
  const sep = separator;
  const gigiRep = sep ? `${p}${sep}` : p;
  const popoRep = sep ? `${p}${sep}popo${sep}` : `${p}popo`;
  const gremRep = sep ? `${p}${sep}grem${sep}` : `${p}grem`;
  return [
    ['gigi', gigiRep],
    ['popo', popoRep],
    ['grem', gremRep],
  ];
}

export default {
  'Gigi Murin': {
    defaultPrefix: 'gigi',
    transform(inner: string, separator: string, prefix: string): string {
      const key = inner.toLowerCase();
      const sep = separator;
      const p = prefix.toLowerCase();

      const exact = buildExact(sep, p);
      if (exact[key]) return exact[key];

      for (const [pre, replacement] of buildPrefixes(sep, p)) {
        if (key.startsWith(pre)) {
          return replacement + key.slice(pre.length);
        }
      }
      return sep ? `${p}${sep}${key}` : `${p}${key}`;
    },
  },
} satisfies TalentNamingExports;
