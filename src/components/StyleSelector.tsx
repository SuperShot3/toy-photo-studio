import React from 'react';
import { Sparkles, Crown } from 'lucide-react';
import { STYLE_OPTIONS } from '../data/sampleToys';
import { ImageStyle } from '../types';
import { isPromoStyle } from '../utils/promoOverlay';

interface StyleSelectorProps {
  selectedStyle: ImageStyle;
  onStyleSelect: (style: ImageStyle) => void;
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({
  selectedStyle,
  onStyleSelect,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          3. Visual Style <span className="text-indigo-600">*</span>
        </label>
        <span className="text-[10px] text-slate-400">1:1 Geometry Locked</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {STYLE_OPTIONS.map((style) => {
          const isSelected = selectedStyle === style.id;

          return (
            <button
              key={style.id}
              type="button"
              onClick={() => onStyleSelect(style.id)}
              className={`flex flex-col items-center p-2 rounded-xl border text-center transition-all cursor-pointer group ${
                isSelected
                  ? 'border-2 border-indigo-600 bg-indigo-50/70 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-indigo-400 hover:bg-slate-50/60'
              }`}
            >
              <div
                className={`relative w-full aspect-square max-h-16 rounded-lg mb-1.5 flex items-center justify-center overflow-hidden transition-colors ${
                  style.id === 'clean-catalog'
                    ? isSelected
                      ? 'bg-indigo-100/90 text-indigo-700'
                      : 'bg-slate-100 text-slate-600'
                    : style.id === 'styled-promo'
                    ? isSelected
                      ? 'bg-indigo-600 text-white'
                      : 'bg-indigo-50 text-indigo-600'
                    : isSelected
                    ? 'bg-slate-900 text-amber-400'
                    : 'bg-slate-800 text-amber-300'
                }`}
              >
                {style.id === 'clean-catalog' && (
                  <div className="w-6 h-6 border-2 border-dashed border-current rounded flex items-center justify-center text-[9px] font-bold">
                    1:1
                  </div>
                )}
                {style.id === 'styled-promo' && <Sparkles className="w-5 h-5 mb-2" />}
                {style.id === 'luxury-promo' && <Crown className="w-5 h-5 mb-2" />}

                {style.id !== 'clean-catalog' && (
                  <span
                    className={`absolute inset-x-0 bottom-0 py-[3px] text-[7px] font-bold tracking-wider uppercase ${
                      style.id === 'luxury-promo'
                        ? 'bg-black/55 text-amber-200 font-serif italic'
                        : 'bg-black/35 text-white font-display'
                    }`}
                  >
                    Name
                  </span>
                )}
              </div>

              <span
                className={`text-[10px] font-bold tracking-wider uppercase ${
                  isSelected ? 'text-indigo-700' : 'text-slate-700'
                }`}
              >
                {style.id === 'clean-catalog'
                  ? 'CLEAN'
                  : style.id === 'styled-promo'
                  ? 'PROMO'
                  : 'LUXURY'}
              </span>
              <span className="text-[9px] text-slate-400 truncate max-w-full">
                {style.badge}
              </span>
            </button>
          );
        })}
      </div>

      {isPromoStyle(selectedStyle) ? (
        <p className="text-[10px] text-slate-500 leading-relaxed px-0.5">
          Promo prints the <span className="font-semibold text-slate-700">product name</span> and a
          short selling line on the photo, so a name is required.
        </p>
      ) : (
        <p className="text-[10px] text-slate-500 leading-relaxed px-0.5">
          Catalog stays text-free for Amazon and Shopify. Switch to Promo to add a name on the image.
        </p>
      )}
    </div>
  );
};
