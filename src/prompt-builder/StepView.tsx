import React from 'react';
import type { PromptState, Step } from '../../config/promptSteps';
import { OptionCard } from './OptionCard';
import {
  countStep,
  imageHasPerson,
  isTextFieldVisible,
  isVariableStep,
  personChooserStep,
  selectionCap,
  variableLabels,
  visibleOptions,
} from './logic';
import { hasPerson } from '../../config/promptSteps';

interface StepViewProps {
  step: Step;
  state: PromptState;
  onToggle: (optionId: string) => void;
  onCount: (count: number) => void;
  onVariable: (stepId: string) => void;
  onTogglePersonImage: (index: number) => void;
  onText: (value: string) => void;
}

const GRID = 'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4';

export const StepView: React.FC<StepViewProps> = ({
  step,
  state,
  onToggle,
  onCount,
  onVariable,
  onTogglePersonImage,
  onText,
}) => {
  const picked = state.answers[step.id] ?? [];
  const cap = selectionCap(step, state);
  const variable = isVariableStep(step, state);
  const full = cap > 1 && picked.length >= cap;

  if (step.type === 'count') {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Number of images">
          {(step.counts ?? []).map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={state.count === n}
              onClick={() => onCount(n)}
              className={`rounded-2xl border-2 py-4 text-2xl font-extrabold transition-all cursor-pointer ${
                state.count === n
                  ? 'border-rose-500 bg-rose-50 text-rose-700 ring-2 ring-rose-200'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-rose-300'
              }`}
            >
              {n}
            </button>
          ))}
        </div>

        {state.count > 1 && (
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800">What changes between the images?</h3>
              <p className="text-xs text-slate-500">Only one thing changes. Everything else stays identical.</p>
            </div>
            <div className={GRID}>
              {(countStep?.options ?? []).map((option) => (
                <OptionCard
                  key={option.id}
                  option={option}
                  selected={state.variable === option.id}
                  onClick={() => onVariable(option.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  const options = visibleOptions(step, state);
  const showText = isTextFieldVisible(step, state);
  const perImage = !!step.perImagePerson && state.count > 1 && hasPerson(state);
  const labels = variableLabels(state);

  return (
    <div className="space-y-5">
      {variable && (
        <div
          className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-bold ${
            picked.length === cap ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
          }`}
          aria-live="polite"
        >
          <span>
            {picked.length} of {cap} selected
          </span>
          <span className="text-xs font-medium opacity-80">
            {full ? 'Tap a selected card to swap it' : `Pick ${cap} (the order is the image order)`}
          </span>
        </div>
      )}

      {options.length > 0 && (
        <div className={GRID}>
          {options.map((option) => {
            const index = picked.indexOf(option.id);
            return (
              <OptionCard
                key={option.id}
                option={option}
                selected={index >= 0}
                order={cap > 1 ? index + 1 : undefined}
                disabled={full && index < 0}
                onClick={() => onToggle(option.id)}
              />
            );
          })}
        </div>
      )}

      {perImage && step.id === personChooserStep?.id && (
        <div className="space-y-2.5 rounded-xl border border-slate-200 bg-white p-3.5">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Which images include the person?</h3>
            <p className="text-xs text-slate-500">
              Switch off the images that should show only the product. Keep at least one.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {Array.from({ length: state.count }, (_, i) => {
              const on = imageHasPerson(state, i);
              return (
                <button
                  key={i}
                  type="button"
                  role="switch"
                  aria-checked={on}
                  onClick={() => onTogglePersonImage(i)}
                  className={`rounded-xl border-2 px-3 py-2.5 text-left transition-all cursor-pointer ${
                    on
                      ? 'border-rose-500 bg-rose-50 text-rose-700'
                      : 'border-slate-200 bg-white text-slate-400 hover:border-rose-300'
                  }`}
                >
                  <span className="block text-sm font-extrabold">Image {i + 1}</span>
                  {labels[i] && <span className="block truncate text-xs font-medium opacity-80">{labels[i]}</span>}
                  <span className="mt-1 block text-xs font-bold">{on ? 'With person' : 'No person'}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {perImage && step.id !== personChooserStep?.id && state.withoutPerson.length > 0 && (
        <p className="rounded-xl bg-slate-100 px-3.5 py-2.5 text-xs font-medium text-slate-600">
          This only applies to the images with the person (change that on the Person step).
        </p>
      )}

      {(showText || step.type === 'text') && step.textField && (
        <label className="block space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{step.textField.label}</span>
          {step.textField.multiline ? (
            <textarea
              value={state.texts[step.id] ?? ''}
              onChange={(e) => onText(e.target.value)}
              placeholder={step.textField.placeholder}
              rows={3}
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-slate-800 placeholder:text-slate-400 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
            />
          ) : (
            <input
              type="text"
              value={state.texts[step.id] ?? ''}
              onChange={(e) => onText(e.target.value)}
              placeholder={step.textField.placeholder}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-slate-800 placeholder:text-slate-400 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
            />
          )}
        </label>
      )}
    </div>
  );
};
