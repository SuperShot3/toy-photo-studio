import { GeneratedResult } from '../types';

const DB_NAME = 'toy-photo-studio';
const DB_VERSION = 1;
const STORE_NAME = 'session-shots';
const SESSION_ID_KEY = 'toy-photo-studio-session-id';
const SELECTED_SHOT_KEY = 'toy-photo-studio-selected-shot';

/** Keep a short roll of shots in this tab. No server database. */
export const MAX_SESSION_SHOTS = 12;
const SHOT_TTL_MS = 8 * 60 * 60 * 1000;

interface StoredShot extends GeneratedResult {
  sessionId: string;
}

let memorySessionId: string | null = null;
let memoryShots: StoredShot[] = [];

function nowMs(): number {
  return Date.now();
}

function isExpiredOrphan(shot: StoredShot, sessionId: string): boolean {
  if (shot.sessionId === sessionId) return false;
  const generated = Date.parse(shot.generatedAt);
  if (Number.isNaN(generated)) return true;
  return nowMs() - generated >= SHOT_TTL_MS;
}

function readSessionStorage(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeSessionStorage(key: string, value: string): void {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // Private mode or disabled storage — session still works in memory.
  }
}

function removeSessionStorage(key: string): void {
  try {
    sessionStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export function getSessionId(): string {
  if (memorySessionId) return memorySessionId;
  const existing = readSessionStorage(SESSION_ID_KEY);
  if (existing) {
    memorySessionId = existing;
    return existing;
  }
  const created = crypto.randomUUID();
  memorySessionId = created;
  writeSessionStorage(SESSION_ID_KEY, created);
  return created;
}

export function loadSelectedShotId(): string | null {
  return readSessionStorage(SELECTED_SHOT_KEY);
}

export function saveSelectedShotId(id: string | null): void {
  if (!id) {
    removeSessionStorage(SELECTED_SHOT_KEY);
    return;
  }
  writeSessionStorage(SELECTED_SHOT_KEY, id);
}

export function mimeFromDataUrl(dataUrl: string): string {
  const match = /^data:([^;,]+)/i.exec(dataUrl);
  return match?.[1] || 'image/jpeg';
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not available'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('sessionId', 'sessionId', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Failed to open session gallery'));
  });
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed'));
  });
}

function waitForTransaction(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('IndexedDB transaction failed'));
    tx.onabort = () => reject(tx.error ?? new Error('IndexedDB transaction aborted'));
  });
}

function sortNewestFirst(shots: GeneratedResult[]): GeneratedResult[] {
  return [...shots].sort((a, b) => Date.parse(b.generatedAt) - Date.parse(a.generatedAt));
}

function toPublicShot(shot: StoredShot): GeneratedResult {
  const { sessionId: _sessionId, ...publicShot } = shot;
  return publicShot;
}

function fromMemory(sessionId: string): GeneratedResult[] {
  memoryShots = memoryShots.filter((shot) => !isExpiredOrphan(shot, sessionId));
  return sortNewestFirst(
    memoryShots.filter((shot) => shot.sessionId === sessionId).map(toPublicShot)
  ).slice(0, MAX_SESSION_SHOTS);
}

export async function loadSessionShots(): Promise<GeneratedResult[]> {
  const sessionId = getSessionId();

  try {
    const db = await openDb();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const all = (await requestToPromise(store.getAll())) as StoredShot[];

    for (const shot of all) {
      if (isExpiredOrphan(shot, sessionId)) {
        store.delete(shot.id);
      }
    }

    await waitForTransaction(tx);
    db.close();

    const live = all.filter((shot) => shot.sessionId === sessionId);
    memoryShots = all.filter((shot) => !isExpiredOrphan(shot, sessionId));
    return sortNewestFirst(live.map(toPublicShot)).slice(0, MAX_SESSION_SHOTS);
  } catch (error) {
    console.warn('Session gallery falling back to memory', error);
    return fromMemory(sessionId);
  }
}

export async function persistSessionShots(shots: GeneratedResult[]): Promise<void> {
  const sessionId = getSessionId();
  const trimmed = sortNewestFirst(shots).slice(0, MAX_SESSION_SHOTS);
  const stored: StoredShot[] = trimmed.map((shot) => ({ ...shot, sessionId }));

  memoryShots = [
    ...memoryShots.filter((shot) => shot.sessionId !== sessionId && !isExpiredOrphan(shot, sessionId)),
    ...stored,
  ];

  try {
    const db = await openDb();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const all = (await requestToPromise(store.getAll())) as StoredShot[];

    for (const shot of all) {
      if (shot.sessionId === sessionId || isExpiredOrphan(shot, sessionId)) {
        store.delete(shot.id);
      }
    }

    for (const shot of stored) {
      store.put(shot);
    }

    await waitForTransaction(tx);
    db.close();
  } catch (error) {
    console.warn('Could not persist session shots to IndexedDB', error);
  }
}

export async function clearSessionShots(): Promise<void> {
  saveSelectedShotId(null);
  await persistSessionShots([]);
}
