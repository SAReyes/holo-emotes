import { describe, expect, it } from 'vitest';
import { localThumbPath } from './emote-image';

describe('localThumbPath', () => {
  it('maps a resizable thumb URL to the hash directories plus basename', () => {
    expect(
      localThumbPath('https://static.wikitide.net/hololivewiki/thumb/d/db/Emote-gigi1.png/90px-Emote-gigi1.png'),
    ).toBe('/emotes/thumbs/d/db/90px-Emote-gigi1.png');
  });

  it('maps a plain (non-resizable) URL the same way', () => {
    expect(localThumbPath('https://static.wikitide.net/hololivewiki/4/41/Emote-risu1.png')).toBe(
      '/emotes/thumbs/4/41/Emote-risu1.png',
    );
  });

  it('returns null for URLs that are not wiki images', () => {
    expect(localThumbPath('https://example.com/foo.png')).toBeNull();
    expect(localThumbPath('not a url')).toBeNull();
  });
});
