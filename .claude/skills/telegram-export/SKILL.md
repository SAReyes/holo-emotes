---
name: telegram-export
description: Modify the Telegram sticker pack export (src/telegram.ts, src/telegram-emoji.ts, their tests, and the Telegram modal in src/components/SelectionBar.tsx): per-sticker emoji suggestions, Bot API calls, 512px rendering, pack naming, existing-pack handling, and the zip fallback. Use when changing how emoji are suggested, how packs are created, or what the zip contains.
---

# Telegram export

Two modules. `src/telegram-emoji.ts` turns an emote into the Unicode emoji
Telegram requires on every sticker. `src/telegram.ts` builds `InputSticker`
payloads, calls the Bot API from the browser, renders 512px PNGs on a
canvas, checks for an existing pack, and writes the zip fallback. The pack
is a regular sticker set, not a custom emoji set. `docs/telegram-export.md` holds the Telegram constraints and the
reasoning. The code carries no comments.

## Shape

| Piece | Pure | Tested in |
| --- | --- | --- |
| `suggestEmoji`, `isSingleEmoji` | yes | `src/telegram-emoji.test.ts` |
| `packShortName`, `validatePackBase`, `slugKeywords`, `prepareStickers`, `buildCreateForm`, `buildAddForm`, `buildManifest` | yes | `src/telegram.test.ts` |
| `createStickerPack`, `exportTelegramZip`, `fetchStickerSet` | fetch and download only | `src/telegram.test.ts` with a stubbed `fetch` and a stub `render` |
| `renderStickerPng` | canvas, browser only | by hand in the simulator |

`createStickerPack` and `exportTelegramZip` take `render` as their last
parameter. Tests pass a stub that returns a Blob. Do not reach for jsdom or a
canvas polyfill.

## Procedure

1. For a new emoji keyword, add it to a group in `KEYWORD_GROUPS` and one
   assertion with a real emote name from `public/emotes/*.json`. Group order
   is priority. Keys of three characters or fewer, and keys in `WHOLE_WORD`,
   match whole slug words only; the talent prefix word is never matched.
   Before and after, run a scratch script over every name in the JSON to
   count how many fall through to the talent default and to eyeball the
   matches, since a short key can fire inside an unrelated word.
2. For a new talent default, add one entry to `TALENT_EMOJI` keyed by the
   exact talent name in the JSON.
3. For API changes, check the method's parameters against
   core.telegram.org/bots/api first and record the constraint in the doc's
   requirements table. Keep the request building in a pure `build*Form`
   function and assert on the `FormData` in the test.
4. Run `pnpm test` and `pnpm build`.
5. In `pnpm dev` on the iPhone simulator, select a talent, open Export pack,
   choose Telegram, and check the step 1 suggestions. Press Next, enter a
   fake token and user ID `1` on step 2, press Create pack, and confirm the
   wizard returns to step 2 with Telegram's `Unauthorized` in the error box.
   Press the Download a ZIP link, accept the Safari download, then find the
   zip under the simulator's
   `data/Containers/Shared/AppGroup/*/File Provider Storage/Downloads/` and
   confirm with `file` that every PNG is 512 x 512 and `emoji.txt` pairs
   each file with its emoji.
6. A real pack creation needs a bot token. Never ask for it in chat. The
   user can test that path themselves from the modal.
