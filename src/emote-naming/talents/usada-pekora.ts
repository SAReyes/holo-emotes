import { prefixedTransform, type TalentNamingExports } from '../shared';

const READINGS: Record<string, string> = {
  '獅々田': 'shishida',
  '焦り顔': 'aseri kao',
  'ウィンク': 'wink',
  'ドン': 'don',
  'ぺこぉ': 'peko o',
  'ぺごぉ': 'pego o',
  'ぺこーーー': 'pekoooo',
};

export default {
  'Usada Pekora': {
    defaultPrefix: 'peko',
    transform: prefixedTransform({ strip: 'peko', readings: READINGS }),
  },
} satisfies TalentNamingExports;
