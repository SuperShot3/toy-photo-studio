import React, { useEffect, useState } from 'react';
import { Download, RefreshCw, ArrowDownToLine, Type, Sun, RotateCw, Crop } from 'lucide-react';
import { GeneratedResult, sizeCmForProduct } from '../types';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { ImageLightbox } from './ImageLightbox';
import { formatElapsed } from '../utils/formatElapsed';
import { isMobileSaveTarget, saveImage } from '../utils/saveImage';
import {
  composePromoOverlay,
  isPromoStyle,
  STUDIO_LOGO_URL,
  type CropAspect,
  type RotateDeg,
} from '../utils/promoOverlay';

const BRIGHTNESS_DEFAULT = 100;
const CONTRAST_DEFAULT = 100;
const SATURATION_DEFAULT = 100;
const WARMTH_DEFAULT = 0;
const ASPECT_OPTIONS: CropAspect[] = ['original', '1:1', '4:5', '3:1'];

interface ResultViewProps {
  result: GeneratedResult;
  onRegenerate: () => void;
  regenerateDisabled?: boolean;
  shotPriceLabel: string;
}

function LightSlider({
  label,
  value,
  min,
  max,
  display,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  display: string;
  onChange: (next: number) => void;
}) {
  return (
    <label className="block space-y-1">
      <span className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase">{label}</span>
        <span className="text-[10px] font-semibold text-slate-600 tabular-nums">{display}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 accent-indigo-600 cursor-pointer"
      />
    </label>
  );
}

