import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Download, X } from 'lucide-react';

interface ImageLightboxProps {
  open: boolean;
  imageUrl: string;
  alt: string;
  onClose: () => void;
  onDownload?: () => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  open,
  imageUrl,
  alt,
  onClose,
  onDownload,
}) => {
  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={alt}
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/90 cursor-pointer"
        aria-label="Close full-size photo"
        onClick={onClose}
      />

      <div className="relative z-10 flex max-h-[92dvh] w-full max-w-[min(96vw,1400px)] flex-col items-center gap-3">
        <img
          src={imageUrl}
          alt={alt}
          draggable={false}
          className="max-h-[82dvh] w-auto max-w-full rounded-lg object-contain shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
          referrerPolicy="no-referrer"
        />

        <div className="flex items-center gap-2">
          {onDownload && (
            <button
              type="button"
              onClick={onDownload}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm hover:bg-white cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/25 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="absolute top-3 right-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-slate-800 shadow-sm hover:bg-white cursor-pointer"
        aria-label="Close full-size photo"
      >
        <X className="h-4 w-4" />
      </button>
    </div>,
    document.body
  );
};
