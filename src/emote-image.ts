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
