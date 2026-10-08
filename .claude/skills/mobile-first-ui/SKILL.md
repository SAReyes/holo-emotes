---
name: mobile-first-ui
description: Modify the browser UI or its styles (src/components/*.tsx, src/layouts/Layout.astro). Use when changing layout, spacing, colors, animation, hover or touch behavior, responsive breakpoints, or anything a phone user sees.
---

# Mobile-first UI

Preact components in `src/components/` each carry their own `<style>` block.
Global tokens, resets, and shared keyframes live in `src/layouts/Layout.astro`.
`EmoteBrowser.tsx` owns all state; the rest are presentational. The code
carries no comments. The rules below are the reasons behind the styles.

## Breakpoints and base styles

Base styles target a phone. One breakpoint, `@media (min-width: 640px)`,
widens padding, gaps, and minimum widths for desktop. Never write a
`max-width` query. If a style only makes sense on desktop, put it inside the
`640px` block.

## Touch rules

Each of these fixed a real bug on an iPhone. Keep them.

| Rule | Where | Why |
| --- | --- | --- |
| `touch-action: manipulation` and transparent `-webkit-tap-highlight-color` on buttons, inputs, labels, links | `Layout.astro` | Removes the 300ms double-tap delay and the grey tap flash. |
| Inputs are `16px` under `@media (pointer: coarse)` | `Layout.astro` | iOS Safari zooms the page when a focused input is smaller than 16px. |
| Hover styles only inside `@media (hover: hover)` | `EmoteGrid.tsx` and others | Touch devices otherwise get stuck in the hover state after a tap. |
| Remove buttons always visible under `@media (hover: none)` | `SelectionBar.tsx` | There is no hover to reveal them on a phone. |
| The emote tooltip opens only when `pointerType === 'mouse'` | `EmoteGrid.tsx` | On iOS a tap whose `mouseenter` handler mutates the DOM is treated as a hover, and the click is swallowed. The first tap on an emote did nothing. |
| Selection bar is `position: fixed` with `padding-bottom: env(safe-area-inset-bottom)` | `SelectionBar.tsx` | Clears the home indicator. The viewport meta sets `viewport-fit=cover`. |
| Filter bar is `position: sticky; top: 0` and the header does not stick | `FilterBar.tsx`, `EmoteBrowser.tsx` | A sticky header plus a sticky filter bar left no room for content on a phone. |
| Flex children that hold text get `min-width: 0` | section headers | Talent names were squeezed to zero width by the naming badge. |

## Animation

Shared keyframes `fade-in`, `fade-out`, `pop-in`, `pop-out`, `slide-up` are
defined once in `Layout.astro`. Components reference them by name.
`prefers-reduced-motion: reduce` sets every animation and transition duration
to near zero globally, so no component needs its own reduced-motion rule.

Two helpers handle mount and unmount:

- **`Collapsible`** animates height with `grid-template-rows: 0fr` to `1fr`.
  Children mount when opened and unmount once the 220ms close transition has
  finished, so collapsed sections cost nothing. Use it for accordions and the
  selection grid.
- **`usePresence(open, ms)`** keeps an element mounted for `ms` after `open`
  turns false and reports `closing` during that window. Add a `.closing`
  class that plays the exit keyframe with `forwards`. The dropdown, export
  menu, and modal use it with 140ms to 160ms.

Do not toggle `display: none` on anything that should animate out.

## State conventions

- `activeGenerations` is `null` when every generation is on. Toggling a set
  of generations together turns them all off if they are all on, otherwise
  all on, and collapses back to `null` when the set becomes complete.
- `EmoteImg` shows the self-hosted thumbnail from `localThumbPath` and swaps
  to the wiki URL on error. The path contract is in the `scraper` skill.

## Verifying a change

1. Run `pnpm dev`.
2. Open the page on an iPhone simulator through argent, not only in a desktop
   browser. Tap an emote once and confirm it selects on the first tap. Focus
   the search input and confirm the page does not zoom. Open and close the
   generations dropdown, the export menu, and the Slack modal and watch for
   a clipped overlay or a jump at the end of the animation.
3. Then check a desktop width above 640px for the widened layout and hover
   states.
4. Run `pnpm build`.
