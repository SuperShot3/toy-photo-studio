import React from 'react';
import { ProductKind, PRODUCT_KIND_OPTIONS } from '../types';

interface SubjectSelectorProps {
  selectedKind: ProductKind;
  onKindSelect: (kind: ProductKind) => void;
}

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

      <div className="grid grid-cols-2 gap-2">
        {PRODUCT_KIND_OPTIONS.map((opt) => {
          const isSelected = selectedKind === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onKindSelect(opt.id)}
              className={`py-2 px-2 rounded-lg transition-all cursor-pointer ${
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
