import type { PromptState } from '../../config/promptSteps';
import { sanitizeState } from './logic';

const STORAGE_KEY = 'lanna-bloom-prompt-presets';

export type Preset = {
  id: string;
  name: string;
  createdAt: number;
  state: PromptState;
};

export function loadPresets(): Preset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is Preset => !!item && typeof item.id === 'string' && typeof item.name === 'string')
      .map((item) => ({
        id: item.id,
        name: item.name,
        createdAt: Number(item.createdAt) || 0,
        state: sanitizeState(item.state),
      }));
  } catch {
    return [];
  }
}

/** Returns false when storage is unavailable (private window, blocked site data). */
export function savePresets(presets: Preset[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
    return true;
  } catch {
    return false;
  }
}

export function newPresetId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
