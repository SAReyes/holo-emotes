import { joinParts, type TalentNamingExports } from '../shared';

export default {
  'Takanashi Kiara': {
    defaultPrefix: 'kiara',
    transform(inner: string, separator: string, prefix: string): string {
      return joinParts(separator, prefix.toLowerCase(), inner.toLowerCase());
    },
  },
} satisfies TalentNamingExports;
