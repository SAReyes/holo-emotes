import JSZip from 'jszip';
import type { SelectedEmote } from './types';
import { toSlackName, type NamingConfig } from './emote-naming';

/** Wikitide / MediaWiki thumb URLs: .../thumb/<hash>/<file>/<N>px-<file> */
const RESIZABLE_PATH = /^(.+)\/thumb\/(.+)\/\d+px-[^/]+$/;

export type ResolutionMode = 'thumbnail' | 'original' | 'custom';

export interface ResolutionConfig {
  mode: ResolutionMode;
  /** Used when mode is 'custom'; clamped 1–512 when resolving */
  customPx?: number;
}

export const CUSTOM_PX_MAX = 512;

export function isResizableUrl(urlString: string): boolean {
  try {
    const { pathname } = new URL(urlString);
    return RESIZABLE_PATH.test(pathname);
  } catch {
    return false;
  }
}

/**
 * Strip /thumb/ and the trailing /<N>px-... segment to get the original asset URL.
 */
export function toOriginalUrl(urlString: string): string {
  try {
    const u = new URL(urlString);
    const m = u.pathname.match(RESIZABLE_PATH);
    if (!m) return urlString;
    const [, prefix, inner] = m;
    u.pathname = `${prefix}/${inner}`;
    return u.href;
  } catch {
    return urlString;
  }
}

/**
 * Replace the width in the thumb segment with customPx (only for resizable URLs).
 */
export function toCustomUrl(urlString: string, px: number): string {
  if (!isResizableUrl(urlString)) return urlString;
  const clamped = clampCustomPx(px);
  try {
    const u = new URL(urlString);
    u.pathname = u.pathname.replace(/\/(\d+)px-([^/]+)$/, `/${clamped}px-$2`);
    return u.href;
  } catch {
    return urlString;
  }
}

export function clampCustomPx(n: number): number {
  if (!Number.isFinite(n)) return 128;
  return Math.max(1, Math.min(CUSTOM_PX_MAX, Math.round(n)));
}

export function resolveExportUrl(urlString: string, config: ResolutionConfig): string {
  if (config.mode === 'thumbnail' || !isResizableUrl(urlString)) return urlString;
  if (config.mode === 'original') return toOriginalUrl(urlString);
  return toCustomUrl(urlString, config.customPx ?? 128);
}

function extensionFromUrl(url: string): string {
  try {
    const path = new URL(url).pathname;
    const base = path.split('/').pop() ?? '';
    const dot = base.lastIndexOf('.');
    if (dot === -1 || dot === base.length - 1) return '.png';
    const ext = base.slice(dot).toLowerCase();
    if (/^\.(png|jpe?g|gif|webp)$/.test(ext)) return ext;
    return '.png';
  } catch {
    return '.png';
  }
}

function uniqueZipEntryName(
  base: string,
  ext: string,
  used: Set<string>,
  duplicateSep: string,
): string {
  let name = `${base}${ext}`;
  if (!used.has(name)) {
    used.add(name);
    return name;
  }
  let n = 2;
  const sep = duplicateSep;
  while (used.has(`${base}${sep}${n}${ext}`)) n += 1;
  name = `${base}${sep}${n}${ext}`;
  used.add(name);
  return name;
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function fetchEmoteWithOptionalFallback(
  primaryUrl: string,
  fallbackUrl: string | null,
  emoteLabel: string,
): Promise<ArrayBuffer> {
  let res = await fetch(primaryUrl, { mode: 'cors' });
  if (!res.ok && fallbackUrl && fallbackUrl !== primaryUrl) {
    res = await fetch(fallbackUrl, { mode: 'cors' });
  }
  if (!res.ok) {
    throw new Error(`Failed to fetch ${emoteLabel}: ${res.status} ${res.statusText}`);
  }
  return res.arrayBuffer();
}

/**
 * Build a ZIP of selected emotes with Slack-safe filenames and start download.
 */
export async function exportForSlack(
  emotes: SelectedEmote[],
  resolution: ResolutionConfig = { mode: 'thumbnail' },
  naming?: NamingConfig,
): Promise<void> {
  if (emotes.length === 0) return;

  const zip = new JSZip();
  const usedNames = new Set<string>();
  const dupSep = naming?.separator ?? '-';

  for (const emote of emotes) {
    const base = toSlackName(emote.talent, emote.name, naming);
    const primaryUrl = resolveExportUrl(emote.url, resolution);
    const ext = extensionFromUrl(primaryUrl);
    const entryName = uniqueZipEntryName(base, ext, usedNames, dupSep);

    const useCustomFallback =
      resolution.mode === 'custom' && isResizableUrl(emote.url);
    const fallbackUrl = useCustomFallback ? toOriginalUrl(emote.url) : null;

    const buf = await fetchEmoteWithOptionalFallback(primaryUrl, fallbackUrl, emote.name);
    zip.file(entryName, buf);
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  const stamp = new Date().toISOString().slice(0, 10);
  triggerDownload(blob, `holo-emotes-slack-${stamp}.zip`);
}
