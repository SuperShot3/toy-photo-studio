/** Wall-clock wait shown on generate / result, e.g. `18.4s` or `1m 12s`. */
export function formatElapsed(ms: number): string {
  const total = Math.max(0, ms) / 1000;
  if (total < 60) return `${total.toFixed(1)}s`;
  const minutes = Math.floor(total / 60);
  const seconds = Math.round(total % 60);
  return `${minutes}m ${seconds}s`;
}
