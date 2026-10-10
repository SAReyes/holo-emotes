import { prefixedTransform, type TalentNamingExports } from '../shared';

const SPLIT: Record<string, string[]> = {
  goodgame: ['good', 'game'],
  goodgame2: ['good', 'game2'],
};

const READINGS: Record<string, string> = {
  'てんq': 'ten q',
  'ズーン': 'zuun',
  'ビビ': 'bibi',
  'フレフレ': 'furefure',
  '台パン': 'daiban',
  '指差し': 'yubisashi',
  '虎太郎': 'kotarou',
  'ムキー': 'mukii',
  'マイナステン': 'minus ten',
  'エイチピー': 'hp',
};

export default {
  'Tokoyami Towa': {
    defaultPrefix: 'towa',
    transform: prefixedTransform({ strip: 'トワ様', split: SPLIT, readings: READINGS }),
  },
} satisfies TalentNamingExports;
