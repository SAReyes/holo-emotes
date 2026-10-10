import { prefixedTransform, type TalentNamingExports } from '../shared';

const READINGS: Record<string, string> = {
  'コヨーテ': 'coyote',
  '尻尾振る': 'shippo furu',
  'こko': 'ko',
  'よyo': 'yo',
  'りri': 'ri',
  'んnn': 'n',
  'おoo': 'o',
  'つtsu': 'tsu',
  '無罪muzai': 'muzai',
  '有罪yuzai': 'yuzai',
  '冷rei': 'rei',
  'さすsus': 'sasu sus',
  '疑問顔': 'gimon kao',
  '酔った': 'yotta',
  'サムズアップ': 'thumbs up',
  '許さない': 'yurusanai',
};

export default {
  'Hakui Koyori': {
    defaultPrefix: 'koyo',
    transform: prefixedTransform({ readings: READINGS }),
  },
} satisfies TalentNamingExports;
