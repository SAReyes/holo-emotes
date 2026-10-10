import { prefixedTransform, type TalentNamingExports } from '../shared';

const READINGS: Record<string, string> = {
  'のえる': 'noel',
  'でらっくす': 'deluxe',
  'いまじなりーしゃどう': 'imaginary shadow',
  'まっする': 'muscle',
  'みるく': 'milk',
  'けつどり': 'ketsudori',
  'ひかるぼう': 'hikarubou',
};

export default {
  'Shirogane Noel': {
    defaultPrefix: 'noel',
    transform: prefixedTransform({ readings: READINGS }),
  },
} satisfies TalentNamingExports;
