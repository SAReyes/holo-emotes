export type EmoteMap = Record<string, string>;
export type TalentMap = Record<string, EmoteMap>;
export type GenerationMap = Record<string, TalentMap>;

export interface TalentInfo {
  page: string;
  oshiMark: string;
  fanName: string;
}

export type TalentInfoMap = Record<string, TalentInfo>;

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