export const ResultView: React.FC<ResultViewProps> = ({
  result,
  onRegenerate,
  regenerateDisabled = false,
  shotPriceLabel,
}) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const promo = isPromoStyle(result.style);
  const sizeCm = sizeCmForProduct(result.productKind, result.toySizeCm);
  const [overlayOn, setOverlayOn] = useState(promo);
  const [logoOn, setLogoOn] = useState(false);
  const [headline, setHeadline] = useState(result.productName || result.productTitle);
  const [tagline, setTagline] = useState('');
  const [brightness, setBrightness] = useState(BRIGHTNESS_DEFAULT);
  const [contrast, setContrast] = useState(CONTRAST_DEFAULT);
  const [saturation, setSaturation] = useState(SATURATION_DEFAULT);
  const [warmth, setWarmth] = useState(WARMTH_DEFAULT);
  const [aspect, setAspect] = useState<CropAspect>('original');
  const [rotateDeg, setRotateDeg] = useState<RotateDeg>(0);
  const [displayImage, setDisplayImage] = useState(result.imageUrl);
  const [isComposing, setIsComposing] = useState(false);
  const printName = promo && overlayOn;
  const lightChanged =
    brightness !== BRIGHTNESS_DEFAULT ||
    contrast !== CONTRAST_DEFAULT ||
    saturation !== SATURATION_DEFAULT ||
    warmth !== WARMTH_DEFAULT;
  const frameChanged = aspect !== 'original' || rotateDeg !== 0;
  const editsChanged = lightChanged || frameChanged;

  const resetEdits = () => {
    setBrightness(BRIGHTNESS_DEFAULT);
    setContrast(CONTRAST_DEFAULT);
    setSaturation(SATURATION_DEFAULT);
    setWarmth(WARMTH_DEFAULT);
    setAspect('original');
    setRotateDeg(0);
  };

  useEffect(() => {
    setOverlayOn(isPromoStyle(result.style));
    setLogoOn(false);
    setHeadline(result.productName || result.productTitle);
    setTagline('');
    setBrightness(BRIGHTNESS_DEFAULT);
    setContrast(CONTRAST_DEFAULT);
    setSaturation(SATURATION_DEFAULT);
    setWarmth(WARMTH_DEFAULT);
    setAspect('original');
    setRotateDeg(0);
    setDisplayImage(result.imageUrl);
  }, [result.imageUrl, result.style, result.productName, result.productTitle]);

  useEffect(() => {
    if (!printName && !logoOn && !editsChanged) {
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
        headline: printName ? headline.trim() || result.productName || 'Product' : '',
        tagline: printName ? tagline.trim() : '',
        sizeLabel: printName && sizeCm ? `${sizeCm} cm` : '',
        includeLogo: logoOn,
        rotateDeg,
        aspect,
        light: {
          brightness: brightness / 100,
          contrast: contrast / 100,
          saturation: saturation / 100,
          warmth,
        },
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
    printName,
    logoOn,
    overlayOn,
    headline,
    tagline,
    brightness,
    contrast,
    saturation,
    warmth,
    aspect,
    rotateDeg,
    editsChanged,
    result.imageUrl,
    result.style,
    result.productName,
    sizeCm,
  ]);

  const saveOnPhone = isMobileSaveTarget();
  const saveLabel = saveOnPhone ? 'Save' : 'Download';
  const saveCtaLabel = saveOnPhone
    ? 'Save to Photos'
    : printName || logoOn
      ? 'Download Designed Promo Image'
      : 'Download High-Res Studio Image';

  const handleDownload = () => {
    const sanitizedTitle = (result.productName || 'studio-photo')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-');
    const suffix =
      printName && logoOn ? 'promo-logo' : printName ? 'promo' : logoOn ? 'logo' : result.style;
    const mime = displayImage.match(/^data:(image\/[a-zA-Z0-9.+-]+)/)?.[1] || 'image/png';
    const ext =
      mime.includes('jpeg') || mime.includes('jpg')
        ? 'jpg'
        : mime.includes('webp')
          ? 'webp'
          : 'png';
    void saveImage(displayImage, `${sanitizedTitle}-${suffix}.${ext}`).catch(() => {});
  };

  const timingLabel = result.durationMs
    ? `Generated in ${formatElapsed(result.durationMs)}`
    : null;

  const composingLabel =
    printName && logoOn
      ? 'Printing name and logo'
      : logoOn
        ? 'Adding logo'
        : printName
          ? 'Printing name on photo'
          : frameChanged
            ? 'Framing photo'
            : 'Adjusting light';

  return (
    <div className="space-y-6 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white uppercase tracking-wider">
              AI Enhanced
            </span>
            <span className="text-[11px] text-slate-400 capitalize font-medium">
              {result.style.replace('-', ' ')}
            </span>
            {timingLabel && (
              <span className="text-[11px] text-slate-400 font-medium tabular-nums">
                {timingLabel}
              </span>
            )}
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
            Studio Output
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRegenerate}
            disabled={regenerateDisabled}
            title={
              regenerateDisabled
                ? 'Wait for a shot to finish before starting another'
                : `${shotPriceLabel} per image`
            }
            className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
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
            {saveLabel}
          </button>
        </div>
      </div>

      <div className="relative">
        <BeforeAfterSlider
          originalImage={result.originalImageUrl}
          generatedImage={displayImage}
          productName={result.productName}
          onViewGenerated={() => setLightboxOpen(true)}
        />
        {isComposing && (
          <p className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 pointer-events-none px-2.5 py-0.5 rounded-full bg-slate-900/70 text-white text-[10px] font-medium">
            {composingLabel}
          </p>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 space-y-3">
        {promo && (
          <>
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
          </>
        )}

        <label
          className={`flex items-center justify-between gap-3 cursor-pointer ${
            promo ? 'pt-3 border-t border-slate-200' : ''
          }`}
        >
          <span className="flex items-center gap-2.5 min-w-0">
            <img
              src={STUDIO_LOGO_URL}
              alt=""
              className="w-9 h-9 rounded-md object-contain bg-white border border-slate-200 shrink-0 p-0.5"
            />
            <span className="min-w-0">
              <span className="block text-[11px] font-bold text-slate-800">Add logo</span>
              <span className="block text-[10px] text-slate-500 truncate">
                Stamp Lanna Bloom in the top-right of the photo
              </span>
            </span>
          </span>
          <input
            type="checkbox"
            checked={logoOn}
            onChange={(e) => setLogoOn(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer shrink-0"
          />
        </label>

        <div className="pt-3 border-t border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Sun className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-slate-800">Light</p>
                <p className="text-[10px] text-slate-500 truncate">
                  Brightness, contrast, color, and warmth — baked into the download
                </p>
              </div>
            </div>
            {editsChanged && (
              <button
                type="button"
                onClick={resetEdits}
                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer shrink-0"
              >
                Reset
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <LightSlider
              label="Brightness"
              value={brightness}
              min={70}
              max={140}
              display={`${brightness}%`}
              onChange={setBrightness}
            />
            <LightSlider
              label="Contrast"
              value={contrast}
              min={80}
              max={130}
              display={`${contrast}%`}
              onChange={setContrast}
            />
            <LightSlider
              label="Saturation"
              value={saturation}
              min={50}
              max={150}
              display={`${saturation}%`}
              onChange={setSaturation}
            />
            <LightSlider
              label="Warmth"
              value={warmth}
              min={-50}
              max={50}
              display={warmth === 0 ? 'Neutral' : warmth > 0 ? `+${warmth}` : `${warmth}`}
              onChange={setWarmth}
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-200 space-y-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <Crop className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-slate-800">Frame</p>
              <p className="text-[10px] text-slate-500 truncate">
                Center crop for catalog, Instagram, or a banner
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {ASPECT_OPTIONS.map((option) => {
              const selected = aspect === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setAspect(option)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors ${
                    selected
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {option === 'original' ? 'Original' : option}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() =>
                setRotateDeg((current) => ((current + 90) % 360) as RotateDeg)
              }
              className="ml-auto px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center gap-1"
            >
              <RotateCw className="w-3 h-3" />
              Rotate
              {rotateDeg !== 0 && (
                <span className="tabular-nums text-slate-400">{rotateDeg}°</span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end gap-4 pt-2 border-t border-slate-100">
        <div className="flex-1 bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Model Guidance & Specs</p>
          <ul className="text-[11px] text-slate-600 space-y-1.5">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0"></span>
              <span>Subject integrity preserved (1:1 geometry)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0"></span>
              <span>
                {sizeCm
                  ? `Studio soft-box lighting applied (~${sizeCm}cm calibrated)`
                  : 'Studio soft-box lighting applied'}
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0"></span>
              <span>
                {printName && logoOn
                  ? 'Product name and brand logo printed on the photo'
                  : printName
                    ? 'Product name printed on the photo for ads and social'
                    : logoOn
                      ? 'Brand logo stamped in the top-right of the photo'
                      : promo
                        ? 'Promo type is off — download is the clean studio shot'
                        : 'Text-free catalog frame for Amazon and Shopify'}
              </span>
            </li>
          </ul>
        </div>

        <button
          type="button"
          onClick={handleDownload}
          className="w-full sm:w-64 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs shrink-0"
        >
          <ArrowDownToLine className="w-4 h-4" />
          {saveCtaLabel}
        </button>
      </div>

      <ImageLightbox
        open={lightboxOpen}
        imageUrl={displayImage}
        alt={`${result.productName || 'Product'} studio result`}
        onClose={() => setLightboxOpen(false)}
        onDownload={handleDownload}
        downloadLabel={saveLabel}
      />
    </div>
  );
};
