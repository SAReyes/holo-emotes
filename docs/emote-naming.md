# Emote naming

The export turns every selected emote's wiki name into a Slack emoji name.
This page is the only place that explains how. The code is in
`src/emote-naming/` and must not carry comments; put the reasoning here.

## Pipeline

Raw names come from `public/emotes/*.json` wrapped in colons, for example
`": CeCeLaugh:"`. `toSlackName(talent, raw, config?)` in
`src/emote-naming/index.ts` runs three steps:

1. `stripEmoteDelimiters` removes the `": "` and `":"` wrapper. If nothing is
   left the result is the literal `emote`.
2. A talent transform, if one is registered for the talent, builds a rough
   slug from the inner name, the separator, and the prefix. Otherwise
   `defaultTransform` lowercases the name and turns every run of
   non-alphanumerics into one separator.
3. `sanitizeSlug` keeps only `[a-z0-9]` and the separator, collapses repeated
   separators, and trims them from both ends. If nothing is left the result is
   `emote`.

Non-ASCII names, which most JP talents use, lose every character in step 3.
`": ぬんぬん1:"` becomes `1`. This is a known gap, not a design choice.

## Config from the export modal

`NamingConfig` in `shared.ts` carries two choices the user makes in the
export modal:

| Field | Meaning | Default |
| --- | --- | --- |
| `separator` | Joins words. Any string, including empty. | `-` |
| `prefixes` | Per-talent prefix, keyed by the talent name in the JSON. | The transform's `defaultPrefix` |

`getDefaultPrefixes(talentNames)` pre-fills the modal. Transforms must build
their output from the separator and prefix they are given, never from
hard-coded `-` or the talent's own name, so the modal's choices hold.

## Shared helpers

All in `src/emote-naming/shared.ts`. Each is pure.

| Helper | Does |
| --- | --- |
| `stripEmoteDelimiters(raw)` | Removes the `": name:"` wrapper and trims. |
| `escapeRegExp(s)` | Escapes a string for use inside a `RegExp`. |
| `splitCamelCaseWords(s, sep)` | Inserts the separator at PascalCase and camelCase boundaries. Acronyms stay whole, so `CeCeSPIN` yields `spin`, not `s-p-i-n`. |
| `joinParts(sep, ...parts)` | Joins the non-empty parts with the separator. An empty separator concatenates. |
| `stripLeadingWord(s, word)` | Drops a leading word, case-insensitive. Used to remove the talent's own name, as in `shioriComfy` to `Comfy`. |
| `normalizeSeparators(s, sep)` | Collapses repeated separators and trims them from the ends. |
| `defaultTransform(inner, sep)` | Lowercase, non-alphanumerics to separator, collapse, trim. |
| `sanitizeSlug(base, sep)` | Final pass. Keeps `[a-z0-9]` and the literal separator, which may be longer than one character. |
| `splitWords(rest, sep, split?)` | Looks `rest` up in a `SPLIT` table first, otherwise splits camelCase. The common tail of most talent transforms. |

## Talent rules

Talent transforms live in `src/emote-naming/talents/`, one file per talent,
spread into one registry in `talents/index.ts`. The key must match the talent
name in the emote JSON exactly. Most follow the same shape: strip the
talent's own name from the front, look the rest up in a `SPLIT` table, fall
back to camelCase splitting, then join with the prefix.

`SPLIT` tables exist because the wiki writes many compounds as one lowercase
token, which no splitter can separate. Keys are lowercase and are the name
after any self-prefix has been removed. Paired emotes ending in `L` and `R`
map to `left` and `right`.

