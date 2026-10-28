import {
  DEFAULT_IMAGE_COUNT,
  DEFAULT_ROLE_IDS,
  MAX_IMAGES,
  PERSON_SCALE_FALLBACK,
  PERSON_SCALE_SUFFIX,
  QUALITY_LINE,
  TIP_LINE,
  conflictRules,
  hasPerson,
  promptSteps,
  roles,
  type Option,
  type PromptState,
  type Role,
  type Shot,
  type Step,
  type StepContext,
} from '../../config/promptSteps';

const PRODUCT_STEP_ID = 'product';

export const SET_ID = 'set';
export const shotId = (index: number) => `shot-${index}`;
export const parseShotId = (id: string): number | undefined => {
  const match = /^shot-(\d+)$/.exec(id);
  return match ? Number(match[1]) : undefined;
};

export const getStep = (stepId: string): Step | undefined =>
  promptSteps.find((step) => step.id === stepId);

export const getRole = (roleId: string): Role | undefined => roles.find((role) => role.id === roleId);

const sharedSteps = promptSteps.filter((step) => step.scope !== 'shot');
const shotSteps = promptSteps.filter((step) => step.scope === 'shot');

export const isStepVisible = (step: Step, ctx: StepContext) => !step.showIf || step.showIf(ctx);

/** Steps asked once for the whole set. */
export const visibleSteps = (state: PromptState): Step[] =>
  sharedSteps.filter((step) => isStepVisible(step, state));

/** The shared answers with one image's own choices on top, so conditions see the whole picture. */
export function shotContext(state: PromptState, index: number): StepContext {
  const shot = state.shots[index];
  return {
    answers: { ...state.answers, ...(shot?.answers ?? {}) },
    texts: { ...state.texts, ...(shot?.texts ?? {}) },
  };
}

/** Steps shown on one image's screen. */
export const visibleShotSteps = (state: PromptState, index: number): Step[] => {
  const ctx = shotContext(state, index);
  return shotSteps.filter((step) => isStepVisible(step, ctx));
};

/** Selected options stay visible even when their showIf turns false, so the user can undo them. */
export function visibleOptions(step: Step, ctx: StepContext): Option[] {
  const selected = ctx.answers[step.id] ?? [];
  return (step.options ?? []).filter(
    (option) => !option.showIf || option.showIf(ctx) || selected.includes(option.id),
  );
}

export const isTextFieldVisible = (step: Step, ctx: StepContext) =>
  !!step.textField && (!step.textField.showIf || step.textField.showIf(ctx));

export function isStepValid(step: Step, state: PromptState): boolean {
  if (step.type === 'text') return !!step.optional || !!state.texts[step.id]?.trim();
  return !!step.optional || (state.answers[step.id]?.length ?? 0) > 0;
}

export const canSkipStep = (step: Step) => !!step.optional;

// ---------------------------------------------------------------- shots and state

/** A shot filled with a role's defaults. Unknown ids in the role are ignored. */
export function createShot(roleId: string): Shot {
  const role = getRole(roleId) ?? roles[0];
  const answers: Record<string, string[]> = {};
  for (const [stepId, optionId] of Object.entries(role.defaults)) {
    if (getStep(stepId)?.options?.some((option) => option.id === optionId)) answers[stepId] = [optionId];
  }
  return { role: role.id, answers, texts: {} };
}

export function createInitialState(): PromptState {
  return {
    answers: {},
    texts: {},
    shots: DEFAULT_ROLE_IDS.slice(0, DEFAULT_IMAGE_COUNT).map(createShot),
  };
}

