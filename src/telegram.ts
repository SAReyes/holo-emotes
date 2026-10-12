import JSZip from 'jszip';
import type { SelectedEmote } from './types';
import { toSlackName, type NamingConfig } from './emote-naming';
import { fetchEmoteWithOptionalFallback, toOriginalUrl, triggerDownload, uniqueZipEntryName } from './export';

export const STICKER_SIZE = 512;
export const PACK_CREATE_BATCH = 50;
export const PACK_STICKER_LIMIT = 120;
export const KEYWORDS_MAX_LENGTH = 64;
export const PACK_NAME_MAX_LENGTH = 64;

const PACK_BASE = /^[A-Za-z][A-Za-z0-9_]*$/;
const API_RETRIES = 3;

export interface EmojiAssignment {
  emote: SelectedEmote;
  emoji: string;
}

export type ExistingPackMode = 'append' | 'replace';

export interface TelegramPackConfig {
  botToken: string;
  userId: number;
  packBase: string;
  packTitle: string;
  existing?: ExistingPackMode;
}

export interface ExistingPack {
  name: string;
  title: string;
  count: number;
}

export interface CreatedPack {
  name: string;
  title: string;
  count: number;
  botUsername: string;
  link: string;
  appLink: string;
}

export class PackExistsError extends Error {
  pack: ExistingPack;

  constructor(pack: ExistingPack) {
    super(`A pack named ${pack.name} already exists with ${pack.count} stickers.`);
    this.pack = pack;
  }
}

export interface InputSticker {
  sticker: string;
  format: 'static';
  emoji_list: string[];
  keywords: string[];
}

export interface PreparedSticker {
  attach: string;
  input: InputSticker;
  emote: SelectedEmote;
}

export interface TelegramProgress {
  phase: 'render' | 'upload';
  done: number;
  total: number;
}

export type RenderSticker = (bytes: ArrayBuffer) => Promise<Blob>;

interface TelegramResponse<T> {
  ok: boolean;
  result?: T;
  description?: string;
  error_code?: number;
  parameters?: { retry_after?: number };
}

export function packShortName(base: string, botUsername: string): string {
  return `${base}_by_${botUsername}`;
}

export function validatePackBase(base: string, botUsername: string): string | null {
  if (!base) return 'Enter a pack name.';
  if (!PACK_BASE.test(base)) return 'Use only English letters, digits and underscores, starting with a letter.';
  if (base.includes('__')) return 'Underscores cannot be consecutive.';
  if (base.endsWith('_')) return 'The name cannot end with an underscore.';
  if (packShortName(base, botUsername).length > PACK_NAME_MAX_LENGTH) {
    return `The full name must be at most ${PACK_NAME_MAX_LENGTH} characters including _by_${botUsername}.`;
  }
  return null;
}

export function slugKeywords(slug: string, separator: string): string[] {
  const words = separator ? slug.split(separator).filter(Boolean) : [slug];
  const out: string[] = [];
  let length = 0;
  for (const word of words) {
    if (length + word.length > KEYWORDS_MAX_LENGTH) break;
    out.push(word);
    length += word.length;
  }
  return out;
}

export function prepareStickers(items: EmojiAssignment[], naming?: NamingConfig): PreparedSticker[] {
  const separator = naming?.separator ?? '-';
  return items.map(({ emote, emoji }, index) => {
    const attach = `emote${index}`;
    const slug = toSlackName(emote.talent, emote.name, naming);
    return {
      attach,
      emote,
      input: {
        sticker: `attach://${attach}`,
        format: 'static',
        emoji_list: [emoji],
        keywords: slugKeywords(slug, separator),
      },
    };
  });
}

export function buildCreateForm(
  cfg: TelegramPackConfig,
  packName: string,
  stickers: PreparedSticker[],
  blobs: Blob[],
): FormData {
  const form = new FormData();
  form.set('user_id', String(cfg.userId));
  form.set('name', packName);
  form.set('title', cfg.packTitle);
  form.set('sticker_type', 'regular');
  form.set('stickers', JSON.stringify(stickers.map((s) => s.input)));
  stickers.forEach((s, i) => form.set(s.attach, blobs[i], `${s.attach}.png`));
  return form;
}

