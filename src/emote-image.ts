/**
 * Where a wiki image is stored when self-hosted. Shared by the fetch script
 * (which writes the file) and the UI (which displays it), so the two agree.
 *
 *   https://static.wikitide.net/hololivewiki/thumb/d/db/Emote-gigi1.png/90px-Emote-gigi1.png
 *   https://static.wikitide.net/hololivewiki/4/41/Emote-risu1.png
 *
 * both map to /emotes/thumbs/<hash>/<hash2>/<basename>. MediaWiki derives the
 * two hash directories from the filename, so the basename is unique within them.
 */
export const THUMBS_DIR = 'emotes/thumbs';

const WIKI_PATH = /\/hololivewiki\/(?:thumb\/)?([0-9a-f])\/([0-9a-f]{2})\/[^/]+(?:\/[^/]+)?$/;

export function localThumbPath(urlString: string): string | null {
  let pathname: string;
  try {
    pathname = new URL(urlString).pathname;
  } catch {
    return null;
  }
  const m = pathname.match(WIKI_PATH);
  if (!m) return null;
  const basename = pathname.slice(pathname.lastIndexOf('/') + 1);
  return `/${THUMBS_DIR}/${m[1]}/${m[2]}/${basename}`;
}
