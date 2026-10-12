import JSZip from 'jszip';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  buildManifest,
  createStickerPack,
  fetchStickerSet,
  PackExistsError,
  verifyPacks,
  exportTelegramZip,
  packShortName,
  prepareStickers,
  slugKeywords,
  validatePackBase,
  type EmojiAssignment,
  type TelegramPackConfig,
} from './telegram';
import type { SelectedEmote } from './types';

const THUMB = 'https://static.wikitide.net/hololivewiki/thumb/d/db/Emote-gigi1.png/90px-Emote-gigi1.png';
const ORIGINAL = 'https://static.wikitide.net/hololivewiki/d/db/Emote-gigi1.png';
const PLAIN = 'https://static.wikitide.net/hololivewiki/4/41/Emote-risu1.png';

function emote(talent: string, name: string, url: string): SelectedEmote {
  return { branch: 'Hololive English', generation: 'Justice', talent, name, url };
}

function item(talent: string, name: string, url: string, emoji: string): EmojiAssignment {
  return { emote: emote(talent, name, url), emoji };
}

const CFG: TelegramPackConfig = {
  botToken: '123:abc',
  userId: 42,
  packBase: 'holo_test',
  packTitle: 'Holo test',
};

const render = async (bytes: ArrayBuffer) => new Blob([new TextDecoder().decode(bytes) + ':512']);

describe('pack naming', () => {
  it('appends the bot suffix', () => {
    expect(packShortName('holo_test', 'HoloBot')).toBe('holo_test_by_HoloBot');
  });

  it('validates the base against Telegram rules', () => {
    expect(validatePackBase('holo_test', 'HoloBot')).toBeNull();
    expect(validatePackBase('', 'HoloBot')).toBe('Enter a pack name.');
    expect(validatePackBase('1holo', 'HoloBot')).toMatch(/starting with a letter/);
    expect(validatePackBase('holo-test', 'HoloBot')).toMatch(/English letters/);
    expect(validatePackBase('holo__test', 'HoloBot')).toMatch(/consecutive/);
    expect(validatePackBase('holo_', 'HoloBot')).toMatch(/end with an underscore/);
    expect(validatePackBase('a'.repeat(60), 'HoloBot')).toMatch(/at most 64/);
  });
});

describe('prepareStickers', () => {
  it('builds attach references, emoji lists, and slug keywords', () => {
    const out = prepareStickers([
      item('Gigi Murin', ': gigiwave:', THUMB, '👋'),
      item('Ayunda Risu', ': Brr:', PLAIN, '🥶'),
    ]);
    expect(out.map((s) => s.input)).toEqual([
      { sticker: 'attach://emote0', format: 'static', emoji_list: ['👋'], keywords: ['gigi', 'wave'] },
      { sticker: 'attach://emote1', format: 'static', emoji_list: ['🥶'], keywords: ['risu', 'brr'] },
    ]);
  });

  it('caps keywords at 64 characters in total', () => {
    expect(slugKeywords('a'.repeat(30) + '-' + 'b'.repeat(30) + '-' + 'c'.repeat(10), '-')).toEqual([
      'a'.repeat(30),
      'b'.repeat(30),
    ]);
    expect(slugKeywords('gigiwave', '')).toEqual(['gigiwave']);
  });
});

describe('buildManifest', () => {
  it('writes one tab-separated line per file', () => {
    expect(buildManifest([{ file: 'gigi-wave.png', emoji: '👋' }, { file: 'risu-brr.png', emoji: '🥶' }])).toBe(
      'gigi-wave.png\t👋\nrisu-brr.png\t🥶\n',
    );
  });
});

interface Call {
  url: string;
  form?: FormData;
}

function stubBot(handlers: Record<string, (form?: FormData) => unknown>, imageBody = 'img') {
  const calls: Call[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      const form = init?.body instanceof FormData ? init.body : undefined;
      calls.push({ url, form });
      const method = url.match(/api\.telegram\.org\/bot[^/]+\/(\w+)/)?.[1];
      if (!method) return new Response(imageBody, { status: 200 });
      const handler = handlers[method];
      if (!handler && method === 'getStickerSet') {
        return Response.json({ ok: false, error_code: 400, description: 'Bad Request: STICKERSET_INVALID' });
      }
      if (!handler) return Response.json({ ok: false, description: `no handler for ${method}` });
      const result = handler(form);
      return result instanceof Response ? result : Response.json({ ok: true, result });
    }),
  );
  return calls;
}

