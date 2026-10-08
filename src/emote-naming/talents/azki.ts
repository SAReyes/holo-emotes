import { joinParts, stripLeadingWord, type TalentNamingExports } from '../shared';

const SPLIT: Record<string, string[]> = {
  hitext: ['hi', 'text'],
  azhand: ['az', 'hand'],
};

export default {
  AZKi: {
    defaultPrefix: 'azki',
    transform(inner: string, separator: string, prefix: string): string {
      const rest = stripLeadingWord(inner, 'azki').toLowerCase();
      return joinParts(separator, prefix.toLowerCase(), ...(SPLIT[rest] ?? [rest]));
    },
  },
} satisfies TalentNamingExports;
