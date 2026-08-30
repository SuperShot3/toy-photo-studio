import React from 'react';
import { SCALE_OPTIONS } from '../data/sampleToys';
import { PersonScale } from '../types';

interface ScaleSelectorProps {
  selectedScale: PersonScale;
  onScaleSelect: (scale: PersonScale) => void;
  toySizeCm: string | number;
}

export const ScaleSelector: React.FC<ScaleSelectorProps> = ({
  selectedScale,
  onScaleSelect,
  toySizeCm,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          4. Scale Reference (Human)
        </label>
        <span className="text-[10px] text-slate-400">
          {toySizeCm ? `Calibrated to ~${toySizeCm}cm` : 'Relative ratio'}
        </span>
      </div>

      <div className="flex gap-2">
        {SCALE_OPTIONS.map((opt) => {
          const isSelected = selectedScale === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onScaleSelect(opt.id)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {opt.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};

