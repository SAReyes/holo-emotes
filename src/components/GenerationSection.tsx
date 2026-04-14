import type { TalentMap, SelectedEmote } from '../types';
import TalentSection from './TalentSection';

interface Props {
  branchName: string;
  generation: string;
  talents: TalentMap;
  expanded: boolean;
  expandedNodes: Set<string>;
  onToggle: () => void;
  onToggleNode: (key: string) => void;
  isEmoteSelected: (branch: string, generation: string, talent: string, name: string) => boolean;
  onToggleEmote: (emote: SelectedEmote) => void;
  onSelectAllForTalent: (branch: string, generation: string, talent: string, emotes: Record<string, string>) => void;
  onDeselectAllForTalent: (branch: string, generation: string, talent: string, emotes: Record<string, string>) => void;
  isTalentFullySelected: (branch: string, generation: string, talent: string, emotes: Record<string, string>) => boolean;
}

export default function GenerationSection({
  branchName,
  generation,
  talents,
  expanded,
  expandedNodes,
  onToggle,
  onToggleNode,
  isEmoteSelected,
  onToggleEmote,
  onSelectAllForTalent,
  onDeselectAllForTalent,
  isTalentFullySelected,
}: Props) {
  const talentCount = Object.keys(talents).length;
  const emoteCount = Object.values(talents).reduce((s, e) => s + Object.keys(e).length, 0);

  return (
    <div class="gen-section">
      <button
        class="gen-header"
        onClick={onToggle}
        aria-expanded={expanded}
      >
        <svg
          class={`chevron ${expanded ? 'open' : ''}`}
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <span class="gen-name">{generation}</span>
        <div class="gen-badges">
          <span class="gen-badge">{talentCount} talent{talentCount !== 1 ? 's' : ''}</span>
          <span class="gen-badge gen-badge--count">{emoteCount} emotes</span>
        </div>
      </button>

      {expanded && (
        <div class="gen-body">
          {Object.entries(talents).map(([talent, emotes]) => (
            <TalentSection
              key={talent}
              branchName={branchName}
              generation={generation}
              talent={talent}
              emotes={emotes}
              expanded={expandedNodes.has(`talent:${branchName}:${generation}:${talent}`)}
              onToggle={() => onToggleNode(`talent:${branchName}:${generation}:${talent}`)}
              isEmoteSelected={isEmoteSelected}
              onToggleEmote={onToggleEmote}
              onSelectAll={() => onSelectAllForTalent(branchName, generation, talent, emotes)}
              onDeselectAll={() => onDeselectAllForTalent(branchName, generation, talent, emotes)}
              isFullySelected={isTalentFullySelected(branchName, generation, talent, emotes)}
            />
          ))}
        </div>
      )}

      <style>{`
        .gen-section {
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          overflow: hidden;
        }

        .gen-header {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          background: none;
          border: none;
          color: var(--text-secondary);
          text-align: left;
          cursor: pointer;
          transition: background var(--transition), color var(--transition);
        }

        .gen-header:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }

        .gen-header[aria-expanded="true"] {
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

        .gen-name {
          font-size: 13px;
          font-weight: 600;
          flex: 1;
          letter-spacing: -0.1px;
        }

        .gen-badges {
          display: flex;
          gap: 5px;
        }

        .gen-badge {
          font-size: 10px;
          padding: 1px 6px;
          border-radius: 8px;
          background: var(--bg-base);
          border: 1px solid var(--border);
          color: var(--text-muted);
          font-weight: 500;
          white-space: nowrap;
        }

        .gen-badge--count {
          color: var(--accent);
          border-color: var(--accent-dim);
          background: var(--accent-glow);
        }

        .gen-body {
          border-top: 1px solid var(--border);
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
      `}</style>
    </div>
  );
}
