import React, { useState } from 'react';
import { Check, ImageOff } from 'lucide-react';
import type { Option } from '../../config/promptSteps';

interface OptionCardProps {
  option: Option;
  selected: boolean;
  /** Dimmed and not clickable (the pick limit is reached). */
  disabled?: boolean;
  /** 1-based pick order, shown when a step takes several picks. */
  order?: number;
  onClick: () => void;
}

export const OptionCard: React.FC<OptionCardProps> = ({ option, selected, disabled, order, onClick }) => {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      disabled={disabled}
      className={`relative flex flex-col overflow-hidden rounded-2xl border-2 bg-white text-left transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 ${
        selected
          ? 'border-rose-500 shadow-md shadow-rose-100 ring-2 ring-rose-200'
          : 'border-slate-200 hover:border-rose-300 active:scale-[0.98]'
      }`}
    >
      <div className="relative aspect-square w-full bg-rose-50">
        {imageFailed ? (
          <div className="flex h-full w-full items-center justify-center text-rose-300">
            <ImageOff className="h-8 w-8" />
          </div>
        ) : (
          <img
            src={option.image}
            alt=""
            loading="lazy"
            draggable={false}
            onError={() => setImageFailed(true)}
            className="h-full w-full object-cover"
          />
        )}
        {selected && (
          <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-white shadow">
            <Check className="h-4 w-4" strokeWidth={3} />
          </span>
        )}
        {selected && order !== undefined && (
          <span className="absolute left-2 top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-slate-900 px-1.5 text-xs font-bold text-white shadow">
            {order}
          </span>
        )}
      </div>
      <div className="px-2.5 py-2">
        <div className="text-sm font-bold leading-tight text-slate-800">{option.label}</div>
        {option.hint && <div className="mt-0.5 text-[11px] leading-tight text-slate-500">{option.hint}</div>}
      </div>
    </button>
  );
};