| Talent | Prefix | Rules beyond the common shape |
| --- | --- | --- |
| Cecilia Immergreen | `cece` | A leading `CeCe` is replaced by the prefix. The rest is camel-split. |
| Ceres Fauna | `fauna` | Common shape, no self-prefix to strip. `SPLIT` covers `hugsnail`, `pinklight`, `greenlight`, `nemusmug`. |
| Elizabeth Rose Bloodflame | `liz` | No camel splitting: names are single words. `SPLIT` covers compounds such as `bluestick`, `vewynoice`, `warcry`, and the `eyel` / `eyer` pair. |
| Fuwawa & Mococo Abyssgard | `fwmc` | The twins share one pool. Names led by `FUWA` or `MOCO` keep that twin as the prefix and ignore the modal prefix. `FUWAMOCO` stays whole with no prefix. `emoji<X>` becomes `prefix-emoji-x`. Everything shared by both, like `BAU` and `KUSA`, takes the duo prefix. |
| Gawr Gura | `gura` | The wiki abbreviates her name as `Gura`, `Gur`, or `Gu`. `gura` and `gur` are stripped as self-prefixes. `GuDuh` and `GuYum` are handled in `SPLIT` instead, because `guWAT` is a different emote from `GuraWat` and must stay whole. |
| Gigi Murin | `gigi` | Exact table for `grem`, `frewup`, `stopfight`. A leading `gigi` becomes the prefix. Leading `popo` and `grem` become sub-prefixes, as in `gigi-popo-cheer`. Anything else is prefix plus the whole name. |
| Hakos Baelz | `bae` | Names mix lowercase and SHOUTED tokens. `SPLIT` covers the ones that read as several words, such as `squeakyay` and `whatadeal`. |
| IRyS | `irys` | Strips `irys`. `SPLIT` covers the `wing`, `bloom`, and `gloom` left and right pairs plus `bloompat`, `gloompat`, `socool`. |
| Koseki Bijou | `bijou` | Strips `bijou`. `pebble` is a sub-prefix for the fan mascot, so `bijouPebblecry` becomes `bijou-pebble-cry`. `SPLIT` covers `swirlyeyes`. |
| Mori Calliope | `calli` | `RipR`, `RipI`, `RipP` spell RIP across three emotes and keep the letter as its own word. Her name is dropped wherever it appears, so `happymori` becomes `happy` and `calliopog` becomes `pog`, because the prefix already carries it. |
| Nanashi Mumei | `mumei` | Camel splitting handles `colonSmile` and `friendHap`. `SPLIT` covers lowercase compounds and the `glowstick` pair. |
| Nerissa Ravencroft | `rissa` | Strips `Rissa`, then camel-splits. Styles are mixed: `RissaLove`, `KiraKira`, `HWA`, `bonk`. |
| Ninomae Ina'nis | `ina` | No camel splitting, because `10Q`, `OxO`, and `LOVE4EVER` are single words. `SPLIT` covers `rightglow`, `leftglow`, `gonext`. |
| Ouro Kronii | `kronii` | Most names are `kro` plus a word. Puns that only work as one word stay whole: `krosrprise`, `kronichiwa`, `kronfused`, `kropium`, `yukkronii`. `kronie` (the fans) and `boros` (the snake) are sub-prefixes, like Bijou's `pebble`. `kronii` and `kro` are self-prefixes. |
| Raora Panthera | `rao` | Prefix plus the lowercased name. Nothing to split. |
| Shiori Novella | `shiori` | Strips `shiori`, then camel-splits. `SPLIT` covers `novelbonk`, `giftlove`, `facepaw`. |
| Takanashi Kiara | `kiara` | Names are short codes such as `mgn`, `fpm`, `YLS`, `1010`. Prefix plus lowercase. |
| Watson Amelia | `ame` | Every name is `ame` plus CamelCase, as in `ameGatorIdol` and `ameHic1`. Strip and camel-split. |

Talents without a transform get `defaultTransform` and no prefix. Names from
different talents can then collide in Slack, which is why the EN branch
transforms always add one.

## Adding a talent

