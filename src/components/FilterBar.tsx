import { useEffect, useRef, useState } from 'preact/hooks';
import { usePresence } from './use-presence';

interface GenerationGroup {
  name: string;
  generations: string[];
}

interface Props {
  groups: GenerationGroup[];
  activeGenerations: Set<string> | null;
  searchQuery: string;
  onToggleGenerations: (gens: string[]) => void;
  onSearchChange: (q: string) => void;
  onClearFilters: () => void;
}

const BRANCH_COLORS: Record<string, string> = {
  'Hololive English': '#33ccff',
  'Hololive (Japan)': '#ff6699',
  'Hololive Indonesia': '#66dd66',
  'Hololive DEV_IS': '#cc66ff',
};

function getBranchColor(name: string) {
  return BRANCH_COLORS[name] ?? '#aaaacc';
}

function CheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function FilterBar({
  groups,
  activeGenerations,
  searchQuery,
  onToggleGenerations,
  onSearchChange,
  onClearFilters,
}: Props) {
  const [genOpen, setGenOpen] = useState(false);
  const genWrapRef = useRef<HTMLDivElement>(null);
  const genMenu = usePresence(genOpen, 140);

  useEffect(() => {
    if (!genOpen) return;
    const onDoc = (e: MouseEvent) => {
      const el = genWrapRef.current;
      if (el && !el.contains(e.target as Node)) setGenOpen(false);
    };
    const id = requestAnimationFrame(() => document.addEventListener('click', onDoc));
    return () => {
      cancelAnimationFrame(id);
      document.removeEventListener('click', onDoc);
    };
  }, [genOpen]);

  const generations = groups.flatMap((g) => g.generations);
  const isActive = (gen: string) => activeGenerations === null || activeGenerations.has(gen);
  const hasActiveFilters = activeGenerations !== null || searchQuery.trim() !== '';
  const activeGenCount = activeGenerations === null ? generations.length : activeGenerations.size;

  return (
    <div class="filter-bar">
      <div class="filter-inner">
        <div class="filter-group filter-group--gen" ref={genWrapRef}>
          <button
            class={`gen-dropdown-btn ${genOpen ? 'open' : ''} ${activeGenerations !== null ? 'has-filter' : ''}`}
            onClick={() => setGenOpen((v) => !v)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
            </svg>
            Generations
            {activeGenerations !== null && (
              <span class="gen-badge">{activeGenCount}/{generations.length}</span>
            )}
            <svg class="chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {genMenu.mounted && (
            <div class={`gen-dropdown ${genMenu.closing ? 'closing' : ''}`}>
              <div class="gen-dropdown-header">
                <span>Filter by generation</span>
                <button
                  class="gen-clear"
                  onClick={() => {
                    if (activeGenerations === null) onToggleGenerations(generations);
                    else onClearFilters();
                  }}
                >
                  {activeGenerations !== null ? 'Show all' : 'Hide all'}
                </button>
              </div>
              <div class="gen-list">
                {groups.map((group) => {
                  const groupActive = group.generations.every(isActive);
                  const groupPartial = !groupActive && group.generations.some(isActive);
                  const color = getBranchColor(group.name);
                  return (
                    <div key={group.name} class="gen-group">
                      <label class={`gen-item gen-item--group ${groupActive ? 'active' : ''}`}>
                        <input
                          type="checkbox"
                          checked={groupActive}
                          onChange={() => onToggleGenerations(group.generations)}
                        />
                        <span class={`gen-check ${groupPartial ? 'partial' : ''}`}>
                          {groupActive && <CheckIcon />}
                        </span>
                        <span class="gen-dot" style={`background: ${color}`} />
                        <span class="gen-name">{group.name}</span>
                      </label>
                      {group.generations.map((gen) => {
                        const active = isActive(gen);
                        return (
                          <label key={gen} class={`gen-item gen-item--child ${active ? 'active' : ''}`}>
                            <input
                              type="checkbox"
                              checked={active}
                              onChange={() => onToggleGenerations([gen])}
                            />
                            <span class="gen-check">{active && <CheckIcon />}</span>
                            <span class="gen-name">{gen}</span>
                          </label>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div class="filter-group filter-group--search">
          <div class="search-wrap">
            <svg class="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              class="search-input"
              placeholder="Search…"
              value={searchQuery}
              onInput={(e) => onSearchChange((e.target as HTMLInputElement).value)}
            />
            {searchQuery && (
              <button class="search-clear" onClick={() => onSearchChange('')} aria-label="Clear search">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {hasActiveFilters && (
          <button class="clear-all" onClick={onClearFilters} title="Reset all filters">
            Reset
          </button>
        )}
      </div>

      <style>{`
        .filter-bar {
          background-color: rgba(18, 18, 31, 0.9);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          backdrop-filter: blur(12px);
          position: sticky;
          top: 0;
          z-index: 40;
        }

        .filter-inner {
          max-width: 1600px;
          margin: 0 auto;
          padding: 8px 12px;
          display: flex;
          align-items: center;
          gap: 8px 12px;
          flex-wrap: wrap;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .filter-group--gen {
          position: relative;
        }

        .filter-group--search {
          flex: 1;
          min-width: 120px;
        }

        @media (min-width: 640px) {
          .filter-inner {
            padding: 10px 24px;
          }

          .filter-group--search {
            min-width: 200px;
          }
        }

        .gen-dropdown-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border);
          background: var(--bg-elevated);
          color: var(--text-secondary);
          font-size: 12px;
          font-weight: 500;
          transition: all var(--transition);
          white-space: nowrap;
        }

        .gen-dropdown-btn:hover,
        .gen-dropdown-btn.open {
          border-color: var(--border-light);
          color: var(--text-primary);
        }

        .gen-dropdown-btn.has-filter {
          border-color: var(--accent-dim);
          color: var(--accent);
          background: var(--accent-glow);
        }

        .gen-badge {
          background: var(--accent);
          color: #000;
          font-size: 10px;
          font-weight: 700;
          padding: 1px 5px;
          border-radius: 10px;
        }

        .chevron {
          transition: transform var(--transition);
        }

        .gen-dropdown-btn.open .chevron {
          transform: rotate(180deg);
        }

        .gen-dropdown {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          background: var(--bg-elevated);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow);
          min-width: 280px;
          max-height: 360px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          z-index: 100;
          transform-origin: top left;
          animation: pop-in 160ms ease-out;
        }

        .gen-dropdown.closing {
          animation: pop-out 140ms ease-in forwards;
          pointer-events: none;
        }

        .gen-dropdown-header {
          padding: 10px 12px;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .gen-clear {
          background: none;
          border: none;
          color: var(--accent);
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
          text-transform: none;
          letter-spacing: 0;
        }

        .gen-clear:hover {
          color: var(--accent-hover);
        }

        .gen-list {
          overflow-y: auto;
          padding: 6px;
        }

        .gen-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 7px 8px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: background var(--transition);
          color: var(--text-secondary);
          font-size: 13px;
        }

        .gen-item:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }

        .gen-item.active {
          color: var(--text-primary);
        }

        .gen-item input[type="checkbox"] {
          display: none;
        }

        .gen-check {
          width: 15px;
          height: 15px;
          border-radius: 4px;
          border: 1.5px solid var(--border-light);
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition);
        }

        .gen-item.active .gen-check {
          background: var(--accent);
          border-color: var(--accent);
          color: #000;
        }

        .gen-name {
          line-height: 1.3;
        }

        .gen-group + .gen-group {
          margin-top: 4px;
          padding-top: 4px;
          border-top: 1px solid var(--border);
        }

        .gen-item--group {
          font-weight: 600;
          color: var(--text-primary);
        }

        .gen-item--child {
          padding-left: 28px;
        }

        .gen-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .gen-check.partial {
          border-color: var(--accent);
          background: var(--accent-glow);
        }

        .search-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 10px;
          color: var(--text-muted);
          pointer-events: none;
        }

        .search-input {
          width: 100%;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          padding: 6px 32px 6px 32px;
          font-size: 13px;
          transition: all var(--transition);
          outline: none;
        }

        .search-input::placeholder {
          color: var(--text-muted);
        }

        .search-input:focus {
          border-color: var(--accent-dim);
          background: var(--bg-hover);
          box-shadow: 0 0 0 2px var(--accent-glow);
        }

        .search-input::-webkit-search-cancel-button {
          display: none;
        }

        .search-clear {
          position: absolute;
          right: 8px;
          background: none;
          border: none;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          padding: 2px;
          border-radius: 3px;
          transition: color var(--transition);
        }

        .search-clear:hover {
          color: var(--text-primary);
        }

        .clear-all {
          background: none;
          border: 1px solid var(--border);
          color: var(--text-muted);
          font-size: 12px;
          padding: 5px 10px;
          border-radius: var(--radius-sm);
          transition: all var(--transition);
          white-space: nowrap;
        }

        .clear-all:hover {
          border-color: var(--danger);
          color: var(--danger);
        }
      `}</style>
    </div>
  );
}
