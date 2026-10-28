import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { roles, type PromptState, type Step } from '../../config/promptSteps';
import { StepFields } from './StepView';
import { canSkipStep, getRole, shotContext, visibleShotSteps } from './logic';

interface ShotViewProps {
  state: PromptState;
  index: number;
  onToggle: (step: Step, optionId: string) => void;
  onText: (step: Step, value: string) => void;
  onClear: (step: Step) => void;
  onRole: (roleId: string) => void;
}

/** One image: its role and a row per setting. Tap a row to see the cards and change it. */
export const ShotView: React.FC<ShotViewProps> = ({ state, index, onToggle, onText, onClear, onRole }) => {
  const [openId, setOpenId] = useState<string | null>(null);
  const shot = state.shots[index];
  const ctx = shotContext(state, index);
  const steps = visibleShotSteps(state, index);

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Role of this image">
          {roles.map((role) => (
            <button
              key={role.id}
              type="button"
              role="radio"
              aria-checked={shot.role === role.id}
              onClick={() => onRole(role.id)}
              className={`rounded-full border-2 px-3.5 py-1.5 text-sm font-bold transition-colors cursor-pointer ${
                shot.role === role.id
                  ? 'border-rose-500 bg-rose-50 text-rose-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-rose-300'
              }`}
            >
              {role.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-500">
          {getRole(shot.role)?.hint}. Changing the role resets this image's settings.
        </p>
      </div>

      <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {steps.map((step) => {
          const picked = ctx.answers[step.id]?.[0];
          const option = step.options?.find((o) => o.id === picked);
          const open = openId === step.id;
          return (
            <li key={step.id}>
              <button
                type="button"
                onClick={() => setOpenId(open ? null : step.id)}
                aria-expanded={open}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-rose-50 cursor-pointer"
              >
                <span className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-rose-50">
                  {option && (
                    <img
                      src={option.image}
                      alt=""
                      draggable={false}
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                      className="h-full w-full object-cover"
                    />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">{step.title}</span>
                  <span className={`block truncate text-sm ${option ? 'font-semibold text-slate-800' : 'text-slate-400'}`}>
                    {option?.label ?? 'Not set'}
                  </span>
                </span>
                {open ? (
                  <ChevronUp className="h-4 w-4 shrink-0 text-slate-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
                )}
              </button>

              {open && (
                <div className="space-y-3 border-t border-slate-100 bg-slate-50/60 p-3">
                  <p className="text-sm font-bold text-slate-700">{step.question}</p>
                  <StepFields
                    step={step}
                    ctx={ctx}
                    onToggle={(optionId) => {
                      onToggle(step, optionId);
                      // Steps with a text field stay open so the text can be typed.
                      if (!step.textField) setOpenId(null);
                    }}
                    onText={(value) => onText(step, value)}
                  />
                  {canSkipStep(step) && picked && (
                    <button
                      type="button"
                      onClick={() => {
                        onClear(step);
                        setOpenId(null);
                      }}
                      className="text-xs font-bold text-slate-500 underline-offset-2 hover:underline cursor-pointer"
                    >
                      Clear this setting
                    </button>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