1. Create `src/emote-naming/talents/<first-last>.ts`, kebab-case.
2. Export a default object that satisfies `TalentNamingExports`:

   ```typescript
   import { joinParts, splitWords, stripLeadingWord, type TalentNamingExports } from '../shared';

   const SPLIT: Record<string, string[]> = {};

   export default {
     'Talent Full Name': {
       defaultPrefix: 'short',
       transform(inner: string, separator: string, prefix: string): string {
         const rest = stripLeadingWord(inner, 'talent');
         return joinParts(separator, prefix.toLowerCase(), ...splitWords(rest, separator, SPLIT));
       },
     },
   } satisfies TalentNamingExports;
   ```

3. Spread it into `talentTransforms` in `src/emote-naming/talents/index.ts`.
4. Add a row to the table above with the prefix and any rule that is not the
   common shape. Any choice that would have tempted you to write a comment
   goes in that row.
5. Add a `describe` block to `src/emote-naming/index.test.ts` using real
   names from the fetched JSON. Assert literal output strings. Include one
   case with a custom separator and one with a custom prefix.
6. Run `pnpm test` and show a before and after table of real names in the
   summary.

## Examples

Generated by calling `toSlackName` with default config on names from the
fetched JSON.

| Talent | Raw | Output |
| --- | --- | --- |
| Ayunda Risu (no transform) | `: LightStick:` | `lightstick` |
| Cecilia Immergreen | `: CeCeLetHerCook:` | `cece-let-her-cook` |
| Cecilia Immergreen | `: CeCeSPIN:` | `cece-spin` |
| Ceres Fauna | `: hugsnail:` | `fauna-hug-snail` |
| Elizabeth Rose Bloodflame | `: eyel:` | `liz-eye-left` |
| Fuwawa & Mococo Abyssgard | `: FUWAyes:` | `fuwa-yes` |
| Fuwawa & Mococo Abyssgard | `: BAU:` | `fwmc-bau` |
| Fuwawa & Mococo Abyssgard | `: emojiF:` | `fwmc-emoji-f` |
| Fuwawa & Mococo Abyssgard | `: FUWAMOCO:` | `fuwamoco` |
| Gawr Gura | `: GurNya:` | `gura-nya` |
| Gawr Gura | `: GuDuh:` | `gura-duh` |
| Gawr Gura | `: guWAT:` | `gura-guwat` |
| Gawr Gura | `: GuraWat:` | `gura-wat` |
| Gawr Gura | `: BloopYayL:` | `gura-bloop-yay-left` |
| Gigi Murin | `: popocheer:` | `gigi-popo-cheer` |
| Gigi Murin | `: grem:` | `gigi-grem` |
| Hakos Baelz | `: whatadeal:` | `bae-what-a-deal` |
| IRyS | `: irysWingL:` | `irys-wing-left` |
| Koseki Bijou | `: bijouPebblecry:` | `bijou-pebble-cry` |
| Mori Calliope | `: RipR:` | `calli-rip-r` |
| Mori Calliope | `: calliopog:` | `calli-pog` |
| Nanashi Mumei | `: glowstickL:` | `mumei-glowstick-left` |
| Nerissa Ravencroft | `: KiraKira:` | `rissa-kira-kira` |
| Ninomae Ina'nis | `: LOVE4EVER:` | `ina-love4ever` |
| Ouro Kronii | `: kromegalol:` | `kronii-mega-lol` |
| Ouro Kronii | `: kronichiwa:` | `kronii-kronichiwa` |
| Ouro Kronii | `: kroniebonk:` | `kronii-kronie-bonk` |
| Ouro Kronii | `: boroswhoa:` | `kronii-boros-whoa` |
| Raora Panthera | `: LETHERCOOK:` | `rao-lethercook` |
| Shiori Novella | `: shioriNovelbonk:` | `shiori-novel-bonk` |
| Takanashi Kiara | `: YLS:` | `kiara-yls` |
| Watson Amelia | `: ameGatorIdol:` | `ame-gator-idol` |
