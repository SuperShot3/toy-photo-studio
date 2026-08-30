import React, { useEffect, useState } from 'react';
import { Download, RefreshCw, Copy, Check, ArrowDownToLine, Type } from 'lucide-react';
import { GeneratedResult } from '../types';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { composePromoOverlay, isPromoStyle } from '../utils/promoOverlay';

interface ResultViewProps {
  result: GeneratedResult;
  onRegenerate: () => void;
  isRegenerating: boolean;
  shotPriceLabel: string;
}

export const ResultView: React.FC<ResultViewProps> = ({
  result,
  onRegenerate,
  isRegenerating,
  shotPriceLabel,
}) => {
  const [copied, setCopied] = useState(false);
  const promo = isPromoStyle(result.style);
  const [overlayOn, setOverlayOn] = useState(promo);
  const [headline, setHeadline] = useState(result.productName || result.productTitle);
  const [tagline, setTagline] = useState(result.sellingLine);
  const [displayImage, setDisplayImage] = useState(result.imageUrl);
  const [isComposing, setIsComposing] = useState(false);

  useEffect(() => {
    setOverlayOn(isPromoStyle(result.style));
    setHeadline(result.productName || result.productTitle);
    setTagline(result.sellingLine);
    setDisplayImage(result.imageUrl);
  }, [result.imageUrl, result.style, result.productName, result.productTitle, result.sellingLine]);

  useEffect(() => {
    if (!promo || !overlayOn) {
      setDisplayImage(result.imageUrl);
      setIsComposing(false);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      setIsComposing(true);
      composePromoOverlay({
        imageUrl: result.imageUrl,
        style: result.style,
        headline: headline.trim() || result.productName || 'Product',
        tagline: tagline.trim(),
        sizeLabel: result.toySizeCm ? `${result.toySizeCm} cm` : '',
      })
        .then((url) => {
          if (!cancelled) setDisplayImage(url);
        })
        .catch(() => {
          if (!cancelled) setDisplayImage(result.imageUrl);
        })
        .finally(() => {
          if (!cancelled) setIsComposing(false);
        });
    }, 280);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [
    promo,
    overlayOn,
    headline,
    tagline,
    result.imageUrl,
    result.style,
    result.productName,
    result.toySizeCm,
  ]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = displayImage;
    const sanitizedTitle = (result.productName || 'studio-photo')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-');
    const suffix = promo && overlayOn ? 'promo' : result.style;
    const mime = displayImage.match(/^data:(image\/[a-zA-Z0-9.+-]+)/)?.[1] || 'image/png';
    const ext =
      mime.includes('jpeg') || mime.includes('jpg')
        ? 'jpg'
        : mime.includes('webp')
          ? 'webp'
          : 'png';
    link.download = `${sanitizedTitle}-${suffix}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyListing = async () => {
    const listingText = `📦 PRODUCT TITLE:\n${result.productTitle}\n\n✨ SELLING HOOK:\n${result.sellingLine}\n\n📝 PRODUCT DESCRIPTION:\n${result.marketingDescription}\n\n📏 SPECIFICATIONS:\n- Dimensions: ~${result.toySizeCm} cm\n- Photography Style: ${result.style.replace('-', ' ').toUpperCase()}\n- Visual Reference: ${result.personScale === 'none' ? 'Solo Product' : result.personScale === 'child' ? 'With Child Scale Reference' : 'With Adult Scale Reference'}`;

    try {
      await navigator.clipboard.writeText(listingText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  return (
    <div className="space-y-6 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white uppercase tracking-wider">
              AI Enhanced
            </span>
            <span className="text-[11px] text-slate-400 capitalize font-medium">
              {result.style.replace('-', ' ')}
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
            Studio Output
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRegenerate}
            disabled={isRegenerating}
            title={`${shotPriceLabel} per image`}
            className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin text-indigo-600' : ''}`} />
            Regenerate
            <span className="tabular-nums text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
              {shotPriceLabel}
            </span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-indigo-100"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </button>
        </div>
      </div>

      <div className="relative">
        <BeforeAfterSlider
          originalImage={result.originalImageUrl}
          generatedImage={displayImage}
          productName={result.productName}
        />
        {isComposing && (
          <p className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 pointer-events-none px-2.5 py-0.5 rounded-full bg-slate-900/70 text-white text-[10px] font-medium">
            Printing name on photo
          </p>
        )}
      </div>

      {promo && (
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Type className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-slate-800">Name on photo</p>
                <p className="text-[10px] text-slate-500 truncate">
                  Printed on the image so the shot is ready to post or sell
                </p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={overlayOn}
              onClick={() => setOverlayOn((on) => !on)}
              className={`relative w-10 h-5 rounded-full transition-colors shrink-0 cursor-pointer ${
                overlayOn ? 'bg-indigo-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                  overlayOn ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {overlayOn && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Name on image
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  maxLength={48}
                  placeholder="Product name"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Selling line
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  maxLength={72}
                  placeholder="Short line that helps people buy"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-slate-100">
        <div className="space-y-3">
          <div className="flex justify-between items-start gap-2">
            <h2 className="text-base font-bold text-slate-900 leading-snug">
              {result.productTitle}
            </h2>
            <button
              type="button"
              onClick={handleCopyListing}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 whitespace-nowrap cursor-pointer flex items-center gap-1 shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          <p className="text-xs text-indigo-700 font-bold tracking-widest uppercase">
            {result.sellingLine}
          </p>

          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed whitespace-pre-line">
            {result.marketingDescription}
          </p>
        </div>

        <div className="flex flex-col justify-between gap-3">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Model Guidance & Specs</p>
            <ul className="text-[11px] text-slate-600 space-y-1.5">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0"></span>
                <span>Subject integrity preserved (1:1 geometry)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0"></span>
                <span>Studio soft-box lighting applied (~{result.toySizeCm}cm calibrated)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0"></span>
                <span>
                  {promo
                    ? overlayOn
                      ? 'Product name printed on the photo for ads and social'
                      : 'Promo type is off — download is the clean studio shot'
                    : 'Text-free catalog frame for Amazon and Shopify'}
                </span>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={handleDownload}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <ArrowDownToLine className="w-4 h-4" />
              {promo && overlayOn ? 'Download Designed Promo Image' : 'Download High-Res Studio Image'}
            </button>

            <button
              type="button"
              onClick={handleCopyListing}
              className={`w-full py-2.5 rounded-lg text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                copied
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Listing Copied to Clipboard!' : 'Copy Full E-Commerce Listing'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
