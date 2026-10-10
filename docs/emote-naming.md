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

Step 3 drops every non-ASCII character, so a Japanese name only survives if
its talent transform romanizes it first. `": ぬんぬん1:"` under a talent with
no transform becomes `1`. See [Japanese names](#japanese-names).

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
| `romanize(inner, sep, readings?)` | Japanese to a rough slug. See [Japanese names](#japanese-names). |
| `prefixedTransform(rules?)` | Builds the common transform from `{ strip?, split?, readings? }`: strip the talent's own name, `splitWords` with the `SPLIT` table, `romanize` each word with the `READINGS` table, join behind the prefix. Most JP talents are one call to this. |

## Talent rules

Talent transforms live in `src/emote-naming/talents/`, one file per talent,
spread into one registry in `talents/index.ts`. The key must match the talent
name in the emote JSON exactly. Most follow the same shape: strip the
talent's own name from the front, look the rest up in a `SPLIT` table, fall
back to camelCase splitting, then join with the prefix.

The prefix is the talent's common short name or nickname. The wiki's own
prefix is used when it is one (`peko`, `rbc`, `fbk`, `koyo`) and replaced
when it is a fan name or opaque (`ssrb` to `botan`, `AKIROSE` to `aki`).

`SPLIT` tables exist because the wiki writes many compounds as one lowercase
token, which no splitter can separate. Keys are lowercase and are the name
after any self-prefix has been removed. Paired emotes ending in `L` and `R`
map to `left` and `right`.

| Talent | Prefix | Rules beyond the common shape |
| --- | --- | --- |
| Akai Haato | `haachama` | Prefix is her nickname, which is better known than `haato`. No self-prefix. `READINGS` for the kanji (`焼きはあとん`, `最強`, `霧吹き`) and `タラン`. The A to Z letter emotes come out as `haato-aaa` and so on. |
| Aki Rosenthal | `aki` | Strips `AKIROSE`. `SPLIT` covers `nextsc` and `blessyou`. One katakana name, `アローナ` to `arona`. |
| Amane Kanata | `kanata` | Every name is `kanata` plus CamelCase. `SPLIT` covers `lightblue` and `lightred`. |
| AZKi | `azki` | No camel splitting, because `AZrium` and `AZhand` would split at the `Z`. Prefix plus lowercase. `SPLIT` covers `hitext` and `azhand`. `azki` is stripped as a self-prefix, so the emote named `azki` becomes just `azki` and `AZKi1` becomes `azki-1`. |
| Cecilia Immergreen | `cece` | A leading `CeCe` is replaced by the prefix. The rest is camel-split. |
| Ceres Fauna | `fauna` | Common shape, no self-prefix to strip. `SPLIT` covers `hugsnail`, `pinklight`, `greenlight`, `nemusmug`. |
| Elizabeth Rose Bloodflame | `liz` | No camel splitting: names are single words. `SPLIT` covers compounds such as `bluestick`, `vewynoice`, `warcry`, and the `eyel` / `eyer` pair. |
| Fuwawa & Mococo Abyssgard | `fwmc` | The twins share one pool. Names led by `FUWA` or `MOCO` keep that twin as the prefix and ignore the modal prefix. `FUWAMOCO` stays whole with no prefix. `emoji<X>` becomes `prefix-emoji-x`. Everything shared by both, like `BAU` and `KUSA`, takes the duo prefix. |
| Gawr Gura | `gura` | The wiki abbreviates her name as `Gura`, `Gur`, or `Gu`. `gura` and `gur` are stripped as self-prefixes. `GuDuh` and `GuYum` are handled in `SPLIT` instead, because `guWAT` is a different emote from `GuraWat` and must stay whole. |
| Gigi Murin | `gigi` | Exact table for `grem`, `frewup`, `stopfight`. A leading `gigi` becomes the prefix. Leading `popo` and `grem` become sub-prefixes, as in `gigi-popo-cheer`. Anything else is prefix plus the whole name. |
| Hakos Baelz | `bae` | Names mix lowercase and SHOUTED tokens. `SPLIT` covers the ones that read as several words, such as `squeakyay` and `whatadeal`. |
| Hakui Koyori | `koyo` | No self-prefix. Her letter emotes pair kana with their romaji (`こko`, `無罪muzai`); each is mapped to the romaji once. `コヨーテ` is `coyote`. |
| Himemori Luna | `luna` | No self-prefix. Only `メンバーズカード` needs a reading; the rest is kana and common loanwords, so `ペンラ11` is `luna-penlight-11`. |
| Hiodoshi Ao | `ao` | No self-prefix. Loanwords go back to English (`カクテル` to `cocktail`, `シャンパンタワー` to `champagne tower`). `高い酒` is `takai sake`. |
| Hoshimachi Suisei | `suisei` | Single lowercase words, prefix plus lowercase. Camel splitting separates the `bikkuriB` / `bikkuriY` pair. `suisei` is a self-prefix, so that emote becomes just `suisei`. |
| Houshou Marine | `marine` | No self-prefix. `マリン` and `まりん` are always the word `marin`, so `ろりまりん` is `rori-marin`. `ヨーソローの` spells out her greeting one character per emote; the `のー` one reads `no-nobashi`. |
| Ichijou Ririka | `ririka` | No self-prefix. Prefix plus lowercase. `SPLIT` covers `goodjob`. |
| Inugami Korone | `korone` | Every name is `korone` plus CamelCase. Strip and camel-split, nothing to read. |
| IRyS | `irys` | Strips `irys`. `SPLIT` covers the `wing`, `bloom`, and `gloom` left and right pairs plus `bloompat`, `gloompat`, `socool`. |
| Isaki Riona | `riona` | Every name is `riona` plus a word. Strip and camel-split, so `rionalight` is `riona-light`. |
| Juufuutei Raden | `raden` | No self-prefix. `こんばんは` reads `konbanwa`, not wanakana's `konbanha`. `okです` (lowercase, see Japanese names) is `ok desu`. `六根清浄` is `rokkon shoujou`. |
| Kazama Iroha | `iroha` | Strips `iroha`, so `iroha1` is `iroha-1`. Lowercase single words otherwise. |
| Kikirara Vivi | `vivi` | No self-prefix. `ヴィヴィ` is `vivi`. |
| Koganei Niko | `niko` | No self-prefix. `ニコ担` (her fans) is `niko tan`; `の字` is `no ji`, so `ニコの字` is `niko-niko-no-ji`. `ッッッ` is `ltu-ltu-ltu`. `担の字` and `たんの字` read the same and collide. |
| Koseki Bijou | `bijou` | Strips `bijou`. `pebble` is a sub-prefix for the fan mascot, so `bijouPebblecry` becomes `bijou-pebble-cry`. `SPLIT` covers `swirlyeyes`. |
| La+ Darknesss | `laplus` | No self-prefix. `げーみんぐ` is `gaming`; `ぎむの` and `怒りの` are split at `no`. |
| Minato Aqua | `aqua` | Strips `aqua`. `くそざこ余裕の余` and its pair spell a word across emotes and read `kusozako-yoyuu-no-yo` / `-yuu`. `っっっ` is `ltu-ltu-ltu`, the fan spelling of small tsu. `Aquaサイリウム` keeps the inner `aqua`. |
| Mizumiya Su | `su` | No self-prefix. `すうの圧` is `suu no atsu`, `わらうすう` is `warau suu`. |
| Momosuzu Nene | `nene` | No self-prefix, because `nenechigod` and `nenene` would lose their head. `nene` therefore becomes `nene-nene`. |
| Mori Calliope | `calli` | `RipR`, `RipI`, `RipP` spell RIP across three emotes and keep the letter as its own word. Her name is dropped wherever it appears, so `happymori` becomes `happy` and `calliopog` becomes `pog`, because the prefix already carries it. |
| Murasaki Shion | `shion` | Strips `shion`. `紫` is `murasaki`, `塩っ子` is `shiokko`, `トイレ` is `toilet`. `SPLIT` covers `thankyou`. |
| Nakiri Ayame | `ayame` | No self-prefix. `SPLIT` separates `nakiri` and `poyoyo` from their compounds and `goodgame`. |
| Nanashi Mumei | `mumei` | Camel splitting handles `colonSmile` and `friendHap`. `SPLIT` covers lowercase compounds and the `glowstick` pair. |
| Natsuiro Matsuri | `matsuri` | Strips `まつり`. `まつりす` (the fans) stays one word; `待つり` and `待つりす` are puns on her name and read the same. `のもじ` is `no moji`. |
| Nekomata Okayu | `okayu` | No self-prefix. Twenty-one kanji names, all in `READINGS`. `それは` and `の` are their own words, so `檻の中のおにぎりゃー` is `ori-no-naka-no-onigiryaa`. `おにぎりゃー` is one word. |
| Nerissa Ravencroft | `rissa` | Strips `Rissa`, then camel-splits. Styles are mixed: `RissaLove`, `KiraKira`, `HWA`, `bonk`. |
| Ninomae Ina'nis | `ina` | No camel splitting, because `10Q`, `OxO`, and `LOVE4EVER` are single words. `SPLIT` covers `rightglow`, `leftglow`, `gonext`. |
| Omaru Polka | `polka` | No self-prefix. Prefix plus lowercase. |
| Ookami Mio | `mio` | Strips `mio`. `ミオ` and `みぉ` are the word `mio`; `の` and `ノ` are the word `no`, so `ミオかわのミオ` is `mio-kawa-no-mio`. `待機の待` and `待機の機` read `taiki-no-tai` and `taiki-no-ki`. |
| Oozora Subaru | `subaru` | Strips one `スバル`; a second `スバル` or `すばる` becomes the word `subaru`, so `スバルすばるびっくり` is `subaru-subaru-bikkuri`. `あひる` is always its own word. `ドダック` is `do duck`. |
| Otonose Kanade | `kanade` | No self-prefix. `おつのせ` and `こんのせ` are her greetings and stay whole; `イラスト` is `illust`, `音符` is `onpu`. `ｗｗｗ` and `www` are the same word and collide. |
| Ouro Kronii | `kronii` | Most names are `kro` plus a word. Puns that only work as one word stay whole: `krosrprise`, `kronichiwa`, `kronfused`, `kropium`, `yukkronii`. `kronie` (the fans) and `boros` (the snake) are sub-prefixes, like Bijou's `pebble`. `kronii` and `kro` are self-prefixes. |
| Raora Panthera | `rao` | Prefix plus the lowercased name. Nothing to split. |
| Rindo Chihaya | `chihaya` | No self-prefix. Prefix plus lowercase. |
| Roboco | `rbc` | Every name is `rbc` plus CamelCase. Strip, camel-split, then `romanize` each word for the three Japanese names: `充電中`, `ねこたち`, and the long-vowel marks in `rbc3ーー`. `SPLIT` covers `thankyou`, `highspec`, `minus100hp`. |
| Sakamata Chloe | `chloe` | No self-prefix. `READINGS` for `激アツ`, `助かる`, `寿司っ`, `勝ち確`, `フラグ`. Half-width `ｗ` is the word `w`. |
| Sakura Miko | `miko` | Every name is `miko` plus CamelCase. Strip and camel-split. `SPLIT` separates `35p` (the fan name) and her own name inside compounds: `doya35p`, `mikopipipi`, `nakimiko`, `fxmiko`, `penmikop`, `kouhomikop`. |
| Shiori Novella | `shiori` | Strips `shiori`, then camel-splits. `SPLIT` covers `novelbonk`, `giftlove`, `facepaw`. |
| Shirakami Fubuki | `fbk` | Strips `FBK`. The rest is SHOUTED or CamelCase and lowercases cleanly. |
| Shiranui Flare | `flare` | No self-prefix. Prefix plus lowercase; `mojiP` camel-splits to `moji-p`. |
| Shirogane Noel | `noel` | No self-prefix. All hiragana. `READINGS` turns the loanwords back (`まっする` to `muscle`, `みるく` to `milk`, `でらっくす` to `deluxe`). |
| Shishiro Botan | `botan` | Strips `ssrb`, which is the fan name, not hers, so it is not the prefix. `SPLIT` separates a second `ssrb` (the fan mascot) in `ssrb01`, `ssrbgray`, and friends. `わらう英語` is `warau eigo`. |
| Takanashi Kiara | `kiara` | Names are short codes such as `mgn`, `fpm`, `YLS`, `1010`. Prefix plus lowercase. |
| Takane Lui | `lui` | No self-prefix. `SPLIT` covers `goodgame` and `socool`. |
| Todoroki Hajime | `hajime` | No self-prefix. Prefix plus lowercase; the wiki's own spellings (`maltucho`, `yataty`) are kept. |
| Tokino Sora | `sora` | Japanese names. Strips a leading `そら`, then `romanize` with a `READINGS` table. Katakana loanwords go back to English (`ソーダ` to `soda`, `ナイス` to `nice`, `ペンラ` to `penlight`) and `ちゃん` is always its own word, except inside `赤ちゃん`, which is one word. |
| Tokoyami Towa | `towa` | Strips `トワ様`. `トワ文字` keeps `towa` because it has no `様`. `てんq` (lowercase, see Japanese names) is `ten q`; `エイチピー` is `hp`. `SPLIT` covers `goodgame` and `goodgame2`. |
| Tsunomaki Watame | `watame` | No self-prefix. Colour plus `ペンラ` reads `ki-penlight`, `momo-penlight`, and so on. `臭くさ` is `kusai-kusa` to stay apart from `草くさ`. `キッ怒` is the pun `kiddo`. `SPLIT` keeps `zzz` whole. |
| Usada Pekora | `peko` | Strips `peko`. Small `ぉ` is its own `o` (`ぺこぉ` to `peko-o`) so it stays apart from `ぺこー` (`pekoo`); `ぺこーーー` is `pekoooo`. `獅々田` is `shishida`. |
| Watson Amelia | `ame` | Every name is `ame` plus CamelCase, as in `ameGatorIdol` and `ameHic1`. Strip and camel-split. |
| Yukihana Lamy | `lamy` | No self-prefix. `ラミィ` is the word `lamy`, so `よっぱラミィ` is `yoppa-lamy`. `えらいの` is split at `no`. `雪民さん` is `yukimin san`. |
| Yuzuki Choco | `choco` | Strips `ちょこ先生`. The 手書き series spells `kawaii tensai katsu` one kanji per emote, so `可`, `愛`, `天`, `才`, `勝` each have a one-syllable reading. `ナイスパ` stays `naisupa`. |

Talents without a transform get `defaultTransform` and no prefix. Names from
different talents can then collide in Slack, which is why the EN and JP 0th
generation transforms always add one. Every JP and DEV_IS talent now has a transform.

## Japanese names

`wanakana` converts hiragana and katakana to Hepburn romaji and leaves
everything else alone. It knows nothing about kanji, and Japanese has no
spaces, so `romanize` runs four passes before it:

1. **Word readings.** Every key in the talent's `READINGS` table and in
   `COMMON_READINGS` (in `shared.ts`) is replaced by its romaji wrapped in
   spaces, longest key first. A space in the value is a word boundary. This
   is where kanji get their reading (`止まらねえぞ` to `tomaranee zo`),
   katakana loanwords go back to English (`サイリウム` to `sairium`,
   `スタンプ` to `stamp`, `ペンラ` to `penlight`), and suffixes that should
   stand alone are split off (`ちゃん`, `びっくり`, `はてな`, `文字`, `草`).
   Longest-first is why `赤ちゃん` can map to `akachan` while a bare `ちゃん`
   maps to `chan`.
2. **Long vowels.** A `ー` after hiragana becomes that kana's vowel, so
   `わおーん` is `waoon` and `やったー` is `yattaa`, matching what wanakana
   already does for katakana (`ソーダ` to `sooda`). A `ー` after anything
   else is dropped, which is why `ーーー` on its own has the common reading
   `nobashi`, the fan word for the mark.
3. **Kana fixes.** wanakana gets a few small-vowel combos wrong (`ふぁ` to
   `fua`, `ちぃ` to `chyi`). `KANA_FIXES` replaces them without spaces, so
   `ふぁい` stays one word, `fai`.
4. **NFKC.** Full-width `ＧＧ` and `ｔ` become ASCII. Half-width `ｱﾞ` does not
   survive this and needs a reading.

Then wanakana runs and `defaultTransform` turns the spaces into separators.
Small `っ` doubles the next consonant (`そっか` to `sokka`) and a trailing
`っ` disappears (`きゅっ` to `kyu`). Everything else, which is most of the
names, goes through untouched.

Readings are matched against the word after `splitWords`, which lowercases
it. A key with ASCII in it must therefore be lowercase: `てんq`, not `てんQ`.

A few names collide after romanization because the wiki has the same word
twice, in hiragana and katakana (`pekoきらきら` and `pekoキラキラ`), in
kanji and kana (`担の字` and `たんの字`), or with and without a prefix
(`トワ様びっくり` and `bikkuri`).
Naming never numbers them. The export suffixes the separator and a count
to the second and later zip entries (`peko-kirakira.png`,
`peko-kirakira-2.png`), which `src/export.test.ts` pins with these names.

A full morphological dictionary (kuroshiro, kuromoji) would read kanji
without a table, but it is about 20 MB and asynchronous, and naming runs
synchronously in the browser at export time. The table is the trade.

## Adding a talent

1. Create `src/emote-naming/talents/<first-last>.ts`, kebab-case.
2. Export a default object that satisfies `TalentNamingExports`:

   ```typescript
   import { prefixedTransform, type TalentNamingExports } from '../shared';

   const SPLIT: Record<string, string[]> = {};

   const READINGS: Record<string, string> = {};

   export default {
     'Talent Full Name': {
       defaultPrefix: 'short',
       transform: prefixedTransform({ strip: 'talent', split: SPLIT, readings: READINGS }),
     },
   } satisfies TalentNamingExports;
   ```

   `strip` is the talent's own name as the wiki writes it, in kana if that
   is what the names start with (`スバル`, `ちょこ先生`). Leave out `split` or
   `readings` when the table would be empty. Write the transform by hand
   only when the shape differs, as `AZKi` does to skip camel splitting.
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
| Roboco | `: rbc充電中:` | `rbc-juudenchuu` |
| Roboco | `: rbcHighspec:` | `rbc-high-spec` |
| AZKi | `: AZKi1:` | `azki-1` |
| Sakura Miko | `: mikoDoya35P:` | `miko-doya-35p` |
| Hoshimachi Suisei | `: bikkuriB:` | `suisei-bikkuri-b` |
| Tokino Sora | `: ぬんぬん1:` | `sora-nunnun1` |
| Tokino Sora | `: 止まらねえぞ:` | `sora-tomaranee-zo` |
| Tokino Sora | `: ミニソーダちゃん:` | `sora-mini-soda-chan` |
| Tokino Sora | `: あん肝ペンラ青:` | `sora-ankimo-penlight-ao` |
| Tokino Sora | `: そらザウルス:` | `sora-saurus` |
| Minato Aqua | `: aquaくそざこ余裕の余:` | `aqua-kusozako-yoyuu-no-yo` |
| Nekomata Okayu | `: 檻の中のおにぎりゃー:` | `okayu-ori-no-naka-no-onigiryaa` |
| Oozora Subaru | `: スバルうれしいあひる:` | `subaru-ureshii-ahiru` |
| Houshou Marine | `: 沈没船長:` | `marine-chinbotsu-senchou` |
| Tsunomaki Watame | `: 紫ペンラ:` | `watame-murasaki-penlight` |
| Yuzuki Choco | `: ちょこ先生ＧＧ文字スタンプ:` | `choco-gg-moji-stamp` |
| Hakui Koyori | `: 無罪muzai:` | `koyo-muzai` |
| Juufuutei Raden | `: お酒を飲みまあす:` | `raden-osake-wo-nomimaasu` |
| Koganei Niko | `: 照れるニコ担:` | `niko-tereru-niko-tan` |
| Hiodoshi Ao | `: シャンパンタワー:` | `ao-champagne-tower` |
| Watson Amelia | `: ameGatorIdol:` | `ame-gator-idol` |
