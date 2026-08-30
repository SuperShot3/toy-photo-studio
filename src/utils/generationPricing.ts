import { AiProvider } from '../types';

export interface ShotPrice {
  usd: number;
  label: string;
  perImage: string;
  model: string;
}

/**
 * Estimated API cost for one studio shot, based on the models and
 * quality settings actually used in server/ai.ts.
 *
 * OpenAI: gpt-image-1.5, images.edit, 1024x1024, quality medium,
 *         input_fidelity high (~$0.034 output + ~$0.035 reference input).
 * Gemini: gemini-3.1-flash-image, 1K output ($0.067 image output).
 */
const PRICES: Record<AiProvider, ShotPrice> = {
  openai: {
    usd: 0.07,
    label: '~$0.07',
    perImage: '~$0.07 / image',
    model: 'GPT Image 1.5 · medium 1024',
  },
  gemini: {
    usd: 0.067,
    label: '$0.067',
    perImage: '$0.067 / image',
    model: 'Gemini 3.1 Flash Image · 1K',
  },
};

export function getShotPrice(provider: AiProvider): ShotPrice {
  return PRICES[provider];
}
