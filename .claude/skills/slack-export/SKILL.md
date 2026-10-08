---
name: slack-export
description: Modify the Slack zip export (src/export.ts, src/export.test.ts): URL resolution for thumbnail, original, and custom sizes, zip entry naming, and the download. Use when changing what gets fetched or how files are named in the zip.
---

# Slack export

`exportForSlack(emotes, resolution, naming)` in `src/export.ts` fetches each
selected emote, names it with `toSlackName`, and downloads a zip. Everything
before the final download is pure and tested in `src/export.test.ts`. The
code carries no comments. The reasoning is here.

## URL shapes

Wikitide serves most emotes as resizable MediaWiki thumbs and a few (the
Indonesia branch) as plain originals:

```
.../thumb/<h>/<hh>/<file>/<N>px-<file>    resizable
.../<h>/<hh>/<file>                       original only
```

| Function | Does |
| --- | --- |
| `isResizableUrl` | True when the path matches the thumb shape. |
| `toOriginalUrl` | Drops `/thumb/` and the trailing `/<N>px-<file>` segment. Non-thumb URLs pass through. |
| `toCustomUrl` | Replaces `<N>` with the requested width. Non-thumb URLs pass through. |
| `clampCustomPx` | Rounds and clamps to 1 through `CUSTOM_PX_MAX` (512). Non-finite input becomes 128. |
| `resolveExportUrl` | Picks by `mode`: `thumbnail` returns the stored URL, `original` and `custom` go through the two above. |

The export always fetches from the wiki, never from the self-hosted
thumbnails, because custom sizes and originals only exist there. In `custom`
mode a failed fetch falls back to the original URL, since the wiki does not
pre-render every width.

## Zip entries

The entry name is the Slack slug plus the extension taken from the resolved
URL. Only `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp` are kept; anything else
becomes `.png`. Duplicate slugs get a numeric suffix joined with the naming
separator, so two `fauna-smile` entries become `fauna-smile.png` and
`fauna-smile-2.png`. The zip is named `holo-emotes-slack-<YYYY-MM-DD>.zip`.

## Procedure

1. Put new logic in a pure function and export it.
2. Add a test using a real URL from `public/emotes/*.json`. The stub for
   `fetch`, the download anchor, and object URLs is at the top of the
   `exportForSlack` block in `src/export.test.ts`. Reuse it.
3. Run `pnpm test`, then exercise the export from `pnpm dev` with a mixed
   selection that includes an Indonesia emote and a custom size.
