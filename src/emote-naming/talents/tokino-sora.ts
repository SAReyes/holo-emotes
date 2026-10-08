import { joinParts, romanize, stripLeadingWord, type TalentNamingExports } from '../shared';

const READINGS: Record<string, string> = {
  '止まらねえぞ': 'tomaranee zo',
  '泣いちゃう': 'naichau',
  '新ぬんぬん': 'shin nunnun',
  'ああ迷子': 'aa maigo',
  'あん肝': 'ankimo',
  '赤ちゃん': 'akachan',
  'じゃあ敵だね': 'jaa teki da ne',
  'の絵文字': 'no emoji',
  'ちゃん': 'chan',
  'びっくり': 'bikkuri',
  'ソーダ': 'soda',
  'ミニ': 'mini',
  'ペンラ': 'penlight',
  'ピンク': 'pink',
  '青': 'ao',
  'スンスタンプ': 'sun stamp',
  'ザウルス': 'saurus',
  'ナイス': 'nice',
  'ジトー': 'jito',
};

export default {
  'Tokino Sora': {
    defaultPrefix: 'sora',
    transform(inner: string, separator: string, prefix: string): string {
      const rest = stripLeadingWord(inner, 'そら');
      return joinParts(separator, prefix.toLowerCase(), romanize(rest, separator, READINGS));
    },
  },
} satisfies TalentNamingExports;
