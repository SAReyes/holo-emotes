# Telegram export

Telegram has no file import for stickers. Every pack is created through a
bot, so the export in `src/telegram.ts` calls the Bot API directly from the
browser with a token the user supplies. A zip fallback produces the same
images for manual upload through the @Stickers bot. The code carries no
comments. The reasoning is here.

The export makes a regular sticker set, not a custom emoji set. Custom emoji
need Telegram Premium to use and are capped at 100×100; stickers work for
everyone and keep the artwork legible.

## What Telegram requires

| Requirement | Source | How the export meets it |
| --- | --- | --- |
| Static stickers: PNG or WEBP, one side exactly 512px, the other 512px or less, at most 512 KB | core.telegram.org/stickers | `renderStickerPng` draws the wiki original onto a 512×512 transparent canvas, scaled to fit and centred. |
| One to twenty standard emoji per sticker (`emoji_list`) | Bot API `InputSticker` | The user picks one emoji per emote in the modal. `suggestEmoji` pre-fills it. |
| Optional search keywords, at most 64 characters in total | Bot API `InputSticker` | `slugKeywords` splits the Slack slug on the separator and stops before the cap. |
| Pack name: letters, digits, underscores, starts with a letter, no `__`, ends in `_by_<bot>`, at most 64 characters | Bot API `createNewStickerSet` | `validatePackBase` checks the user's base name. `packShortName` appends the suffix using the username from `getMe`. |
| At most 50 stickers in `createNewStickerSet`, 120 per regular set | Bot API `addStickerToSet` | The first 50 go in the create call, the rest one per `addStickerToSet`. More than 120 is refused before any request. |

`api.telegram.org` answers browser requests with `access-control-allow-origin: *`,
so no proxy is needed.

## Source image size

Stickers are 512px, and wiki originals range from 48px to 512px, so the
export fetches the original (`toOriginalUrl`) and lets the canvas scale it.
The original is a static file, so this is not a thumbnail transformation on
the wiki's side. The Membership Emotes pages only ever render 90px and
180px thumbs, which would be upscaled too far. Small originals do come out
soft at 512px; that is the artwork's limit, not something the export can
fix.

## Emoji suggestions

`suggestEmoji(talent, rawName)` in `src/telegram-emoji.ts` runs the name
through `toSlackName` first, which strips the talent prefix, splits camel
case, and romanizes Japanese. The first slug word is the talent prefix and
is ignored, so `ao` does not fire on every one of Ao's emotes and `okay`
does not fire on `okayu`. A trailing number is also dropped from each word
so `penlight1` and `welcome2` match like `penlight` and `welcome`; the
original word is still tried so `o7` keeps its digit.

One rule runs before the keywords: a name shaped like `X-no-Y` with a `Y`
of three characters or fewer is one character of a word spelled across
several emotes (Mio, Marine, Niko, and Lamy all have these) and is a letter
sticker 🔤. It runs first because `Y` is often itself a keyword, such as
`yo`, `kon`, or `ki`.

The remaining words are matched against `KEYWORD_GROUPS`, an ordered list
of `[emoji, keywords]` pairs. The first group with a hit wins, so specific
groups sit above generic ones: colours come before the penlight group so
`blue-light` becomes 💙 rather than 🔦, and 👀 comes before ⭐ so `stare`
is not read as `star`. Keys include romanized Japanese (`tasukaru`,
`omedetou`, `shiwashiwa`), onomatopoeia (`waaa`, `haahaa`), fan and mascot
names (`onigiryaa`, `shiokko`, `haaton`), and other talents' names, which
map to that talent's own emoji so Ina's `GURA` becomes 🔱.

Within a group a key matches as a substring, so `comfy` fires on
`gura-comfy` and `sukisuki` on `suki`. Keys of three characters or fewer,
and every key in `WHOLE_WORD`, must match a whole slug word. That stops
`no` (the Japanese particle) from meaning refusal, `ushi` from firing on
`sushi`, and `atsu` on `pinatsu`. When a word proves to be a false friend,
add it to `WHOLE_WORD` rather than removing the key.

After the keyword pass the remaining pattern rules run: a name that is
only a repeated letter (`aaa`, `rrrr`) is a letter sticker 🔤, a name that
is only digits is a number sticker 🔢, and a name whose only word is one or
two characters, or whose last word is a single character, is a letter
sticker too (`koyo-ko`, `subaru-subaru-a`, `gura-mm`). Only then does the
talent's own entry in `TALENT_EMOJI` apply, and finally `FALLBACK_EMOJI`
for a talent with no mark on the wiki.

Coverage is measured, not guessed. A scratch script that runs `suggestEmoji`
over every emote in `public/emotes/*.json`, with `TALENT_EMOJI` emptied so
a keyword hit that equals the talent emoji is not miscounted, reported
1,736 of 2,763 falling through with the first table and 318 after this
one. What remains is mostly talent names, song titles, fan nicknames, and
baby-talk syllables with no emoji equivalent, where the talent default is
the honest answer. The same script should be rerun after any change, and
the before/after diff of every suggestion eyeballed, because a short key
can fire inside an unrelated word: `hate` inside `hatena`, `mata` inside
`tomata`, `no` as the particle rather than refusal.

`TALENT_EMOJI` is derived from `public/emotes/talents.json`, which the
scraper fills from each talent's wiki infobox (see the `scraper` skill).
`firstEmoji` takes the first pictographic grapheme of the stored mark, so
Nene's `🍑🥟` gives 🍑 and Sora's `🐻💿` gives 🐻, and appends the
variation selector to a symbol that defaults to text presentation, such as
☄, so Telegram renders it as emoji.

