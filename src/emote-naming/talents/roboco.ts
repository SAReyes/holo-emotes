import { prefixedTransform, type TalentNamingExports } from '../shared';

const SPLIT: Record<string, string[]> = {
  thankyou: ['thank', 'you'],
  highspec: ['high', 'spec'],
  minus100hp: ['minus', '100hp'],
};

const READINGS: Record<string, string> = {
  '充電中': 'juudenchuu',
  'ねこたち': 'neko tachi',
  'ーー': 'oo',
};

export default {
  Roboco: {
    defaultPrefix: 'rbc',
    transform: prefixedTransform({ strip: 'rbc', split: SPLIT, readings: READINGS }),
  },
} satisfies TalentNamingExports;
