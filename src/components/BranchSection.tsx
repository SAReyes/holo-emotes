import type { BranchData, SelectedEmote } from '../types';
import GenerationSection from './GenerationSection';
import Collapsible from './Collapsible';

const BRANCH_COLORS: Record<string, string> = {
  'Hololive English': '#33ccff',
  'Hololive (Japan)': '#ff6699',
  'Hololive Indonesia': '#66dd66',
  'Hololive DEV_IS': '#cc66ff',
};

interface Props {
  branch: BranchData;
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

export default function BranchSection({
  branch,
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
  const color = BRANCH_COLORS[branch.name] ?? '#aaaacc';
  const genCount = Object.keys(branch.generations).length;
  const talentCount = Object.values(branch.generations).reduce(
    (s, t) => s + Object.keys(t).length, 0
  );
  const emoteCount = Object.values(branch.generations).reduce(
    (s, talents) => s + Object.values(talents).reduce((ts, e) => ts + Object.keys(e).length, 0), 0
  );

  return (
    <div class="branch-section" style={`--branch-color: ${color}`}>
      <button
        class="branch-header"
        onClick={onToggle}
        aria-expanded={expanded}
      >
        <svg
          class={`chevron ${expanded ? 'open' : ''}`}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <span class="branch-name">{branch.name}</span>
        <div class="branch-badges">
          <span class="branch-meta">{genCount} gen{genCount !== 1 ? 's' : ''} · {talentCount} talents</span>
          <span class="branch-count">{emoteCount.toLocaleString()}</span>
        </div>
      </button>

      <Collapsible open={expanded}>
        <div class="branch-body">
          {Object.entries(branch.generations).map(([gen, talents]) => (
            <GenerationSection
              key={gen}
              branchName={branch.name}
              generation={gen}
              talents={talents}
              expanded={expandedNodes.has(`gen:${branch.name}:${gen}`)}
              expandedNodes={expandedNodes}
              onToggle={() => onToggleNode(`gen:${branch.name}:${gen}`)}
              onToggleNode={onToggleNode}
              isEmoteSelected={isEmoteSelected}
              onToggleEmote={onToggleEmote}
              onSelectAllForTalent={onSelectAllForTalent}
              onDeselectAllForTalent={onDeselectAllForTalent}
              isTalentFullySelected={isTalentFullySelected}
            />
          ))}
        </div>
      </Collapsible>

      <style>{`
        .branch-section {
          border-bottom: 1px solid var(--border);
        }

        .branch-header {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 0;
          background: none;
          border: none;
          color: var(--text-primary);
          text-align: left;
          cursor: pointer;
        }

        .chevron {
          order: 3;
          color: var(--text-muted);
          flex-shrink: 0;
          transition: transform var(--transition), color var(--transition);
        }

        @media (hover: hover) {
          .branch-header:hover .chevron {
            color: var(--text-secondary);
          }
        }

        .chevron.open {
          transform: rotate(90deg);
          color: var(--branch-color);
        }

        .branch-name {
          font-size: 16px;
          font-weight: 600;
          letter-spacing: -0.2px;
          flex: 1;
          min-width: 0;
        }

        .branch-badges {
          display: flex;
          gap: 12px;
          align-items: baseline;
        }

        .branch-meta {
          display: none;
          font-size: 12px;
          color: var(--text-muted);
          white-space: nowrap;
        }

        @media (min-width: 640px) {
          .branch-meta {
            display: inline;
          }
        }

        .branch-count {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-muted);
          font-variant-numeric: tabular-nums;
          white-space: nowrap;
          transition: color var(--transition);
        }

        .branch-header[aria-expanded="true"] .branch-count {
          color: var(--branch-color);
        }

        .branch-body {
          padding: 0 0 12px;
          display: flex;
          flex-direction: column;
        }
      `}</style>
    </div>
  );
}