function stubDownload() {
  const download: { blob?: Blob; filename?: string } = {};
  vi.spyOn(URL, 'createObjectURL').mockImplementation((blob) => {
    download.blob = blob as Blob;
    return 'blob:stub';
  });
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  const anchor = { href: '', download: '', rel: '', click: vi.fn(), remove: vi.fn() };
  vi.stubGlobal('document', { createElement: () => anchor, body: { appendChild: vi.fn() } });
  return () => ({ ...download, filename: anchor.download, clicked: anchor.click.mock.calls.length });
}

async function formText(form: FormData, key: string): Promise<string> {
  const v = form.get(key);
  return v instanceof Blob ? v.text() : String(v);
}

describe('createStickerPack', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('creates the set in one call and returns the add link', async () => {
    const calls = stubBot({ getMe: () => ({ username: 'HoloBot' }), createNewStickerSet: () => true });
    const progress: string[] = [];
    const created = await createStickerPack(
      [item('Gigi Murin', ': gigiwave:', THUMB, '👋'), item('Ayunda Risu', ': Brr:', PLAIN, '🥶')],
      CFG,
      undefined,
      (p) => progress.push(`${p.phase}:${p.done}/${p.total}`),
      render,
    );

    expect(created).toEqual({
      name: 'holo_test_by_HoloBot',
      title: 'Holo test',
      count: 2,
      botUsername: 'HoloBot',
      link: 'https://t.me/addstickers/holo_test_by_HoloBot',
      appLink: 'tg://addstickers?set=holo_test_by_HoloBot',
    });
    expect(progress).toEqual(['render:0/2', 'render:1/2', 'render:2/2', 'upload:0/2', 'upload:2/2']);
    expect(calls.map((c) => c.url)).toEqual([
      'https://api.telegram.org/bot123:abc/getMe',
      'https://api.telegram.org/bot123:abc/getStickerSet',
      ORIGINAL,
      PLAIN,
      'https://api.telegram.org/bot123:abc/createNewStickerSet',
    ]);
    expect(calls[1].form!.get('name')).toBe('holo_test_by_HoloBot');

    const form = calls[4].form!;
    expect(form.get('user_id')).toBe('42');
    expect(form.get('name')).toBe('holo_test_by_HoloBot');
    expect(form.get('title')).toBe('Holo test');
    expect(form.get('sticker_type')).toBe('regular');
    expect(JSON.parse(form.get('stickers') as string)).toEqual([
      { sticker: 'attach://emote0', format: 'static', emoji_list: ['👋'], keywords: ['gigi', 'wave'] },
      { sticker: 'attach://emote1', format: 'static', emoji_list: ['🥶'], keywords: ['risu', 'brr'] },
    ]);
    expect(await formText(form, 'emote0')).toBe('img:512');
    expect(await formText(form, 'emote1')).toBe('img:512');
  });

  it('adds stickers past the first fifty one at a time', async () => {
    const calls = stubBot({
      getMe: () => ({ username: 'HoloBot' }),
      createNewStickerSet: () => true,
      addStickerToSet: () => true,
    });
    const items = Array.from({ length: 52 }, (_, i) =>
      item('Gigi Murin', `: gigi${i}:`, THUMB.replaceAll('gigi1', `g${i}`), '👋'),
    );
    const progress: string[] = [];
    await createStickerPack(items, CFG, undefined, (p) => progress.push(`${p.phase}:${p.done}`), render);

    const methods = calls.map((c) => c.url.split('/').pop()).filter((m) => /^(getMe|getStickerSet|createNewStickerSet|addStickerToSet)$/.test(m!));
    expect(methods).toEqual(['getMe', 'getStickerSet', 'createNewStickerSet', 'addStickerToSet', 'addStickerToSet']);
    expect(progress.filter((p) => p.startsWith('upload'))).toEqual(['upload:0', 'upload:50', 'upload:51', 'upload:52']);
    expect(progress.filter((p) => p.startsWith('render'))).toHaveLength(53);

    const add = calls.find((c) => c.url.endsWith('addStickerToSet'))!.form!;
    expect(add.get('name')).toBe('holo_test_by_HoloBot');
    expect(JSON.parse(add.get('sticker') as string)).toEqual({
      sticker: 'attach://emote50',
      format: 'static',
      emoji_list: ['👋'],
      keywords: ['gigi', '50'],
    });
    expect(add.get('emote50')).toBeInstanceOf(Blob);
  });

  it('waits out a 429 and retries', async () => {
    vi.useFakeTimers();
    let attempts = 0;
    stubBot({
      getMe: () => ({ username: 'HoloBot' }),
      createNewStickerSet: () => {
        attempts += 1;
        return attempts === 1
          ? Response.json({ ok: false, error_code: 429, description: 'Too Many Requests', parameters: { retry_after: 1 } })
          : true;
      },
    });
    const pending = createStickerPack([item('Gigi Murin', ': gigiwave:', THUMB, '👋')], CFG, undefined, undefined, render);
    await vi.advanceTimersByTimeAsync(1000);
    await expect(pending).resolves.toMatchObject({ link: 'https://t.me/addstickers/holo_test_by_HoloBot' });
    expect(attempts).toBe(2);
    vi.useRealTimers();
  });

  it('surfaces the Telegram error description', async () => {
    stubBot({
      getMe: () => ({ username: 'HoloBot' }),
      createNewStickerSet: () =>
        Response.json({ ok: false, error_code: 400, description: 'Bad Request: sticker set name is already occupied' }),
    });
    await expect(
      createStickerPack([item('Gigi Murin', ': gigiwave:', THUMB, '👋')], CFG, undefined, undefined, render),
    ).rejects.toThrow('Bad Request: sticker set name is already occupied');
  });

  it('reports partial progress when a later add fails', async () => {
    stubBot({
      getMe: () => ({ username: 'HoloBot' }),
      createNewStickerSet: () => true,
      addStickerToSet: () => Response.json({ ok: false, error_code: 400, description: 'Bad Request: STICKERS_TOO_MUCH' }),
    });
    const items = Array.from({ length: 51 }, (_, i) => item('Gigi Murin', `: gigi${i}:`, THUMB, '👋'));
    await expect(createStickerPack(items, CFG, undefined, undefined, render)).rejects.toThrow(
      'Pack created with 50 of 51 stickers. Failed on : gigi50:: Bad Request: STICKERS_TOO_MUCH',
    );
  });

  const EXISTING = { name: 'holo_test_by_HoloBot', title: 'Old title', stickers: [{}, {}, {}] };

  it('refuses to overwrite an existing pack unless told how', async () => {
    stubBot({ getMe: () => ({ username: 'HoloBot' }), getStickerSet: () => EXISTING });
    const pending = createStickerPack([item('Gigi Murin', ': gigiwave:', THUMB, '👋')], CFG, undefined, undefined, render);
    await expect(pending).rejects.toBeInstanceOf(PackExistsError);
    await expect(pending).rejects.toMatchObject({ pack: { name: 'holo_test_by_HoloBot', title: 'Old title', count: 3 } });
  });

  it('appends to an existing pack one sticker at a time', async () => {
    const calls = stubBot({
      getMe: () => ({ username: 'HoloBot' }),
      getStickerSet: () => EXISTING,
      addStickerToSet: () => true,
    });
    const created = await createStickerPack(
      [item('Gigi Murin', ': gigiwave:', THUMB, '👋'), item('Ayunda Risu', ': Brr:', PLAIN, '🥶')],
      { ...CFG, existing: 'append' },
      undefined,
      undefined,
      render,
    );
    const methods = calls.map((c) => c.url.split('/').pop()).filter((m) => /^(getMe|getStickerSet|createNewStickerSet|deleteStickerSet|addStickerToSet)$/.test(m!));
    expect(methods).toEqual(['getMe', 'getStickerSet', 'addStickerToSet', 'addStickerToSet']);
    expect(created).toMatchObject({ title: 'Old title', count: 5 });
  });

  it('refuses to append past the 120 cap', async () => {
    stubBot({
      getMe: () => ({ username: 'HoloBot' }),
      getStickerSet: () => ({ ...EXISTING, stickers: Array.from({ length: 119 }, () => ({})) }),
    });
    await expect(
      createStickerPack([item('Gigi Murin', ': a:', THUMB, '👋'), item('Gigi Murin', ': b:', THUMB, '👋')], { ...CFG, existing: 'append' }, undefined, undefined, render),
    ).rejects.toThrow('Room for 1');
  });

  it('replaces an existing pack by deleting it first', async () => {
    const calls = stubBot({
      getMe: () => ({ username: 'HoloBot' }),
      getStickerSet: () => EXISTING,
      deleteStickerSet: () => true,
      createNewStickerSet: () => true,
    });
    const created = await createStickerPack([item('Gigi Murin', ': gigiwave:', THUMB, '👋')], { ...CFG, existing: 'replace' }, undefined, undefined, render);
    const methods = calls.map((c) => c.url.split('/').pop()).filter((m) => /^(getMe|getStickerSet|deleteStickerSet|createNewStickerSet)$/.test(m!));
    expect(methods).toEqual(['getMe', 'getStickerSet', 'deleteStickerSet', 'createNewStickerSet']);
    expect(created).toMatchObject({ title: 'Holo test', count: 1 });
  });
});

