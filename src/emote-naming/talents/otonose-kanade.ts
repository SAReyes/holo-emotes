import { prefixedTransform, type TalentNamingExports } from '../shared';

const READINGS: Record<string, string> = {
  'おつのせ': 'otsunose',
  'こんのせ': 'konnose',
  'イラスト': 'illust',
  '音符': 'onpu',
};

export default {
  'Otonose Kanade': {
    defaultPrefix: 'kanade',
    transform: prefixedTransform({ readings: READINGS }),
  },
} satisfies TalentNamingExports;
