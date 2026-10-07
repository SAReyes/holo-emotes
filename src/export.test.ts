import JSZip from 'jszip';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  clampCustomPx,
  exportForSlack,
  isResizableUrl,
  resolveExportUrl,
  toCustomUrl,
  toOriginalUrl,
} from './export';
import type { SelectedEmote } from './types';

// Real URLs from public/emotes/*.json. The wiki serves most emotes as
// resizable thumbs and a few (Indonesia) as plain originals.
const THUMB = 'https://static.wikitide.net/hololivewiki/thumb/d/db/Emote-gigi1.png/90px-Emote-gigi1.png';
const ORIGINAL = 'https://static.wikitide.net/hololivewiki/d/db/Emote-gigi1.png';
const PLAIN = 'https://static.wikitide.net/hololivewiki/4/41/Emote-risu1.png';

describe('URL resolution', () => {
  it('recognises MediaWiki thumb URLs', () => {
    expect(isResizableUrl(THUMB)).toBe(true);
    expect(isResizableUrl(PLAIN)).toBe(false);
    expect(isResizableUrl('not a url')).toBe(false);
  });

  it('strips the thumb segment to reach the original', () => {
    expect(toOriginalUrl(THUMB)).toBe(ORIGINAL);
    expect(toOriginalUrl(PLAIN)).toBe(PLAIN);
  });

  it('rewrites the pixel width, clamped to the allowed range', () => {
    expect(toCustomUrl(THUMB, 128)).toBe(
      'https://static.wikitide.net/hololivewiki/thumb/d/db/Emote-gigi1.png/128px-Emote-gigi1.png',
    );
    expect(toCustomUrl(THUMB, 9999)).toBe(
      'https://static.wikitide.net/hololivewiki/thumb/d/db/Emote-gigi1.png/512px-Emote-gigi1.png',
    );
    expect(toCustomUrl(PLAIN, 128)).toBe(PLAIN);
  });

  it('clamps custom sizes to 1..512 and defaults junk to 128', () => {
    expect(clampCustomPx(0)).toBe(1);
    expect(clampCustomPx(600)).toBe(512);
    expect(clampCustomPx(100.4)).toBe(100);
    expect(clampCustomPx(Number.NaN)).toBe(128);
  });

  it('resolves by mode', () => {
    expect(resolveExportUrl(THUMB, { mode: 'thumbnail' })).toBe(THUMB);
    expect(resolveExportUrl(THUMB, { mode: 'original' })).toBe(ORIGINAL);
    expect(resolveExportUrl(THUMB, { mode: 'custom', customPx: 64 })).toBe(
      'https://static.wikitide.net/hololivewiki/thumb/d/db/Emote-gigi1.png/64px-Emote-gigi1.png',
    );
    expect(resolveExportUrl(THUMB, { mode: 'custom' })).toBe(
      'https://static.wikitide.net/hololivewiki/thumb/d/db/Emote-gigi1.png/128px-Emote-gigi1.png',
    );
    expect(resolveExportUrl(PLAIN, { mode: 'original' })).toBe(PLAIN);
  });
});

function emote(talent: string, name: string, url: string): SelectedEmote {
  return { branch: 'Hololive English', generation: 'Justice', talent, name, url };
}

/** Stub fetch, the DOM download anchor, and object URLs; return what was downloaded. */
function stubBrowser(responder: (url: string) => Response) {
  const fetched: string[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      fetched.push(url);
      return responder(url);
    }),
  );

  const download: { blob?: Blob; filename?: string } = {};
  vi.spyOn(URL, 'createObjectURL').mockImplementation((blob) => {
    download.blob = blob as Blob;
    return 'blob:stub';
  });
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

  const anchor = { href: '', download: '', rel: '', click: vi.fn(), remove: vi.fn() };
  vi.stubGlobal('document', {
    createElement: () => anchor,
    body: { appendChild: vi.fn() },
  });

  return {
    fetched,
    download: () => ({ ...download, filename: anchor.download, clicked: anchor.click.mock.calls.length }),
  };
}

const ok = (body: string) => new Response(body, { status: 200 });
const notFound = () => new Response('', { status: 404, statusText: 'Not Found' });

async function entries(blob: Blob): Promise<Record<string, string>> {
  const zip = await JSZip.loadAsync(await blob.arrayBuffer());
  const out: Record<string, string> = {};
  for (const [name, file] of Object.entries(zip.files)) out[name] = await file.async('string');
  return out;
}

describe('exportForSlack', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('does nothing for an empty selection', async () => {
    const b = stubBrowser(() => ok(''));
    await exportForSlack([]);
    expect(b.fetched).toEqual([]);
    expect(b.download().clicked).toBe(0);
  });

  it('zips emotes under their Slack names and numbers duplicates', async () => {
    const b = stubBrowser((url) => ok(`bytes:${url.split('/').pop()}`));
    await exportForSlack([
      emote('Gigi Murin', ': gigiwave:', THUMB),
      emote('Gigi Murin', ': gigiwave:', THUMB.replaceAll('gigi1', 'gigi2')),
      emote('Cecilia Immergreen', ': CeCeLaugh:', THUMB.replaceAll('gigi1', 'cece1')),
      emote('Ayunda Risu', ': Brr:', PLAIN),
    ]);

    const d = b.download();
    expect(d.clicked).toBe(1);
    expect(d.filename).toMatch(/^holo-emotes-slack-\d{4}-\d{2}-\d{2}\.zip$/);
    expect(await entries(d.blob!)).toEqual({
      'gigi-wave.png': 'bytes:90px-Emote-gigi1.png',
      'gigi-wave-2.png': 'bytes:90px-Emote-gigi2.png',
      'cece-laugh.png': 'bytes:90px-Emote-cece1.png',
      'brr.png': 'bytes:Emote-risu1.png',
    });
  });

  it('applies the naming config to filenames and the duplicate suffix', async () => {
    const b = stubBrowser(() => ok('x'));
    await exportForSlack(
      [emote('Gigi Murin', ': gigiwave:', THUMB), emote('Gigi Murin', ': gigiwave:', THUMB)],
      { mode: 'thumbnail' },
      { separator: '_', prefixes: { 'Gigi Murin': 'gg' } },
    );
    expect(Object.keys(await entries(b.download().blob!)).sort()).toEqual(['gg_wave.png', 'gg_wave_2.png']);
  });

  it('fetches the resolved URL for the chosen resolution', async () => {
    const b = stubBrowser(() => ok('x'));
    await exportForSlack([emote('Gigi Murin', ': gigiwave:', THUMB)], { mode: 'original' });
    expect(b.fetched).toEqual([ORIGINAL]);
  });

  it('falls back to the original when a custom size is missing on the server', async () => {
    const b = stubBrowser((url) => (url.includes('/256px-') ? notFound() : ok('fallback')));
    await exportForSlack([emote('Gigi Murin', ': gigiwave:', THUMB)], { mode: 'custom', customPx: 256 });
    expect(b.fetched).toEqual([
      'https://static.wikitide.net/hololivewiki/thumb/d/db/Emote-gigi1.png/256px-Emote-gigi1.png',
      ORIGINAL,
    ]);
    expect(await entries(b.download().blob!)).toEqual({ 'gigi-wave.png': 'fallback' });
  });

  it('throws with the emote name when the image cannot be fetched', async () => {
    stubBrowser(() => notFound());
    await expect(exportForSlack([emote('Gigi Murin', ': gigiwave:', PLAIN)])).rejects.toThrow(
      'Failed to fetch : gigiwave:: 404 Not Found',
    );
  });
});
