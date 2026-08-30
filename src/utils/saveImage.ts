function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod|Android/i.test(ua)) return true;
  return navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
}

function mimeFromDataUrl(dataUrl: string): string {
  return dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+)/)?.[1] || 'image/png';
}

function dataUrlToFile(dataUrl: string, filename: string): File {
  const comma = dataUrl.indexOf(',');
  if (comma < 0) {
    throw new Error('Invalid image data URL');
  }

  const header = dataUrl.slice(0, comma);
  const payload = dataUrl.slice(comma + 1);
  const mime = header.match(/:(.*?);/)?.[1] || mimeFromDataUrl(dataUrl);
  const binary = atob(payload);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new File([bytes], filename, { type: mime });
}

function downloadFile(file: File) {
  const href = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = href;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(href), 1_000);
}

function canShareFile(file: File): boolean {
  if (typeof navigator.canShare !== 'function') return false;
  try {
    return navigator.canShare({ files: [file] });
  } catch {
    return false;
  }
}

async function shareFile(file: File): Promise<boolean> {
  if (!canShareFile(file)) return false;

  try {
    await navigator.share({ files: [file], title: file.name });
    return true;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return true;
    }
    return false;
  }
}

export function isMobileSaveTarget(): boolean {
  return isMobileDevice();
}

export async function saveImage(dataUrl: string, filename: string): Promise<void> {
  const file = dataUrlToFile(dataUrl, filename);

  if (isMobileDevice()) {
    const shared = await shareFile(file);
    if (shared) return;
  }

  downloadFile(file);
}
