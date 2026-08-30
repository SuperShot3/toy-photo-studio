import {
  STYLE_REF_PROMPT_MAX,
  isPromoImageStyle,
  type PromoImageStyle,
  type StyleSceneRef,
} from '../types';
import { BUILT_IN_STYLE_REFS } from '../data/styleRefs';

const STORAGE_KEY = 'photostudio.style-scene-refs.v1';
const MAX_CUSTOM_REFS = 24;
const THUMB_MAX_EDGE = 512;

interface StoredCustomRefs {
  version: 1;
  refs: StyleSceneRef[];
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(
        new Error('Could not read that image. Please upload a JPEG, PNG, or WEBP photo.')
      );
    image.src = src;
  });
}

export async function thumbnailStyleRefImage(dataUrl: string): Promise<string> {
  const image = await loadImage(dataUrl);
  const longestEdge = Math.max(image.naturalWidth || 1, image.naturalHeight || 1);
  const scale = Math.min(1, THUMB_MAX_EDGE / longestEdge);
  const width = Math.max(1, Math.round((image.naturalWidth || 1) * scale));
  const height = Math.max(1, Math.round((image.naturalHeight || 1) * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not process the photo in this browser.');
  }

  ctx.fillStyle = '#111111';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL('image/jpeg', 0.82);
}

function parseCustomRefs(raw: string | null): StyleSceneRef[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Partial<StoredCustomRefs>;
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.refs)) return [];
    return parsed.refs
      .filter((item): item is StyleSceneRef => {
        if (!item || typeof item !== 'object') return false;
        if (typeof item.id !== 'string' || !item.id) return false;
        if (!isPromoImageStyle(item.style)) return false;
        if (typeof item.name !== 'string' || !item.name.trim()) return false;
        if (typeof item.prompt !== 'string' || !item.prompt.trim()) return false;
        if (typeof item.imageUrl !== 'string' || !item.imageUrl) return false;
        return true;
      })
      .map((item) => ({
        id: item.id,
        style: item.style,
        name: item.name.trim().slice(0, 48),
        prompt: item.prompt.trim().slice(0, STYLE_REF_PROMPT_MAX),
        imageUrl: item.imageUrl,
        builtIn: false,
      }));
  } catch {
    return [];
  }
}

export function loadCustomStyleRefs(): StyleSceneRef[] {
  if (typeof window === 'undefined') return [];
  return parseCustomRefs(window.localStorage.getItem(STORAGE_KEY));
}

export function saveCustomStyleRefs(refs: StyleSceneRef[]): StyleSceneRef[] {
  const custom = refs
    .filter((ref) => !ref.builtIn)
    .slice(0, MAX_CUSTOM_REFS)
    .map((ref) => ({ ...ref, builtIn: false as const }));
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ version: 1, refs: custom } satisfies StoredCustomRefs)
  );
  return custom;
}

export function listMergedStyleRefs(): StyleSceneRef[] {
  return [...BUILT_IN_STYLE_REFS, ...loadCustomStyleRefs()];
}

export function listStyleRefsForStyle(style: PromoImageStyle): StyleSceneRef[] {
  return listMergedStyleRefs().filter((ref) => ref.style === style);
}

export function findStyleRef(id: string | null | undefined): StyleSceneRef | null {
  if (!id) return null;
  return listMergedStyleRefs().find((ref) => ref.id === id) ?? null;
}

export function addCustomStyleRef(input: {
  style: PromoImageStyle;
  name: string;
  prompt: string;
  imageUrl: string;
}): StyleSceneRef {
  const name = input.name.trim().slice(0, 48);
  const prompt = input.prompt.trim().slice(0, STYLE_REF_PROMPT_MAX);
  if (!name) throw new Error('Please name this scene look.');
  if (!prompt) throw new Error('Please add a scene prompt.');
  if (!input.imageUrl) throw new Error('Please add a reference photo.');

  const current = loadCustomStyleRefs();
  if (current.length >= MAX_CUSTOM_REFS) {
    throw new Error(`You can save up to ${MAX_CUSTOM_REFS} custom looks.`);
  }

  const next: StyleSceneRef = {
    id: crypto.randomUUID(),
    style: input.style,
    name,
    prompt,
    imageUrl: input.imageUrl,
    builtIn: false,
  };
  saveCustomStyleRefs([...customWithoutId(current, next.id), next]);
  return next;
}

export function updateCustomStyleRef(
  id: string,
  patch: Partial<Pick<StyleSceneRef, 'name' | 'prompt' | 'imageUrl' | 'style'>>
): StyleSceneRef | null {
  const current = loadCustomStyleRefs();
  const existing = current.find((ref) => ref.id === id);
  if (!existing) return null;

  const updated: StyleSceneRef = {
    ...existing,
    ...patch,
    name: (patch.name ?? existing.name).trim().slice(0, 48),
    prompt: (patch.prompt ?? existing.prompt).trim().slice(0, STYLE_REF_PROMPT_MAX),
    builtIn: false,
  };
  saveCustomStyleRefs(current.map((ref) => (ref.id === id ? updated : ref)));
  return updated;
}

export function deleteCustomStyleRef(id: string): void {
  saveCustomStyleRefs(loadCustomStyleRefs().filter((ref) => ref.id !== id));
}

function customWithoutId(refs: StyleSceneRef[], id: string): StyleSceneRef[] {
  return refs.filter((ref) => ref.id !== id);
}
