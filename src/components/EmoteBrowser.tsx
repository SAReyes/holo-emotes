import { useState, useMemo } from 'preact/hooks';
import type { BranchData, SelectedEmote } from '../types';
import FilterBar from './FilterBar';
import BranchSection from './BranchSection';
import SelectionBar from './SelectionBar';

interface Props {
  data: BranchData[];
}

export default function EmoteBrowser({ data }: Props) {
  const [selectedEmotes, setSelectedEmotes] = useState<Map<string, SelectedEmote>>(new Map());
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [activeGenerations, setActiveGenerations] = useState<Set<string> | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const generationGroups = useMemo(
    () => data.map((b) => ({ name: b.name, generations: Object.keys(b.generations) })),
    [data],
  );
  const allGenerations = useMemo(
    () => generationGroups.flatMap((g) => g.generations),
    [generationGroups],
  );

  const filteredData = useMemo(() => {
    return data
      .map((branch) => {
        const filteredGens: typeof branch.generations = {};
        for (const [gen, talents] of Object.entries(branch.generations)) {
          if (activeGenerations !== null && !activeGenerations.has(gen)) continue;

          if (!searchQuery.trim()) {
            filteredGens[gen] = talents;
            continue;
          }

          const q = searchQuery.toLowerCase();
          const filteredTalents: typeof talents = {};
          for (const [talent, emotes] of Object.entries(talents)) {
            const talentMatches = talent.toLowerCase().includes(q);
            const filteredEmotes: typeof emotes = {};
            for (const [name, url] of Object.entries(emotes)) {
              if (talentMatches || name.toLowerCase().includes(q)) {
                filteredEmotes[name] = url;
              }
            }
            if (Object.keys(filteredEmotes).length > 0) {
              filteredTalents[talent] = filteredEmotes;
            }
          }
          if (Object.keys(filteredTalents).length > 0) {
            filteredGens[gen] = filteredTalents;
          }
        }
        return { ...branch, generations: filteredGens };
      })
      .filter((b) => Object.keys(b.generations).length > 0);
  }, [data, activeGenerations, searchQuery]);

  /** Toggle a set of generations together: all on → all off, otherwise all on. */
  function toggleGenerations(gens: string[]) {
    setActiveGenerations((prev) => {
      const next = new Set(prev ?? allGenerations);
      const allOn = gens.every((g) => next.has(g));
      for (const g of gens) {
        if (allOn) next.delete(g);
        else next.add(g);
      }
      return next.size === allGenerations.length ? null : next;
    });
  }

  function toggleNode(key: string) {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function emoteKey(branch: string, generation: string, talent: string, name: string) {
    return `${branch}||${generation}||${talent}||${name}`;
  }

  function toggleEmote(emote: SelectedEmote) {
    const key = emoteKey(emote.branch, emote.generation, emote.talent, emote.name);
    setSelectedEmotes((prev) => {
      const next = new Map(prev);
      if (next.has(key)) next.delete(key);
      else next.set(key, emote);
      return next;
    });
  }

  function isEmoteSelected(branch: string, generation: string, talent: string, name: string) {
    return selectedEmotes.has(emoteKey(branch, generation, talent, name));
  }

  function selectAllForTalent(branch: string, generation: string, talent: string, emotes: Record<string, string>) {
    setSelectedEmotes((prev) => {
      const next = new Map(prev);
      for (const [name, url] of Object.entries(emotes)) {
        const key = emoteKey(branch, generation, talent, name);
        next.set(key, { branch, generation, talent, name, url });
      }
      return next;
    });
  }

  function deselectAllForTalent(branch: string, generation: string, talent: string, emotes: Record<string, string>) {
    setSelectedEmotes((prev) => {
      const next = new Map(prev);
      for (const name of Object.keys(emotes)) {
        next.delete(emoteKey(branch, generation, talent, name));
      }
      return next;
    });
  }

  function isTalentFullySelected(branch: string, generation: string, talent: string, emotes: Record<string, string>) {
    return Object.keys(emotes).every((name) => selectedEmotes.has(emoteKey(branch, generation, talent, name)));
  }

  function clearSelection() {
    setSelectedEmotes(new Map());
  }

  const totalEmoteCount = useMemo(() => {
    let count = 0;
    for (const b of data) {
      for (const talents of Object.values(b.generations)) {
        for (const emotes of Object.values(talents)) {
          count += Object.keys(emotes).length;
        }
      }
    }
    return count;
  }, [data]);

  return (
    <div class="app">
      <header class="app-header">
        <div class="header-inner">
          <h1>
            <span class="holo-gradient">Holo</span> Emotes
          </h1>
          <p class="header-subtitle">{totalEmoteCount.toLocaleString()} emotes across {data.length} branches</p>
        </div>
      </header>

      <FilterBar
        groups={generationGroups}
        activeGenerations={activeGenerations}
        searchQuery={searchQuery}
        onToggleGenerations={toggleGenerations}
        onSearchChange={setSearchQuery}
        onClearFilters={() => {
          setActiveGenerations(null);
          setSearchQuery('');
        }}
      />

      <main class="app-main">
        {filteredData.length === 0 ? (
          <div class="empty-state">
            <div class="empty-icon">🔍</div>
            <p>No emotes match your filters.</p>
            <button
              class="btn-secondary"
              onClick={() => {
                setActiveGenerations(null);
                setSearchQuery('');
              }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          filteredData.map((branch) => (
            <BranchSection
              key={branch.name}
              branch={branch}
              expanded={expandedNodes.has(`branch:${branch.name}`)}
              expandedNodes={expandedNodes}
              onToggle={() => toggleNode(`branch:${branch.name}`)}
              onToggleNode={toggleNode}
              isEmoteSelected={isEmoteSelected}
              onToggleEmote={toggleEmote}
              onSelectAllForTalent={selectAllForTalent}
              onDeselectAllForTalent={deselectAllForTalent}
              isTalentFullySelected={isTalentFullySelected}
            />
          ))
        )}
      </main>

      <footer class="app-footer">
        <p class="footer-credit">
          Unofficial fan project, free and non-commercial. All emote artwork is
          © <a href="https://cover-corp.com/" target="_blank" rel="noopener noreferrer">COVER Corp.</a> and
          its talents. Emote names and images are sourced from the{' '}
          <a href="https://hololive.wiki/wiki/Membership_Emotes" target="_blank" rel="noopener noreferrer">
            Hololive Fan Wiki
          </a>{' '}
          (text under CC BY-SA 4.0). Not affiliated with or endorsed by COVER Corp.
        </p>
        <a href="https://areyes.es" target="_blank" rel="noopener noreferrer">
          Site © 2026 Adrian Reyes
        </a>
      </footer>

      <SelectionBar
        selected={selectedEmotes}
        onClear={clearSelection}
        onRemove={(key) => {
          setSelectedEmotes((prev) => {
            const next = new Map(prev);
            next.delete(key);
            return next;
          });
        }}
      />

      <style>{`
        .app {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .app-header {
          background: linear-gradient(180deg, var(--bg-surface) 0%, transparent 100%);
          padding: 12px 0 10px;
        }

        .header-inner {
          max-width: 1600px;
          margin: 0 auto;
          padding: 0 16px;
          display: flex;
          align-items: baseline;
          flex-wrap: wrap;
          gap: 2px 12px;
        }

        .app-header h1 {
          font-size: 22px;
          font-weight: 700;
          letter-spacing: -0.5px;
          line-height: 1.2;
        }

        .holo-gradient {
          background: linear-gradient(90deg, #33ccff 0%, #cc66ff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .header-subtitle {
          font-size: 12px;
          color: var(--text-muted);
        }

        .app-main {
          flex: 1;
          max-width: 1600px;
          width: 100%;
          margin: 0 auto;
          padding: 12px 12px 120px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        @media (min-width: 640px) {
          .app-header {
            padding: 20px 0 16px;
          }

          .header-inner,
          .app-footer {
            padding-left: 24px;
            padding-right: 24px;
          }

          .app-main {
            padding: 16px 24px 120px;
          }
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 80px 24px;
          color: var(--text-secondary);
        }

        .empty-icon {
          font-size: 48px;
        }

        .btn-secondary {
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          color: var(--text-primary);
          padding: 8px 16px;
          border-radius: var(--radius-sm);
          transition: all var(--transition);
        }

        .btn-secondary:hover {
          background: var(--bg-hover);
          border-color: var(--border-light);
        }

        .app-footer {
          max-width: 1600px;
          width: 100%;
          margin: 0 auto;
          padding: 16px 12px 120px;
          text-align: center;
          font-size: 12px;
        }

        .footer-credit {
          margin: 0 auto 8px;
          max-width: 640px;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .footer-credit a {
          text-decoration: underline;
        }

        .app-footer a {
          color: var(--text-muted);
          text-decoration: none;
          transition: color var(--transition);
        }

        .app-footer a:hover {
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
}
