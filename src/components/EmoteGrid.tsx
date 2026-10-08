import { useState } from 'preact/hooks';
import EmoteImg from './EmoteImg';
import type { SelectedEmote } from '../types';

interface Props {
  branchName: string;
  generation: string;
  talent: string;
  emotes: Record<string, string>;
  isEmoteSelected: (branch: string, generation: string, talent: string, name: string) => boolean;
  onToggleEmote: (emote: SelectedEmote) => void;
}

interface TooltipState {
  name: string;
  url: string;
  x: number;
  y: number;
}

export default function EmoteGrid({
  branchName,
  generation,
  talent,
  emotes,
  isEmoteSelected,
  onToggleEmote,
}: Props) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  /**
   * Hover preview for mouse users only. On iOS a tap whose mouseenter handler
   * mutates the DOM is treated as a hover, and the click is swallowed.
   */
  function handlePointerEnter(e: PointerEvent, name: string, url: string) {
    if (e.pointerType !== 'mouse') return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setTooltip({
      name,
      url,
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
  }

  function handlePointerLeave() {
    setTooltip(null);
  }

  const entries = Object.entries(emotes);

  return (
    <div class="emote-grid">
      {entries.map(([name, url]) => {
        const selected = isEmoteSelected(branchName, generation, talent, name);
        return (
          <button
            key={name}
            class={`emote-card ${selected ? 'selected' : ''}`}
            onClick={() => onToggleEmote({ branch: branchName, generation, talent, name, url })}
            onPointerEnter={(e) => handlePointerEnter(e, name, url)}
            onPointerLeave={handlePointerLeave}
            title={name}
            aria-pressed={selected}
          >
            <div class="emote-img-wrap">
              <EmoteImg url={url} alt={name} loading="lazy" class="emote-img" />
              {selected && (
                <div class="selected-overlay">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              )}
            </div>
            <span class="emote-name">{name.replace(/^:\s*/, '').replace(/\s*:$/, '')}</span>
          </button>
        );
      })}

      {tooltip && (
        <div
          class="emote-tooltip"
          style={`left: ${tooltip.x}px; top: ${tooltip.y}px;`}
        >
          <EmoteImg url={tooltip.url} alt={tooltip.name} class="tooltip-img" />
          <span class="tooltip-name">{tooltip.name.replace(/^:\s*/, '').replace(/\s*:$/, '')}</span>
        </div>
      )}

      <style>{`
        .emote-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(72px, 1fr));
          gap: 6px;
        }

        .emote-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 6px 4px;
          border-radius: var(--radius-sm);
          border: 1.5px solid var(--border);
          background: var(--bg-elevated);
          cursor: pointer;
          transition: all var(--transition);
          position: relative;
          color: var(--text-secondary);
        }

        @media (hover: hover) {
          .emote-card:hover {
            border-color: var(--border-light);
            background: var(--bg-hover);
            color: var(--text-primary);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          }
        }

        .emote-card.selected {
          border-color: var(--accent);
          background: var(--accent-glow);
          box-shadow: 0 0 0 1px var(--accent-dim), 0 0 12px rgba(51, 204, 255, 0.1);
        }

        .emote-card:active {
          transform: scale(0.94);
          transition-duration: 80ms;
        }

        .emote-card.selected:hover {
          box-shadow: 0 0 0 1px var(--accent), 0 4px 16px rgba(51, 204, 255, 0.2);
        }

        .emote-img-wrap {
          position: relative;
          width: 52px;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .emote-img {
          max-width: 48px;
          max-height: 48px;
          width: auto;
          height: auto;
          object-fit: contain;
          image-rendering: -webkit-optimize-contrast;
        }

        .selected-overlay {
          position: absolute;
          inset: 0;
          background: rgba(51, 204, 255, 0.25);
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent);
          animation: pop-in 180ms cubic-bezier(0.2, 0.9, 0.3, 1.3);
        }

        .emote-name {
          font-size: 9px;
          text-align: center;
          line-height: 1.2;
          word-break: break-word;
          max-width: 100%;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          color: inherit;
        }

        .emote-tooltip {
          position: fixed;
          transform: translate(-50%, calc(-100% - 10px));
          background: var(--bg-elevated);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
          padding: 10px;
          box-shadow: var(--shadow);
          pointer-events: none;
          z-index: 200;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          min-width: 90px;
        }


        .tooltip-img {
          width: 80px;
          height: 80px;
          object-fit: contain;
          image-rendering: -webkit-optimize-contrast;
        }

        .tooltip-name {
          font-size: 10px;
          color: var(--text-secondary);
          text-align: center;
          max-width: 100px;
          word-break: break-word;
        }
      `}</style>
    </div>
  );
}