describe('fetchStickerSet', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('returns the pack summary, or null when Telegram does not know the name', async () => {
    stubBot({ getStickerSet: (form) => (form?.get('name') === 'known_by_HoloBot' ? EXISTING_SET : Response.json({ ok: false, error_code: 400, description: 'Bad Request: STICKERSET_INVALID' })) });
    expect(await fetchStickerSet('123:abc', 'known_by_HoloBot')).toEqual({ name: 'known_by_HoloBot', title: 'Known', count: 2 });
    expect(await fetchStickerSet('123:abc', 'nope_by_HoloBot')).toBeNull();
  });

  it('surfaces other errors', async () => {
    stubBot({ getStickerSet: () => Response.json({ ok: false, error_code: 401, description: 'Unauthorized' }) });
    await expect(fetchStickerSet('bad', 'x_by_HoloBot')).rejects.toThrow('Unauthorized');
  });

  it('verifies a list of remembered packs, marking deleted ones null', async () => {
    stubBot({ getStickerSet: (form) => (form?.get('name') === 'known_by_HoloBot' ? EXISTING_SET : Response.json({ ok: false, error_code: 400, description: 'Bad Request: STICKERSET_INVALID' })) });
    expect(await verifyPacks('123:abc', ['known_by_HoloBot', 'gone_by_HoloBot'])).toEqual({
      known_by_HoloBot: { name: 'known_by_HoloBot', title: 'Known', count: 2 },
      gone_by_HoloBot: null,
    });
  });

  it('rejects an invalid pack name before uploading anything', async () => {
    const calls = stubBot({ getMe: () => ({ username: 'HoloBot' }) });
    await expect(
      createStickerPack([item('Gigi Murin', ': gigiwave:', THUMB, '👋')], { ...CFG, packBase: 'holo-test' }, undefined, undefined, render),
    ).rejects.toThrow('English letters');
    expect(calls).toHaveLength(1);
  });

  it('rejects more than 120 stickers', async () => {
    const calls = stubBot({});
    const items = Array.from({ length: 121 }, () => item('Gigi Murin', ': gigiwave:', THUMB, '👋'));
    await expect(createStickerPack(items, CFG, undefined, undefined, render)).rejects.toThrow('at most 120');
    expect(calls).toHaveLength(0);
  });
});

