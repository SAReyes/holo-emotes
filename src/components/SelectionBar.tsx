import { createPortal } from 'preact/compat';
import { useEffect, useRef, useState } from 'preact/hooks';
import type { SelectedEmote } from '../types';
import {
  CUSTOM_PX_MAX,
  exportForSlack,
  isResizableUrl,
  clampCustomPx,
  type ResolutionConfig,
  type ResolutionMode,
} from '../export';

interface Props {
  selected: Map<string, SelectedEmote>;
  onClear: () => void;
  onRemove: (key: string) => void;
}

export default function SelectionBar({ selected, onClear, onRemove }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [slackModalOpen, setSlackModalOpen] = useState(false);
  const [resolutionMode, setResolutionMode] = useState<ResolutionMode>('thumbnail');
  const [customPx, setCustomPx] = useState(256);
  const exportWrapRef = useRef<HTMLDivElement>(null);
  const count = selected.size;
  const visible = count > 0;

  const entries = Array.from(selected.entries());
  const previewEmotes = entries.slice(0, 12);
  const resizableCount = entries.filter(([, e]) => isResizableUrl(e.url)).length;

  useEffect(() => {
    if (!exportMenuOpen) return;
    const onDoc = (e: MouseEvent) => {
      const el = exportWrapRef.current;
      if (el && !el.contains(e.target as Node)) {
        setExportMenuOpen(false);
      }
    };
    const id = requestAnimationFrame(() => {
      document.addEventListener('click', onDoc);
    });
    return () => {
      cancelAnimationFrame(id);
      document.removeEventListener('click', onDoc);
    };
  }, [exportMenuOpen]);

  useEffect(() => {
    if (!slackModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSlackModalOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [slackModalOpen]);

  function buildResolutionConfig(): ResolutionConfig {
    if (resolutionMode === 'custom') {
      return { mode: 'custom', customPx: clampCustomPx(customPx) };
    }
    return { mode: resolutionMode };
  }

  async function handleSlackExportConfirm() {
    const list = entries.map(([, emote]) => emote);
    setExporting(true);
    try {
      await exportForSlack(list, buildResolutionConfig());
      setSlackModalOpen(false);
      setExportMenuOpen(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Export failed';
      window.alert(msg);
    } finally {
      setExporting(false);
    }
  }

  function openSlackResolutionModal() {
    setExportMenuOpen(false);
    setSlackModalOpen(true);
  }

  if (!visible) {
    return null;
  }

  return (
    <div class={`selection-bar ${expanded ? 'expanded' : ''}`}>
      <div class="bar-inner">
        <button
          class="bar-summary"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
        >
          <div class="preview-strip">
            {previewEmotes.map(([key, emote]) => (
              <img
                key={key}
                src={emote.url}
                alt={emote.name}
                class="preview-img"
                loading="lazy"
              />
            ))}
            {count > 12 && (
              <span class="preview-more">+{count - 12}</span>
            )}
          </div>
          <span class="bar-count">
            <strong>{count}</strong> emote{count !== 1 ? 's' : ''} selected
          </span>
          <svg
            class={`bar-chevron ${expanded ? 'open' : ''}`}
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </button>

        <div class="bar-actions">
          <button class="btn-clear" onClick={onClear}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            Clear
          </button>
          <div class="export-wrap" ref={exportWrapRef}>
            <button
              type="button"
              class="btn-export"
              disabled={exporting}
              title={exporting ? 'Building ZIP…' : 'Export selected emotes'}
              onClick={(e) => {
                e.stopPropagation();
                if (!exporting) setExportMenuOpen((v) => !v);
              }}
              aria-expanded={exportMenuOpen}
              aria-haspopup="true"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              {exporting ? 'Exporting…' : 'Export pack'}
              <svg
                class={`export-chevron ${exportMenuOpen ? 'open' : ''}`}
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {exportMenuOpen && !exporting && (
              <div
                class="export-menu"
                role="menu"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  class="export-option export-option-active"
                  role="menuitem"
                  onClick={openSlackResolutionModal}
                >
                  <span class="export-option-label">
                    <svg class="export-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834V5.042zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834h2.522zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52 2.521 2.528 2.528 0 0 1-2.522-2.521V2.522A2.528 2.528 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52v2.522zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.527 2.527 0 0 1-2.522-2.52 2.528 2.528 0 0 1 2.521-2.522h6.313A2.528 2.528 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
                    </svg>
                    Slack
                  </span>
                  <span class="export-option-hint">ZIP for custom emoji</span>
                </button>
                <div class="export-option export-option-soon" role="menuitem" aria-disabled="true">
                  <span class="export-option-label">
                    <svg class="export-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    WhatsApp
                  </span>
                  <span class="export-badge">Coming soon</span>
                </div>
                <div class="export-option export-option-soon" role="menuitem" aria-disabled="true">
                  <span class="export-option-label">
                    <svg class="export-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.147-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                    </svg>
                    Telegram
                  </span>
                  <span class="export-badge">Coming soon</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {expanded && (
        <div class="expanded-grid">
          {entries.map(([key, emote]) => (
            <div key={key} class="sel-emote">
              <img src={emote.url} alt={emote.name} class="sel-img" loading="lazy" />
              <button
                class="sel-remove"
                onClick={() => onRemove(key)}
                aria-label={`Remove ${emote.name}`}
              >
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
              <span class="sel-name">{emote.name.replace(/^:\s*/, '').replace(/\s*:$/, '')}</span>
            </div>
          ))}
        </div>
      )}

      {typeof document !== 'undefined' &&
        slackModalOpen &&
        createPortal(
          <div
            class="res-modal-overlay"
            role="presentation"
            onClick={() => !exporting && setSlackModalOpen(false)}
          >
            <div
              class="res-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="res-modal-title"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 id="res-modal-title" class="res-modal-title">
                Export resolution
              </h2>
              <p class="res-modal-meta">
                {resizableCount} of {count} emote{count !== 1 ? 's' : ''} support resizing
              </p>

              <fieldset class="res-fieldset">
                <legend class="res-legend">Image size</legend>

                <label class="res-radio-row">
                  <input
                    type="radio"
                    name="res-mode"
                    checked={resolutionMode === 'thumbnail'}
                    onChange={() => setResolutionMode('thumbnail')}
                    disabled={exporting}
                  />
                  <span class="res-radio-body">
                    <span class="res-radio-label">Thumbnail size</span>
                    <span class="res-radio-hint">(~90px, as displayed)</span>
                  </span>
                </label>

                <label class="res-radio-row">
                  <input
                    type="radio"
                    name="res-mode"
                    checked={resolutionMode === 'original'}
                    onChange={() => setResolutionMode('original')}
                    disabled={exporting}
                  />
                  <span class="res-radio-body">
                    <span class="res-radio-label">Original size</span>
                    <span class="res-radio-hint">(full resolution)</span>
                  </span>
                </label>

                <label class="res-radio-row">
                  <input
                    type="radio"
                    name="res-mode"
                    checked={resolutionMode === 'custom'}
                    onChange={() => setResolutionMode('custom')}
                    disabled={exporting}
                  />
                  <span class="res-radio-body">
                    <span class="res-radio-label">Custom size</span>
                    <span class="res-radio-hint">(thumb URLs only, max {CUSTOM_PX_MAX}px)</span>
                  </span>
                </label>

                {resolutionMode === 'custom' && (
                  <div class="res-custom-block">
                    <div class="res-custom-row">
                      <input
                        type="range"
                        class="res-slider"
                        min={1}
                        max={CUSTOM_PX_MAX}
                        step={1}
                        value={clampCustomPx(customPx)}
                        disabled={exporting}
                        onInput={(e) =>
                          setCustomPx(clampCustomPx(Number((e.target as HTMLInputElement).value)))
                        }
                      />
                      <input
                        type="number"
                        class="res-number"
                        min={1}
                        max={CUSTOM_PX_MAX}
                        step={1}
                        value={customPx}
                        disabled={exporting}
                        onInput={(e) => {
                          const v = Number((e.target as HTMLInputElement).value);
                          if (Number.isFinite(v)) setCustomPx(v);
                        }}
                        onBlur={() => setCustomPx(clampCustomPx(customPx))}
                      />
                      <span class="res-px-suffix">px</span>
                    </div>
                    <p class="res-fallback-note">
                      Falls back to original if size exceeds the source image.
                    </p>
                  </div>
                )}
              </fieldset>

              <div class="res-modal-actions">
                <button
                  type="button"
                  class="res-btn res-btn-secondary"
                  disabled={exporting}
                  onClick={() => setSlackModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  class="res-btn res-btn-primary"
                  disabled={exporting}
                  onClick={() => void handleSlackExportConfirm()}
                >
                  {exporting ? 'Exporting…' : 'Export'}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      <style>{`
        .selection-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(18, 18, 31, 0.95);
          border-top: 1px solid var(--accent-dim);
          backdrop-filter: blur(16px);
          z-index: 60;
          box-shadow: 0 -4px 32px rgba(51, 204, 255, 0.1);
          transition: max-height 0.3s ease;
        }

        .bar-inner {
          max-width: 1600px;
          margin: 0 auto;
          padding: 10px 24px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .bar-summary {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 10px;
          background: none;
          border: none;
          color: var(--text-primary);
          cursor: pointer;
          text-align: left;
          padding: 0;
          min-width: 0;
        }

        .preview-strip {
          display: flex;
          align-items: center;
          gap: -4px;
          flex-shrink: 0;
        }

        .preview-img {
          width: 28px;
          height: 28px;
          object-fit: contain;
          border-radius: 4px;
          border: 1px solid var(--border);
          background: var(--bg-elevated);
          margin-left: -6px;
        }

        .preview-img:first-child {
          margin-left: 0;
        }

        .preview-more {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          margin-left: 6px;
          white-space: nowrap;
        }

        .bar-count {
          font-size: 13px;
          color: var(--text-secondary);
          white-space: nowrap;
        }

        .bar-count strong {
          color: var(--accent);
          font-weight: 700;
        }

        .bar-chevron {
          color: var(--text-muted);
          transition: transform var(--transition);
          flex-shrink: 0;
        }

        .bar-chevron.open {
          transform: rotate(180deg);
        }

        .bar-actions {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }

        .btn-clear {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 7px 12px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border);
          background: var(--bg-elevated);
          color: var(--text-secondary);
          font-size: 12px;
          font-weight: 500;
          transition: all var(--transition);
        }

        .btn-clear:hover {
          border-color: var(--danger);
          color: var(--danger);
          background: color-mix(in srgb, var(--danger) 10%, var(--bg-elevated));
        }

        .export-wrap {
          position: relative;
        }

        .btn-export {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 7px 14px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--accent-dim);
          background: var(--accent-glow);
          color: var(--accent);
          font-size: 12px;
          font-weight: 600;
          transition: all var(--transition);
        }

        .btn-export:not(:disabled):hover {
          background: var(--accent);
          color: #000;
          border-color: var(--accent);
        }

        .btn-export:disabled {
          opacity: 0.65;
          cursor: wait;
        }

        .export-chevron {
          margin-left: 2px;
          opacity: 0.85;
          transition: transform var(--transition);
        }

        .export-chevron.open {
          transform: rotate(180deg);
        }

        .export-menu {
          position: absolute;
          bottom: calc(100% + 8px);
          right: 0;
          min-width: 220px;
          padding: 6px;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.35);
          z-index: 70;
        }

        .export-option {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 2px;
          width: 100%;
          padding: 8px 10px;
          border: none;
          border-radius: 6px;
          background: transparent;
          color: var(--text-primary);
          font-size: 12px;
          font-weight: 600;
          text-align: left;
          cursor: pointer;
          transition: background var(--transition);
        }

        .export-option-active:hover {
          background: var(--bg-hover);
        }

        .export-option-label {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .export-icon {
          flex-shrink: 0;
          opacity: 0.9;
        }

        .export-option-hint {
          font-size: 10px;
          font-weight: 500;
          color: var(--text-muted);
          padding-left: 22px;
        }

        .export-option-soon {
          cursor: not-allowed;
          opacity: 0.5;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .export-badge {
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--text-muted);
          border: 1px solid var(--border);
          padding: 2px 6px;
          border-radius: 4px;
          flex-shrink: 0;
        }

        .expanded-grid {
          max-width: 1600px;
          margin: 0 auto;
          padding: 0 24px 14px;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          max-height: 220px;
          overflow-y: auto;
        }

        .sel-emote {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          width: 60px;
        }

        .sel-img {
          width: 44px;
          height: 44px;
          object-fit: contain;
          border-radius: 6px;
          border: 1px solid var(--border);
          background: var(--bg-elevated);
        }

        .sel-remove {
          position: absolute;
          top: -4px;
          right: -4px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: none;
          background: var(--danger);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          opacity: 0;
          transition: opacity var(--transition);
        }

        .sel-emote:hover .sel-remove {
          opacity: 1;
        }

        .sel-name {
          font-size: 8.5px;
          color: var(--text-muted);
          text-align: center;
          max-width: 100%;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          line-height: 1.2;
          word-break: break-word;
        }

        .res-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 120;
          background: rgba(0, 0, 0, 0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          backdrop-filter: blur(4px);
        }

        .res-modal {
          width: 100%;
          max-width: 400px;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow);
          padding: 20px 22px;
        }

        .res-modal-title {
          font-size: 17px;
          font-weight: 700;
          margin: 0 0 6px;
          color: var(--text-primary);
        }

        .res-modal-meta {
          font-size: 12px;
          color: var(--text-muted);
          margin: 0 0 16px;
        }

        .res-fieldset {
          border: none;
          margin: 0;
          padding: 0;
        }

        .res-legend {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--text-secondary);
          margin-bottom: 10px;
          padding: 0;
        }

        .res-radio-row {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 10px 12px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border);
          background: var(--bg-surface);
          margin-bottom: 8px;
          cursor: pointer;
          transition: border-color var(--transition), background var(--transition);
        }

        .res-radio-row:hover {
          border-color: var(--border-light);
          background: var(--bg-hover);
        }

        .res-radio-row input {
          margin-top: 3px;
          accent-color: var(--accent);
          flex-shrink: 0;
        }

        .res-radio-body {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }

        .res-radio-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .res-radio-hint {
          font-size: 11px;
          color: var(--text-muted);
        }

        .res-custom-block {
          margin: 4px 0 12px;
          padding: 12px;
          border-radius: var(--radius-sm);
          border: 1px dashed var(--border-light);
          background: rgba(0, 0, 0, 0.15);
        }

        .res-custom-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .res-slider {
          flex: 1;
          min-width: 0;
          accent-color: var(--accent);
        }

        .res-number {
          width: 72px;
          padding: 6px 8px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border);
          background: var(--bg-base);
          color: var(--text-primary);
          font-size: 13px;
        }

        .res-px-suffix {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          flex-shrink: 0;
        }

        .res-fallback-note {
          font-size: 11px;
          color: var(--text-muted);
          margin: 10px 0 0;
          line-height: 1.4;
        }

        .res-modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 18px;
          padding-top: 16px;
          border-top: 1px solid var(--border);
        }

        .res-btn {
          padding: 8px 16px;
          border-radius: var(--radius-sm);
          font-size: 13px;
          font-weight: 600;
          border: 1px solid transparent;
          transition: all var(--transition);
        }

        .res-btn-secondary {
          background: transparent;
          border-color: var(--border);
          color: var(--text-secondary);
        }

        .res-btn-secondary:hover:not(:disabled) {
          border-color: var(--text-muted);
          color: var(--text-primary);
        }

        .res-btn-primary {
          background: var(--accent);
          color: #000;
          border-color: var(--accent);
        }

        .res-btn-primary:hover:not(:disabled) {
          background: var(--accent-hover);
          border-color: var(--accent-hover);
        }

        .res-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
