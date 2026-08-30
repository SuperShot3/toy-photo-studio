import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, X, RefreshCw, Loader2 } from 'lucide-react';
import { ProductKind } from '../types';
import { normalizeReferenceImage } from '../utils/normalizeImage';

interface PhotoUploaderProps {
  imagePreviewUrl: string | null;
  onImageSelected: (base64Url: string, mimeType: string) => void;
  onClearImage: () => void;
  productKind?: ProductKind;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  imagePreviewUrl,
  onImageSelected,
  onClearImage,
  productKind = 'flowers',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isNormalizing, setIsNormalizing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const applyImage = async (dataUrl: string) => {
    setIsNormalizing(true);
    setUploadError(null);
    try {
      const normalized = await normalizeReferenceImage(dataUrl);
      onImageSelected(normalized.dataUrl, normalized.mimeType);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Could not read that image. Please upload a JPEG, PNG, or WEBP photo.';
      setUploadError(message);
    } finally {
      setIsNormalizing(false);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Please upload a valid image file (JPEG, PNG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        void applyImage(result);
      }
    };
    reader.onerror = () => {
      setUploadError('Could not read that file. Please try another photo.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          1. {productKind === 'flowers' ? 'Flower' : 'Toy'} Photo Reference <span className="text-indigo-600">*</span>
        </label>
          {imagePreviewUrl && (
          <button
            type="button"
            onClick={() => {
              setUploadError(null);
              onClearImage();
            }}
            className="text-[11px] font-semibold text-slate-400 hover:text-red-600 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            Remove Photo
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp, image/heic, image/heif"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFile(e.target.files[0]);
          }
        }}
      />

      {imagePreviewUrl ? (
        <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group shadow-xs">
          {isNormalizing && (
            <div className="absolute inset-0 z-10 bg-white/70 flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
            </div>
          )}
          <div className="aspect-square sm:aspect-16/10 max-h-[300px] w-full flex items-center justify-center p-3">
            <img
              src={imagePreviewUrl}
              alt={productKind === 'flowers' ? 'Uploaded flower product' : 'Uploaded toy product'}
              className="max-h-full max-w-full object-contain rounded-lg drop-shadow-sm"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute inset-x-0 bottom-0 p-2.5 bg-slate-900/80 backdrop-blur-sm flex items-center justify-between text-white text-xs">
            <span className="font-medium flex items-center gap-1.5 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Reference Loaded
            </span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2 py-1 rounded-md bg-white/20 hover:bg-white/30 transition-all flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              Change Photo
            </button>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-6 sm:p-7 text-center cursor-pointer transition-all duration-150 flex flex-col items-center justify-center min-h-[160px] ${
            isDragging
              ? 'border-indigo-600 bg-indigo-50/50 scale-[0.99]'
              : 'border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/30 bg-white shadow-xs'
          }`}
        >
          <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-2 shadow-xs">
            <UploadCloud className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800 mb-0.5">
            Click or drag & drop {productKind === 'flowers' ? 'flower' : 'toy'} photo
          </h3>
          <p className="text-xs text-slate-400 mb-3 max-w-xs">
            Any clear snapshot on phone, desk, or white background
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs">
            <ImageIcon className="w-3.5 h-3.5" />
            Browse Device
          </div>
          {isNormalizing && (
            <div className="absolute inset-0 rounded-xl bg-white/70 flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
            </div>
          )}
        </div>
      )}

      {uploadError && (
        <p className="text-[11px] text-red-600 font-medium">{uploadError}</p>
      )}
    </div>
  );
};
