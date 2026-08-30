import { AiProvider, ApiSettings } from '../types';

const STORAGE_KEY = 'toy-photo-studio-api-settings';

const DEFAULT_SETTINGS: ApiSettings = {
  provider: 'openai',
  geminiApiKey: '',
  openaiApiKey: '',
};

export function loadApiSettings(): ApiSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<ApiSettings>;
    return {
      provider: parsed.provider === 'gemini' ? 'gemini' : 'openai',
      geminiApiKey: parsed.geminiApiKey ?? '',
      openaiApiKey: parsed.openaiApiKey ?? '',
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveApiSettings(settings: ApiSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function getActiveApiKey(settings: ApiSettings): string {
  return settings.provider === 'gemini'
    ? settings.geminiApiKey.trim()
    : settings.openaiApiKey.trim();
}

export function isApiKeyConfigured(settings: ApiSettings): boolean {
  return getActiveApiKey(settings).length > 0;
}

export function providerLabel(provider: AiProvider): string {
  return provider === 'gemini' ? 'Google Gemini' : 'ChatGPT (OpenAI)';
}
