import React from 'react';
import { ChevronDown } from 'lucide-react';
import { OpenAiImageModel } from '../types';
import { getShotPrice, IMAGE_MODEL_OPTIONS } from '../utils/generationPricing';

interface ModelSelectorProps {
  selectedModel: OpenAiImageModel;
  onModelSelect: (model: OpenAiImageModel) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  onModelSelect,
}) => {
  const selected = getShotPrice(selectedModel);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label
          htmlFor="openai-image-model"
          className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider"
        >
          5. Image model
        </label>
        <span className="text-[10px] text-slate-400 tabular-nums">{selected.perImage}</span>
      </div>

      <div className="relative">
        <select
          id="openai-image-model"
          value={selectedModel}
          onChange={(e) => onModelSelect(e.target.value as OpenAiImageModel)}
          className="w-full appearance-none px-3 py-2.5 pr-9 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none cursor-pointer"
        >
          {IMAGE_MODEL_OPTIONS.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.name} · {opt.price.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      </div>

      <p className="text-[10px] text-slate-500 leading-relaxed px-0.5">{selected.hint}</p>
    </div>
  );
};
