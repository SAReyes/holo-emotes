import type { TalentMap, SelectedEmote } from '../types';
import { hasTalentTransform } from '../emote-naming';
import TalentSection from './TalentSection';
import Collapsible from './Collapsible';

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
          <span class="gen-meta">{talentCount} talent{talentCount !== 1 ? 's' : ''}</span>
          <span class="gen-count">{emoteCount} emotes</span>
        </div>
      </button>

      <Collapsible open={expanded}>
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
              hasTransform={hasTalentTransform(talent)}
            />
          ))}
        </div>
      </Collapsible>

      <style>{`
        .gen-section {
          border-radius: var(--radius-md);
          transition: background var(--transition);
        }

        .gen-section:has(> .gen-header[aria-expanded="true"]) {
          background: var(--surface-tint);
        }

        .gen-header {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 9px 10px;
          background: none;
          border: none;
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          text-align: left;
          cursor: pointer;
          transition: background var(--transition), color var(--transition);
        }

        .gen-header:hover {
          background: var(--surface-tint-hover);
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
          align-items: baseline;
          gap: 10px;
        }

        .gen-meta {
          display: none;
          font-size: 11px;
          color: var(--text-muted);
          white-space: nowrap;
        }

        @media (min-width: 640px) {
          .gen-meta {
            display: inline;
          }
        }

        .gen-count {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          white-space: nowrap;
          font-variant-numeric: tabular-nums;
        }

        .gen-header[aria-expanded="true"] .gen-count {
          color: var(--accent);
        }

        .gen-body {
          margin: 0 0 6px 15px;
          padding-left: 6px;
          border-left: 1px solid var(--glass-border-strong);
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        @media (min-width: 640px) {
          .gen-body {
            margin-left: 17px;
            padding-left: 8px;
          }
        }
      `}</style>
    </div>
  );
}
