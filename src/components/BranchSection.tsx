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
        <div class="branch-accent" />
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
          <span class="badge badge--emotes">{emoteCount.toLocaleString()} emotes</span>
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
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-lg);
          box-shadow: var(--glass-highlight), 0 8px 32px rgba(0, 0, 0, 0.25);
          overflow: hidden;
          transition: border-color var(--transition), box-shadow var(--transition);
        }

        .branch-section:has(.branch-header[aria-expanded="true"]) {
          border-color: color-mix(in srgb, var(--branch-color) 35%, var(--glass-border));
          box-shadow: var(--glass-highlight), 0 8px 32px rgba(0, 0, 0, 0.25), 0 0 0 1px color-mix(in srgb, var(--branch-color) 12%, transparent);
        }

        .branch-header {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 16px;
          background: none;
          border: none;
          color: var(--text-primary);
          text-align: left;
          cursor: pointer;
          transition: background var(--transition);
          position: relative;
        }

        .branch-header:hover {
          background: var(--surface-tint);
        }

        .branch-accent {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: var(--branch-color);
          border-radius: 0 2px 2px 0;
        }

        .chevron {
          color: var(--text-muted);
          flex-shrink: 0;
          transition: transform var(--transition), color var(--transition);
        }

        .chevron.open {
          transform: rotate(90deg);
          color: var(--branch-color);
        }

        .branch-name {
          font-size: 15px;
          font-weight: 600;
          letter-spacing: -0.2px;
          flex: 1;
        }

        .branch-badges {
          display: flex;
          gap: 6px;
          align-items: center;
        }

        .branch-meta {
          display: none;
          font-size: 11px;
          color: var(--text-muted);
          white-space: nowrap;
        }

        @media (min-width: 640px) {
          .branch-meta {
            display: inline;
          }
        }

        .badge {
          font-size: 11px;
          padding: 2px 8px;
          border-radius: 10px;
          font-weight: 600;
          white-space: nowrap;
        }

        .badge--emotes {
          background: color-mix(in srgb, var(--branch-color) 14%, transparent);
          border: 1px solid color-mix(in srgb, var(--branch-color) 28%, transparent);
          color: var(--branch-color);
        }

        .branch-body {
          border-top: 1px solid var(--glass-border);
          padding: 4px 6px 8px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        @media (min-width: 640px) {
          .branch-body {
            padding: 6px 10px 12px;
          }
        }
      `}</style>
    </div>
  );
}
