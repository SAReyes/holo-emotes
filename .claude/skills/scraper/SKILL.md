---
name: scraper
description: Modify or run the hololive.wiki emote scraper (scripts/fetch-emotes.ts, scripts/robots.ts, src/emote-image.ts). Use when changing how emotes are discovered, parsed, named, downloaded, or stored, or when refreshing public/emotes.
---

# Scraper

The scraper reads hololive.wiki and writes one JSON per branch plus
self-hosted thumbnails into `public/emotes/`. The code carries no comments.
Everything you need to know about why it is shaped this way is here.

## Files

| File | Role |
| --- | --- |
| `scripts/fetch-emotes.ts` | Discovery, parsing, thumbnail sync, CLI. |
| `scripts/robots.ts` | robots.txt parser and the `assertAllowed` gate every request goes through. |
| `src/emote-image.ts` | Maps a wiki image URL to its local thumbnail path. Shared with the UI so the writer and the reader agree. |
| `scripts/robots.test.ts`, `src/emote-image.test.ts` | Tests for the two pure modules. |

## Why it reads article pages, not the API

hololive.wiki's robots.txt disallows `/w/` (the MediaWiki API) and every
`?action=` URL, but not plain `/wiki/` article pages. So the scraper fetches
the rendered pages under `/wiki/Membership_Emotes` and parses HTML. Every
request, pages and images alike, passes `assertAllowed` first, which fetches
and caches the live robots.txt per origin and throws if the path is disallowed
for `User-agent: *`. Do not add a request path that bypasses it.

## robots.txt semantics

`parseRobots` reads only the `User-agent: *` group. Consecutive `User-agent`
lines form one group header. A rule line closes the header, so a later
`User-agent` line starts a new group. `isAllowed` uses the longest matching
rule, and on a tie Allow wins. That is the behavior Google documents. `*`
wildcards and a trailing `$` anchor are supported. A 404 for robots.txt allows
everything; any other error throws. `scripts/robots.test.ts` holds a trimmed
copy of the real file as served in October 2026. Refresh it if the rules
change.

## Data shape

Defined in `src/types.ts` and mirrored in the script:

| Type | Key | Value |
| --- | --- | --- |
| `EmoteMap` | emote name | image URL |
| `TalentMap` | talent name | `EmoteMap` |
| `GenerationMap` | generation name | `TalentMap` |
| `BranchMap` | branch name | `GenerationMap` |

Each branch page is walked as a flat sequence of `h2`, `h3`, and `img` in
document order. An `h2` starts a generation, an `h3` starts a talent, and
every `img` after an `h3` is an emote under it. Images before the first
talent heading are ignored. A generation that never appears is `Ungrouped`.
The first occurrence of a name wins within a talent.

## Parsing an image

`parseEmote` resolves protocol-relative (`//`), absolute-path (`/`), and full
URLs against `https://hololive.wiki`. It drops images whose URL contains any
of `/static/`, `spinner`, `placeholder`, `blank.gif`, `pixel`, and names that
contain `loading`, `placeholder`, or `sprite`. The name comes from
`data-image-name`, then `alt`, then `title`. The file extension is stripped
and underscores become spaces. Heading text is read from `.mw-headline` so the
`[edit]` link is excluded.

## Thumbnails

The wiki serves two URL shapes:

```
https://static.wikitide.net/hololivewiki/thumb/d/db/Emote-gigi1.png/90px-Emote-gigi1.png
https://static.wikitide.net/hololivewiki/4/41/Emote-risu1.png
```

`localThumbPath` maps both to `/emotes/thumbs/<h>/<hh>/<basename>`. MediaWiki
derives the two hash directories from the filename, so the basename is unique
inside them and the thumb width segment can be dropped.

`syncThumbs` is delta only. It downloads files that are missing locally with
six concurrent workers and deletes files under `thumbs/` that no branch
references any more. Existing files are never re-downloaded, so a changed
image at the same URL needs a manual delete.

## Why the output is committed

hololive.wiki returns 403 to GitHub Actions runners. The JSON and thumbnails
are committed so the Pages build never fetches the wiki. The UI shows the
local thumbnail and falls back to the wiki URL if the file is missing.

## Procedure

1. Run `pnpm fetch-emotes -o public/emotes`. Without `-o` the script prompts
   for a branch and prints JSON to stdout instead of writing files.
2. Read `git diff --stat public/emotes`. New talents, renamed emotes, and
   removed thumbnails all show here. A large unexpected diff means the page
   structure changed, not the emotes.
3. If you changed parsing, add a case to the relevant test with real markup
   or a real URL, not an invented one.
4. Run `pnpm test` and `pnpm build`.
5. If a new talent appears in an EN branch, follow `docs/emote-naming.md` to
   add a naming transform.
