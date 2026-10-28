import {
  QUALITY_LINE,
  TIP_LINE,
  conflictRules,
  promptSteps,
  type Option,
  type PromptState,
  type Step,
} from '../../config/promptSteps';

const PRODUCT_STEP_ID = 'product';

export const countStep = promptSteps.find((step) => step.type === 'count');

export function createInitialState(): PromptState {
  return {
    count: countStep?.counts?.[0] ?? 1,
    variable: countStep?.options?.[0]?.id ?? '',
    answers: {},
    texts: {},
  };
}

export const getStep = (stepId: string): Step | undefined =>
  promptSteps.find((step) => step.id === stepId);

export const isStepVisible = (step: Step, state: PromptState) => !step.showIf || step.showIf(state);

export const visibleSteps = (state: PromptState): Step[] =>
  promptSteps.filter((step) => isStepVisible(step, state));

/** Selected cards stay visible even when their showIf turns false, so the user can undo them. */
export function visibleOptions(step: Step, state: PromptState): Option[] {
  const selected = state.answers[step.id] ?? [];
  return (step.options ?? []).filter(
    (option) => !option.showIf || option.showIf(state) || selected.includes(option.id),
  );
}

export const isVariableStep = (step: Step, state: PromptState) =>
  state.count > 1 && !!step.canBeVariable && state.variable === step.id;

export function selectionCap(step: Step, state: PromptState): number {
  if (step.type === 'multi') return Infinity;
  return isVariableStep(step, state) ? state.count : 1;
}

export const isTextFieldVisible = (step: Step, state: PromptState) =>
  !!step.textField && (!step.textField.showIf || step.textField.showIf(state));

export function isStepValid(step: Step, state: PromptState): boolean {
  if (step.type === 'count') {
    return state.count === 1 || !!countStep?.options?.some((option) => option.id === state.variable);
  }
  const picked = state.answers[step.id] ?? [];
  if (step.type === 'text') {
    return !!step.optional || !!state.texts[step.id]?.trim();
  }
  if (isVariableStep(step, state)) return picked.length === state.count;
  return !!step.optional || picked.length > 0;
}

export const canSkipStep = (step: Step, state: PromptState) =>
  !!step.optional && !isVariableStep(step, state);

/** Trim every answer list to what the step allows and drop ids that no longer exist. */
function clampAnswers(state: PromptState): PromptState {
  const answers: Record<string, string[]> = {};
  for (const step of promptSteps) {
    const known = new Set((step.options ?? []).map((option) => option.id));
    const picked = (state.answers[step.id] ?? []).filter((id, i, all) => known.has(id) && all.indexOf(id) === i);
    const capped = picked.slice(0, selectionCap(step, state));
    if (capped.length > 0) answers[step.id] = capped;
  }
  return { ...state, answers };
}

/** Make an unknown value (a stored preset) into a valid state for the current config. */
export function sanitizeState(raw: unknown): PromptState {
  const base = createInitialState();
  if (!raw || typeof raw !== 'object') return base;
  const input = raw as Partial<PromptState>;

  const counts = countStep?.counts ?? [1];
  const count = counts.includes(input.count as number) ? (input.count as number) : base.count;
  const variable = countStep?.options?.some((option) => option.id === input.variable)
    ? (input.variable as string)
    : base.variable;

  const answers: Record<string, string[]> = {};
  if (input.answers && typeof input.answers === 'object') {
    for (const [stepId, ids] of Object.entries(input.answers)) {
      if (Array.isArray(ids)) answers[stepId] = ids.filter((id): id is string => typeof id === 'string');
    }
  }
  const texts: Record<string, string> = {};
  if (input.texts && typeof input.texts === 'object') {
    for (const [stepId, text] of Object.entries(input.texts)) {
      if (typeof text === 'string') texts[stepId] = text;
    }
  }
  return clampAnswers({ count, variable, answers, texts });
}

export const setCount = (state: PromptState, count: number): PromptState =>
  clampAnswers({ ...state, count });

