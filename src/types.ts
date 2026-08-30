export type ImageStyle = 'clean-catalog' | 'styled-promo' | 'luxury-promo';
export type PersonScale = 'none' | 'child' | 'adult';
export type ProductKind = 'toy' | 'flowers';

export function parseProductKind(value: unknown): ProductKind {
  return value === 'flowers' ? 'flowers' : 'toy';
}

/** Size is a toy spec only. Flowers never carry a cm value. */
export function sizeCmForProduct(
  kind: ProductKind | undefined,
  size: string | number | undefined | null
): string | undefined {
  if (parseProductKind(kind) === 'flowers') return undefined;
  if (size === undefined || size === null) return undefined;
  const trimmed = String(size).trim();
  return trimmed || undefined;
}

export const OPENAI_IMAGE_MODELS = [
  'gpt-image-1-mini',
  'gpt-image-1',
  'gpt-image-1.5',
  'gpt-image-2',
] as const;

export type OpenAiImageModel = (typeof OPENAI_IMAGE_MODELS)[number];

export const DEFAULT_OPENAI_IMAGE_MODEL: OpenAiImageModel = 'gpt-image-1-mini';

export function parseOpenAiImageModel(value: unknown): OpenAiImageModel {
  if (value === 'studio' || value === 'gpt-image-1.5') return 'gpt-image-1.5';
  if (value === 'gpt-image-1') return 'gpt-image-1';
  if (value === 'gpt-image-2') return 'gpt-image-2';
  return DEFAULT_OPENAI_IMAGE_MODEL;
}

export interface ApiSettings {
  openaiApiKey: string;
  openaiImageModel: OpenAiImageModel;
}

export interface AiRequestConfig {
  apiKey: string;
}

export interface GeneratePhotoRequest {
  imageBase64: string;
  mimeType: string;
  productName: string;
  toySizeCm?: string | number;
  productDescription?: string;
  productKind?: ProductKind;
  style: ImageStyle;
  personScale: PersonScale;
  apiKey: string;
  openaiImageModel?: OpenAiImageModel;
}

export interface GeneratedResult {
  id: string;
  imageUrl: string;
  originalImageUrl: string;
  productTitle: string;
  sellingLine: string;
  marketingDescription: string;
  style: ImageStyle;
  personScale: PersonScale;
  productName: string;
  toySizeCm?: string | number;
  productKind?: ProductKind;
  generatedAt: string;
}

export interface ImproveDescriptionRequest {
  productName: string;
  toySizeCm?: string | number;
  productKind?: ProductKind;
  roughDescription: string;
  imageBase64?: string;
  mimeType?: string;
  apiKey: string;
}

export interface ImprovedDescriptionResponse {
  productTitle: string;
  sellingLine: string;
  productDescription: string;
}

export interface StyleOption {
  id: ImageStyle;
  name: string;
  tagline: string;
  badge: string;
  description: string;
  bgPreview: string;
  idealFor: string;
  iconName: string;
}

export interface ScaleOption {
  id: PersonScale;
  name: string;
  subtitle: string;
  icon: string;
}
