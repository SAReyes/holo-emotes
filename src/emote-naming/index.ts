import { talentTransforms } from './talents';
import { defaultTransform, sanitizeSlug, stripEmoteDelimiters, type NamingConfig } from './shared';

export { stripEmoteDelimiters } from './shared';
export type { NamingConfig, TalentNamingExports, TalentTransformConfig } from './shared';

export function hasTalentTransform(talentName: string): boolean {
  return talentName in talentTransforms;
}

export function getDefaultPrefixes(talentNames: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const name of talentNames) {
    const config = talentTransforms[name];
    if (config) result[name] = config.defaultPrefix;
  }
  return result;
}

export function toSlackName(
  talentName: string,
  rawEmoteName: string,
  cfg?: NamingConfig,
): string {
  const sep = cfg?.separator ?? '-';
  const inner = stripEmoteDelimiters(rawEmoteName);
  if (!inner) return 'emote';

  const config = talentTransforms[talentName];
  const prefixForTalent = cfg?.prefixes?.[talentName] ?? config?.defaultPrefix ?? '';
  const base = config
    ? config.transform(inner, sep, prefixForTalent)
    : defaultTransform(inner, sep);
  return sanitizeSlug(base, sep);
}
