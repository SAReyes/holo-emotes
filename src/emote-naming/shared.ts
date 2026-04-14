/** Strip ": foo:" style wrappers */
export function stripEmoteDelimiters(raw: string): string {
  return raw.replace(/^:\s*/, '').replace(/\s*:$/, '').trim();
}

/** Split PascalCase / camelCase (handles acronyms like SPIN -> spin). */
export function splitCamelCaseWords(s: string): string {
  return s
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2');
}

/** Default: lowercase, non-alphanumeric -> single hyphen, trim hyphens */
export function defaultTransform(inner: string): string {
  return inner
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export type TalentTransform = (inner: string) => string;

/** One exported object per talent file (spread into the registry). */
export type TalentNamingExports = Record<string, TalentTransform>;
