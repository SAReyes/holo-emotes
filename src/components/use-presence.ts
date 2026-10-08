import { useEffect, useState } from 'preact/hooks';

/**
 * Keeps an element mounted for `ms` after `open` turns false so it can play
 * an exit animation. `closing` is true during that window.
 */
export function usePresence(open: boolean, ms: number): { mounted: boolean; closing: boolean } {
  const [mounted, setMounted] = useState(open);

  useEffect(() => {
    if (open) {
      setMounted(true);
      return;
    }
    const id = setTimeout(() => setMounted(false), ms);
    return () => clearTimeout(id);
  }, [open, ms]);

  return { mounted, closing: mounted && !open };
}
