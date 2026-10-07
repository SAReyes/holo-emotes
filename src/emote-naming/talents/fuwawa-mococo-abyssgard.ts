import { joinParts, type TalentNamingExports } from '../shared';

/**
 * FuwaMoco share one emote pool. Names led by FUWA or MOCO keep that twin as
 * their prefix; everything shared by both ("BAU", "KUSA", "emojiF") takes the
 * duo prefix from the export modal.
 */
export default {
  'Fuwawa & Mococo Abyssgard': {
    defaultPrefix: 'fwmc',
    transform(inner: string, separator: string, prefix: string): string {
      const key = inner.toLowerCase();
      const p = prefix.toLowerCase();
      if (key === 'fuwamoco') return key;
      for (const twin of ['fuwa', 'moco']) {
        if (key.startsWith(twin)) return joinParts(separator, twin, key.slice(twin.length));
      }
      if (key.startsWith('emoji')) return joinParts(separator, p, 'emoji', key.slice(5));
      return joinParts(separator, p, key);
    },
  },
} satisfies TalentNamingExports;
