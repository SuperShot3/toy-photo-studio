import React from 'react';
import { Images, X, Trash2, Loader2 } from 'lucide-react';
import { GeneratedResult, ImageStyle } from '../types';
import { MAX_SESSION_SHOTS } from '../utils/sessionGallery';

interface SessionGalleryProps {
  shots: GeneratedResult[];
  selectedId: string | null;
  isGenerating?: boolean;
  onSelect: (shot: GeneratedResult) => void;
  onRemove: (shotId: string) => void;
  onClearAll: () => void;
}

const STYLE_LABEL: Record<ImageStyle, string> = {
  'clean-catalog': 'Clean',
  'styled-promo': 'Promo',
  'luxury-promo': 'Luxury',
};

function formatShotTime(iso: string): string {
  const generated = Date.parse(iso);
  if (Number.isNaN(generated)) return '';

  const deltaMs = Date.now() - generated;
  const minutes = Math.max(0, Math.floor(deltaMs / 60000));
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 8) return `${hours}h ago`;
  return new Date(generated).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export const SessionGallery: React.FC<SessionGalleryProps> = ({
  shots,
  selectedId,
  isGenerating = false,
  onSelect,
  onRemove,
  onClearAll,
}) => {
  if (shots.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Images className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-900">
              Session shots
            </h3>
            <span className="text-[10px] font-bold tabular-nums text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md">
              {shots.length}/{MAX_SESSION_SHOTS}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Kept in this tab only. Cleared when you close it.
          </p>
        </div>

        <button
          type="button"
          onClick={onClearAll}
          className="text-[11px] font-semibold text-slate-400 hover:text-red-600 flex items-center gap-1 transition-colors cursor-pointer shrink-0"
        >
          <Trash2 className="w-3 h-3" />
          Clear
        </button>
      </div>

      <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-0.5 px-0.5">
        {isGenerating && (
          <div className="w-[92px] sm:w-[104px] shrink-0 rounded-xl overflow-hidden ring-1 ring-indigo-200 bg-indigo-50/70">
            <div className="aspect-square flex flex-col items-center justify-center gap-1.5 text-indigo-600">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-[9px] font-bold uppercase tracking-wider">Rendering</span>
            </div>
            <div className="px-1.5 py-1.5 bg-white border-t border-indigo-100">
              <p className="text-[10px] font-bold text-indigo-700 leading-tight">New shot</p>
              <p className="text-[9px] text-slate-400">In progress</p>
            </div>
          </div>
        )}
        {shots.map((shot) => {
          const isSelected = shot.id === selectedId;

          return (
            <div key={shot.id} className="relative shrink-0 group">
              <button
                type="button"
                onClick={() => onSelect(shot)}
                aria-pressed={isSelected}
                aria-label={`Open ${shot.productName} ${STYLE_LABEL[shot.style]} shot`}
                className={`w-[92px] sm:w-[104px] rounded-xl overflow-hidden text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'ring-2 ring-indigo-600 ring-offset-2 ring-offset-white'
                    : 'ring-1 ring-slate-200 hover:ring-indigo-300'
                }`}
              >
                <div className="aspect-square bg-slate-100">
                  <img
                    src={shot.imageUrl}
                    alt={`${shot.productName} studio shot`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="px-1.5 py-1.5 bg-white border-t border-slate-100">
                  <p className="text-[10px] font-bold text-slate-700 truncate leading-tight">
                    {shot.productName || 'Product'}
                  </p>
                  <p className="text-[9px] text-slate-400 truncate">
                    {STYLE_LABEL[shot.style]} · {formatShotTime(shot.generatedAt)}
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onRemove(shot.id);
                }}
                aria-label={`Remove ${shot.productName} shot from this session`}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-slate-900/75 hover:bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
