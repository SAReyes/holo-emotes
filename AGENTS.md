# AGENTS.md

Guidance for coding agents (Claude Code, Codex, or similar) working in this repo.
Read it once per session. Keep it short; if you find yourself writing the same
instruction twice, turn it into a script or a check instead of more text.

## What this is

A static site that browses hololive membership emotes and exports a selection as
a Slack-ready zip. Astro renders the page, Preact drives the browser UI, and a
Node script scrapes emote data from hololive.wiki. One developer, one `main`
branch, deployed to GitHub Pages on every push to `main`.

## Commands

Tool versions are pinned in `.prototools` (Node 22, pnpm 10). Use pnpm.

| Task | Command |
| --- | --- |
| Install deps | `pnpm install` |
| Fetch emote JSON (required before dev/build) | `pnpm fetch-emotes -o public/emotes` |
| Dev server | `pnpm dev` |
| Production build | `pnpm build` |
| Unit tests (vitest) | `pnpm test` |

`public/emotes/` is gitignored and generated. `src/pages/index.astro` reads every
`*.json` in it at build time, so a fresh clone fails to build until the fetch
script has run. There are no test files yet; `pnpm test` exits non-zero until the
first `*.test.ts` lands. When you add logic to `src/emote-naming/` or
`src/export.ts`, add the first test file next to it.

## Layout

- `scripts/fetch-emotes.ts`. Scrapes branch -> generation -> talent -> emote
  maps from the wiki API and writes one JSON per branch. CLI flag `-o/--output`.
- `src/types.ts`. The data shape everything else consumes: `BranchData`,
  `GenerationMap`, `SelectedEmote`. Start here before touching any feature.
- `src/components/`. Preact UI. `EmoteBrowser.tsx` owns all state (selection,
  filters, search); the other components are presentational.
- `src/emote-naming/`. Pure functions that turn raw emote names into Slack
  slugs. Per-talent overrides live in `talents/`. Conventions are documented in
  `.cursor/rules/emote-naming.mdc`; follow that file when adding a talent.
- `src/export.ts`. URL resolution (thumbnail / original / custom px) and zip
  building. Pure except for the final download.
- `test.sh`, `interactive.sh`. Older bash prototypes of the scraper. Reference
  only; the TypeScript script is the source of truth.

## How to work here

These are the few rules that earn their place in a repo this size.

**Smallest change that solves the problem.** Prefer deleting over adding. No new
abstraction, wrapper, or config option for a single caller. If a change needs a
new layer, say why in the summary.

**Name the data shape first.** Before writing logic, state what goes in and what
comes out in terms of the types in `src/types.ts` or `src/emote-naming/shared.ts`.
Encode rules in a table, map, or type rather than a chain of conditionals. The
talent transform registry is the model: one object per talent, spread into one
record, no `if (talent === ...)` anywhere.

**Keep boundaries honest.** Parse and validate external data (wiki HTML, JSON on
disk, user input in the export modal) at the edge, then trust the types inside.
Naming and export helpers stay pure so they can be tested without a browser.

**Prove it works against the real artifact.** "It type-checks" is not done.
Before reporting a change as finished:

1. `pnpm build` succeeds with emotes fetched.
2. `pnpm test` passes (once tests exist).
3. For UI changes, load `pnpm dev` and exercise the changed flow yourself.
4. For naming changes, show a before/after table of real emote names from the
   fetched JSON, not invented examples.

**Test behavior, not implementation.** Call `toSlackName`, `toOriginalUrl`, etc.
the way the app does and assert a literal expected string. A test that would
still pass if every imported function returned `undefined` is not a test.

**Fix root causes.** When something breaks, reproduce it first (a failing test,
a build error, a specific emote that renders wrong), then trace to the cause.
Do not patch the symptom.

**Proceed on reversible work.** Edits, refactors, new tests, and local scripts
do not need permission. Do them, then report. Pause for anything that pushes to
`main` (that deploys), deletes data, or rewrites history. If a design question
can be settled by running something, run it instead of asking.

## Writing the summary

- Lead with the outcome and what was verified. Say plainly if something was not
  verified or was skipped.
- Short declarative sentences. One idea per sentence. No long dashes.
- Reference code as `path:line` so it is clickable.
- Claims about behavior cite evidence: a command run, a test name, a screenshot.
- No closing offers or restating the work.

## Git

- Conventional-style prefixes as in history: `feat:`, `fix:`, `chore:`.
- Commit only when asked. Never force-push `main`.
