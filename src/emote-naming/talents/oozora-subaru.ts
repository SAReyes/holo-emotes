import { prefixedTransform, type TalentNamingExports } from '../shared';

const READINGS: Record<string, string> = {
  'ドダック': 'do duck',
  'すばる': 'subaru',
  '肩幅顔': 'katahaba kao',
  '把握': 'haaku',
  'スバル': 'subaru',
  'あひる': 'ahiru',
  'わたあめ': 'wataame',
  'そーせーじ': 'sausage',
  'マグマ': 'magma',
  'うぃんく': 'wink',
  'めろん': 'melon',
  'さいなりうむ': 'sainarium',
};

export default {
  'Oozora Subaru': {
    defaultPrefix: 'subaru',
    transform: prefixedTransform({ strip: 'スバル', readings: READINGS }),
  },
} satisfies TalentNamingExports;