export const setVariable = (state: PromptState, variable: string): PromptState =>
  clampAnswers({ ...state, variable });

export const setText = (state: PromptState, stepId: string, value: string): PromptState => ({
  ...state,
  texts: { ...state.texts, [stepId]: value },
});

export function clearStep(state: PromptState, step: Step): PromptState {
  const { [step.id]: _answer, ...answers } = state.answers;
  const { [step.id]: _text, ...texts } = state.texts;
  return { ...state, answers, texts };
}

/** Preselect other steps from an option's `defaults`. A step that is the set's variable is left alone. */
function applyDefaults(state: PromptState, defaults: Record<string, string>): PromptState {
  const answers = { ...state.answers };
  for (const [stepId, optionId] of Object.entries(defaults)) {
    const step = getStep(stepId);
    if (!step || isVariableStep(step, state)) continue;
    if (step.options?.some((option) => option.id === optionId)) answers[stepId] = [optionId];
  }
  return { ...state, answers };
}

export function toggleOption(state: PromptState, step: Step, optionId: string): PromptState {
  const current = state.answers[step.id] ?? [];
  const cap = selectionCap(step, state);

  if (current.includes(optionId)) {
    // Single choice: tapping the picked card keeps it (a prefilled default is not undone by accident). Skip clears it.
    if (cap === 1) return state;
    const { [step.id]: _removed, ...answers } = state.answers;
    const rest = current.filter((id) => id !== optionId);
    return { ...state, answers: rest.length ? { ...answers, [step.id]: rest } : answers };
  }
  if (cap > 1 && current.length >= cap) return state;

  const picked = cap === 1 ? [optionId] : [...current, optionId];
  const next = { ...state, answers: { ...state.answers, [step.id]: picked } };
  const defaults = step.options?.find((option) => option.id === optionId)?.defaults;
  return defaults ? applyDefaults(next, defaults) : next;
}

export function findConflicts(state: PromptState): string[] {
  return conflictRules.filter((rule) => rule.test(state)).map((rule) => rule.message);
}

// ---------------------------------------------------------------- prompt text

/** Collapse whitespace and stray commas so the prompt never has "a,, b" or "a ,b". */
function tidy(text: string): string {
  return text
    .replace(/[ \t]+/g, ' ')
    .replace(/\s+([,.;:])/g, '$1')
    .replace(/([,;])(\s*[,;])+/g, '$1')
    .replace(/,\s*\./g, '.')
    .replace(/ *\n */g, '\n')
    .trim();
}

const userText = (value: string | undefined) =>
  tidy((value ?? '').replace(/\s*\n\s*/g, ' ')).replace(/^[,.;\s]+|[,;\s]+$/g, '');

function phraseFor(step: Step, option: Option, state: PromptState): string {
  const text = isTextFieldVisible(step, state) ? userText(state.texts[step.id]) : '';
  if (option.phrase.includes('{text}')) {
    return tidy(option.phrase.replace('{text}', text || step.textField?.fallback || ''));
  }
  return tidy([option.phrase, text].filter(Boolean).join(', '));
}

function selectedPhrases(step: Step, state: PromptState): string[] {
  const options = step.options ?? [];
  const phrases = (state.answers[step.id] ?? [])
    .map((id) => options.find((option) => option.id === id))
    .filter((option): option is Option => !!option)
    .map((option) => phraseFor(step, option, state));
  if (options.length === 0 && step.type === 'text') phrases.push(userText(state.texts[step.id]));
  return phrases.filter(Boolean);
}

export function variableLabel(state: PromptState): string {
  return countStep?.options?.find((option) => option.id === state.variable)?.phrase ?? 'camera angle';
}

/** Option phrases of the varying step, in the order the user picked them. */
export function variableValues(state: PromptState): string[] {
  const step = getStep(state.variable);
  if (!step) return [];
  const values = selectedPhrases({ ...step, textField: undefined }, state);
  return Array.from({ length: state.count }, (_, i) => values[i] ?? '');
}