/** Keep only known picks for the given steps. */
function cleanAnswers(raw: unknown, steps: Step[]): Record<string, string[]> {
  const answers: Record<string, string[]> = {};
  if (!raw || typeof raw !== 'object') return answers;
  const input = raw as Record<string, unknown>;
  for (const step of steps) {
    const ids = input[step.id];
    if (!Array.isArray(ids)) continue;
    const known = new Set((step.options ?? []).map((option) => option.id));
    const picked = ids.filter(
      (id, i, all): id is string => typeof id === 'string' && known.has(id) && all.indexOf(id) === i,
    );
    const capped = step.type === 'multi' ? picked : picked.slice(0, 1);
    if (capped.length > 0) answers[step.id] = capped;
  }
  return answers;
}

function cleanTexts(raw: unknown, steps: Step[]): Record<string, string> {
  const texts: Record<string, string> = {};
  if (!raw || typeof raw !== 'object') return texts;
  const input = raw as Record<string, unknown>;
  for (const step of steps) {
    if (typeof input[step.id] === 'string') texts[step.id] = input[step.id] as string;
  }
  return texts;
}

/** Make an unknown value (a stored preset) into a valid state for the current config. */
export function sanitizeState(raw: unknown): PromptState {
  const base = createInitialState();
  if (!raw || typeof raw !== 'object') return base;
  const input = raw as Partial<PromptState>;

  const shots: Shot[] = Array.isArray(input.shots)
    ? input.shots.slice(0, MAX_IMAGES).flatMap((item, i): Shot[] => {
        if (!item || typeof item !== 'object') return [];
        const role = getRole(item.role)?.id ?? DEFAULT_ROLE_IDS[i] ?? roles[0].id;
        return [{ role, answers: cleanAnswers(item.answers, shotSteps), texts: cleanTexts(item.texts, shotSteps) }];
      })
    : [];

  return {
    answers: cleanAnswers(input.answers, sharedSteps),
    texts: cleanTexts(input.texts, sharedSteps),
    shots: shots.length > 0 ? shots : base.shots,
  };
}

/** Grow with the default role for the new position, or drop images from the end. */
export function setCount(state: PromptState, count: number): PromptState {
  const target = Math.min(Math.max(Math.round(count), 1), MAX_IMAGES);
  const shots = state.shots.slice(0, target);
  while (shots.length < target) shots.push(createShot(DEFAULT_ROLE_IDS[shots.length] ?? roles[0].id));
  return { ...state, shots };
}

/** Switching role starts the image over from that role's defaults. */
export function setRole(state: PromptState, index: number, roleId: string): PromptState {
  if (!getRole(roleId) || state.shots[index]?.role === roleId) return state;
  return updateShot(state, index, () => createShot(roleId));
}

export const setText = (state: PromptState, stepId: string, value: string): PromptState => ({
  ...state,
  texts: { ...state.texts, [stepId]: value },
});

export function clearStep(state: PromptState, step: Step): PromptState {
  const { [step.id]: _answer, ...answers } = state.answers;
  const { [step.id]: _text, ...texts } = state.texts;
  return { ...state, answers, texts };
}

function updateShot(state: PromptState, index: number, change: (shot: Shot) => Shot): PromptState {
  return { ...state, shots: state.shots.map((shot, i) => (i === index ? change(shot) : shot)) };
}

export const setShotText = (state: PromptState, index: number, stepId: string, value: string): PromptState =>
  updateShot(state, index, (shot) => ({ ...shot, texts: { ...shot.texts, [stepId]: value } }));

export const clearShotStep = (state: PromptState, index: number, step: Step): PromptState =>
  updateShot(state, index, (shot) => {
    const { [step.id]: _answer, ...answers } = shot.answers;
    const { [step.id]: _text, ...texts } = shot.texts;
    return { ...shot, answers, texts };
  });

/**
 * Single choice: tapping the picked card keeps it (a prefilled default is not undone by accident), Skip clears it.
 * Multi choice: tapping toggles.
 */
