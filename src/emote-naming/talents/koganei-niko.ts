import { prefixedTransform, type TalentNamingExports } from '../shared';

const READINGS: Record<string, string> = {
  '鎖': 'kusari',
  '照れる': 'tereru',
  '笑う': 'warau',
  '怒る': 'okoru',
  'ニコ担': 'niko tan',
  '笹': 'sasa',
  'の字': 'no ji',
  'ニコ': 'niko',
  '担': 'tan',
  'キター': 'kitaa',
  '草虎': 'kusatora',
  'ッッッ': 'ltu ltu ltu',
  'ざぁーこ': 'zaako',
  '酒がうまい': 'sake ga umai',
  '困り顔': 'komarigao',
  '萌えッ': 'moe',
};

export default {
  'Koganei Niko': {
    defaultPrefix: 'niko',
    transform: prefixedTransform({ readings: READINGS }),
  },
} satisfies TalentNamingExports;
