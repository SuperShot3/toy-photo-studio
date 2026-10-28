export type CopyResult = 'copied' | 'selected' | 'failed';

/** Select the text of an element so the user can copy it by hand. */
function selectContents(element: HTMLElement | null): boolean {
  if (!element) return false;
  const selection = window.getSelection();
  if (!selection) return false;
  const range = document.createRange();
  range.selectNodeContents(element);
  selection.removeAllRanges();
  selection.addRange(range);
  return true;
}

/**
 * Copy with the Clipboard API, then execCommand, then fall back to selecting
 * the visible text ('selected') so the user can press Cmd/Ctrl+C.
 */
export async function copyText(text: string, fallbackElement: HTMLElement | null): Promise<CopyResult> {
  try {
    await navigator.clipboard.writeText(text);
    return 'copied';
  } catch {
    // Clipboard API missing or blocked (http, iframes); try the legacy path.
  }

  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    area.setSelectionRange(0, text.length);
    const ok = document.execCommand('copy');
    document.body.removeChild(area);
    if (ok) return 'copied';
  } catch {
    // Fall through to manual selection.
  }

  return selectContents(fallbackElement) ? 'selected' : 'failed';
}
