import React, { useState } from 'react';
import { KeyRound, ChevronDown, ChevronUp, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { ApiSettings, AiProvider } from '../types';
import { getActiveApiKey, isApiKeyConfigured, providerLabel } from '../utils/apiSettings';

interface ApiSettingsPanelProps {
  settings: ApiSettings;
  onSettingsChange: (settings: ApiSettings) => void;
}

export const ApiSettingsPanel: React.FC<ApiSettingsPanelProps> = ({
  settings,
  onSettingsChange,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);

  const configured = isApiKeyConfigured(settings);
  const activeKey = getActiveApiKey(settings);

  const update = (patch: Partial<ApiSettings>) => {
    onSettingsChange({ ...settings, ...patch });
  };

  const handleProviderChange = (provider: AiProvider) => {
    update({ provider });
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
              AI Provider & API Key
            </p>
            <p className="text-[10px] text-slate-500">
              {providerLabel(settings.provider)}
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
              Choose Provider
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['openai', 'gemini'] as AiProvider[]).map((provider) => {
                const selected = settings.provider === provider;
                return (
                  <button
                    key={provider}
                    type="button"
                    onClick={() => handleProviderChange(provider)}
                    className={`px-2.5 py-2 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                      selected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    {provider === 'openai' ? 'ChatGPT' : 'Gemini'}
                  </button>
                );
              })}
            </div>
          </div>

          {settings.provider === 'openai' ? (
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">
                OpenAI API Key
              </label>
              <div className="relative">
                <input
                  type={showOpenaiKey ? 'text' : 'password'}
                  value={settings.openaiApiKey}
                  onChange={(e) => update({ openaiApiKey: e.target.value })}
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
                Uses gpt-image-1 for photos and gpt-4o-mini for copy. Get a key at platform.openai.com
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">
                Gemini API Key
              </label>
              <div className="relative">
                <input
                  type={showGeminiKey ? 'text' : 'password'}
                  value={settings.geminiApiKey}
                  onChange={(e) => update({ geminiApiKey: e.target.value })}
                  placeholder="AIza..."
                  className="w-full px-3 py-2 pr-10 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowGeminiKey((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                  aria-label={showGeminiKey ? 'Hide API key' : 'Show API key'}
                >
                  {showGeminiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5">
                Uses Gemini image + flash models. Get a key at aistudio.google.com
              </p>
            </div>
          )}

          {!configured && (
            <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[10px] text-amber-800">
              Add your {settings.provider === 'openai' ? 'OpenAI' : 'Gemini'} API key above to generate images.
            </div>
          )}

          {configured && (
            <p className="text-[10px] text-slate-400">
              Key saved in this browser ({activeKey.slice(0, 7)}…{activeKey.slice(-4)})
            </p>
          )}
        </div>
      )}
    </div>
  );
};