function productNoun(state: PromptState): string {
  const step = getStep(PRODUCT_STEP_ID);
  const option = step?.options?.find((o) => o.id === state.answers[PRODUCT_STEP_ID]?.[0]);
  return option?.phrase || 'product';
}

function sharedItems(state: PromptState): string[] {
  const varying = state.count > 1 ? state.variable : undefined;
  const inPrompt = promptSteps.filter(
    (step) => step.type !== 'count' && step.id !== varying && isStepVisible(step, state),
  );
  return [...inPrompt.filter((step) => !step.promptLast), ...inPrompt.filter((step) => step.promptLast)]
    .flatMap((step) => selectedPhrases(step, state));
}

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

export type PromptBlock = { label?: string; text: string };
export type PromptTab = {
  id: string;
  title: string;
  hint?: string;
  /** Prompt parts, each shown with its own Copy button when there is more than one. */
  blocks: PromptBlock[];
  /** Everything the tab's Copy button puts on the clipboard. */
  text: string;
};

export function buildPrompts(state: PromptState): PromptTab[] {
  const noun = productNoun(state);
  const items = sharedItems(state);
  const description = items.length ? `Shared description: ${items.join(', ')}.` : '';
  const quality = QUALITY_LINE;

  if (state.count <= 1) {
    const text = tidy(
      [`Create an image of the ${noun}.`, description.replace('Shared description', 'Description'), quality]
        .filter(Boolean)
        .join('\n'),
    );
    return [{ id: 'single', title: 'Prompt', blocks: [{ text }], text: `${text}\n\n${TIP_LINE}` }];
  }

  const label = variableLabel(state);
  const values = variableValues(state).map((value) => value || '(not chosen yet)');

  const oneMessage = [
    `Create ${state.count} separate images of the same ${noun} in the same scene.`,
    'Keep the product, background, lighting, person and style identical in every image.',
    `Change only the ${label}.`,
    '',
    description,
    quality,
    '',
    ...values.map((value, i) => `Image ${i + 1}: ${value}`),
  ]
    .filter((line, i, all) => line !== '' || (all[i - 1] !== '' && i > 0))
    .join('\n');

  const stepByStep: PromptBlock[] = values.map((value, i) => ({
    label: `Prompt ${i + 1}`,
    text:
      i === 0
        ? tidy(
            [
              `Create an image of the ${noun}.`,
              `${capitalize(label)}: ${value}.`,
              description.replace('Shared description', 'Description'),
              quality,
            ]
              .filter(Boolean)
              .join('\n'),
          )
        : `Same product, same scene, same lighting and style as the previous image. Change only the ${label} to: ${value}. Keep everything else identical.`,
  }));

  return [
    {
      id: 'one-message',
      title: 'One message',
      hint: 'Paste once. ChatGPT makes the whole set.',
      blocks: [{ text: tidy(oneMessage) }],
      text: `${tidy(oneMessage)}\n\n${TIP_LINE}`,
    },
    {
      id: 'step-by-step',
      title: 'Step by step',
      hint: 'More consistent. Paste one by one in the same ChatGPT chat.',
      blocks: stepByStep,
      text: `${stepByStep.map((block) => `${block.label}:\n${block.text}`).join('\n\n')}\n\n${TIP_LINE}`,
    },
  ];
}

/** One line per answered, visible step, for the review screen. */
export function summarize(state: PromptState): { step: Step; value: string }[] {
  return visibleSteps(state).flatMap((step) => {
    if (step.type === 'count') {
      const value =
        state.count === 1
          ? '1 image'
          : `${state.count} images, changing ${countStep?.options?.find((o) => o.id === state.variable)?.label.toLowerCase() ?? ''}`;
      return [{ step, value }];
    }
    const labels = (state.answers[step.id] ?? [])
      .map((id) => step.options?.find((option) => option.id === id)?.label)
      .filter((label): label is string => !!label);
    const text = isTextFieldVisible(step, state) ? userText(state.texts[step.id]) : '';
    const value = [labels.join(' · '), text].filter(Boolean).join(' — ');
    return value ? [{ step, value }] : [];
  });
}