References to other talents resolve to that talent's mark. `ALIAS_EMOJI`
maps each talent's naming prefix from the Slack transforms and the
hand-kept nicknames in `TALENT_NICKNAMES` to the mark, so Botan's `nenechi`
becomes 🍑, Lamy's `shishiron` becomes ♌, Noel's `marin` becomes 🏴‍☠️,
and Ina's `GURA` becomes 🔱. Full name words are deliberately not aliases:
`mori` is also the Japanese for forest and `sora` for sky. Aliases match whole words only and run after the keyword
groups and the letter-sticker rules, so `fubu-mio-daisuki` is still 😍 and
Subaru's `すばるあ` is still 🔤. Add a nickname when a fallback turns out to
be a reference; do not add it as a keyword.

Examples from the fetched JSON:

| Talent | Raw name | Suggestion | Why |
| --- | --- | --- | --- |
| Gawr Gura | `: GuraComfy:` | ☺️ | keyword `comfy` |
| Hakui Koyori | `: どやぁ:` | 😏 | romanized `doyaa` contains `doya` |
| Tokoyami Towa | `: トワ様びっくり:` | ❗ | `bikkuri` |
| Mori Calliope | `: Ripr:` | 💀 | word `rip` |
| Kaela Kovalskia | `: pimok:` | 🔨 | no keyword, talent default |

To add a keyword, add it to the right group in `KEYWORD_GROUPS` (or add a
group, placed above anything more generic that could also match) and a case
to `src/telegram-emoji.test.ts` with a real emote name. `KEYWORD_EMOJI` is
derived from the groups for lookups and should not be edited directly.

## Bot API flow

`createStickerPack(items, cfg, naming, onProgress, render)`:

1. `getMe` to learn the bot username, then validate the pack base name.
2. `getStickerSet` on the full name. If the pack exists and `cfg.existing`
   is unset, throw `PackExistsError` carrying its title and count so the UI
   can ask. With `existing: 'append'` the create step is skipped and every
   item goes through `addStickerToSet`, refused up front if the total would
   pass 120. With `existing: 'replace'` the set is removed with
   `deleteStickerSet` first.
3. Fetch and render every image, reporting `{ phase: 'render', done }`
   after each one. Rendering happens before any upload because the create
   call takes up to 50 stickers at once, and reporting only around uploads
   made a small pack jump from nothing to done.
4. Send `createNewStickerSet` with `sticker_type: regular`, the JSON
   `stickers` array for the first 50, and each image attached under
   `attach://emote<i>`; then one `addStickerToSet` per remaining item.
   Each upload reports `{ phase: 'upload', done }`. The modal's bar runs
   over both phases, so it fills halfway during rendering.
5. Return a `CreatedPack`: name, title, final count, bot username, the
   `https://t.me/addstickers/<name>` link and the `tg://addstickers?set=<name>`
   deep link.

## Links and existing packs

`t.me/addstickers/<name>` is the install link for a sticker set. Opening it
shows the set with an "Add stickers" button; that modal is the install flow.
The `tg://addstickers?set=` form skips the t.me page and opens the app
directly, so the success step offers both. (`addemoji` is the equivalent for
custom emoji sets, which this export no longer makes.)

The Bot API has no call that lists the sets a bot owns, and a user's own
installed sets are reachable only through a logged-in user session, never
a bot token. Three things stand in for a listing. The modal remembers every
pack created from this browser, keyed by bot username, in the same
`localStorage` entry as the token. When step 2 opens with a token, or when
Check bot is pressed, `getMe` confirms the bot and `verifyPacks` runs
`getStickerSet` over the remembered packs for that bot, refreshing title
and count and dropping any that Telegram no longer has; the list on step 2
then shows only that bot's packs, each with a Use button that fills the
name and title. And every create checks the name with `getStickerSet`
first, so recreating a pack from a different browser still lands on the
add-or-replace choice rather than on Telegram's "name is already occupied"
error.

`callBot` retries on HTTP 429 after `parameters.retry_after` seconds, up to
three attempts, and otherwise throws the API's `description`. A failure
after the create call throws a message that says how many emoji made it in,
because the pack already exists at that point.

The owner must have messaged the bot once, or Telegram rejects the user ID.
`detectUserId` reads `getUpdates` and takes the sender of the latest private
message, which is how the modal's detect button fills the field.

`render` defaults to the canvas renderer and is a parameter so the upload
logic can be tested in Node with a stub.

## Zip fallback

`exportTelegramZip` writes the same 512px PNGs named by the Slack slug,
plus `emoji.txt` with one `<file>\t<emoji>` line per image. The user creates
the pack in @Stickers and uploads each file with its emoji. The zip is named
`holo-emotes-telegram-<YYYY-MM-DD>.zip`.

## Modal state

The Telegram modal in `SelectionBar.tsx` is a three-step wizard: emoji per
sticker, bot and pack, then create. Each step shows only its own fields and
its own buttons, with a stepper on top so the bot step cannot be missed.
Create pack moves to step 3 and shows upload progress; a failure returns to
step 2 with Telegram's message so the fields can be corrected, and an
existing pack returns to step 2 with the add-or-replace choice. The zip
fallback is a link on step 2, since it needs the emoji but not the bot.
The modal keeps the bot token and user ID in
`localStorage` under `holo-emotes.telegram` so they survive a reload. The
token is sent only to `api.telegram.org`, and the modal says so. Emoji
choices are kept per selection key for the life of the page so reopening
the modal does not discard edits.
