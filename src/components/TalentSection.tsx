import type { SelectedEmote } from '../types';
import EmoteGrid from './EmoteGrid';

interface Props {
  branchName: string;
  generation: string;
  talent: string;
  emotes: Record<string, string>;
  expanded: boolean;
  onToggle: () => void;
  isEmoteSelected: (branch: string, generation: string, talent: string, name: string) => boolean;
  onToggleEmote: (emote: SelectedEmote) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  isFullySelected: boolean;
  hasTransform: boolean;
}

export default function TalentSection({
  branchName,
  generation,
  talent,
  emotes,
  expanded,
  onToggle,
  isEmoteSelected,
  onToggleEmote,
  onSelectAll,
  onDeselectAll,
  isFullySelected,
  hasTransform,
}: Props) {
  const count = Object.keys(emotes).length;

  function handleSelectToggle() {
    if (isFullySelected) onDeselectAll();
    else onSelectAll();
  }

  return (
    <div class="talent-section">
      <div class="talent-header">
        <button
          class="talent-toggle"
          onClick={onToggle}
          aria-expanded={expanded}
        >
          <svg
            class={`chevron ${expanded ? 'open' : ''}`}
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
          <span class="talent-name-row">
            <span class="talent-name">{talent}</span>
            {!hasTransform && (
              <span
                class="talent-naming-warn"
                role="img"
                aria-label="Default Slack naming: custom transform not configured for this talent"
                title="Custom emote naming not configured — Slack export uses the default transform"
              >
                <svg
                  class="talent-naming-warn-icon"
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.25"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                Default naming
              </span>
            )}
          </span>
          <span class="talent-count">{count} emote{count !== 1 ? 's' : ''}</span>
        </button>
        <button
          type="button"
          class={`select-all-btn ${isFullySelected ? 'deselect' : ''}`}
          onClick={handleSelectToggle}
          title={isFullySelected ? 'Deselect all from this talent' : 'Select all from this talent'}
        >
          {isFullySelected ? (
            <>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Deselect all
            </>
          ) : (
            <>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
              Select all
            </>
          )}
        </button>
      </div>

      {expanded && (
        <div class="talent-body">
          <EmoteGrid
            branchName={branchName}
            generation={generation}
            talent={talent}
            emotes={emotes}
            isEmoteSelected={isEmoteSelected}
            onToggleEmote={onToggleEmote}
          />
        </div>
      )}

      <style>{`
        .talent-section {
          background: var(--bg-base);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          overflow: hidden;
        }

        .talent-header {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 0 10px 0 0;
          color: var(--text-secondary);
          transition: background var(--transition), color var(--transition);
        }

        .talent-header:hover {
          background: var(--bg-elevated);
          color: var(--text-primary);
        }

        .talent-toggle {
          flex: 1;
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 8px 10px;
          background: none;
          border: none;
          color: inherit;
          font: inherit;
          text-align: left;
          cursor: pointer;
        }

        .talent-toggle[aria-expanded="true"] {
          color: var(--text-primary);
        }

        .chevron {
          flex-shrink: 0;
          color: var(--text-muted);
          transition: transform var(--transition), color var(--transition);
        }

        .chevron.open {
          transform: rotate(90deg);
          color: var(--accent);
        }

        .talent-name-row {
          display: flex;
          align-items: center;
          gap: 6px;
          flex: 1;
          min-width: 0;
        }

        .talent-name {
          font-size: 12.5px;
          font-weight: 600;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .talent-naming-warn {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          flex-shrink: 0;
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          color: var(--warning, #e5a00d);
          border: 1px solid color-mix(in srgb, var(--warning, #e5a00d) 45%, var(--border));
          background: color-mix(in srgb, var(--warning, #e5a00d) 12%, var(--bg-elevated));
          padding: 2px 5px;
          border-radius: 4px;
          line-height: 1;
        }

        .talent-naming-warn-icon {
          flex-shrink: 0;
          opacity: 0.95;
        }

        .talent-count {
          font-size: 11px;
          color: var(--text-muted);
          white-space: nowrap;
        }

        .select-all-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 500;
          padding: 3px 8px;
          border-radius: 5px;
          border: 1px solid var(--border);
          background: var(--bg-elevated);
          color: var(--text-muted);
          transition: all var(--transition);
          white-space: nowrap;
          flex-shrink: 0;
        }

        .select-all-btn:hover {
          border-color: var(--accent-dim);
          color: var(--accent);
          background: var(--accent-glow);
        }

        .select-all-btn.deselect {
          border-color: color-mix(in srgb, var(--accent) 40%, transparent);
          color: var(--accent);
          background: var(--accent-glow);
        }

        .select-all-btn.deselect:hover {
          border-color: var(--danger);
          color: var(--danger);
          background: color-mix(in srgb, var(--danger) 10%, transparent);
        }

        .talent-body {
          border-top: 1px solid var(--border);
          padding: 10px;
        }
      `}</style>
    </div>
  );
}
