import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp, Flower2, RotateCcw, TriangleAlert } from 'lucide-react';
import { REVIEW_TITLE, type PromptState } from '../../config/promptSteps';
import { PresetsPanel } from './PresetsPanel';
import { ReviewStep } from './ReviewStep';
import { StepView } from './StepView';
import {
  buildPrompts,
  canSkipStep,
  clearStep,
  createInitialState,
  findConflicts,
  getStep,
  isStepValid,
  isVariableStep,
  selectionCap,
  setCount,
  setText,
  setVariable,
  toggleOption,
  visibleSteps,
} from './logic';

const REVIEW_ID = 'review';

export default function PromptBuilderPage() {
  const [state, setState] = useState<PromptState>(createInitialState);
  const [currentId, setCurrentId] = useState<string>(() => visibleSteps(createInitialState())[0].id);
  const [visited, setVisited] = useState<Set<string>>(() => new Set([currentId]));
  const [previewOpen, setPreviewOpen] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px) and (min-height: 760px)').matches,
  );
  const activeChip = useRef<HTMLButtonElement | null>(null);

  const steps = useMemo(() => visibleSteps(state), [state]);
  const items = useMemo(
    () => [...steps.map((s) => ({ id: s.id, title: s.title })), { id: REVIEW_ID, title: REVIEW_TITLE }],
    [steps],
  );
  const currentIndex = Math.max(0, items.findIndex((item) => item.id === currentId));
  const step = currentId === REVIEW_ID ? undefined : getStep(currentId);
  const isReview = currentId === REVIEW_ID;
  const conflicts = useMemo(() => findConflicts(state), [state]);
  const livePrompt = useMemo(() => buildPrompts(state)[0].blocks[0].text, [state]);

  useEffect(() => {
    activeChip.current?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    window.scrollTo({ top: 0 });
  }, [currentId]);

  const goTo = (id: string) => {
    setCurrentId(id);
    setVisited((prev) => new Set(prev).add(id));
  };
  const goNext = () => items[currentIndex + 1] && goTo(items[currentIndex + 1].id);
  const goBack = () => items[currentIndex - 1] && goTo(items[currentIndex - 1].id);

  const handleSkip = () => {
    if (step) setState((prev) => clearStep(prev, step));
    goNext();
  };

  const handleStartOver = () => {
    const hasProgress = Object.keys(state.answers).length > 0 || Object.values(state.texts).some(Boolean);
    if (hasProgress && !window.confirm('Start over? Your current choices will be cleared.')) return;
    const first = steps[0].id;
    setState(createInitialState());
    setVisited(new Set([first]));
    setCurrentId(first);
  };

  const handleLoadPreset = (loaded: PromptState) => {
    setState(loaded);
    const all = new Set(visibleSteps(loaded).map((s) => s.id));
    all.add(REVIEW_ID);
    setVisited(all);
    setCurrentId(REVIEW_ID);
  };

  const valid = step ? isStepValid(step, state) : true;
  const showSkip = !!step && canSkipStep(step, state);
  const needsExact = !!step && isVariableStep(step, state);
  const needed = step ? selectionCap(step, state) : 0;
  const pickedCount = step ? (state.answers[step.id]?.length ?? 0) : 0;

  return (
    <div className="min-h-dvh bg-rose-50/40 text-slate-800">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-4xl items-center gap-3 px-4">
          <a
            href="/"
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100"
            aria-label="Back to PhotoStudioAI"
          >
            <ArrowLeft className="h-5 w-5" />
          </a>
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-rose-500 text-white">
              <Flower2 className="h-4 w-4" />
            </span>
            <h1 className="truncate text-base font-bold tracking-tight text-slate-900 sm:text-lg">
              <span className="hidden sm:inline">Lanna Bloom </span>Prompt Builder
            </h1>
          </div>
          <button
            type="button"
            onClick={handleStartOver}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Start over
          </button>
        </div>

        <nav aria-label="Steps" className="border-t border-slate-100">
          <ol className="mx-auto flex max-w-4xl gap-1.5 overflow-x-auto px-4 py-2 [scrollbar-width:none]">
            {items.map((item, index) => {
              const isCurrent = index === currentIndex;
              const reachable = visited.has(item.id) || index < currentIndex;
              const stepDef = getStep(item.id);
              const done = !isCurrent && index < currentIndex && (!stepDef || isStepValid(stepDef, state));
              return (
                <li key={item.id} className="shrink-0">
                  <button
                    type="button"
                    ref={isCurrent ? activeChip : undefined}
                    disabled={!reachable}
                    aria-current={isCurrent ? 'step' : undefined}
                    onClick={() => goTo(item.id)}
                    className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                      isCurrent
                        ? 'bg-rose-600 text-white'
                        : done
                          ? 'bg-rose-100 text-rose-700 hover:bg-rose-200 cursor-pointer'
                          : reachable
                            ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer'
                            : 'bg-slate-100 text-slate-300'
                    }`}
                  >
                    {index + 1}. {item.title}
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-4 pb-64 pt-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-rose-600">
            Step {currentIndex + 1} of {items.length}
          </p>
          <h2 className="mt-1 font-display text-2xl font-bold text-slate-900">
            {step ? step.question : 'Your prompt is ready'}
          </h2>
          {isReview && <p className="mt-1 text-sm text-slate-500">Copy it into ChatGPT. Tap a row to change a choice.</p>}
        </div>

        {step && (
          <StepView
            key={step.id}
            step={step}
            state={state}
            onToggle={(optionId) => setState((prev) => toggleOption(prev, step, optionId))}
            onCount={(count) => setState((prev) => setCount(prev, count))}
            onVariable={(stepId) => setState((prev) => setVariable(prev, stepId))}
            onText={(value) => setState((prev) => setText(prev, step.id, value))}
          />
        )}

        {isReview && <ReviewStep state={state} onJump={goTo} onLoadPreset={handleLoadPreset} />}

        {currentIndex === 0 && !isReview && <PresetsPanel state={state} onLoad={handleLoadPreset} />}

        {conflicts.length > 0 && (
          <div role="status" className="space-y-1.5 rounded-xl border border-amber-300 bg-amber-50 p-3.5">
            {conflicts.map((message) => (
              <p key={message} className="flex items-start gap-2 text-sm text-amber-900">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                {message}
              </p>
            ))}
          </div>
        )}
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(15,23,42,0.06)]">
        <div className="mx-auto max-w-4xl px-4">
          {!isReview && (
            <div className="border-b border-slate-100 py-2">
              <button
                type="button"
                onClick={() => setPreviewOpen((open) => !open)}
                aria-expanded={previewOpen}
                className="flex w-full items-center gap-2 text-left cursor-pointer"
              >
                <span className="shrink-0 text-xs font-bold uppercase tracking-wider text-slate-500">Live prompt</span>
                {!previewOpen && <span className="min-w-0 flex-1 truncate text-xs text-slate-400">{livePrompt}</span>}
                <span className="ml-auto shrink-0 text-slate-400">
                  {previewOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                </span>
              </button>
              {previewOpen && (
                <pre className="mt-2 max-h-36 overflow-y-auto whitespace-pre-wrap break-words rounded-lg bg-slate-50 p-2.5 font-sans text-xs leading-relaxed text-slate-600">
                  {livePrompt}
                </pre>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 py-3">
            <button
              type="button"
              onClick={goBack}
              disabled={currentIndex === 0}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
            >
              Back
            </button>
            <div className="flex-1" />
            {needsExact && !valid && (
              <span className="text-xs font-semibold text-rose-600">
                {pickedCount} of {needed}
              </span>
            )}
            {showSkip && (
              <button
                type="button"
                onClick={handleSkip}
                className="rounded-xl px-4 py-3 text-sm font-bold text-slate-500 transition-colors hover:bg-slate-100 cursor-pointer"
              >
                Skip
              </button>
            )}
            {!isReview && (
              <button
                type="button"
                onClick={goNext}
                disabled={!valid}
                className="rounded-xl bg-rose-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 cursor-pointer"
              >
                {currentIndex === items.length - 2 ? 'Review' : 'Next'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
