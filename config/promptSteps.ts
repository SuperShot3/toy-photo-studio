/**
 * Lanna Bloom Prompt Builder: every step, option, image and prompt phrase lives here.
 *
 * - Add an option: push a new object into a step's `options` array. It shows up
 *   in the wizard, the live preview and the final prompt with no other code change.
 * - Replace an image: change the `image` path (or overwrite the file in
 *   /public/prompt-builder/<step>/<id>.svg, or point it at a .jpg).
 * - Change wording: edit `phrase`. `{text}` inside a phrase is replaced by the
 *   step's text field; without `{text}`, the text is appended after the phrase.
 */

export type PromptState = {
  /** How many images are in the set (1-4). */
  count: number;
  /** Step id of the one characteristic that changes between images. */
  variable: string;
  /** Selected option ids per step id, in the order they were picked. */
  answers: Record<string, string[]>;
  /** Free text per step id (product details, solid color, person look). */
  texts: Record<string, string>;
};

export type Option = {
  id: string;
  label: string;
  /** Path in /public/prompt-builder/<step>/<id>.svg (later .jpg). */
  image: string;
  /** Text added to the prompt. May be empty. */
  phrase: string;
  /** Short helper text under the label. */
  hint?: string;
  /** Conditional visibility. A selected option stays visible so it can be undone. */
  showIf?: (state: PromptState) => boolean;
  /** Content purpose only: option id to preselect in other steps (step id -> option id). */
  defaults?: Record<string, string>;
};

export type TextField = {
  label: string;
  placeholder: string;
  /** Hide the field unless this returns true. Always shown when omitted. */
  showIf?: (state: PromptState) => boolean;
  /** Used for `{text}` in the phrase when the field is empty. */
  fallback?: string;
  multiline?: boolean;
};

export type Step = {
  id: string;
  title: string;
  question: string;
  /**
   * single: one option. multi: any number of options.
   * count: number of images + which characteristic varies. text: text field only.
   */
  type: 'single' | 'multi' | 'count' | 'text';
  /** Shows a "Skip" button. Skipped steps add nothing to the prompt. */
  optional?: boolean;
  options?: Option[];
  /** Text input shown under the option cards. */
  textField?: TextField;
  /** Hide the whole step (and keep it out of the prompt) unless this returns true. */
  showIf?: (state: PromptState) => boolean;
  /** When this step is the set's variable and count > 1, it takes exactly `count` picks. */
  canBeVariable?: boolean;
  /** `count` step only: allowed numbers of images. */
  counts?: number[];
  /** Put this step's phrases at the end of the description instead of in step order. */
  promptLast?: boolean;
};

const img = (step: string, id: string) => `/prompt-builder/${step}/${id}.svg`;

export const pickedId = (state: PromptState, stepId: string): string | undefined =>
  state.answers[stepId]?.[0];

const hasPerson = (state: PromptState) => {
  const person = pickedId(state, 'person');
  return person !== undefined && person !== 'none';
};

export const REVIEW_TITLE = 'Review';

export const TIP_LINE =
  "Tip: upload a real photo of your product first and add: 'Use the uploaded photo as the exact product reference.'";

/** Fixed closing sentence of every shared description. */
export const QUALITY_LINE = 'Realistic photography, natural colors, high detail, no text, no watermark.';