const EXISTING_SET = { name: 'known_by_HoloBot', title: 'Known', stickers: [{}, {}] };

describe('exportTelegramZip', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('zips rendered PNGs with a manifest of emoji', async () => {
    stubBot({}, 'img');
    const download = stubDownload();
    await exportTelegramZip(
      [
        item('Gigi Murin', ': gigiwave:', THUMB, '👋'),
        item('Gigi Murin', ': gigiwave:', THUMB.replaceAll('gigi1', 'gigi2'), '🙌'),
        item('Ayunda Risu', ': Brr:', PLAIN, '🥶'),
      ],
      undefined,
      render,
    );

    const d = download();
    expect(d.clicked).toBe(1);
    expect(d.filename).toMatch(/^holo-emotes-telegram-\d{4}-\d{2}-\d{2}\.zip$/);
    const zip = await JSZip.loadAsync(await d.blob!.arrayBuffer());
    const files: Record<string, string> = {};
    for (const [name, f] of Object.entries(zip.files)) files[name] = await f.async('string');
    expect(files).toEqual({
      'gigi-wave.png': 'img:512',
      'gigi-wave-2.png': 'img:512',
      'risu-brr.png': 'img:512',
      'emoji.txt': 'gigi-wave.png\t👋\ngigi-wave-2.png\t🙌\nrisu-brr.png\t🥶\n',
    });
  });
});
