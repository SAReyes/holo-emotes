import { prefixedTransform, type TalentNamingExports } from '../shared';

const SPLIT: Record<string, string[]> = {
  thankyou: ['thank', 'you'],
};

const READINGS: Record<string, string> = {
  '紫': 'murasaki',
  'ハバ卒': 'haba sotsu',
  '塩っ子': 'shiokko',
  'トイレ': 'toilet',
};

export default {
  'Murasaki Shion': {
    defaultPrefix: 'shion',
    transform: prefixedTransform({ strip: 'shion', split: SPLIT, readings: READINGS }),
  },
} satisfies TalentNamingExports;
