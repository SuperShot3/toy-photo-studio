import React, { useEffect, useState } from 'react';
import { KeyRound, ChevronDown, ChevronUp, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { ApiSettings } from '../types';
import { getActiveApiKey, isApiKeyConfigured } from '../utils/apiSettings';

interface ApiSettingsPanelProps {
  settings: ApiSettings;
  onSettingsChange: (settings: ApiSettings) => void;
}

export const ApiSettingsPanel: React.FC<ApiSettingsPanelProps> = ({
  settings,
  onSettingsChange,
}) => {
  const [isOpen, setIsOpen] = useState(() => !isApiKeyConfigured(settings));
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [openaiDraft, setOpenaiDraft] = useState(settings.openaiApiKey);

  useEffect(() => {
    setOpenaiDraft(settings.openaiApiKey);
  }, [settings.openaiApiKey]);

  const configured = isApiKeyConfigured(settings);
  const activeKey = getActiveApiKey(settings);
  const draftSettings: ApiSettings = {
    ...settings,
    openaiApiKey: openaiDraft,
  };
  const isDirty = openaiDraft !== settings.openaiApiKey;
  const draftHasActiveKey = isApiKeyConfigured(draftSettings);

  const handleSave = () => {
    if (!isDirty && !draftHasActiveKey) return;
    onSettingsChange(draftSettings);
    setShowOpenaiKey(false);
    if (isApiKeyConfigured(draftSettings)) {
      setIsOpen(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 text-left hover:bg-slate-100/80 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-indigo-600" />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
              OpenAI API Key
            </p>
            <p className="text-[10px] text-slate-500">
              ChatGPT (OpenAI)
              {configured ? ' • Key saved' : ' • Key required'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {configured ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-500" />
          )}
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="px-3.5 pb-3.5 space-y-3 border-t border-slate-200/80 pt-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">
              OpenAI API Key
            </label>
            <div className="relative">
              <input
                type={showOpenaiKey ? 'text' : 'password'}
                value={openaiDraft}
                onChange={(e) => setOpenaiDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSave();
                  }
                }}
                placeholder="sk-..."
                className="w-full px-3 py-2 pr-10 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-mono"
              />
              <button
                type="button"
                onClick={() => setShowOpenaiKey((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                aria-label={showOpenaiKey ? 'Hide API key' : 'Show API key'}
              >
                {showOpenaiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5">
              Photos use the model you pick on the studio panel. Copy uses gpt-4o-mini. Get a key
              at platform.openai.com
            </p>
          </div>

          {!draftHasActiveKey && (
            <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[10px] text-amber-800">
              Add your OpenAI API key above, then click Save.
            </div>
          )}

          {configured && !isDirty && (
            <p className="text-[10px] text-slate-400">
              Key saved in this browser ({activeKey.slice(0, 7)}…{activeKey.slice(-4)})
            </p>
          )}

          {isDirty && (
            <p className="text-[10px] text-slate-500">
              Click Save to store this key in your browser. It is not used until you save.
            </p>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={!isDirty && !draftHasActiveKey}
            className={`w-full py-2 px-3 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              !isDirty && !draftHasActiveKey
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white shadow-sm'
            }`}
          >
            Save key
          </button>
        </div>
      )}
    </div>
  );
};
