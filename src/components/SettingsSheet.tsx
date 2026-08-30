import React, { useEffect } from 'react';
import { X, Images } from 'lucide-react';
import { ApiSettingsPanel } from './ApiSettingsPanel';
import type { ApiSettings } from '../types';

interface SettingsSheetProps {
  open: boolean;
  settings: ApiSettings;
  onSettingsChange: (settings: ApiSettings) => void;
  onOpenStyleRefs: () => void;
  onClose: () => void;
}

export const SettingsSheet: React.FC<SettingsSheetProps> = ({
  open,
  settings,
  onSettingsChange,
  onOpenStyleRefs,
  onClose,
}) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/35 cursor-pointer"
        aria-label="Close settings"
        onClick={onClose}
      />
      <aside className="relative w-full max-w-md h-full bg-white border-l border-slate-200 shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-4 sm:px-5 h-16 border-b border-slate-100">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">Settings</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
            aria-label="Close settings"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          <ApiSettingsPanel settings={settings} onSettingsChange={onSettingsChange} />

          <div className="rounded-xl border border-slate-200 bg-slate-50/80 overflow-hidden">
            <div className="px-3.5 py-3 space-y-2.5">
              <div className="flex items-start gap-2">
                <Images className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Style background references
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                    Add luxury and promo scene looks (photo + prompt). They appear in Visual Style
                    when you pick a look.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onOpenStyleRefs}
                className="w-full py-2 px-3 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Open page
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};
