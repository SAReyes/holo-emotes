import { prefixedTransform, type TalentNamingExports } from '../shared';

const READINGS: Record<string, string> = {
  '止まらねえぞ': 'tomaranee zo',
  '泣いちゃう': 'naichau',
  '新ぬんぬん': 'shin nunnun',
  'ああ迷子': 'aa maigo',
  'あん肝': 'ankimo',
  '赤ちゃん': 'akachan',
  'じゃあ敵だね': 'jaa teki da ne',
  'の絵文字': 'no emoji',
  'ソーダ': 'soda',
  'ミニ': 'mini',
  '青': 'ao',
  'スンスタンプ': 'sun stamp',
  'ザウルス': 'saurus',
  'ジトー': 'jito',
};

export default {
  'Tokino Sora': {
    defaultPrefix: 'sora',
    transform: prefixedTransform({ strip: 'そら', readings: READINGS }),
  },
} satisfies TalentNamingExports;
