import type { ComponentChildren } from 'preact';
import { usePresence } from './use-presence';

interface Props {
  open: boolean;
  children: ComponentChildren;
}

const CLOSE_MS = 220;

/**
 * Animates its children open and closed by height. Children mount when
 * opened and unmount once the closing transition has finished, so collapsed
 * sections cost nothing.
 */
export default function Collapsible({ open, children }: Props) {
  const { mounted } = usePresence(open, CLOSE_MS);

  return (
    <div class="collapsible" data-open={open ? 'true' : 'false'}>
      <div class="collapsible-inner">{mounted && children}</div>

      <style>{`
        .collapsible {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows ${CLOSE_MS}ms ease;
        }

        .collapsible[data-open="true"] {
          grid-template-rows: 1fr;
        }

        .collapsible-inner {
          min-height: 0;
          overflow: hidden;
          opacity: 0;
          transition: opacity ${CLOSE_MS}ms ease;
        }

        .collapsible[data-open="true"] > .collapsible-inner {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}
