import React, { useEffect, useState } from 'react';
import { X, ChevronDown, ChevronUp, Check } from 'lucide-react';
import type { PromoImageStyle, StyleSceneRef } from '../types';
import { listStyleRefsForStyle } from '../utils/styleRefs';

interface StyleRefPickerModalProps {
  open: boolean;
  style: PromoImageStyle;
  selectedId: string | null;
  onSelect: (ref: StyleSceneRef) => void;
  onClose: () => void;
}

export const StyleRefPickerModal: React.FC<StyleRefPickerModalProps> = ({
  open,
  style,
  selectedId,
  onSelect,
  onClose,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const refs = listStyleRefsForStyle(style);
  const heading = style === 'luxury-promo' ? 'Luxury looks' : 'Promo looks';

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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40 cursor-pointer"
        aria-label="Close visual references"
        onClick={onClose}
      />
      <div className="relative w-full sm:max-w-2xl max-h-[88vh] bg-white rounded-t-2xl sm:rounded-2xl border border-slate-200 shadow-xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Visual reference</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {heading} — pick a scene. The prompt is used as the background look, with a slight
              variation each generate.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto p-4 sm:p-5">
          {refs.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-10">
              No looks yet. Add one from Settings → Manage style references.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {refs.map((ref) => {
                const isSelected = selectedId === ref.id;
                const isExpanded = expandedId === ref.id;
                return (
                  <div
                    key={ref.id}
                    className={`rounded-xl border overflow-hidden ${
                      isSelected
                        ? 'border-indigo-600 ring-2 ring-indigo-500/20'
                        : 'border-slate-200'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onSelect(ref)}
                      className="w-full text-left cursor-pointer"
                    >
                      <div className="relative aspect-square bg-slate-100">
                        <img
                          src={ref.imageUrl}
                          alt={ref.name}
                          className="w-full h-full object-cover"
                        />
                        {isSelected && (
                          <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                        {ref.builtIn && (
                          <span className="absolute top-1.5 left-1.5 text-[8px] font-bold uppercase tracking-wider bg-black/50 text-white px-1.5 py-0.5 rounded">
                            Built-in
                          </span>
                        )}
                      </div>
                      <div className="px-2.5 py-2">
                        <p className="text-[11px] font-bold text-slate-800 truncate">{ref.name}</p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : ref.id)}
                      className="w-full flex items-center justify-between px-2.5 pb-2 text-[10px] font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
                    >
                      <span>{isExpanded ? 'Hide prompt' : 'Show prompt'}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>
                    {isExpanded && (
                      <p className="px-2.5 pb-2.5 text-[10px] leading-relaxed text-slate-600">
                        {ref.prompt}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
