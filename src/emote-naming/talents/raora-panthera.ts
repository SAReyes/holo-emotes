import { normalizeSeparators, type TalentNamingExports } from '../shared';

export default {
  'Raora Panthera': {
    defaultPrefix: 'rao',
    transform(inner: string, separator: string, prefix: string): string {
      const p = prefix.toLowerCase();
      const body = inner.toLowerCase();
      const joined = separator ? `${p}${separator}${body}` : `${p}${body}`;
      return normalizeSeparators(joined, separator);
    },
  },
} satisfies TalentNamingExports;