export const promptSteps: Step[] = [
  {
    id: 'purpose',
    title: 'Purpose',
    question: 'Where will this image be used?',
    type: 'single',
    optional: true,
    promptLast: true,
    options: [
      {
        id: 'website',
        label: 'Website product photo',
        hint: '1:1, white studio, clean',
        image: img('purpose', 'website'),
        phrase: '',
        defaults: {
          format: 'square',
          background: 'white-studio',
          person: 'none',
          style: 'ecommerce',
          position: 'center',
          lighting: 'bright-studio',
        },
      },
      {
        id: 'instagram',
        label: 'Instagram post',
        hint: '4:5, lifestyle, soft daylight',
        image: img('purpose', 'instagram'),
        phrase: '',
        defaults: { format: 'vertical-4-5', style: 'lifestyle', lighting: 'soft-daylight' },
      },
      {
        id: 'stories',
        label: 'Stories / Reels cover',
        hint: '9:16, space top and bottom',
        image: img('purpose', 'stories'),
        phrase: 'keep clean empty space at the top and bottom of the frame for text added later',
        defaults: { format: 'vertical-9-16', position: 'center' },
      },
      {
        id: 'banner',
        label: 'Banner / ads',
        hint: '16:9, product on a third',
        image: img('purpose', 'banner'),
        phrase: 'leave clean empty space on the side opposite the product for text added later',
        defaults: { format: 'horizontal-16-9', position: 'left-third' },
      },
    ],
  },
  {
    id: 'imageSet',
    title: 'Image set',
    question: 'How many images do you need?',
    type: 'count',
    counts: [1, 2, 3, 4],
    // Options here are "what changes between images"; their id is the id of the step that varies.
    options: [
      {
        id: 'angle',
        label: 'Camera angle',
        hint: 'Same scene, different viewpoints',
        image: img('imageSet', 'angle'),
        phrase: 'camera angle',
      },
      {
        id: 'distance',
        label: 'Distance',
        hint: 'Same scene, closer or farther',
        image: img('imageSet', 'distance'),
        phrase: 'camera distance',
      },
      {
        id: 'position',
        label: 'Product position',
        hint: 'Same scene, product moves in frame',
        image: img('imageSet', 'position'),
        phrase: 'product position in the frame',
      },
    ],
  },
  {
    id: 'product',
    title: 'Product',
    question: 'What is the product?',
    type: 'single',
    options: [
      { id: 'bouquet', label: 'Bouquet', image: img('product', 'bouquet'), phrase: 'bouquet' },
      { id: 'balloons', label: 'Balloon bundle', image: img('product', 'balloons'), phrase: 'balloon bundle' },
      { id: 'teddy', label: 'Teddy bear', image: img('product', 'teddy'), phrase: 'teddy bear' },
      { id: 'gift-box', label: 'Gift box', image: img('product', 'gift-box'), phrase: 'gift box' },
      {
        id: 'bouquet-teddy',
        label: 'Bouquet + teddy',
        image: img('product', 'bouquet-teddy'),
        phrase: 'bouquet with a teddy bear',
      },
      {
        id: 'bouquet-balloons',
        label: 'Bouquet + balloons',
        image: img('product', 'bouquet-balloons'),
        phrase: 'bouquet with balloons',
      },
      {
        id: 'custom',
        label: 'Custom',
        hint: 'Describe it below',
        image: img('product', 'custom'),
        phrase: 'product',
      },
    ],
    textField: {
      label: 'Details',
      placeholder: 'pink and white roses with eucalyptus, kraft paper wrapping, small ribbon',
      multiline: true,
    },
  },
  {
    id: 'angle',
    title: 'Camera angle',
    question: 'Where is the camera?',
    type: 'single',
    optional: true,
    canBeVariable: true,
    options: [
      {
        id: 'eye-level',
        label: 'Eye level front',
        image: img('angle', 'eye-level'),
        phrase: 'eye-level front view',
      },
      {
        id: 'three-quarter',
        label: 'Three-quarter view',
        image: img('angle', 'three-quarter'),
        phrase: 'three-quarter view from slightly to the side',
      },
      {
        id: 'above-30',
        label: 'Slightly above',
        hint: 'About 30°',
        image: img('angle', 'above-30'),
        phrase: 'camera slightly above, about 30 degrees',
      },
      {
        id: 'high-45',
        label: '45° high angle',
        image: img('angle', 'high-45'),
        phrase: 'high angle shot at 45 degrees',
      },
      {
        id: 'top-down',
        label: 'Top-down flat lay',
        image: img('angle', 'top-down'),
        phrase: 'top-down flat lay, camera directly above',
      },
      {
        id: 'low',
        label: 'Low angle',
        image: img('angle', 'low'),
        phrase: 'low-angle shot, camera looking up at the product',
      },
      {
        id: 'side',
        label: 'Side profile',
        hint: '90°',
        image: img('angle', 'side'),
        phrase: 'side profile view, 90 degrees',
      },
      {
        id: 'over-shoulder',
        label: 'Over-the-shoulder',
        hint: 'Needs a person',
        image: img('angle', 'over-shoulder'),
        phrase: 'over-the-shoulder shot',
        showIf: (state) => pickedId(state, 'person') !== 'none',
      },
      {
        id: 'detail',
        label: 'Detail close-up',
        image: img('angle', 'detail'),
        phrase: 'detail close-up of petals and texture',
      },
    ],
  },
  {
    id: 'distance',
    title: 'Distance',
    question: 'How close is the camera?',
    type: 'single',
    optional: true,
    canBeVariable: true,
    options: [
      {
        id: 'macro',
        label: 'Macro',
        image: img('distance', 'macro'),
        phrase: 'extreme close-up, macro detail',
      },
      {
        id: 'close',
        label: 'Close-up',
        image: img('distance', 'close'),
        phrase: 'close-up, product fills most of the frame',
      },
      {
        id: 'medium',
        label: 'Medium',
        image: img('distance', 'medium'),
        phrase: 'medium shot, product with some surrounding space',
      },
      {
        id: 'wide',
        label: 'Wide',
        image: img('distance', 'wide'),
        phrase: 'wide shot, product placed within the full environment',
      },
    ],
  },
  {
    id: 'position',
    title: 'Position',
    question: 'Where is the product in the frame?',
    type: 'single',
    optional: true,
    canBeVariable: true,
    options: [
      { id: 'center', label: 'Center', image: img('position', 'center'), phrase: 'product centered in the frame' },
      {
        id: 'left-third',
        label: 'Left third',
        image: img('position', 'left-third'),
        phrase: 'product placed on the left third of the frame',
      },
      {
        id: 'right-third',
        label: 'Right third',
        image: img('position', 'right-third'),
        phrase: 'product placed on the right third of the frame',
      },
      {
        id: 'foreground',
        label: 'Foreground',
        hint: 'Scene behind',
        image: img('position', 'foreground'),
        phrase: 'product in the foreground with the scene behind it',
      },
      {
        id: 'lower',
        label: 'Lower part',
        hint: 'Of the frame',
        image: img('position', 'lower'),
        phrase: 'product placed in the lower part of the frame',
      },
    ],
  },
  {
    id: 'background',
    title: 'Background',
    question: 'What is behind the product?',
    type: 'single',
    optional: true,
    options: [
      {
        id: 'white-studio',
        label: 'White studio',
        image: img('background', 'white-studio'),
        phrase: 'clean white studio background',
      },
      {
        id: 'solid-color',
        label: 'Solid color studio',
        hint: 'Pick the color below',
        image: img('background', 'solid-color'),
        phrase: 'solid {text} studio background',
      },
      {
        id: 'home',
        label: 'Home interior',
        image: img('background', 'home'),
        phrase: 'cozy home interior',
      },
      {
        id: 'hotel',
        label: 'Hotel room',
        image: img('background', 'hotel'),
        phrase: 'elegant hotel room',
      },
      {
        id: 'cafe',
        label: 'Café table',
        image: img('background', 'cafe'),
        phrase: 'table in a cozy café',
      },
      {
        id: 'tropical',
        label: 'Tropical garden',
        image: img('background', 'tropical'),
        phrase: 'lush tropical garden',
      },
      {
        id: 'beach',
        label: 'Beach at sunset',
        image: img('background', 'beach'),
        phrase: 'beach at sunset',
      },
      {
        id: 'thai-temple',
        label: 'Thai temple style',
        hint: 'Subtle, respectful',
        image: img('background', 'thai-temple'),
        phrase: 'subtle, respectful Thai temple-style architecture in the background',
      },
    ],
    textField: {
      label: 'Color',
      placeholder: 'dusty pink',
      fallback: 'color',
      showIf: (state) => pickedId(state, 'background') === 'solid-color',
    },
  },
  {
    id: 'blur',
    title: 'Blur',
    question: 'How much depth of field?',
    type: 'single',
    optional: true,
    options: [
      {
        id: 'none',
        label: 'None',
        hint: 'All sharp',
        image: img('blur', 'none'),
        phrase: 'everything in sharp focus',
      },
      {
        id: 'soft',
        label: 'Soft background blur',
        image: img('blur', 'soft'),
        phrase: 'shallow depth of field, softly blurred background',
      },
      {
        id: 'bokeh',
        label: 'Bokeh lights',
        image: img('blur', 'bokeh'),
        phrase: 'shallow depth of field with round bokeh light circles in the background',
      },
      {
        id: 'foreground',
        label: 'Blurred foreground edges',
        image: img('blur', 'foreground'),
        phrase: 'soft out-of-focus foreground elements framing the product',
      },
    ],
  },
  {
    id: 'person',
    title: 'Person',
    question: 'Is there a person in the picture?',
    type: 'single',
    optional: true,
    options: [
      { id: 'none', label: 'None', image: img('person', 'none'), phrase: 'no people in the image' },
      { id: 'hands', label: 'Hands only', image: img('person', 'hands'), phrase: 'only hands visible' },
      {
        id: 'partial',
        label: 'Partial body',
        hint: 'Face not shown',
        image: img('person', 'partial'),
        phrase: 'partial body visible, face not shown',
      },
      { id: 'full', label: 'Full person', image: img('person', 'full'), phrase: 'full person visible' },
    ],
    textField: {
      label: 'Appearance (optional)',
      placeholder: 'woman in light linen dress',
      showIf: hasPerson,
    },
  },
  {
    id: 'interaction',
    title: 'Interaction',
    question: 'What is the person doing?',
    type: 'single',
    optional: true,
    showIf: hasPerson,
    options: [
      {
        id: 'holding',
        label: 'Holding in front',
        image: img('interaction', 'holding'),
        phrase: 'holding the product in front of them',
      },
      {
        id: 'hugging',
        label: 'Hugging',
        image: img('interaction', 'hugging'),
        phrase: 'hugging the product close',
      },
      {
        id: 'giving',
        label: 'Giving to someone',
        image: img('interaction', 'giving'),
        phrase: 'giving the product to someone',
      },
      {
        id: 'receiving',
        label: 'Receiving',
        image: img('interaction', 'receiving'),
        phrase: 'receiving the product as a gift',
      },
      {
        id: 'smelling',
        label: 'Smelling flowers',
        image: img('interaction', 'smelling'),
        phrase: 'smelling the flowers',
      },
      {
        id: 'carrying',
        label: 'Carrying in arm',
        image: img('interaction', 'carrying'),
        phrase: 'carrying the product in the crook of one arm',
      },
      {
        id: 'placing',
        label: 'Placing on table',
        image: img('interaction', 'placing'),
        phrase: 'placing the product on a table',
      },
    ],
  },
  {
    id: 'lighting',
    title: 'Lighting',
    question: 'What kind of light?',
    type: 'single',
    optional: true,
    options: [
      {
        id: 'soft-daylight',
        label: 'Soft daylight',
        image: img('lighting', 'soft-daylight'),
        phrase: 'soft natural daylight',
      },
      {
        id: 'golden-hour',
        label: 'Golden hour',
        image: img('lighting', 'golden-hour'),
        phrase: 'warm golden hour sunlight',
      },
      {
        id: 'bright-studio',
        label: 'Bright studio',
        image: img('lighting', 'bright-studio'),
        phrase: 'bright even studio lighting',
      },
      {
        id: 'warm-evening',
        label: 'Warm evening indoor',
        image: img('lighting', 'warm-evening'),
        phrase: 'warm evening indoor lighting',
      },
      {
        id: 'overcast',
        label: 'Overcast soft light',
        image: img('lighting', 'overcast'),
        phrase: 'overcast soft diffused light',
      },
    ],
  },
  {
    id: 'style',
    title: 'Style',
    question: 'What is the overall look?',
    type: 'single',
    optional: true,
    options: [
      {
        id: 'ecommerce',
        label: 'Clean e-commerce',
        image: img('style', 'ecommerce'),
        phrase: 'clean e-commerce product photo style',
      },
      {
        id: 'lifestyle',
        label: 'Lifestyle',
        image: img('style', 'lifestyle'),
        phrase: 'natural lifestyle photography style',
      },
      {
        id: 'editorial',
        label: 'Editorial magazine',
        image: img('style', 'editorial'),
        phrase: 'editorial magazine photography style',
      },
      {
        id: 'film',
        label: 'Film photo look',
        image: img('style', 'film'),
        phrase: 'analog film photo look with subtle grain',
      },
      {
        id: 'pastel',
        label: 'Minimal pastel',
        image: img('style', 'pastel'),
        phrase: 'minimal pastel aesthetic',
      },
    ],
  },
  {
    id: 'format',
    title: 'Format',
    question: 'What shape is the image?',
    type: 'single',
    optional: true,
    options: [
      { id: 'square', label: '1:1 square', image: img('format', 'square'), phrase: 'square 1:1 format' },
      {
        id: 'vertical-4-5',
        label: '4:5 vertical',
        image: img('format', 'vertical-4-5'),
        phrase: 'vertical 4:5 format',
      },
      {
        id: 'vertical-9-16',
        label: '9:16 vertical',
        image: img('format', 'vertical-9-16'),
        phrase: 'vertical 9:16 format',
      },
      {
        id: 'horizontal-16-9',
        label: '16:9 horizontal',
        image: img('format', 'horizontal-16-9'),
        phrase: 'horizontal 16:9 format',
      },
    ],
  },
];

