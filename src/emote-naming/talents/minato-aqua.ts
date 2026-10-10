import { prefixedTransform, type TalentNamingExports } from '../shared';

const READINGS: Record<string, string> = {
  'あくあ狂う': 'akua kuruu',
  'くそざこ': 'kusozako',
  '理': 'ri',
  '解': 'kai',
  '余裕の余': 'yoyuu no yo',
  '余裕の裕': 'yoyuu no yuu',
  '大天使': 'daitenshi',
  '仲仲仲': 'nakanakanaka',
  '良良良': 'ryouryouryou',
  'っっっ': 'ltu ltu ltu',
  'ト音記号': 'toonkigou',
  '土下座': 'dogeza',
  '悲しい': 'kanashii',
  '台バン': 'daiban',
  '顔': 'kao',
  '休憩': 'kyuukei',
  'タイム': 'time',
};

export default {
  'Minato Aqua': {
    defaultPrefix: 'aqua',
    transform: prefixedTransform({ strip: 'aqua', readings: READINGS }),
  },
} satisfies TalentNamingExports;
