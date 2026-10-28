import React, { useState } from 'react';
import { Bookmark, Trash2 } from 'lucide-react';
import type { PromptState } from '../../config/promptSteps';
import { loadPresets, newPresetId, savePresets, type Preset } from './presets';

interface PresetsPanelProps {
  state: PromptState;
  /** Show the saved list with Load buttons (first screen). The review screen only saves. */
  showList?: boolean;
  onLoad: (state: PromptState) => void;
}

export const PresetsPanel: React.FC<PresetsPanelProps> = ({ state, showList = true, onLoad }) => {
  const [presets, setPresets] = useState<Preset[]>(() => loadPresets());
  const [name, setName] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  const persist = (next: Preset[], message: string) => {
    const ok = savePresets(next);
    setPresets(next);
    setNotice(ok ? message : 'Could not write to browser storage, so this preset will be lost on reload.');
  };

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    persist(
      [{ id: newPresetId(), name: trimmed, createdAt: Date.now(), state }, ...presets],
      `Saved "${trimmed}".`,
    );
    setName('');
  };

  const handleDelete = (preset: Preset) => {
    if (!window.confirm(`Delete preset "${preset.name}"?`)) return;
    persist(
      presets.filter((p) => p.id !== preset.id),
      `Deleted "${preset.name}".`,
    );
  };

  return (
    <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
      <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
        <Bookmark className="h-4 w-4 text-rose-500" />
        Presets
      </h3>

      <form onSubmit={handleSave} className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Preset name, e.g. Website roses"
          maxLength={60}
          className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-800 placeholder:text-slate-400 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
        />
        <button
          type="submit"
          disabled={!name.trim()}
          className="shrink-0 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
        >
          Save as preset
        </button>
      </form>

      {notice && (
        <p className="text-xs text-slate-500" role="status">
          {notice}
        </p>
      )}

      {showList &&
        (presets.length === 0 ? (
          <p className="text-xs text-slate-400">No saved presets yet. Your current choices can be saved above.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {presets.map((preset) => (
              <li key={preset.id} className="flex items-center gap-2 py-2">
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-700">{preset.name}</span>
                <button
                  type="button"
                  onClick={() => {
                    onLoad(preset.state);
                    setNotice(`Loaded "${preset.name}".`);
                  }}
                  className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 transition-colors hover:bg-rose-100 cursor-pointer"
                >
                  Load
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(preset)}
                  aria-label={`Delete preset ${preset.name}`}
                  className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-red-600 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        ))}
    </section>
  );
};