/** Non-blocking yellow notices. Add a rule here to warn about another combination. */
export type ConflictRule = {
  id: string;
  message: string;
  test: (state: PromptState) => boolean;
};

const has = (state: PromptState, stepId: string, optionId: string) =>
  state.answers[stepId]?.includes(optionId) ?? false;

export const conflictRules: ConflictRule[] = [
  {
    id: 'flat-lay-full-person',
    message: 'Top-down flat lay rarely works with a full person in the frame.',
    test: (s) => has(s, 'angle', 'top-down') && has(s, 'person', 'full'),
  },
  {
    id: 'macro-full-person',
    message: 'Macro distance cannot show a full person.',
    test: (s) => has(s, 'distance', 'macro') && has(s, 'person', 'full'),
  },
  {
    id: 'over-shoulder-no-person',
    message: 'Over-the-shoulder is selected but Person is set to None.',
    test: (s) => has(s, 'angle', 'over-shoulder') && has(s, 'person', 'none'),
  },
  {
    id: 'white-studio-outdoor-light',
    message: 'White studio background with golden hour light: the outdoor sun will not look natural.',
    test: (s) => has(s, 'background', 'white-studio') && has(s, 'lighting', 'golden-hour'),
  },
  {
    id: 'outdoor-scene-studio',
    message: 'Beach / tropical background clashes with bright studio lighting or clean e-commerce style.',
    test: (s) =>
      (has(s, 'background', 'beach') || has(s, 'background', 'tropical')) &&
      (has(s, 'lighting', 'bright-studio') || has(s, 'style', 'ecommerce')),
  },
  {
    id: 'stories-lower-position',
    message: 'Stories format reserves space at the bottom for text, which may cover a product placed in the lower part.',
    test: (s) => has(s, 'format', 'vertical-9-16') && has(s, 'position', 'lower'),
  },
];
