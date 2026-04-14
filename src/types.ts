export type EmoteMap = Record<string, string>;       // emote name -> url
export type TalentMap = Record<string, EmoteMap>;     // talent name -> emotes
export type GenerationMap = Record<string, TalentMap>; // generation name -> talents

export interface BranchData {
  name: string;
  generations: GenerationMap;
}

export interface SelectedEmote {
  branch: string;
  generation: string;
  talent: string;
  name: string;
  url: string;
}
