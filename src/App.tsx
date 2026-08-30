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
import { ResultView } from './components/ResultView';
import { ApiSettingsPanel } from './components/ApiSettingsPanel';
import { ImageStyle, PersonScale, GeneratedResult, ImprovedDescriptionResponse, SampleToy, ApiSettings } from './types';
import { loadApiSettings, saveApiSettings, getActiveApiKey, isApiKeyConfigured } from './utils/apiSettings';
import { Sparkles, ArrowRight, Loader2, AlertCircle, ShieldCheck, CheckCircle, Zap } from 'lucide-react';

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
  const [description, setDescription] = useState<string>('');

  // Style and scale selections
  const [selectedStyle, setSelectedStyle] = useState<ImageStyle>('clean-catalog');
  const [selectedScale, setSelectedScale] = useState<PersonScale>('none');

  // Generation states
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GeneratedResult | null>(null);

  const resultRef = useRef<HTMLDivElement>(null);

  // Handle image selection
  const handleImageSelected = (base64Url: string, fileMimeType: string, sampleData?: SampleToy) => {
    setImagePreviewUrl(base64Url);
    setMimeType(fileMimeType);
    setError(null);

    // Auto-populate fields if sample toy was picked and user hasn't typed anything yet
    if (sampleData) {
      if (!productName) setProductName(sampleData.name);
      if (!toySizeCm || toySizeCm === '25') setToySizeCm(sampleData.sizeCm.toString());
      if (!description) setDescription(sampleData.description);
    }
  };

  const handleClearImage = () => {
    setImagePreviewUrl(null);
    setResult(null);
  };

  const handleApplyImprovedCopy = (improved: ImprovedDescriptionResponse) => {
    if (improved.productTitle) setProductName(improved.productTitle);
    if (improved.productDescription) setDescription(improved.productDescription);
  };

  // Main Generate Image Action
  const handleGenerateImage = async () => {
    if (!imagePreviewUrl) {
      setError('Please upload a toy photo before generating.');
      return;
    }

    if (!productName.trim()) {
      setError('Please enter a product name for your toy.');
      return;
    }

    if (!isApiKeyConfigured(apiSettings)) {
      setError(`Please add your ${apiSettings.provider === 'openai' ? 'OpenAI' : 'Gemini'} API key in the settings panel above.`);
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGenerationStep('Analyzing toy features, materials & proportions...');

    // Progress animation timers for user feedback
    const t1 = setTimeout(() => {
      setGenerationStep('Building virtual studio lighting & shadow physics...');
    }, 2000);

    const t2 = setTimeout(() => {
      setGenerationStep('Rendering e-commerce studio shot with exact toy preservation...');
    }, 4500);

    try {
      const response = await fetch('/api/generate-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imagePreviewUrl,
          mimeType: mimeType || 'image/jpeg',
          productName: productName.trim(),
          toySizeCm: toySizeCm || '20',
          productDescription: description.trim(),
          style: selectedStyle,
          personScale: selectedScale,
          provider: apiSettings.provider,
          apiKey: getActiveApiKey(apiSettings),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate product photo. Please try again.');
      }

      const data = await response.json();

      const newResult: GeneratedResult = {
        imageUrl: data.imageUrl,
        originalImageUrl: imagePreviewUrl,
        productTitle: data.productTitle || productName,
        sellingLine: data.sellingLine || 'High quality toy crafted for memorable play.',
        marketingDescription: data.marketingDescription || description,
        style: selectedStyle,
        personScale: selectedScale,
        productName: productName,
        toySizeCm: toySizeCm,
        generatedAt: new Date().toISOString(),
      };

      setResult(newResult);

      // Smooth scroll to result
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    } catch (err: any) {
      console.error('Generation failed:', err);
      setError(err.message || 'An error occurred during generation.');
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800 selection:bg-indigo-500/20">
      <Header />

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

            <ApiSettingsPanel
              settings={apiSettings}
              onSettingsChange={setApiSettings}
            />

            {/* 1. Photo Upload */}
            <PhotoUploader
              imagePreviewUrl={imagePreviewUrl}
              onImageSelected={handleImageSelected}
              onClearImage={handleClearImage}
            />

            {/* 2. Product Details */}
            <ProductDetailsForm
              productName={productName}
              onProductNameChange={setProductName}
              toySizeCm={toySizeCm}
              onToySizeCmChange={setToySizeCm}
              description={description}
              onDescriptionChange={setDescription}
              imageBase64={imagePreviewUrl}
              mimeType={mimeType}
              onApplyImprovedCopy={handleApplyImprovedCopy}
              apiSettings={apiSettings}
            />

            {/* 3. Style Selection */}
            <StyleSelector
              selectedStyle={selectedStyle}
              onStyleSelect={setSelectedStyle}
            />

            {/* 4. Scale Reference Option */}
            <ScaleSelector
              selectedScale={selectedScale}
              onScaleSelect={setSelectedScale}
              toySizeCm={toySizeCm}
            />

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
                className={`w-full py-3.5 px-5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-150 cursor-pointer ${
                  isGenerating
                    ? 'bg-indigo-600/80 text-white cursor-not-allowed'
                    : !imagePreviewUrl
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                    : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white shadow-lg shadow-indigo-100'
                }`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>{generationStep || 'Rendering Studio Shot...'}</span>
                  </>
                ) : (
                  <>
                    <span>Generate Professional Shot</span>
                    <Sparkles className="w-4 h-4" />
                  </>
                )}
              </button>

              {!imagePreviewUrl && (
                <p className="text-center text-[11px] text-slate-400 mt-2 font-medium">
                  Upload photo or click a preset sample above to start
                </p>
              )}
            </div>
          </section>

          {/* Right Column: Output / Live Result Area */}
          <section className="flex-1 w-full min-w-0" ref={resultRef}>
            {result ? (
              <ResultView
                result={result}
                onRegenerate={handleGenerateImage}
                isRegenerating={isGenerating}
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
                  <p className="text-[11px] text-slate-400 pt-1">
                    Locking 1:1 subject geometry and material textures
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
                    Upload a toy snapshot on the left, pick your photography style, and click <span className="font-semibold text-indigo-600">Generate Professional Shot</span> to get clean catalog and promo images.
                  </p>
                </div>

                {imagePreviewUrl && (
                  <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Photo ready for "{productName || 'Toy'}" • Click Generate to render
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

        {/* Feature Guarantees Footer Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-slate-200/80 text-xs text-slate-500 mt-6">
          <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="font-medium text-slate-700">100% Subject Geometry Preserved</span>
          </div>
          <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium text-slate-700">Amazon & Shopify E-Commerce Ready</span>
          </div>
          <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <Zap className="w-4 h-4 text-slate-700 shrink-0" />
            <span className="font-medium text-slate-700">Instant SEO Title & Copywriter</span>
          </div>
        </div>
      </main>

      <footer className="mt-auto border-t border-slate-200 py-4 text-center text-xs text-slate-400 bg-white">
        <p>Toy Photo Studio • Sleek Interface</p>
      </footer>
    </div>
  );
}
