import React from 'react';
import type { PromptState, Step, StepContext } from '../../config/promptSteps';
import { OptionCard } from './OptionCard';
import { isTextFieldVisible, visibleOptions } from './logic';

const GRID = 'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4';

interface StepFieldsProps {
  step: Step;
  /** The answers this step reads and writes: the shared ones, or an image's own over the shared. */
  ctx: StepContext;
  onToggle: (optionId: string) => void;
  onText: (value: string) => void;
}

/** Option cards plus the step's text field. Used by shared steps and by each image's rows. */
export const StepFields: React.FC<StepFieldsProps> = ({ step, ctx, onToggle, onText }) => {
  const picked = ctx.answers[step.id] ?? [];
  const options = visibleOptions(step, ctx);
  const showText = isTextFieldVisible(step, ctx);

  return (
    <div className="space-y-5">
      {options.length > 0 && (
        <div className={GRID}>
          {options.map((option) => (
            <OptionCard
              key={option.id}
              option={option}
              selected={picked.includes(option.id)}
              onClick={() => onToggle(option.id)}
            />
          ))}
        </div>
      )}

      {(showText || step.type === 'text') && step.textField && (
        <label className="block space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{step.textField.label}</span>
          {step.textField.multiline ? (
            <textarea
              value={ctx.texts[step.id] ?? ''}
              onChange={(e) => onText(e.target.value)}
              placeholder={step.textField.placeholder}
              rows={3}
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-slate-800 placeholder:text-slate-400 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
            />
          ) : (
            <input
              type="text"
              value={ctx.texts[step.id] ?? ''}
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

interface StepViewProps {
  step: Step;
  state: PromptState;
  onToggle: (optionId: string) => void;
  onText: (value: string) => void;
}

export const StepView: React.FC<StepViewProps> = ({ step, state, onToggle, onText }) => (
  <StepFields step={step} ctx={state} onToggle={onToggle} onText={onText} />
);