function pick(answers: Record<string, string[]>, step: Step, optionId: string): Record<string, string[]> {
  const current = answers[step.id] ?? [];
  if (step.type !== 'multi') return current.includes(optionId) ? answers : { ...answers, [step.id]: [optionId] };
  if (!current.includes(optionId)) return { ...answers, [step.id]: [...current, optionId] };
  const { [step.id]: _removed, ...rest } = answers;
  const left = current.filter((id) => id !== optionId);
  return left.length ? { ...rest, [step.id]: left } : rest;
}

/** Content purpose preselects other shared steps. Image-level steps belong to the roles. */
function applyDefaults(answers: Record<string, string[]>, defaults: Record<string, string>) {
  const next = { ...answers };
  for (const [stepId, optionId] of Object.entries(defaults)) {
    const step = getStep(stepId);
    if (step && step.scope !== 'shot' && step.options?.some((option) => option.id === optionId)) {
      next[stepId] = [optionId];
    }
  }
  return next;
}

export function toggleOption(state: PromptState, step: Step, optionId: string): PromptState {
  const answers = pick(state.answers, step, optionId);
  const defaults = step.options?.find((option) => option.id === optionId)?.defaults;
  return { ...state, answers: defaults ? applyDefaults(answers, defaults) : answers };
}

export const toggleShotOption = (state: PromptState, index: number, step: Step, optionId: string): PromptState =>
  updateShot(state, index, (shot) => ({ ...shot, answers: pick(shot.answers, step, optionId) }));

