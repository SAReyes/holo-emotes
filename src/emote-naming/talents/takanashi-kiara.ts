import { joinParts, type TalentNamingExports } from '../shared';

export default {
  'Takanashi Kiara': {
    defaultPrefix: 'kiara',
    transform(inner: string, separator: string, prefix: string): string {
      // Short codes ("mgn", "fpm", "YLS", "1010"): prefix + lowercase, nothing to split.
      return joinParts(separator, prefix.toLowerCase(), inner.toLowerCase());
    },
  },
} satisfies TalentNamingExports;
