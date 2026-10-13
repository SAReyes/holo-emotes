import type { SelectedEmote } from '../types';
import EmoteGrid from './EmoteGrid';
import Collapsible from './Collapsible';

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
                <span class="talent-naming-warn-text">Default naming</span>
              </span>
            )}
          </span>
          <span class="talent-count">{count} emote{count !== 1 ? 's' : ''}</span>
        </button>
      </div>

      <Collapsible open={expanded}>
        <div class="talent-body">
          <div class="talent-tools">
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
          <EmoteGrid
            branchName={branchName}
            generation={generation}
            talent={talent}
            emotes={emotes}
            isEmoteSelected={isEmoteSelected}
            onToggleEmote={onToggleEmote}
          />
        </div>
      </Collapsible>

      <style>{`
        .talent-header {
          display: flex;
          align-items: center;
          gap: 12px;
          color: var(--text-secondary);
          transition: color var(--transition);
        }

        @media (hover: hover) {
          .talent-header:hover {
            color: var(--text-primary);
          }
        }

        .talent-toggle {
          flex: 1;
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 0;
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
          font-size: 13.5px;
          font-weight: 500;
          min-width: 0;
          overflow-wrap: anywhere;
        }

        .talent-naming-warn-text {
          display: none;
        }

        @media (min-width: 640px) {
          .talent-name {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .talent-naming-warn-text {
            display: inline;
          }
        }

        .talent-naming-warn {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          flex-shrink: 0;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--warning, #e5a00d);
          line-height: 1;
        }

        .talent-naming-warn-icon {
          flex-shrink: 0;
          opacity: 0.95;
        }

        .talent-count {
          font-size: 12px;
          color: var(--text-muted);
          white-space: nowrap;
          font-variant-numeric: tabular-nums;
        }

        .talent-tools {
          display: flex;
          justify-content: flex-end;
          padding-bottom: 4px;
        }

        .select-all-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          font-weight: 500;
          padding: 6px 0;
          border: none;
          background: transparent;
          color: var(--text-muted);
          transition: color var(--transition);
          white-space: nowrap;
        }

        @media (hover: hover) {
          .select-all-btn:hover {
            color: var(--accent);
          }

          .select-all-btn.deselect:hover {
            color: var(--danger);
          }
        }

        .select-all-btn.deselect {
          color: var(--accent);
        }

        .talent-body {
          padding: 0 0 12px;
        }
      `}</style>
    </div>
  );
}
