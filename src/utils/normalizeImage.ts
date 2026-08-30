const MAX_EDGE = 1024;

export async function normalizeReferenceImage(
  dataUrl: string
): Promise<{ dataUrl: string; mimeType: string }> {
  const image = await loadImage(dataUrl);
  const longestEdge = Math.max(image.naturalWidth || 1, image.naturalHeight || 1);
  const scale = Math.min(1, MAX_EDGE / longestEdge);
  const width = Math.max(1, Math.round((image.naturalWidth || 1) * scale));
  const height = Math.max(1, Math.round((image.naturalHeight || 1) * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not process the photo in this browser.');
  }

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(image, 0, 0, width, height);

  return {
    dataUrl: canvas.toDataURL('image/jpeg', 0.92),
    mimeType: 'image/jpeg',
  };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(
        new Error(
          'Could not read that image. Please upload a JPEG, PNG, or WEBP photo.'
        )
      );
    image.src = src;
  });
}
