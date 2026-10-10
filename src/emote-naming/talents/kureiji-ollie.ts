import { prefixedTransform, type TalentNamingExports } from '../shared';

const SPLIT: Record<string, string[]> = {
  ollien: ['ollien'],
  hypeollie: ['hype'],
  shockollie: ['shock'],
  bonkollie: ['bonk'],
  sweatollie: ['sweat'],
  danceudin: ['dance', 'udin'],
  sweatyudin: ['sweaty', 'udin'],
  alphai1: ['alpha', 'i1'],
  cepoll: ['cepol', 'left'],
  cepolr: ['cepol', 'right'],
  udingasp: ['udin', 'gasp'],
  udinpat: ['udin', 'pat'],
  olliegg: ['gg'],
  ollieikz: ['ikz'],
};

export default {
  'Kureiji Ollie': {
    defaultPrefix: 'ollie',
    transform: prefixedTransform({ strip: 'ollie', split: SPLIT }),
  },
} satisfies TalentNamingExports;
