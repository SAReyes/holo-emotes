import { talentTransforms } from './talents';
import { defaultTransform, stripEmoteDelimiters } from './shared';

export { stripEmoteDelimiters } from './shared';
export type { TalentNamingExports, TalentTransform } from './shared';

export function hasTalentTransform(talentName: string): boolean {
  return talentName in talentTransforms;
}

export function toSlackName(talentName: string, rawEmoteName: string): string {
  const inner = stripEmoteDelimiters(rawEmoteName);
  if (!inner) return 'emote';

  const transform = talentTransforms[talentName];
  const base = transform ? transform(inner) : defaultTransform(inner);
  const sanitized = base.replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '');
  return sanitized || 'emote';
}
