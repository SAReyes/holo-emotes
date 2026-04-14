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
}: Props) {
  const count = Object.keys(emotes).length;

  function handleSelectToggle(e: MouseEvent) {
    e.stopPropagation();
    if (isFullySelected) onDeselectAll();
    else onSelectAll();
  }

  return (
    <div class="talent-section">
      <button
        class="talent-header"
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
        <span class="talent-name">{talent}</span>
        <span class="talent-count">{count} emote{count !== 1 ? 's' : ''}</span>
        <button
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
      </button>

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
          width: 100%;
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 8px 10px;
          background: none;
          border: none;
          color: var(--text-secondary);
          text-align: left;
          cursor: pointer;
          transition: background var(--transition), color var(--transition);
        }

        .talent-header:hover {
          background: var(--bg-elevated);
          color: var(--text-primary);
        }

        .talent-header[aria-expanded="true"] {
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

        .talent-name {
          font-size: 12.5px;
          font-weight: 600;
          flex: 1;
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
