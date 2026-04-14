import { useState } from 'preact/hooks';
import type { SelectedEmote } from '../types';

interface Props {
  selected: Map<string, SelectedEmote>;
  onClear: () => void;
  onRemove: (key: string) => void;
}

export default function SelectionBar({ selected, onClear, onRemove }: Props) {
  const [expanded, setExpanded] = useState(false);
  const count = selected.size;
  const visible = count > 0;

  const entries = Array.from(selected.entries());
  const previewEmotes = entries.slice(0, 12);

  if (!visible) {
    return null;
  }

  return (
    <div class={`selection-bar ${expanded ? 'expanded' : ''}`}>
      <div class="bar-inner">
        <button
          class="bar-summary"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
        >
          <div class="preview-strip">
            {previewEmotes.map(([key, emote]) => (
              <img
                key={key}
                src={emote.url}
                alt={emote.name}
                class="preview-img"
                loading="lazy"
              />
            ))}
            {count > 12 && (
              <span class="preview-more">+{count - 12}</span>
            )}
          </div>
          <span class="bar-count">
            <strong>{count}</strong> emote{count !== 1 ? 's' : ''} selected
          </span>
          <svg
            class={`bar-chevron ${expanded ? 'open' : ''}`}
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </button>

        <div class="bar-actions">
          <button class="btn-clear" onClick={onClear}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            Clear
          </button>
          <button class="btn-export" disabled title="Export coming soon">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export pack
          </button>
        </div>
      </div>

      {expanded && (
        <div class="expanded-grid">
          {entries.map(([key, emote]) => (
            <div key={key} class="sel-emote">
              <img src={emote.url} alt={emote.name} class="sel-img" loading="lazy" />
              <button
                class="sel-remove"
                onClick={() => onRemove(key)}
                aria-label={`Remove ${emote.name}`}
              >
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
              <span class="sel-name">{emote.name.replace(/^:\s*/, '').replace(/\s*:$/, '')}</span>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .selection-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(18, 18, 31, 0.95);
          border-top: 1px solid var(--accent-dim);
          backdrop-filter: blur(16px);
          z-index: 60;
          box-shadow: 0 -4px 32px rgba(51, 204, 255, 0.1);
          transition: max-height 0.3s ease;
        }

        .bar-inner {
          max-width: 1600px;
          margin: 0 auto;
          padding: 10px 24px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .bar-summary {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 10px;
          background: none;
          border: none;
          color: var(--text-primary);
          cursor: pointer;
          text-align: left;
          padding: 0;
          min-width: 0;
        }

        .preview-strip {
          display: flex;
          align-items: center;
          gap: -4px;
          flex-shrink: 0;
        }

        .preview-img {
          width: 28px;
          height: 28px;
          object-fit: contain;
          border-radius: 4px;
          border: 1px solid var(--border);
          background: var(--bg-elevated);
          margin-left: -6px;
        }

        .preview-img:first-child {
          margin-left: 0;
        }

        .preview-more {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          margin-left: 6px;
          white-space: nowrap;
        }

        .bar-count {
          font-size: 13px;
          color: var(--text-secondary);
          white-space: nowrap;
        }

        .bar-count strong {
          color: var(--accent);
          font-weight: 700;
        }

        .bar-chevron {
          color: var(--text-muted);
          transition: transform var(--transition);
          flex-shrink: 0;
        }

        .bar-chevron.open {
          transform: rotate(180deg);
        }

        .bar-actions {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }

        .btn-clear {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 7px 12px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border);
          background: var(--bg-elevated);
          color: var(--text-secondary);
          font-size: 12px;
          font-weight: 500;
          transition: all var(--transition);
        }

        .btn-clear:hover {
          border-color: var(--danger);
          color: var(--danger);
          background: color-mix(in srgb, var(--danger) 10%, var(--bg-elevated));
        }

        .btn-export {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 7px 14px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--accent-dim);
          background: var(--accent-glow);
          color: var(--accent);
          font-size: 12px;
          font-weight: 600;
          transition: all var(--transition);
        }

        .btn-export:not(:disabled):hover {
          background: var(--accent);
          color: #000;
          border-color: var(--accent);
        }

        .btn-export:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .expanded-grid {
          max-width: 1600px;
          margin: 0 auto;
          padding: 0 24px 14px;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          max-height: 220px;
          overflow-y: auto;
        }

        .sel-emote {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          width: 60px;
        }

        .sel-img {
          width: 44px;
          height: 44px;
          object-fit: contain;
          border-radius: 6px;
          border: 1px solid var(--border);
          background: var(--bg-elevated);
        }

        .sel-remove {
          position: absolute;
          top: -4px;
          right: -4px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: none;
          background: var(--danger);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          opacity: 0;
          transition: opacity var(--transition);
        }

        .sel-emote:hover .sel-remove {
          opacity: 1;
        }

        .sel-name {
          font-size: 8.5px;
          color: var(--text-muted);
          text-align: center;
          max-width: 100%;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          line-height: 1.2;
          word-break: break-word;
        }
      `}</style>
    </div>
  );
}
