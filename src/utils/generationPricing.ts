import { OpenAiImageModel } from '../types';

export interface ShotPrice {
  usd: number;
  label: string;
  perImage: string;
  model: string;
  hint: string;
}

/**
 * Estimated API cost for one 1024x1024 medium JPEG studio shot.
 * Input-token extras are small at low fidelity; gpt-image-2 bills high-fidelity input internally.
 */
const PRICES: Record<OpenAiImageModel, ShotPrice> = {
  'gpt-image-1-mini': {
    usd: 0.012,
    label: '~$0.01',
    perImage: '~$0.01 / image',
    model: 'GPT Image Mini · medium 1024',
    hint: 'Cheapest option. Good for drafts; fine details may drift.',
  },
  'gpt-image-1': {
    usd: 0.044,
    label: '~$0.04',
    perImage: '~$0.04 / image',
    model: 'GPT Image 1 · medium 1024',
    hint: 'Previous OpenAI image model. Solid, a bit slower to update.',
  },
  'gpt-image-1.5': {
    usd: 0.036,
    label: '~$0.04',
    perImage: '~$0.04 / image',
    model: 'GPT Image 1.5 · medium 1024',
    hint: 'Best match for this app: keeps shape and colors closer.',
  },
  'gpt-image-2': {
    usd: 0.055,
    label: '~$0.05',
    perImage: '~$0.05 / image',
    model: 'GPT Image 2 · medium 1024',
    hint: 'Newest model. Higher quality, slightly higher cost.',
  },
};

export const IMAGE_MODEL_OPTIONS: Array<{
  id: OpenAiImageModel;
  name: string;
  price: ShotPrice;
}> = [
  { id: 'gpt-image-1-mini', name: 'GPT Image Mini', price: PRICES['gpt-image-1-mini'] },
  { id: 'gpt-image-1', name: 'GPT Image 1', price: PRICES['gpt-image-1'] },
  { id: 'gpt-image-1.5', name: 'GPT Image 1.5', price: PRICES['gpt-image-1.5'] },
  { id: 'gpt-image-2', name: 'GPT Image 2', price: PRICES['gpt-image-2'] },
];

export function getShotPrice(model: OpenAiImageModel): ShotPrice {
  return PRICES[model];
}
