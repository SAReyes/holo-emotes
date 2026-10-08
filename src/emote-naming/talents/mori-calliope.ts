import { joinParts, splitWords, type TalentNamingExports } from '../shared';

const SPLIT: Record<string, string[]> = {
  ripr: ['rip', 'r'],
  ripi: ['rip', 'i'],
  ripp: ['rip', 'p'],
  nosalt: ['no', 'salt'],
  happymori: ['happy'],
  sleepyreap: ['sleepy', 'reap'],
  drunkmori: ['drunk'],
  cryingmori: ['crying'],
  moriguh: ['guh'],
  morimurder: ['murder'],
  gangimori: ['gangi'],
  calliopog: ['pog'],
  hearteyes: ['heart', 'eyes'],
  washhands: ['wash', 'hands'],
  ghostcat: ['ghost', 'cat'],
  bigeye: ['big', 'eye'],
  lilguy: ['lil', 'guy'],
};

export default {
  'Mori Calliope': {
    defaultPrefix: 'calli',
    transform(inner: string, separator: string, prefix: string): string {
      return joinParts(separator, prefix.toLowerCase(), ...splitWords(inner, separator, SPLIT));
    },
  },
} satisfies TalentNamingExports;
