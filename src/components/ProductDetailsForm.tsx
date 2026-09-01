import React, { useState } from 'react';
import { Sparkles, Wand2, Loader2, Check, ArrowRight } from 'lucide-react';
import { ImprovedDescriptionResponse, ApiSettings, ProductKind, kindSwitchNotice, productKindMeta, usesSizeCm } from '../types';
import { getActiveApiKey, isApiKeyConfigured } from '../utils/apiSettings';
import { readApiError, readNetworkError } from '../utils/apiError';

interface ProductDetailsFormProps {
  productName: string;
  onProductNameChange: (val: string) => void;
  toySizeCm: string;
  onToySizeCmChange: (val: string) => void;
  productKind: ProductKind;
  nameRequired: boolean;
  description: string;
  onDescriptionChange: (val: string) => void;
  imageBase64: string | null;
  mimeType: string;
  onApplyImprovedCopy: (improved: ImprovedDescriptionResponse) => void;
  onDetectedKind?: (kind: ProductKind, switchedFrom?: ProductKind) => void;
  apiSettings: ApiSettings;
}

export const ProductDetailsForm: React.FC<ProductDetailsFormProps> = ({
  productName,
  onProductNameChange,
  toySizeCm,
  onToySizeCmChange,
  productKind,
  nameRequired,
  description,
  onDescriptionChange,
  imageBase64,
  mimeType,
  onApplyImprovedCopy,
  onDetectedKind,
  apiSettings,
}) => {
  const kindMeta = productKindMeta(productKind);
  const showSize = usesSizeCm(productKind);
  const [isImproving, setIsImproving] = useState(false);
  const [suggestion, setSuggestion] = useState<ImprovedDescriptionResponse | null>(null);
  const [improveError, setImproveError] = useState<string | null>(null);

  const handleHelpMeWrite = async () => {
    if (!productName && !description && !imageBase64) {
      setImproveError('Please enter a product name or upload an image first.');
      return;
    }

    if (!isApiKeyConfigured(apiSettings)) {
      setImproveError('Please add your OpenAI API key in Settings (menu in the header).');
      return;
    }

    setIsImproving(true);
    setImproveError(null);

    try {
      const response = await fetch('/api/improve-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName,
          toySizeCm: usesSizeCm(productKind) ? toySizeCm : undefined,
          productKind,
          roughDescription: description,
          imageBase64: imageBase64 || undefined,
          mimeType: mimeType || undefined,
          apiKey: getActiveApiKey(apiSettings),
        }),
      });

      if (!response.ok) {
        throw new Error(await readApiError(response, 'Failed to generate improved copy.'));
      }

      const data: ImprovedDescriptionResponse = await response.json();
      if (data.productKind) {
        onDetectedKind?.(data.productKind, data.kindSwitchedFrom);
      }
      setSuggestion(data);
    } catch (err: unknown) {
      console.error(err);
      setImproveError(readNetworkError(err, 'Error generating description.'));
    } finally {
      setIsImproving(false);
    }
  };

  const handleApplySuggestion = () => {
    if (suggestion) {
      onApplyImprovedCopy(suggestion);
      setSuggestion(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          2. Product Specifications
        </label>
        <span className="text-[11px] text-slate-400">
          {kindMeta.specsHint}
        </span>
      </div>

      <div className={`grid grid-cols-1 gap-3 ${showSize ? 'sm:grid-cols-3' : ''}`}>
        {/* Product Name */}
        <div className={showSize ? 'sm:col-span-2' : ''}>
          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">
            Product Name{' '}
            {nameRequired ? (
              <span className="text-indigo-600">*</span>
            ) : (
              <span className="text-[10px] font-medium text-slate-400 normal-case tracking-normal">
                Optional
              </span>
            )}
          </label>
          <input
            type="text"
            value={productName}
            onChange={(e) => onProductNameChange(e.target.value)}
            placeholder={kindMeta.namePlaceholder}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 font-medium"
          />
          {nameRequired && (
            <p className="mt-1 text-[10px] text-slate-400 leading-relaxed">
              Required for promo — this name is printed on the photo.
            </p>
          )}
        </div>

        {showSize && (
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">
              Toy Size (cm) <span className="text-indigo-600">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="300"
                value={toySizeCm}
                onChange={(e) => onToySizeCmChange(e.target.value)}
                placeholder="e.g. 18"
                className="w-full px-3 py-2 pr-10 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                cm
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-[11px] font-bold text-slate-500 uppercase">
            Short Description / Notes
          </label>
          
          <button
            type="button"
            onClick={handleHelpMeWrite}
            disabled={isImproving}
            className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-wider flex items-center gap-1 cursor-pointer disabled:opacity-50 transition-colors"
          >
            {isImproving ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin text-indigo-600" />
                Writing...
              </>
            ) : (
              <>
                <Wand2 className="w-3 h-3 text-indigo-600" />
                Help Me Write
              </>
            )}
          </button>
        </div>

        <textarea
          rows={2}
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder={kindMeta.notesPlaceholder}
          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 h-16 resize-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none placeholder:text-slate-400 font-medium transition-all"
        />
      </div>

      {improveError && (
        <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
          {improveError}
        </div>
      )}

      {/* AI Suggestion Box */}
      {suggestion && (
        <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200/80 space-y-2.5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-indigo-600" />
              AI Copy Proposal
            </span>
            <button
              type="button"
              onClick={handleApplySuggestion}
              className="inline-flex items-center gap-1 text-[11px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1 rounded-md transition-all shadow-xs cursor-pointer"
            >
              <Check className="w-3 h-3" />
              Apply to Form
            </button>
          </div>

          {suggestion.kindSwitchedFrom && suggestion.productKind && (
            <p className="text-[11px] text-indigo-800 leading-relaxed">
              {kindSwitchNotice(suggestion.kindSwitchedFrom, suggestion.productKind)}
            </p>
          )}

          <div className="space-y-1.5 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Suggested Title:</span>
              <p className="font-bold text-slate-900">{suggestion.productTitle}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Selling Hook:</span>
              <p className="italic text-indigo-800 font-medium">"{suggestion.sellingLine}"</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Description:</span>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line text-[11px]">{suggestion.productDescription}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
