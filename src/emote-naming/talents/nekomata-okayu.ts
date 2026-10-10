import { prefixedTransform, type TalentNamingExports } from '../shared';

const READINGS: Record<string, string> = {
  'それは': 'soreha',
  '本当': 'hontou',
  '嘘': 'uso',
  'おにぎりゃー': 'onigiryaa',
  'おにぎり': 'onigiri',
  'おかゆ': 'okayu',
  'ドット': 'dot',
  'チューリップ': 'tulip',
  'チュン': 'chun',
  'ワラビー': 'wallaby',
  '勝ち猫': 'kachineko',
  'てまにゃん': 'temanyan',
  '歩く': 'aruku',
  '寝る': 'neru',
  '去る': 'saru',
  'サングラス': 'sunglasses',
  '王様': 'ousama',
  '早口': 'hayakuchi',
  '考えてる': 'kangaeteru',
  '恥ずかしい': 'hazukashii',
  'ビーム': 'beam',
  'の': 'no',
  '連行': 'renkou',
  '檻の中の': 'ori no naka no',
  '倒れる': 'taoreru',
  '炎': 'honoo',
  'ご飯待機': 'gohan taiki',
  '走る': 'hashiru',
  'メス': 'mesu',
  'おかにゃん': 'okanyan',
  'こまっチンゲン菜': 'komacchingensai',
  '愉悦': 'yuetsu',
  'グレープ': 'grape',
};

export default {
  'Nekomata Okayu': {
    defaultPrefix: 'okayu',
    transform: prefixedTransform({ readings: READINGS }),
  },
} satisfies TalentNamingExports;
