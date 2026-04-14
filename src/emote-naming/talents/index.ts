import type { TalentTransform } from '../shared';
import ceciliaImmergreen from './cecilia-immergreen';
import gigiMurin from './gigi-murin';
import raoraPanthera from './raora-panthera';

export const talentTransforms: Record<string, TalentTransform> = {
  ...ceciliaImmergreen,
  ...gigiMurin,
  ...raoraPanthera,
};
