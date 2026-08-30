import React, { useState, useRef, useCallback } from 'react';
import { Sliders, Columns, Sparkles, Image as ImageIcon, Maximize2 } from 'lucide-react';

interface BeforeAfterSliderProps {
  originalImage: string;
  generatedImage: string;
  productName: string;
  onViewGenerated?: () => void;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  originalImage,
  generatedImage,
  productName,
  onViewGenerated,
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side'>('slider');
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerStartX = useRef(0);
  const didDrag = useRef(false);
  const draggingRef = useRef(false);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('[data-lightbox-trigger]')) return;
    pointerStartX.current = event.clientX;
    didDrag.current = Boolean((event.target as HTMLElement).closest('[data-slider-handle]'));
    draggingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    if (Math.abs(event.clientX - pointerStartX.current) > 8) {
      didDrag.current = true;
    }
    handleMove(event.clientX);
  };

  const endPointer = (openLightbox: boolean) => {
    if (openLightbox && draggingRef.current && !didDrag.current) {
      onViewGenerated?.();
    }
    draggingRef.current = false;
  };

  return (
    <div className="space-y-2.5">
      {/* Mode Switcher */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Visual Inspection</span>
          <span className="text-[10px] text-slate-400">Drag to compare, click to enlarge</span>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
          <button
            type="button"
            onClick={() => setViewMode('slider')}
            className={`px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1 text-[11px] ${
              viewMode === 'slider'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sliders className="w-3 h-3" />
            Slider
          </button>
          <button
            type="button"
            onClick={() => setViewMode('side-by-side')}
            className={`px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1 text-[11px] ${
              viewMode === 'side-by-side'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Columns className="w-3 h-3" />
            Side-by-Side
          </button>
        </div>
      </div>

      {viewMode === 'slider' ? (
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={() => endPointer(true)}
          onPointerCancel={() => endPointer(false)}
          className="relative aspect-square sm:aspect-4/3 w-full rounded-xl overflow-hidden select-none touch-none cursor-ew-resize border border-slate-200 bg-slate-100 shadow-xs"
        >
          {/* Generated Result Image (Bottom layer) */}
          <img
            src={generatedImage}
            alt={`${productName} Studio Result`}
            className="absolute inset-0 w-full h-full object-contain p-2"
            referrerPolicy="no-referrer"
          />

          {/* Original Upload Image (Top clipped layer) */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
          >
            <img
              src={originalImage}
              alt={`${productName} Original Upload`}
              className="absolute inset-0 w-full h-full object-contain p-2 bg-slate-50"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Slider Line & Handle */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_8px_rgba(0,0,0,0.5)] z-20 pointer-events-none"
            style={{ left: `${sliderPosition}%` }}
          >
            <div
              data-slider-handle
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-white text-slate-800 shadow-lg border border-slate-200 flex items-center justify-center pointer-events-auto cursor-ew-resize"
            >
              <Sliders className="w-3 h-3 rotate-90 text-slate-600" />
            </div>
          </div>

          {/* Badges on top-left & top-right */}
          <div className="absolute top-3 left-3 z-10 pointer-events-none flex gap-1.5">
            <span className="bg-black/60 backdrop-blur px-2.5 py-0.5 rounded-full text-[10px] text-white font-bold uppercase tracking-wider flex items-center gap-1">
              <ImageIcon className="w-2.5 h-2.5" />
              Original
            </span>
          </div>
          <div className="absolute top-3 right-3 z-10 pointer-events-none">
            <span className="bg-emerald-500 px-2.5 py-0.5 rounded-full text-[10px] text-white font-bold uppercase tracking-wide flex items-center gap-1 shadow-xs">
              <Sparkles className="w-2.5 h-2.5" />
              AI Enhanced
            </span>
          </div>

          {/* Bottom helper text */}
          <div className="absolute bottom-2.5 inset-x-0 flex justify-center pr-12 pointer-events-none">
            <span className="px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur text-white text-[10px] font-medium">
              Drag to compare · click photo for full size
            </span>
          </div>

          {onViewGenerated && (
            <button
              type="button"
              data-lightbox-trigger
              onClick={(event) => {
                event.stopPropagation();
                onViewGenerated();
              }}
              aria-label="View generated photo full size"
              className="absolute bottom-2.5 right-2.5 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-800 shadow-sm border border-slate-200 hover:bg-slate-50 cursor-pointer"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 aspect-square sm:aspect-4/3 w-full">
          <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 p-2 flex flex-col items-center justify-center">
            <img
              src={originalImage}
              alt="Original"
              className="max-h-full max-w-full object-contain"
              referrerPolicy="no-referrer"
            />
            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-slate-800 text-white text-[9px] font-bold uppercase tracking-wider">
              Original
            </span>
          </div>
          <button
            type="button"
            onClick={onViewGenerated}
            aria-label="View generated photo full size"
            className="relative rounded-xl overflow-hidden border border-indigo-200 bg-white p-2 flex flex-col items-center justify-center shadow-xs cursor-zoom-in group"
          >
            <img
              src={generatedImage}
              alt="Studio Result"
              draggable={false}
              className="max-h-full max-w-full object-contain"
              referrerPolicy="no-referrer"
            />
            <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-bold tracking-wide flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              PhotoStudioAI
            </span>
            <span className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-slate-800 shadow-sm border border-slate-200 opacity-90 group-hover:opacity-100">
              <Maximize2 className="w-3.5 h-3.5" />
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

