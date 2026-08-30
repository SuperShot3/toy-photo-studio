/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { PhotoUploader } from './components/PhotoUploader';
import { ProductDetailsForm } from './components/ProductDetailsForm';
import { StyleSelector } from './components/StyleSelector';
import { ScaleSelector } from './components/ScaleSelector';
import { SubjectSelector } from './components/SubjectSelector';
import { ModelSelector } from './components/ModelSelector';
import { ResultView } from './components/ResultView';
import { SessionGallery } from './components/SessionGallery';
import { SettingsSheet } from './components/SettingsSheet';
import { StyleRefManager } from './components/StyleRefManager';
import { ImageStyle, PersonScale, ProductKind, GeneratedResult, ImprovedDescriptionResponse, ApiSettings, OpenAiImageModel, parseProductKind, sizeCmForProduct, kindSwitchNotice, isPromoImageStyle } from './types';
import { isPromoStyle } from './utils/promoOverlay';
import { Sparkles, Loader2, AlertCircle, Info } from 'lucide-react';
import { loadApiSettings, saveApiSettings, getActiveApiKey, isApiKeyConfigured } from './utils/apiSettings';
import { findStyleRef } from './utils/styleRefs';
import { readApiError, readNetworkError } from './utils/apiError';
import { normalizeReferenceImage } from './utils/normalizeImage';
import { getShotPrice } from './utils/generationPricing';
import { formatElapsed } from './utils/formatElapsed';
import {
  MAX_SESSION_SHOTS,
  loadSelectedShotId,
  loadSessionShots,
  mimeFromDataUrl,
  persistSessionShots,
  saveSelectedShotId,
} from './utils/sessionGallery';

