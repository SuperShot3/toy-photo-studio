import React from 'react';
import { MAX_IMAGES, roles, type PromptState } from '../../config/promptSteps';
import { getRole } from './logic';

interface SetStepProps {
  state: PromptState;
  onCount: (count: number) => void;
  onRole: (index: number, roleId: string) => void;
}

const COUNTS = Array.from({ length: MAX_IMAGES }, (_, i) => i + 1);

export const SetStep: React.FC<SetStepProps> = ({ state, onCount, onRole }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Number of images">
      {COUNTS.map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={state.shots.length === n}
          onClick={() => onCount(n)}
          className={`rounded-2xl border-2 py-4 text-2xl font-extrabold transition-all cursor-pointer ${
            state.shots.length === n
              ? 'border-rose-500 bg-rose-50 text-rose-700 ring-2 ring-rose-200'
              : 'border-slate-200 bg-white text-slate-600 hover:border-rose-300'
          }`}
        >
          {n}
        </button>
      ))}
    </div>

    <ul className="space-y-3">
      {state.shots.map((shot, i) => (
        <li key={i} className="space-y-2.5 rounded-2xl border border-slate-200 bg-white p-3.5">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-sm font-bold text-slate-800">Image {i + 1}</h3>
            <span className="min-w-0 truncate text-xs text-slate-500">{getRole(shot.role)?.hint}</span>
          </div>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={`Role of image ${i + 1}`}>
            {roles.map((role) => (
              <button
                key={role.id}
                type="button"
                role="radio"
                aria-checked={shot.role === role.id}
                onClick={() => onRole(i, role.id)}
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
        </li>
      ))}
    </ul>
    <p className="text-xs text-slate-500">
      Each role fills in a scene, camera and person for you. You can change every detail on the next screens.
    </p>
  </div>
);
