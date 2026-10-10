import { toRomaji } from 'wanakana';

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

export type TalentNamingExports = Record<string, TalentTransformConfig>;

export function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function splitCamelCaseWords(s: string, separator: string): string {
  const sep = separator;
  return s
    .replace(/([a-z0-9])([A-Z])/g, `$1${sep}$2`)
    .replace(/([A-Z]+)([A-Z][a-z])/g, `$1${sep}$2`);
}

export function joinParts(separator: string, ...parts: string[]): string {
  const filtered = parts.filter((x) => x.length > 0);
  return filtered.join(separator);
}

export function stripLeadingWord(s: string, word: string): string {
  return s.toLowerCase().startsWith(word.toLowerCase()) ? s.slice(word.length) : s;
}

export function normalizeSeparators(s: string, separator: string): string {
  if (!separator) return s;
  const esc = escapeRegExp(separator);
  return s
    .replace(new RegExp(`${esc}+`, 'g'), separator)
    .replace(new RegExp(`^${esc}|${esc}$`, 'g'), '');
}

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

export function splitWords(rest: string, separator: string, split: Record<string, string[]> = {}): string[] {
  return split[rest.toLowerCase()] ?? [splitCamelCaseWords(rest, separator).toLowerCase()];
}

const COMMON_READINGS: Record<string, string> = {
  'サイリウム': 'sairium',
  'さいりうむ': 'sairium',
  'ペンライト': 'penlight',
  'ペンラ': 'penlight',
  'ピンク': 'pink',
  'ブルー': 'blue',
  'グリーン': 'green',
  'スタンプ': 'stamp',
  'ハート': 'heart',
  'はーと': 'heart',
  'アイドル': 'idol',
  'シンプル': 'simple',
  'まーく': 'mark',
  'マーク': 'mark',
  'びっくり': 'bikkuri',
  'ビックリ': 'bikkuri',
  'はてな': 'hatena',
  'ナイス': 'nice',
  'ちゃん': 'chan',
  '文字': 'moji',
  '草': 'kusa',
  'ーーー': 'nobashi',
  'ｗｗｗ': 'www',
  'ｗ': 'w',
};

const KANA_FIXES: Record<string, string> = {
  'ふぁ': 'fa',
  'ふぃ': 'fi',
  'ふぇ': 'fe',
  'ふぉ': 'fo',
  'ファ': 'fa',
  'フィ': 'fi',
  'フェ': 'fe',
  'フォ': 'fo',
  'ちぃ': 'chii',
  'ひぃ': 'hii',
  'みぃ': 'mii',
  'ミィ': 'mii',
};

const HIRAGANA_BAR = /([\u3041-\u3096])(ー+)/g;

function replaceAll(s: string, table: Record<string, string>, wrap: (v: string) => string): string {
  const keys = Object.keys(table).sort((a, b) => b.length - a.length);
  let out = s;
  for (const key of keys) {
    out = out.split(key).join(wrap(table[key]));
  }
  return out;
}

export function romanize(inner: string, separator: string, readings: Record<string, string> = {}): string {
  const worded = replaceAll(inner, { ...COMMON_READINGS, ...readings }, (v) => ` ${v} `);
  const stretched = worded.replace(HIRAGANA_BAR, (_, kana: string, bars: string) => kana + toRomaji(kana).slice(-1).repeat(bars.length));
  const fixed = replaceAll(stretched, KANA_FIXES, (v) => v).normalize('NFKC');
  return defaultTransform(toRomaji(fixed), separator);
}

export interface TalentRules {
  strip?: string;
  split?: Record<string, string[]>;
  readings?: Record<string, string>;
}

export function prefixedTransform(rules: TalentRules = {}) {
  return (inner: string, separator: string, prefix: string): string => {
    const whole = rules.split?.[inner.toLowerCase()];
    const rest = rules.strip ? stripLeadingWord(inner, rules.strip) : inner;
    const words = (whole ?? splitWords(rest, separator, rules.split)).map((w) => romanize(w, separator, rules.readings));
    return joinParts(separator, prefix.toLowerCase(), ...words);
  };
}