export default function App() {
  const [apiSettings, setApiSettings] = useState<ApiSettings>(() => loadApiSettings());

  useEffect(() => {
    saveApiSettings(apiSettings);
  }, [apiSettings]);

  // Upload and form states
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [productName, setProductName] = useState<string>('');
  const [toySizeCm, setToySizeCm] = useState<string>('25');
  const [productKind, setProductKind] = useState<ProductKind>('toy');
  const [description, setDescription] = useState<string>('');

  // Style and scale selections
  const [selectedStyle, setSelectedStyle] = useState<ImageStyle>('clean-catalog');
  const [selectedScale, setSelectedScale] = useState<PersonScale>('none');
  const [selectedStyleRefId, setSelectedStyleRefId] = useState<string | null>(null);
  const [styleRefsVersion, setStyleRefsVersion] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [styleRefManagerOpen, setStyleRefManagerOpen] = useState(false);

  // Generation states
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [elapsedMs, setElapsedMs] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [kindNotice, setKindNotice] = useState<string | null>(null);
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [shots, setShots] = useState<GeneratedResult[]>([]);

  const resultRef = useRef<HTMLDivElement>(null);
  const shotsRef = useRef<GeneratedResult[]>([]);
  const genStartRef = useRef(0);
  const elapsedIntervalRef = useRef<number | null>(null);
  const shotPrice = getShotPrice(apiSettings.openaiImageModel);
  const selectedStyleRef = findStyleRef(selectedStyleRefId);

  const handleStyleSelect = (style: ImageStyle) => {
    setSelectedStyle(style);
    if (!isPromoImageStyle(style) || selectedStyleRef?.style !== style) {
      setSelectedStyleRefId(null);
    }
  };

  shotsRef.current = shots;

  useEffect(() => {
    return () => {
      if (elapsedIntervalRef.current) {
        window.clearInterval(elapsedIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      const loaded = await loadSessionShots();
      if (cancelled) return;

      setShots(loaded);
      const selectedId = loadSelectedShotId();
      const selected =
        loaded.find((shot) => shot.id === selectedId) ?? loaded[0] ?? null;

      if (selected) {
        applyShotToForm(selected);
        setResult(selected);
      }
    };

    void restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const applyShotToForm = (shot: GeneratedResult) => {
    const kind = parseProductKind(shot.productKind);
    setImagePreviewUrl(shot.originalImageUrl);
    setMimeType(mimeFromDataUrl(shot.originalImageUrl));
    setProductName(shot.productName);
    setProductKind(kind);
    if (kind !== 'flowers') {
      setToySizeCm(sizeCmForProduct(kind, shot.toySizeCm) ?? '25');
    }
    setDescription(shot.marketingDescription);
    setSelectedStyle(shot.style);
    setSelectedScale(kind === 'flowers' ? 'none' : shot.personScale);
  };

  const commitShots = (next: GeneratedResult[]) => {
    const trimmed = next.slice(0, MAX_SESSION_SHOTS);
    setShots(trimmed);
    void persistSessionShots(trimmed);
    return trimmed;
  };

  const applyDetectedKind = (kind: ProductKind, switchedFrom?: ProductKind) => {
    setProductKind(kind);
    if (kind === 'flowers') setSelectedScale('none');
    if (switchedFrom && switchedFrom !== kind) {
      setKindNotice(kindSwitchNotice(switchedFrom, kind));
    }
  };

  const handleImageSelected = (base64Url: string, fileMimeType: string) => {
    setImagePreviewUrl(base64Url);
    setMimeType(fileMimeType);
    setError(null);
    setKindNotice(null);
  };

  const handleClearImage = () => {
    setImagePreviewUrl(null);
    setKindNotice(null);
  };

  const handleSelectShot = (shot: GeneratedResult) => {
    setResult(shot);
    saveSelectedShotId(shot.id);
    applyShotToForm(shot);
    setError(null);
  };

  const handleRemoveShot = (shotId: string) => {
    const remaining = commitShots(shots.filter((shot) => shot.id !== shotId));
    if (result?.id !== shotId) return;

    const nextSelected = remaining[0] ?? null;
    setResult(nextSelected);
    saveSelectedShotId(nextSelected?.id ?? null);
    if (nextSelected) {
      applyShotToForm(nextSelected);
    }
  };

  const handleClearAllShots = () => {
    commitShots([]);
    setResult(null);
    saveSelectedShotId(null);
  };

  const handleApplyImprovedCopy = (improved: ImprovedDescriptionResponse) => {
    if (improved.productTitle) setProductName(improved.productTitle);
    if (improved.productDescription) setDescription(improved.productDescription);
  };

  // Main Generate Image Action
  const handleGenerateImage = async () => {
    if (!imagePreviewUrl) {
      setError(productKind === 'flowers'
        ? 'Please upload a flower photo before generating.'
        : 'Please upload a toy photo before generating.');
      return;
    }

    if (isPromoStyle(selectedStyle) && !productName.trim()) {
      setError('Please enter a product name. Promo prints this text on the image.');
      return;
    }

    if (!isApiKeyConfigured(apiSettings)) {
      setError('Please add your OpenAI API key in Settings (menu in the header).');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setKindNotice(null);
    setElapsedMs(0);
    genStartRef.current = performance.now();
    if (elapsedIntervalRef.current) window.clearInterval(elapsedIntervalRef.current);
    elapsedIntervalRef.current = window.setInterval(() => {
      setElapsedMs(performance.now() - genStartRef.current);
    }, 200);
    setGenerationStep(
      productKind === 'flowers'
        ? 'Analyzing bloom shape, petals & arrangement...'
        : 'Analyzing toy features, materials & proportions...'
    );

    // Progress animation timers for user feedback
    const t1 = setTimeout(() => {
      setGenerationStep('Building virtual studio lighting & shadow physics...');
    }, 2000);

    const t2 = setTimeout(() => {
      setGenerationStep(
        productKind === 'flowers'
          ? 'Rendering e-commerce studio shot with exact floral preservation...'
          : 'Rendering e-commerce studio shot with exact toy preservation...'
      );
    }, 4500);

    try {
      const reference = await normalizeReferenceImage(imagePreviewUrl);

      const response = await fetch('/api/generate-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: reference.dataUrl,
          mimeType: reference.mimeType || mimeType || 'image/jpeg',
          productName: productName.trim(),
          toySizeCm: sizeCmForProduct(productKind, toySizeCm) ?? (productKind === 'toy' ? '20' : undefined),
          productDescription: description.trim(),
          productKind,
          style: selectedStyle,
          personScale: productKind === 'flowers' ? 'none' : selectedScale,
          ...(selectedStyleRef
            ? { styleRefId: selectedStyleRef.id, styleRefPrompt: selectedStyleRef.prompt }
            : {}),
          apiKey: getActiveApiKey(apiSettings),
          openaiImageModel: apiSettings.openaiImageModel,
        }),
      });

      if (!response.ok) {
        throw new Error(
          await readApiError(response, 'Failed to generate product photo. Please try again.')
        );
      }

      const data = await response.json();
      const usedKind = parseProductKind(data.productKind ?? productKind);
      const switchedFrom: ProductKind | undefined =
        data.kindSwitchedFrom === 'toy' || data.kindSwitchedFrom === 'flowers'
          ? data.kindSwitchedFrom
          : undefined;

      if (switchedFrom) {
        applyDetectedKind(usedKind, switchedFrom);
      } else {
        setProductKind(usedKind);
      }

      const newResult: GeneratedResult = {
        id: crypto.randomUUID(),
        imageUrl: data.imageUrl,
        originalImageUrl: imagePreviewUrl,
        productTitle: data.productTitle || productName,
        sellingLine:
          data.sellingLine ||
          (usedKind === 'flowers'
            ? 'True-to-life blooms, arranged for gifts and special days.'
            : 'High quality toy crafted for memorable play.'),
        marketingDescription: data.marketingDescription || description,
        style: selectedStyle,
        personScale: usedKind === 'flowers' ? 'none' : selectedScale,
        productName: productName,
        toySizeCm: sizeCmForProduct(usedKind, data.toySizeCm ?? toySizeCm),
        productKind: usedKind,
        kindSwitchedFrom: switchedFrom,
        generatedAt: new Date().toISOString(),
        durationMs: Math.round(performance.now() - genStartRef.current),
      };

      setResult(newResult);
      saveSelectedShotId(newResult.id);
      commitShots([newResult, ...shotsRef.current.filter((shot) => shot.id !== newResult.id)]);

      // Smooth scroll to result
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    } catch (err: unknown) {
      console.error('Generation failed:', err);
      setError(readNetworkError(err, 'An error occurred during generation.'));
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
      if (elapsedIntervalRef.current) {
        window.clearInterval(elapsedIntervalRef.current);
        elapsedIntervalRef.current = null;
      }
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800 selection:bg-indigo-500/20">
      <Header onOpenSettings={() => setSettingsOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left Column: Config Panel */}
          <section className="w-full lg:w-[400px] xl:w-[420px] shrink-0 space-y-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
            <div className="pb-2 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Studio Controls
                </h2>
                <p className="text-[11px] text-slate-400">Configure lighting, style & scale</p>
              </div>
              <div className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase">
                Ready
              </div>
            </div>

            {!isApiKeyConfigured(apiSettings) && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 leading-relaxed">
                Add your OpenAI API key in{' '}
                <button
                  type="button"
                  onClick={() => setSettingsOpen(true)}
                  className="font-bold underline underline-offset-2 cursor-pointer"
                >
                  Settings
                </button>{' '}
                (menu in the header).
              </div>
            )}

            <SubjectSelector
              selectedKind={productKind}
              onKindSelect={(kind) => {
                setProductKind(kind);
                setKindNotice(null);
                if (kind === 'flowers') setSelectedScale('none');
              }}
            />

            {/* 1. Photo Upload */}
            <PhotoUploader
              imagePreviewUrl={imagePreviewUrl}
              onImageSelected={handleImageSelected}
              onClearImage={handleClearImage}
              productKind={productKind}
            />

            {/* 2. Product Details */}
            <ProductDetailsForm
              productName={productName}
              onProductNameChange={setProductName}
              toySizeCm={toySizeCm}
              onToySizeCmChange={setToySizeCm}
              productKind={productKind}
              nameRequired={isPromoStyle(selectedStyle)}
              description={description}
              onDescriptionChange={setDescription}
              imageBase64={imagePreviewUrl}
              mimeType={mimeType}
              onApplyImprovedCopy={handleApplyImprovedCopy}
              onDetectedKind={applyDetectedKind}
              apiSettings={apiSettings}
            />

            {/* 3. Style Selection */}
            <StyleSelector
              key={styleRefsVersion}
              selectedStyle={selectedStyle}
              onStyleSelect={handleStyleSelect}
              selectedRef={
                selectedStyleRef && isPromoImageStyle(selectedStyle) && selectedStyleRef.style === selectedStyle
                  ? selectedStyleRef
                  : null
              }
              onSelectRef={(ref) => setSelectedStyleRefId(ref?.id ?? null)}
            />

            {productKind === 'toy' && (
              <ScaleSelector
                selectedScale={selectedScale}
                onScaleSelect={setSelectedScale}
                toySizeCm={toySizeCm}
              />
            )}

            <ModelSelector
              selectedModel={apiSettings.openaiImageModel}
              onModelSelect={(model: OpenAiImageModel) =>
                setApiSettings((current) => ({ ...current, openaiImageModel: model }))
              }
            />

            {kindNotice && (
              <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs flex items-start gap-2.5">
                <Info className="w-4 h-4 shrink-0 text-indigo-500 mt-0.5" />
                <div>
                  <p className="font-bold">Studio switched</p>
                  <p className="mt-0.5 text-[11px]">{kindNotice}</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                <div>
                  <p className="font-bold">Generation Error</p>
                  <p className="mt-0.5 text-[11px]">{error}</p>
                </div>
              </div>
            )}

            {/* Generate Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleGenerateImage}
                disabled={isGenerating || !imagePreviewUrl}
                title={`${shotPrice.perImage} · ${shotPrice.model}`}
                className={`w-full py-3.5 px-4 rounded-xl text-sm font-bold flex items-center gap-2 transition-all duration-150 cursor-pointer ${
                  isGenerating
                    ? 'justify-between bg-indigo-600/80 text-white cursor-not-allowed'
                    : !imagePreviewUrl
                    ? 'justify-between bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                    : 'justify-between bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white shadow-lg shadow-indigo-100'
                }`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white shrink-0" />
                    <span className="truncate">{generationStep || 'Rendering Studio Shot...'}</span>
                    <span className="shrink-0 tabular-nums text-[11px] font-bold tracking-tight px-2 py-0.5 rounded-md bg-white/20 text-white">
                      {formatElapsed(elapsedMs)}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="flex items-center gap-2 min-w-0">
                      <span className="truncate">Generate Professional Shot</span>
                      <Sparkles className="w-4 h-4 shrink-0" />
                    </span>
                    <span
                      className={`shrink-0 tabular-nums text-[11px] font-bold tracking-tight px-2 py-0.5 rounded-md ${
                        !imagePreviewUrl
                          ? 'bg-slate-200 text-slate-500'
                          : 'bg-white/20 text-white'
                      }`}
                    >
                      {shotPrice.label}
                    </span>
                  </>
                )}
              </button>

              <p className="text-center text-[11px] text-slate-400 mt-2 font-medium">
                {isGenerating
                  ? `Elapsed ${formatElapsed(elapsedMs)}`
                  : !imagePreviewUrl
                    ? `Upload a ${productKind === 'flowers' ? 'flower' : 'toy'} photo to start · ${shotPrice.perImage}`
                    : `${shotPrice.perImage} · ${shotPrice.model} · billed to your OpenAI key`}
              </p>
            </div>
          </section>

          {/* Right Column: Output / Live Result Area */}
          <section className="flex-1 w-full min-w-0 space-y-4" ref={resultRef}>
            <SessionGallery
              shots={shots}
              selectedId={result?.id ?? null}
              isGenerating={isGenerating}
              onSelect={handleSelectShot}
              onRemove={handleRemoveShot}
              onClearAll={handleClearAllShots}
            />

            {result ? (
              <ResultView
                result={result}
                onRegenerate={handleGenerateImage}
                isRegenerating={isGenerating}
                shotPriceLabel={shotPrice.label}
                elapsedMs={elapsedMs}
              />
            ) : isGenerating ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 sm:p-12 flex flex-col items-center justify-center text-center min-h-[460px] space-y-5">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm animate-pulse">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
                <div className="space-y-1.5 max-w-sm">
                  <h3 className="text-base font-bold text-slate-900">
                    Generating Studio Photography
                  </h3>
                  <p className="text-xs text-indigo-600 font-semibold animate-fade-in">
                    {generationStep || 'Simulating soft-box lighting & calibrated reflections...'}
                  </p>
                  <p className="text-2xl font-bold text-slate-900 tabular-nums pt-1">
                    {formatElapsed(elapsedMs)}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Time spent generating
                  </p>
                </div>
                <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full w-2/3 animate-pulse"></div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 flex flex-col items-center justify-center text-center min-h-[460px] space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                  <Sparkles className="w-7 h-7 text-slate-400" />
                </div>
                <div className="space-y-1 max-w-md">
                  <h3 className="text-base font-bold text-slate-800">
                    Studio Photo Preview Canvas
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Upload a {productKind === 'flowers' ? 'flower' : 'toy'} snapshot on the left, pick your photography style, and click <span className="font-semibold text-indigo-600">Generate Professional Shot</span> to get clean catalog and promo images.
                  </p>
                  {(selectedStyle === 'styled-promo' || selectedStyle === 'luxury-promo') && (
                    <p className="text-[11px] text-slate-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 leading-relaxed">
                      Promo prints the product name and a short selling line on the photo, so a name is required. Catalog stays text-free.
                    </p>
                  )}
                </div>

                {imagePreviewUrl && (
                  <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Photo ready for "{productName || (productKind === 'flowers' ? 'Bouquet' : 'Toy')}" • Click Generate to render
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </main>

      <footer className="mt-auto border-t border-slate-200 py-4 text-center text-xs text-slate-400 bg-white">
        <p>PhotoStudioAI</p>
      </footer>

      <SettingsSheet
        open={settingsOpen}
        settings={apiSettings}
        onSettingsChange={setApiSettings}
        onOpenStyleRefs={() => {
          setSettingsOpen(false);
          setStyleRefManagerOpen(true);
        }}
        onClose={() => setSettingsOpen(false)}
      />

      <StyleRefManager
        open={styleRefManagerOpen}
        onClose={() => setStyleRefManagerOpen(false)}
        onRefsChange={() => {
          setStyleRefsVersion((value) => value + 1);
          if (selectedStyleRefId && !findStyleRef(selectedStyleRefId)) {
            setSelectedStyleRefId(null);
          }
        }}
      />
    </div>
  );
}
