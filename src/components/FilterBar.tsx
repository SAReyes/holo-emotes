import { useState } from 'preact/hooks';

interface Props {
  branches: string[];
  generations: string[];
  activeBranches: Set<string>;
  activeGenerations: Set<string> | null;
  searchQuery: string;
  onToggleBranch: (name: string) => void;
  onToggleGeneration: (gen: string) => void;
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

export default function FilterBar({
  branches,
  generations,
  activeBranches,
  activeGenerations,
  searchQuery,
  onToggleBranch,
  onToggleGeneration,
  onSearchChange,
  onClearFilters,
}: Props) {
  const [genOpen, setGenOpen] = useState(false);

  const hasActiveFilters =
    activeBranches.size < branches.length ||
    activeGenerations !== null ||
    searchQuery.trim() !== '';

  const activeGenCount = activeGenerations === null ? generations.length : activeGenerations.size;

  return (
    <div class="filter-bar">
      <div class="filter-inner">
        <div class="filter-group">
          <span class="filter-label">Branches</span>
          <div class="branch-pills">
            {branches.map((name) => {
              const active = activeBranches.has(name);
              const color = getBranchColor(name);
              return (
                <button
                  key={name}
                  class={`branch-pill ${active ? 'active' : ''}`}
                  style={active ? `--pill-color: ${color}` : ''}
                  onClick={() => onToggleBranch(name)}
                  title={name}
                >
                  <span class="pill-dot" style={`background: ${color}`} />
                  {name}
                </button>
              );
            })}
          </div>
        </div>

        <div class="filter-group filter-group--gen">
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

          {genOpen && (
            <div class="gen-dropdown">
              <div class="gen-dropdown-header">
                <span>Filter by generation</span>
                <button
                  class="gen-clear"
                  onClick={() => {
                    if (activeGenerations === null) {
                      generations.forEach(onToggleGeneration);
                    } else {
                      onClearFilters();
                    }
                  }}
                >
                  {activeGenerations !== null ? 'Show all' : 'Hide all'}
                </button>
              </div>
              <div class="gen-list">
                {generations.map((gen) => {
                  const active = activeGenerations === null || activeGenerations.has(gen);
                  return (
                    <label key={gen} class={`gen-item ${active ? 'active' : ''}`}>
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={() => onToggleGeneration(gen)}
                      />
                      <span class="gen-check">
                        {active && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </span>
                      <span class="gen-name">{gen}</span>
                    </label>
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
              placeholder="Search talents or emotes…"
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

      {genOpen && <div class="gen-overlay" onClick={() => setGenOpen(false)} />}

      <style>{`
        .filter-bar {
          background-color: rgba(18, 18, 31, 0.9);
          border-bottom: 1px solid var(--border);
          backdrop-filter: blur(12px);
          position: sticky;
          top: 65px;
          z-index: 40;
        }

        .filter-inner {
          max-width: 1600px;
          margin: 0 auto;
          padding: 10px 24px;
          display: flex;
          align-items: center;
          gap: 12px;
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
          min-width: 200px;
        }

        .filter-label {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          white-space: nowrap;
        }

        .branch-pills {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .branch-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 5px 10px;
          border-radius: 20px;
          border: 1px solid var(--border);
          background: var(--bg-elevated);
          color: var(--text-secondary);
          font-size: 12px;
          font-weight: 500;
          transition: all var(--transition);
          white-space: nowrap;
        }

        .branch-pill:hover {
          border-color: var(--border-light);
          color: var(--text-primary);
        }

        .branch-pill.active {
          background: color-mix(in srgb, var(--pill-color) 12%, var(--bg-elevated));
          border-color: color-mix(in srgb, var(--pill-color) 50%, transparent);
          color: var(--pill-color, var(--accent));
        }

        .pill-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
          opacity: 0.7;
        }

        .branch-pill.active .pill-dot {
          opacity: 1;
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

        .gen-overlay {
          position: fixed;
          inset: 0;
          z-index: 99;
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
