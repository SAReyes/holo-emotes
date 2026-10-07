import type { TalentTransformConfig } from '../shared';
import ceciliaImmergreen from './cecilia-immergreen';
import elizabethRoseBloodflame from './elizabeth-rose-bloodflame';
import fuwawaMococoAbyssgard from './fuwawa-mococo-abyssgard';
import gigiMurin from './gigi-murin';
import kosekiBijou from './koseki-bijou';
import nerissaRavencroft from './nerissa-ravencroft';
import raoraPanthera from './raora-panthera';
import shioriNovella from './shiori-novella';

export const talentTransforms: Record<string, TalentTransformConfig> = {
  ...ceciliaImmergreen,
  ...elizabethRoseBloodflame,
  ...fuwawaMococoAbyssgard,
  ...gigiMurin,
  ...kosekiBijou,
  ...nerissaRavencroft,
  ...raoraPanthera,
  ...shioriNovella,
};
