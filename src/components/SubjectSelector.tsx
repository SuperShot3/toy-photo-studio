import React from 'react';
import { ProductKind } from '../types';

interface SubjectSelectorProps {
  selectedKind: ProductKind;
  onKindSelect: (kind: ProductKind) => void;
}

const OPTIONS: Array<{ id: ProductKind; name: string; hint: string }> = [
  { id: 'flowers', name: 'Flowers', hint: 'Blooms, bouquets, plants' },
  { id: 'toy', name: 'Toys', hint: 'Figures, wood, plush' },
];

export const SubjectSelector: React.FC<SubjectSelectorProps> = ({
  selectedKind,
  onKindSelect,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          Subject
        </label>
        <span className="text-[10px] text-slate-400">Sets lighting, scene & copy</span>
      </div>

      <div className="flex gap-2">
        {OPTIONS.map((opt) => {
          const isSelected = selectedKind === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onKindSelect(opt.id)}
              className={`flex-1 py-2 px-2 rounded-lg transition-all cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="block text-xs font-semibold">{opt.name}</span>
              <span
                className={`block text-[9px] mt-0.5 ${
                  isSelected ? 'text-indigo-100' : 'text-slate-400'
                }`}
              >
                {opt.hint}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
