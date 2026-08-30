export async function readApiError(response: Response, fallback: string): Promise<string> {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    const data = (await response.json().catch(() => ({}))) as {
      error?: string | { message?: string };
      message?: string;
    };

    if (typeof data.error === 'string' && data.error.trim()) return data.error;
    if (data.error && typeof data.error === 'object' && data.error.message) {
      return data.error.message;
    }
    if (typeof data.message === 'string' && data.message.trim()) return data.message;
  }

  if (response.status === 404) {
    return 'The photo API is not running. Start the app with npm run dev and open http://localhost:3000.';
  }

  if (response.status === 413) {
    return 'The photo is too large. Try a smaller JPEG or PNG.';
  }

  if (response.status >= 500) {
    return fallback;
  }

  return `${fallback} (HTTP ${response.status})`;
}

export function readNetworkError(error: unknown, fallback: string): string {
  if (error instanceof TypeError) {
    return 'Could not reach the photo studio server. Run npm run dev and open http://localhost:3000.';
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
