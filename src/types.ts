export type ImageStyle = 'clean-catalog' | 'styled-promo' | 'luxury-promo';
export type PromoImageStyle = 'styled-promo' | 'luxury-promo';
export type PersonScale = 'none' | 'child' | 'adult';
export type ProductKind = 'toy' | 'flowers' | 'balloons' | 'candy';
export type ProductSubject = ProductKind | 'other';

export interface ProductKindMeta {
  id: ProductKind;
  name: string;
  hint: string;
  singular: string;
  studioName: string;
  defaultName: string;
  namePlaceholder: string;
  notesPlaceholder: string;
  specsHint: string;
  uploadLabel: string;
  altLabel: string;
}

export const PRODUCT_KIND_META: Record<ProductKind, ProductKindMeta> = {
  flowers: {
    id: 'flowers',
    name: 'Flowers',
    hint: 'Blooms, bouquets, plants',
    singular: 'flower',
    studioName: 'Flowers',
    defaultName: 'Bouquet',
    namePlaceholder: 'e.g. Garden Rose Bouquet',
    notesPlaceholder: 'Bloom types, stem count, wrapping, or occasion...',
    specsHint: 'Name & listing notes',
    uploadLabel: 'Flower Photo Reference',
    altLabel: 'Uploaded flower product',
  },
  toy: {
    id: 'toy',
    name: 'Toys',
    hint: 'Figures, wood, plush',
    singular: 'toy',
    studioName: 'Toys',
    defaultName: 'Toy',
    namePlaceholder: 'e.g. Handcrafted Oak Wood Train',
    notesPlaceholder: 'Briefly describe materials, colors, age group, or key details...',
    specsHint: 'Accurate scale & SEO details',
    uploadLabel: 'Toy Photo Reference',
    altLabel: 'Uploaded toy product',
  },
  balloons: {
    id: 'balloons',
    name: 'Balloons',
    hint: 'Latex, foil, bunches',
    singular: 'balloon',
    studioName: 'Balloons',
    defaultName: 'Balloon Bouquet',
    namePlaceholder: 'e.g. Gold Number Balloon Bouquet',
    notesPlaceholder: 'Latex or foil, colors, prints, count, or occasion...',
    specsHint: 'Name & listing notes',
    uploadLabel: 'Balloon Photo Reference',
    altLabel: 'Uploaded balloon product',
  },
  candy: {
    id: 'candy',
    name: 'Candy',
    hint: 'Sweets, chocolate, treats',
    singular: 'candy',
    studioName: 'Candy',
    defaultName: 'Candy',
    namePlaceholder: 'e.g. Wrapped Fruit Hard Candy',
    notesPlaceholder: 'Flavor, wrappers, piece count, box, or occasion...',
    specsHint: 'Name & listing notes',
    uploadLabel: 'Candy Photo Reference',
    altLabel: 'Uploaded candy product',
  },
};

export const PRODUCT_KIND_OPTIONS: ProductKindMeta[] = [
  PRODUCT_KIND_META.flowers,
  PRODUCT_KIND_META.toy,
  PRODUCT_KIND_META.balloons,
  PRODUCT_KIND_META.candy,
];

export function isPromoImageStyle(style: ImageStyle): style is PromoImageStyle {
  return style === 'styled-promo' || style === 'luxury-promo';
}

export function asProductKind(value: unknown): ProductKind | undefined {
  if (value === 'toy' || value === 'flowers' || value === 'balloons' || value === 'candy') {
    return value;
  }
  return undefined;
}

export function parseProductKind(value: unknown): ProductKind {
  return asProductKind(value) ?? 'toy';
}

export function productKindMeta(kind: ProductKind | undefined): ProductKindMeta {
  return PRODUCT_KIND_META[parseProductKind(kind)];
}

export function usesSizeCm(kind: ProductKind | undefined): boolean {
  return parseProductKind(kind) === 'toy';
}

export function usesPersonScale(kind: ProductKind | undefined): boolean {
  return parseProductKind(kind) === 'toy';
}

export function defaultProductName(kind: ProductKind | undefined): string {
  return productKindMeta(kind).defaultName;
}

export function parseProductSubject(value: unknown): ProductSubject | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toLowerCase();
  if (
    normalized === 'flowers' ||
    normalized === 'flower' ||
    normalized === 'bouquet' ||
    normalized === 'floral' ||
    normalized === 'plant' ||
    normalized === 'plants'
  ) {
    return 'flowers';
  }
  if (normalized === 'toy' || normalized === 'toys') return 'toy';
  if (
    normalized === 'balloons' ||
    normalized === 'balloon' ||
    normalized === 'helium balloon' ||
    normalized === 'foil balloon' ||
    normalized === 'balloon bouquet'
  ) {
    return 'balloons';
  }
  if (
    normalized === 'candy' ||
    normalized === 'candies' ||
    normalized === 'sweets' ||
    normalized === 'sweet' ||
    normalized === 'confectionery' ||
    normalized === 'confection' ||
    normalized === 'chocolate' ||
    normalized === 'lollipop' ||
    normalized === 'lollipops'
  ) {
    return 'candy';
  }
  if (
    normalized === 'other' ||
    normalized === 'neither' ||
    normalized === 'unknown' ||
    normalized === 'none'
  ) {
    return 'other';
  }
  return null;
}

export function kindSwitchNotice(from: ProductKind, to: ProductKind): string {
  return `This photo looks like ${PRODUCT_KIND_META[to].name.toLowerCase()}, so we used the ${PRODUCT_KIND_META[to].studioName} studio instead of ${PRODUCT_KIND_META[from].studioName}.`;
}

/** Size is a toy spec only. Other subjects never carry a cm value. */
export function sizeCmForProduct(
  kind: ProductKind | undefined,
  size: string | number | undefined | null
): string | undefined {
  if (!usesSizeCm(kind)) return undefined;
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
  styleRefId?: string;
  styleRefPrompt?: string;
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
  kindSwitchedFrom?: ProductKind;
  generatedAt: string;
  /** Client wait from Generate click until the result is ready. */
  durationMs?: number;
}

/** In-flight studio renders. Cap keeps OpenAI rate limits and cost in check. */
export const MAX_CONCURRENT_GENERATIONS = 3;

export interface GenerationJob {
  id: string;
  startedAt: number;
  style: ImageStyle;
  productName: string;
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
  productKind?: ProductKind;
  kindSwitchedFrom?: ProductKind;
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

export const STYLE_REF_PROMPT_MAX = 2000;

export interface StyleSceneRef {
  id: string;
  style: PromoImageStyle;
  name: string;
  prompt: string;
  imageUrl: string;
  builtIn: boolean;
}
