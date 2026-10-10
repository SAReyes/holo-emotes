import { prefixedTransform, type TalentNamingExports } from '../shared';

const READINGS: Record<string, string> = {
  '豆まき専用': 'mamemaki senyou',
  '白ん': 'shiro n',
  '白': 'shiro',
  'クリスマス': 'christmas',
  'プレゼント': 'present',
  '尊い': 'toutoi',
  '笑い': 'warai',
  '手書き': 'tegaki',
  '可': 'ka',
  '愛': 'ai',
  '天': 'ten',
  '才': 'sai',
  '勝': 'kachi',
  'ｱﾞ': 'a',
  'ナイスパ': 'naisupa',
};

export default {
  'Yuzuki Choco': {
    defaultPrefix: 'choco',
    transform: prefixedTransform({ strip: 'ちょこ先生', readings: READINGS }),
  },
} satisfies TalentNamingExports;
