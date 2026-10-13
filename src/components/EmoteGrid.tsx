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
                <div class="selected-badge">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
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
          gap: 4px;
        }

        @media (min-width: 640px) {
          .emote-grid {
            grid-template-columns: repeat(auto-fill, minmax(84px, 1fr));
            gap: 6px;
          }
        }

        .emote-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 8px 4px 6px;
          border-radius: var(--radius-md);
          border: none;
          background: transparent;
          box-shadow: 0 0 0 1.5px transparent;
          cursor: pointer;
          transition: background var(--transition), box-shadow var(--transition), color var(--transition), transform var(--transition);
          position: relative;
          color: var(--text-muted);
        }

        @media (hover: hover) {
          .emote-card:hover {
            background: var(--surface-tint-hover);
            color: var(--text-primary);
            transform: translateY(-2px);
          }
        }

        .emote-card.selected {
          background: var(--surface-tint);
          box-shadow: 0 0 0 1.5px var(--accent);
          color: var(--text-primary);
        }

        .emote-card:active {
          transform: scale(0.94);
          transition-duration: 80ms;
        }

        .emote-card.selected:hover {
          box-shadow: 0 0 0 1.5px var(--accent-hover);
        }

        .emote-img-wrap {
          position: relative;
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .emote-img {
          max-width: 56px;
          max-height: 56px;
          width: auto;
          height: auto;
          object-fit: contain;
          image-rendering: -webkit-optimize-contrast;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.35));
        }

        @media (min-width: 640px) {
          .emote-img-wrap {
            width: 64px;
            height: 64px;
          }

          .emote-img {
            max-width: 64px;
            max-height: 64px;
          }
        }

        .selected-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: var(--accent);
          border: 2px solid var(--bg-base);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #000;
          animation: pop-in 180ms cubic-bezier(0.2, 0.9, 0.3, 1.3);
        }

        .emote-name {
          font-size: 10px;
          font-weight: 500;
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
          background: var(--glass-bg-strong);
          border: 1px solid var(--glass-border-strong);
          border-radius: var(--radius-md);
          padding: 10px;
          box-shadow: var(--glass-highlight), var(--shadow);
          -webkit-backdrop-filter: var(--glass-blur);
          backdrop-filter: var(--glass-blur);
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
