function runningOnLocalhost(): boolean {
  return (
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  );
}

function apiUnavailableMessage(): string {
  if (runningOnLocalhost()) {
    return 'The photo API is not running. Start the app with npm run dev and open http://localhost:3000.';
  }
  return 'The photo API is not available on this deployment. Redeploy the latest version that includes /api routes.';
}

function messageFromJson(data: {
  error?: string | { message?: string };
  message?: string;
}): string | null {
  if (typeof data.error === 'string' && data.error.trim()) return data.error;
  if (data.error && typeof data.error === 'object' && data.error.message) {
    return data.error.message;
  }
  if (typeof data.message === 'string' && data.message.trim()) return data.message;
  return null;
}

export async function readApiError(response: Response, fallback: string): Promise<string> {
  const raw = await response.text().catch(() => '');
  const trimmed = raw.trim();

  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const fromJson = messageFromJson(JSON.parse(trimmed) as {
        error?: string | { message?: string };
        message?: string;
      });
      if (fromJson) return fromJson;
    } catch {
      // Not JSON — fall through to status-based messages.
    }
  }

  if (response.status === 404) {
    return apiUnavailableMessage();
  }

  if (response.status === 413) {
    return 'The photo is too large. Try a smaller JPEG or PNG.';
  }

  if (
    response.status === 504 ||
    response.status === 524 ||
    /FUNCTION_INVOCATION_TIMEOUT|timeout/i.test(trimmed)
  ) {
    return 'The studio shot took too long to generate. Please try again.';
  }

  if (trimmed && trimmed.length < 400 && !/<\/?html/i.test(trimmed) && !trimmed.startsWith('<')) {
    if (/FUNCTION_INVOCATION_FAILED/i.test(trimmed)) {
      return 'The photo API crashed on this deployment. Push the latest API fix, wait for Vercel to finish deploying, then try again.';
    }
    return trimmed;
  }

  if (response.status >= 500) {
    return fallback;
  }

  return `${fallback} (HTTP ${response.status})`;
}

export function readNetworkError(error: unknown, fallback: string): string {
  if (error instanceof TypeError) {
    return runningOnLocalhost()
      ? 'Could not reach the photo studio server. Run npm run dev and open http://localhost:3000.'
      : 'Could not reach the photo studio API. Check your connection and try again.';
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
