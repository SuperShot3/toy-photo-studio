import React, { useRef, useState } from 'react';
import type { PromptState, Step } from '../../config/promptSteps';
import { TIP_LINE } from '../../config/promptSteps';
import { CopyButton } from './CopyButton';
import { PresetsPanel } from './PresetsPanel';
import { buildPrompts, summarize, type PromptBlock } from './logic';

interface ReviewStepProps {
  state: PromptState;
  onJump: (stepId: string) => void;
  onLoadPreset: (state: PromptState) => void;
}

const PromptText: React.FC<{ block: PromptBlock; showCopy: boolean }> = ({ block, showCopy }) => {
  const ref = useRef<HTMLPreElement>(null);
  return (
    <div className="space-y-2">
      {(block.label || showCopy) && (
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{block.label}</span>
          {showCopy && <CopyButton text={block.text} targetRef={ref} size="sm" />}
        </div>
      )}
      <pre
        ref={ref}
        className="whitespace-pre-wrap break-words rounded-xl border border-slate-200 bg-white p-3.5 font-sans text-sm leading-relaxed text-slate-800 select-text"
      >
        {block.text}
      </pre>
    </div>
  );
};

export const ReviewStep: React.FC<ReviewStepProps> = ({ state, onJump, onLoadPreset }) => {
  const tabs = buildPrompts(state);
  const [activeId, setActiveId] = useState(tabs[0].id);
  const active = tabs.find((tab) => tab.id === activeId) ?? tabs[0];
  const allRef = useRef<HTMLDivElement>(null);
  const fullRef = useRef<HTMLPreElement>(null);
  const multiBlock = active.blocks.length > 1;

  return (
    <div className="space-y-6">
      <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
        {summarize(state).map(({ step, value }: { step: Step; value: string }) => (
          <li key={step.id}>
            <button
              type="button"
              onClick={() => onJump(step.id)}
              className="flex w-full items-baseline gap-3 px-4 py-2.5 text-left transition-colors hover:bg-rose-50 cursor-pointer"
            >
              <span className="w-24 shrink-0 text-xs font-bold uppercase tracking-wider text-slate-400">
                {step.title}
              </span>
              <span className="min-w-0 flex-1 text-sm text-slate-700">{value}</span>
              <span className="text-xs font-bold text-rose-600">Edit</span>
            </button>
          </li>
        ))}
      </ul>

      <div className="space-y-4">
        {tabs.length > 1 && (
          <div role="tablist" className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={tab.id === active.id}
                onClick={() => setActiveId(tab.id)}
                className={`rounded-lg px-3 py-2 text-sm font-bold transition-colors cursor-pointer ${
                  tab.id === active.id ? 'bg-white text-rose-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.title}
              </button>
            ))}
          </div>
        )}

        {active.hint && <p className="text-xs text-slate-500">{active.hint}</p>}

        {multiBlock ? (
          <div ref={allRef} className="space-y-4">
            {active.blocks.map((block) => (
              <PromptText key={block.label} block={block} showCopy />
            ))}
            <p className="rounded-xl bg-amber-50 px-3.5 py-2.5 text-sm text-amber-900 select-text">{TIP_LINE}</p>
          </div>
        ) : (
          // The visible text is exactly what Copy puts on the clipboard (prompt + tip line).
          <pre
            ref={fullRef}
            className="whitespace-pre-wrap break-words rounded-xl border border-slate-200 bg-white p-3.5 font-sans text-sm leading-relaxed text-slate-800 select-text"
          >
            {active.text}
          </pre>
        )}

        <CopyButton
          text={active.text}
          targetRef={multiBlock ? allRef : fullRef}
          label={multiBlock ? 'Copy all prompts' : 'Copy prompt'}
        />
      </div>

      <PresetsPanel state={state} showList={false} onLoad={onLoadPreset} />
    </div>
  );
};
