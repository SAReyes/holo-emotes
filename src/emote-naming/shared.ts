/** Strip ": foo:" style wrappers */
export function stripEmoteDelimiters(raw: string): string {
  return raw.replace(/^:\s*/, '').replace(/\s*:$/, '').trim();
}

export interface NamingConfig {
  separator: string;
  prefixes: Record<string, string>;
}

export interface TalentTransformConfig {
  defaultPrefix: string;
  transform: (inner: string, separator: string, prefix: string) => string;
}

/** One exported object per talent file (spread into the registry). */
export type TalentNamingExports = Record<string, TalentTransformConfig>;

/** Escape a string for use inside a character class or as a literal in RegExp. */
export function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Split PascalCase / camelCase (handles acronyms like SPIN -> spin). */
export function splitCamelCaseWords(s: string, separator: string): string {
  const sep = separator;
  return s
    .replace(/([a-z0-9])([A-Z])/g, `$1${sep}$2`)
    .replace(/([A-Z]+)([A-Z][a-z])/g, `$1${sep}$2`);
}

/** Join non-empty parts with the separator (or concatenate when it is empty). */
export function joinParts(separator: string, ...parts: string[]): string {
  const filtered = parts.filter((x) => x.length > 0);
  return filtered.join(separator);
}

/** Remove a leading word (case-insensitive) such as the talent's own name: "shioriComfy" -> "Comfy". */
export function stripLeadingWord(s: string, word: string): string {
  return s.toLowerCase().startsWith(word.toLowerCase()) ? s.slice(word.length) : s;
}

/** Collapse repeated separators and trim leading/trailing. */
export function normalizeSeparators(s: string, separator: string): string {
  if (!separator) return s;
  const esc = escapeRegExp(separator);
  return s
    .replace(new RegExp(`${esc}+`, 'g'), separator)
    .replace(new RegExp(`^${esc}|${esc}$`, 'g'), '');
}

/** Default: lowercase, non-alphanumeric -> separator, collapse, trim */
export function defaultTransform(inner: string, separator: string): string {
  const sep = separator;
  const lower = inner.toLowerCase();
  if (!sep) {
    return lower.replace(/[^a-z0-9]/g, '');
  }
  const esc = escapeRegExp(sep);
  return lower
    .replace(/[^a-z0-9]+/g, sep)
    .replace(new RegExp(`${esc}+`, 'g'), sep)
    .replace(new RegExp(`^${esc}|${esc}$`, 'g'), '');
}

/** Final pass after a talent transform: keep only [a-z0-9] and literal separator (any length). */
export function sanitizeSlug(base: string, separator: string): string {
  if (!separator) {
    const out = base.toLowerCase().replace(/[^a-z0-9]/g, '');
    return out || 'emote';
  }
  const sep = separator;
  const lower = base.toLowerCase();
  let out = '';
  for (let i = 0; i < lower.length; ) {
    if (lower.startsWith(sep, i)) {
      out += sep;
      i += sep.length;
      continue;
    }
    const c = lower[i];
    if (/[a-z0-9]/.test(c)) {
      out += c;
      i += 1;
      continue;
    }
    i += 1;
  }
  const esc = escapeRegExp(sep);
  out = out.replace(new RegExp(`(?:${esc})+`, 'g'), sep);
  out = out.replace(new RegExp(`^${esc}|${esc}$`, 'g'), '');
  return out || 'emote';
}

/** Words after the prefix: an explicit SPLIT entry wins, otherwise camelCase boundaries. */
export function splitWords(rest: string, separator: string, split: Record<string, string[]> = {}): string[] {
  return split[rest.toLowerCase()] ?? [splitCamelCaseWords(rest, separator).toLowerCase()];
}
