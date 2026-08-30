/**
 * Keeps the page at 1x scale so pinch, trackpad, and double-tap zoom
 * cannot pan the layout around. Vertical scroll still works.
 */
export function lockViewport(): void {
  const prevent = (event: Event) => {
    event.preventDefault();
  };

  for (const type of ['gesturestart', 'gesturechange', 'gestureend'] as const) {
    document.addEventListener(type, prevent, { passive: false });
  }

  document.addEventListener(
    'touchmove',
    (event) => {
      if (event.touches.length > 1) {
        event.preventDefault();
      }
    },
    { passive: false },
  );

  document.addEventListener(
    'wheel',
    (event) => {
      if (event.ctrlKey) {
        event.preventDefault();
      }
    },
    { passive: false },
  );
}
