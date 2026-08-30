import { ApiSettings, parseOpenAiImageModel } from '../types';

const STORAGE_KEY = 'toy-photo-studio-api-settings';

const DEFAULT_SETTINGS: ApiSettings = {
  openaiApiKey: '',
  openaiImageModel: 'gpt-image-1-mini',
};

export function loadApiSettings(): ApiSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<ApiSettings> & {
      openaiImageMode?: unknown;
    };
    return {
      openaiApiKey: parsed.openaiApiKey ?? '',
      openaiImageModel: parseOpenAiImageModel(
        parsed.openaiImageModel ?? parsed.openaiImageMode
      ),
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveApiSettings(settings: ApiSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function getActiveApiKey(settings: ApiSettings): string {
  return settings.openaiApiKey.trim();
}

export function isApiKeyConfigured(settings: ApiSettings): boolean {
  return getActiveApiKey(settings).length > 0;
}