export function buildAddForm(
  cfg: TelegramPackConfig,
  packName: string,
  sticker: PreparedSticker,
  blob: Blob,
): FormData {
  const form = new FormData();
  form.set('user_id', String(cfg.userId));
  form.set('name', packName);
  form.set('sticker', JSON.stringify(sticker.input));
  form.set(sticker.attach, blob, `${sticker.attach}.png`);
  return form;
}

export function buildManifest(entries: Array<{ file: string; emoji: string }>): string {
  return entries.map(({ file, emoji }) => `${file}\t${emoji}`).join('\n') + '\n';
}

export function packLink(packName: string): string {
  return `https://t.me/addstickers/${packName}`;
}

export function packAppLink(packName: string): string {
  return `tg://addstickers?set=${packName}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callBot<T>(token: string, method: string, body?: FormData): Promise<T> {
  let lastError = `Telegram ${method} failed`;
  for (let attempt = 0; attempt < API_RETRIES; attempt += 1) {
    const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: 'POST',
      body,
    });
    const json = (await res.json()) as TelegramResponse<T>;
    if (json.ok && json.result !== undefined) return json.result;
    lastError = json.description ?? lastError;
    const retryAfter = json.parameters?.retry_after;
    if (json.error_code === 429 && retryAfter !== undefined) {
      await sleep(retryAfter * 1000);
      continue;
    }
    break;
  }
  throw new Error(lastError);
}

export async function fetchBotUsername(token: string): Promise<string> {
  const me = await callBot<{ username?: string }>(token, 'getMe');
  if (!me.username) throw new Error('The bot has no username.');
  return me.username;
}

export async function fetchStickerSet(token: string, name: string): Promise<ExistingPack | null> {
  const form = new FormData();
  form.set('name', name);
  try {
    const set = await callBot<{ name: string; title: string; stickers: unknown[] }>(token, 'getStickerSet', form);
    return { name: set.name, title: set.title, count: set.stickers.length };
  } catch (err) {
    if (err instanceof Error && /STICKERSET_INVALID|not found/i.test(err.message)) return null;
    throw err;
  }
}

export async function verifyPacks(token: string, names: string[]): Promise<Record<string, ExistingPack | null>> {
  const out: Record<string, ExistingPack | null> = {};
  for (const name of names) out[name] = await fetchStickerSet(token, name);
  return out;
}

async function deleteStickerSet(token: string, name: string): Promise<void> {
  const form = new FormData();
  form.set('name', name);
  await callBot<boolean>(token, 'deleteStickerSet', form);
}

export async function detectUserId(token: string): Promise<number> {
  const updates = await callBot<Array<{ message?: { from?: { id: number }; chat?: { type: string } } }>>(
    token,
    'getUpdates',
  );
  for (let i = updates.length - 1; i >= 0; i -= 1) {
    const message = updates[i].message;
    if (message?.chat?.type === 'private' && message.from) return message.from.id;
  }
  throw new Error('No message found. Send /start to your bot in Telegram, then try again.');
}

export async function renderStickerPng(bytes: ArrayBuffer): Promise<Blob> {
  const bitmap = await createImageBitmap(new Blob([bytes]));
  const canvas = document.createElement('canvas');
  canvas.width = STICKER_SIZE;
  canvas.height = STICKER_SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not available in this browser.');
  const scale = Math.min(STICKER_SIZE / bitmap.width, STICKER_SIZE / bitmap.height);
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bitmap, Math.round((STICKER_SIZE - w) / 2), Math.round((STICKER_SIZE - h) / 2), w, h);
  bitmap.close();
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not encode PNG.'))), 'image/png');
  });
}

async function fetchRendered(emote: SelectedEmote, render: RenderSticker): Promise<Blob> {
  const bytes = await fetchEmoteWithOptionalFallback(toOriginalUrl(emote.url), null, emote.name);
  return render(bytes);
}

export async function createStickerPack(
  items: EmojiAssignment[],
  cfg: TelegramPackConfig,
  naming?: NamingConfig,
  onProgress?: (p: TelegramProgress) => void,
  render: RenderSticker = renderStickerPng,
): Promise<CreatedPack> {
  if (items.length === 0) throw new Error('Nothing selected.');
  if (items.length > PACK_STICKER_LIMIT) {
    throw new Error(`Telegram sticker packs hold at most ${PACK_STICKER_LIMIT} stickers. Selected: ${items.length}.`);
  }

  const botUsername = await fetchBotUsername(cfg.botToken);
  const invalid = validatePackBase(cfg.packBase, botUsername);
  if (invalid) throw new Error(invalid);
  const packName = packShortName(cfg.packBase, botUsername);

  const current = await fetchStickerSet(cfg.botToken, packName);
  if (current && !cfg.existing) throw new PackExistsError(current);
  const appending = Boolean(current && cfg.existing === 'append');
  if (appending && current!.count + items.length > PACK_STICKER_LIMIT) {
    throw new Error(
      `${current!.name} holds ${current!.count} stickers and packs are capped at ${PACK_STICKER_LIMIT}. Room for ${PACK_STICKER_LIMIT - current!.count}.`,
    );
  }
  if (current && cfg.existing === 'replace') await deleteStickerSet(cfg.botToken, packName);

  const stickers = prepareStickers(items, naming);
  const total = stickers.length;
  const report = (phase: TelegramProgress['phase'], done: number) => onProgress?.({ phase, done, total });

  report('render', 0);
  const blobs: Blob[] = [];
  for (const s of stickers) {
    blobs.push(await fetchRendered(s.emote, render));
    report('render', blobs.length);
  }

  report('upload', 0);
  let added = 0;
  if (!appending) {
    const first = stickers.slice(0, PACK_CREATE_BATCH);
    await callBot<boolean>(cfg.botToken, 'createNewStickerSet', buildCreateForm(cfg, packName, first, blobs.slice(0, first.length)));
    added = first.length;
    report('upload', added);
  }

  for (let i = added; i < total; i += 1) {
    const s = stickers[i];
    try {
      await callBot<boolean>(cfg.botToken, 'addStickerToSet', buildAddForm(cfg, packName, s, blobs[i]));
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      const verb = appending ? 'Added' : 'Pack created with';
      throw new Error(`${verb} ${i} of ${total} stickers. Failed on ${s.emote.name}: ${reason}`);
    }
    report('upload', i + 1);
  }

  return {
    name: packName,
    title: appending ? current!.title : cfg.packTitle,
    count: (appending ? current!.count : 0) + total,
    botUsername,
    link: packLink(packName),
    appLink: packAppLink(packName),
  };
}

export async function exportTelegramZip(
  items: EmojiAssignment[],
  naming?: NamingConfig,
  render: RenderSticker = renderStickerPng,
): Promise<void> {
  if (items.length === 0) return;

  const zip = new JSZip();
  const used = new Set<string>();
  const dupSep = naming?.separator ?? '-';
  const manifest: Array<{ file: string; emoji: string }> = [];

  for (const { emote, emoji } of items) {
    const base = toSlackName(emote.talent, emote.name, naming);
    const file = uniqueZipEntryName(base, '.png', used, dupSep);
    const blob = await fetchRendered(emote, render);
    zip.file(file, await blob.arrayBuffer());
    manifest.push({ file, emoji });
  }
  zip.file('emoji.txt', buildManifest(manifest));

  const blob = await zip.generateAsync({ type: 'blob' });
  const stamp = new Date().toISOString().slice(0, 10);
  triggerDownload(blob, `holo-emotes-telegram-${stamp}.zip`);
}
