import { prefixedTransform, type TalentNamingExports } from '../shared';

const READINGS: Record<string, string> = {
  '泣ける': 'nakeru',
  '晴れ着': 'haregi',
  '学生': 'gakusei',
  'マリン': 'marin',
  'まりん': 'marin',
  'ルーナ': 'luna',
  'ゲーミング圧': 'gaming atsu',
  '沈没船長': 'chinbotsu senchou',
  '78歳': '78 sai',
  'きっつの': 'kittsu no',
  '大きいつ': 'ookii tsu',
  'ヨーソローのー': 'yosoro no nobashi',
  'ヨーソローの': 'yosoro no',
  'の字': 'no ji',
  '若': 'waka',
  'ムラムラの': 'muramura no',
  'どくろくん': 'dokuro kun',
  'ろり': 'rori',
  'ヤク': 'yaku',
  'サイコロリ': 'saikorori',
  'マリ': 'mari',
  'クラピカ': 'kurapika',
  'ヘブン': 'heaven',
};

export default {
  'Houshou Marine': {
    defaultPrefix: 'marine',
    transform: prefixedTransform({ readings: READINGS }),
  },
} satisfies TalentNamingExports;