/** Every image is checked on its own; with several images each notice says which one. */
export function findConflicts(state: PromptState): string[] {
  const prefix = state.shots.length > 1;
  const messages = state.shots.flatMap((_, i) => {
    const ctx = shotContext(state, i);
    return conflictRules
      .filter((rule) => rule.test(ctx))
      .map((rule) => (prefix ? `Image ${i + 1}: ${rule.message}` : rule.message));
  });
  return Array.from(new Set(messages));
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

function phraseFor(step: Step, option: Option, ctx: StepContext): string {
  const text = isTextFieldVisible(step, ctx) ? userText(ctx.texts[step.id]) : '';
  if (option.phrase.includes('{text}')) {
    return tidy(option.phrase.replace('{text}', text || step.textField?.fallback || ''));
  }
  return tidy([option.phrase, text].filter(Boolean).join(', '));
}

function selectedPhrases(step: Step, ctx: StepContext): string[] {
  const options = step.options ?? [];
  const phrases = (ctx.answers[step.id] ?? [])
    .map((id) => options.find((option) => option.id === id))
    .filter((option): option is Option => !!option)
    .map((option) => phraseFor(step, option, ctx));
  if (options.length === 0 && step.type === 'text') phrases.push(userText(ctx.texts[step.id]));
  return phrases.filter(Boolean);
}

function productOption(state: PromptState): Option | undefined {
  return getStep(PRODUCT_STEP_ID)?.options?.find((o) => o.id === state.answers[PRODUCT_STEP_ID]?.[0]);
}

const productNoun = (state: PromptState) => productOption(state)?.phrase || 'product';

/** How big the product looks next to a person, so a bouquet is not shrunk to a toy. */
const scalePhrase = (state: PromptState) =>
  `${productOption(state)?.scale ?? PERSON_SCALE_FALLBACK}, ${PERSON_SCALE_SUFFIX}`;

/** Phrases shared by every image: product, lighting, style, format, purpose last. */
function sharedItems(state: PromptState): string[] {
  const inPrompt = visibleSteps(state);
  return [...inPrompt.filter((step) => !step.promptLast), ...inPrompt.filter((step) => step.promptLast)].flatMap(
    (step) => selectedPhrases(step, state),
  );
}

/** Phrases of one image: scene, camera, person, and the scale line when a person is in it. */
function shotItems(state: PromptState, index: number): string[] {
  const ctx = shotContext(state, index);
  const items = visibleShotSteps(state, index).flatMap((step) => selectedPhrases(step, ctx));
  return hasPerson(ctx) ? [...items, scalePhrase(state)] : items;
}

export const roleLabel = (shot: Shot) => getRole(shot.role)?.label ?? 'Image';

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
  const shared = sharedItems(state);

  if (state.shots.length <= 1) {
    // The product comes first and the purpose last, with the image's own phrases between.
    const items = [...shared.slice(0, 1), ...shotItems(state, 0), ...shared.slice(1)];
    const text = tidy(
      [`Create an image of the ${noun}.`, items.length ? `Description: ${items.join(', ')}.` : '', QUALITY_LINE]
        .filter(Boolean)
        .join('\n'),
    );
    return [{ id: 'single', title: 'Prompt', blocks: [{ text }], text: `${text}\n\n${TIP_LINE}` }];
  }

  const description = shared.length ? `Shared description: ${shared.join(', ')}.` : '';
  const items = state.shots.map((_, i) => shotItems(state, i));
  const detail = (i: number) => (items[i].length ? `: ${items[i].join(', ')}` : '');
  const shotLine = (shot: Shot, i: number) => `${roleLabel(shot)}${detail(i)}.`;
  const withPerson = state.shots.map((_, i) => hasPerson(shotContext(state, i)));

  const oneMessage = tidy(
    [
      `Create ${state.shots.length} separate images of the same ${noun}.`,
      `Keep the ${noun} identical in every image, and keep the same style, lighting and color palette across the set.${
        withPerson.filter(Boolean).length > 1 ? ' Use the same person in every image that has one.' : ''
      }`,
      'Each image has its own scene and camera, listed below.',
      '',
      [description, QUALITY_LINE].filter(Boolean).join('\n'),
      '',
      ...state.shots.map((shot, i) => `Image ${i + 1} (${roleLabel(shot)})${detail(i)}.`),
    ].join('\n'),
  );

  const stepByStep: PromptBlock[] = state.shots.map((shot, i) => ({
    label: `Prompt ${i + 1}`,
    text:
      i === 0
        ? tidy(
            [
              `Create an image of the ${noun}.`,
              shotLine(shot, i),
              description.replace('Shared description', 'Description'),
              QUALITY_LINE,
            ]
              .filter(Boolean)
              .join('\n'),
          )
        : tidy(
            `Same ${noun} as in the previous image, same style, lighting and color palette. New image, ${shotLine(shot, i)}${
              withPerson[i] && withPerson.slice(0, i).some(Boolean) ? ' Use the same person as in the earlier image.' : ''
            } Keep the ${noun} identical.`,
          ),
  }));

  return [
    {
      id: 'one-message',
      title: 'One message',
      hint: 'Paste once. ChatGPT makes the whole set.',
      blocks: [{ text: oneMessage }],
      text: `${oneMessage}\n\n${TIP_LINE}`,
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

export type SummaryRow = { id: string; title: string; value: string };

/** One line per answered shared step plus one per image, for the review screen. */
export function summarize(state: PromptState): SummaryRow[] {
  const labelsFor = (step: Step, ctx: StepContext) =>
    (ctx.answers[step.id] ?? [])
      .map((id) => step.options?.find((option) => option.id === id)?.label)
      .filter((label): label is string => !!label);

  const shared = visibleSteps(state).flatMap((step): SummaryRow[] => {
    const text = isTextFieldVisible(step, state) ? userText(state.texts[step.id]) : '';
    const value = [labelsFor(step, state).join(' · '), text].filter(Boolean).join(' — ');
    return value ? [{ id: step.id, title: step.title, value }] : [];
  });

  const images = state.shots.map((shot, i): SummaryRow => {
    const ctx = shotContext(state, i);
    const parts = visibleShotSteps(state, i).flatMap((step) => labelsFor(step, ctx));
    return {
      id: shotId(i),
      title: `Image ${i + 1}`,
      value: [roleLabel(shot), parts.join(', ')].filter(Boolean).join(' — '),
    };
  });

  return [...shared, ...images];
}
