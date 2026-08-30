export type ImageStyle = 'clean-catalog' | 'styled-promo' | 'luxury-promo';
export type PersonScale = 'none' | 'child' | 'adult';
export type AiProvider = 'gemini' | 'openai';

export interface ApiSettings {
  provider: AiProvider;
  geminiApiKey: string;
  openaiApiKey: string;
}

export interface AiRequestConfig {
  provider: AiProvider;
  apiKey: string;
}

export interface GeneratePhotoRequest {
  imageBase64: string;
  mimeType: string;
  productName: string;
  toySizeCm: string | number;
  productDescription?: string;
  style: ImageStyle;
  personScale: PersonScale;
  provider: AiProvider;
  apiKey: string;
}

export interface GeneratedResult {
  imageUrl: string;
  originalImageUrl: string;
  productTitle: string;
  sellingLine: string;
  marketingDescription: string;
  style: ImageStyle;
  personScale: PersonScale;
  productName: string;
  toySizeCm: string | number;
  generatedAt: string;
}

export interface ImproveDescriptionRequest {
  productName: string;
  toySizeCm?: string | number;
  roughDescription: string;
  imageBase64?: string;
  mimeType?: string;
  provider: AiProvider;
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

export interface SampleToy {
  id: string;
  name: string;
  sizeCm: number;
  description: string;
  thumbnail: string;
  dataUrl: string;
}
