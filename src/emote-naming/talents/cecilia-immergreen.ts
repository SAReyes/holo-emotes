import { normalizeSeparators, splitCamelCaseWords, type TalentNamingExports } from '../shared';

export default {
  'Cecilia Immergreen': {
    defaultPrefix: 'cece',
    transform(inner: string, separator: string, prefix: string): string {
      let rest = inner;
      const pLower = prefix.toLowerCase();
      const sep = separator;
      const prefixWithSep = sep ? `${pLower}${sep}` : pLower;

      if (rest.startsWith('CeCe')) {
        rest = `${prefixWithSep}${rest.slice(4)}`;
      }
      if (rest.toLowerCase().startsWith(prefixWithSep.toLowerCase())) {
        const suffix = rest.slice(prefixWithSep.length);
        rest = prefixWithSep + splitCamelCaseWords(suffix, sep);
      } else {
        rest = splitCamelCaseWords(rest, sep);
      }
      return normalizeSeparators(rest.toLowerCase(), sep);
    },
  },
} satisfies TalentNamingExports;
