import type { ImageStyle } from '../types';

export function isPromoStyle(style: ImageStyle): boolean {
  return style === 'styled-promo' || style === 'luxury-promo';
}

// encodeURI (not encodeURIComponent): Vite serves this file when `&` stays as `&`.
export const STUDIO_LOGO_URL = `/logo/${encodeURI('Logo & Flower Delivery no bg.png')}`;

export interface PromoOverlayOptions {
  imageUrl: string;
  style: ImageStyle;
  headline: string;
  tagline: string;
  sizeLabel?: string;
  includeLogo?: boolean;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const lines: string[] = [];
  let current = words[0];

  for (let i = 1; i < words.length; i++) {
    const test = `${current} ${words[i]}`;
    if (ctx.measureText(test).width <= maxWidth) {
      current = test;
    } else {
      lines.push(current);
      current = words[i];
      if (lines.length === maxLines - 1) {
        const rest = [current, ...words.slice(i + 1)].join(' ');
        let clipped = rest;
        while (clipped.length > 1 && ctx.measureText(`${clipped}…`).width > maxWidth) {
          clipped = clipped.slice(0, -1).trimEnd();
        }
        lines.push(ctx.measureText(rest).width > maxWidth ? `${clipped}…` : rest);
        return lines;
      }
    }
  }

  lines.push(current);
  return lines;
}

function fitFontSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  fontFamily: string,
  fontWeight: string,
  fontStyle: string,
  startSize: number,
  minSize: number,
  maxWidth: number,
  maxLines: number
): { size: number; lines: string[] } {
  let size = startSize;
  let lines: string[] = [];

  while (size >= minSize) {
    ctx.font = `${fontStyle} ${fontWeight} ${size}px ${fontFamily}`;
    lines = wrapText(ctx, text, maxWidth, maxLines);
    const widest = Math.max(0, ...lines.map((line) => ctx.measureText(line).width));
    if (widest <= maxWidth && lines.length <= maxLines) {
      return { size, lines };
    }
    size -= 2;
  }

  ctx.font = `${fontStyle} ${fontWeight} ${minSize}px ${fontFamily}`;
  return { size: minSize, lines: wrapText(ctx, text, maxWidth, maxLines) };
}

function loadImage(
  src: string,
  errorMessage = 'Could not load studio image for overlay.'
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(errorMessage));
    img.src = src;
  });
}

async function drawStudioLogo(ctx: CanvasRenderingContext2D, canvasWidth: number): Promise<void> {
  const logo = await loadImage(STUDIO_LOGO_URL, 'Could not load brand logo for overlay.');
  const naturalW = logo.naturalWidth || logo.width;
  const naturalH = logo.naturalHeight || logo.height;
  const logoW = canvasWidth * 0.16;
  const logoH = naturalW > 0 ? logoW * (naturalH / naturalW) : logoW;
  const pad = canvasWidth * 0.035;
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  ctx.drawImage(logo, canvasWidth - pad - logoW, pad, logoW, logoH);
}

async function ensureOverlayFonts(): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts) return;

  const loads = [
    document.fonts.load('800 64px Outfit'),
    document.fonts.load('500 28px "Plus Jakarta Sans"'),
    document.fonts.load('italic 600 64px Fraunces'),
    document.fonts.load('500 28px Fraunces'),
  ];

  await Promise.race([
    Promise.all(loads).then(() => document.fonts.ready),
    new Promise((resolve) => setTimeout(resolve, 1800)),
  ]);
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

/**
 * Bakes product name + selling line (promo) and/or the brand logo onto a studio shot.
 * Catalog shots can still call this with includeLogo and empty headline/tagline.
 */
export async function composePromoOverlay(options: PromoOverlayOptions): Promise<string> {
  const headline = options.headline.trim();
  const tagline = options.tagline.trim();
  const printText = Boolean(headline || tagline);
  if (!printText && !options.includeLogo) return options.imageUrl;

  if (printText) await ensureOverlayFonts();
  const img = await loadImage(options.imageUrl);

  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return options.imageUrl;

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const w = canvas.width;

  if (!printText) {
    if (options.includeLogo) {
      try {
        await drawStudioLogo(ctx, w);
      } catch {
        // Keep the photo even if the logo asset fails to load.
      }
    }
    return canvas.toDataURL('image/png');
  }

  const h = canvas.height;
  const padX = Math.round(w * 0.07);
  const maxTextWidth = w - padX * 2;
  const isLuxury = options.style === 'luxury-promo';

  const fadeTop = h * (isLuxury ? 0.58 : 0.62);
  const gradient = ctx.createLinearGradient(0, fadeTop, 0, h);
  if (isLuxury) {
    gradient.addColorStop(0, 'rgba(18, 14, 10, 0)');
    gradient.addColorStop(0.45, 'rgba(18, 14, 10, 0.42)');
    gradient.addColorStop(1, 'rgba(12, 9, 7, 0.86)');
  } else {
    gradient.addColorStop(0, 'rgba(48, 28, 12, 0)');
    gradient.addColorStop(0.4, 'rgba(48, 28, 12, 0.38)');
    gradient.addColorStop(1, 'rgba(32, 18, 8, 0.78)');
  }
  ctx.fillStyle = gradient;
  ctx.fillRect(0, fadeTop, w, h - fadeTop);

  const headlineFamily = isLuxury ? 'Fraunces, Georgia, serif' : 'Outfit, sans-serif';
  const headlineStyle = isLuxury ? 'italic' : 'normal';
  const headlineWeight = isLuxury ? '600' : '800';
  const startHeadline = Math.round(w * (isLuxury ? 0.058 : 0.054));
  const minHeadline = Math.round(w * 0.032);

  const fitted = fitFontSize(
    ctx,
    headline || 'Toy',
    headlineFamily,
    headlineWeight,
    headlineStyle,
    startHeadline,
    minHeadline,
    maxTextWidth,
    2
  );

  const taglineSize = Math.round(w * 0.026);
  ctx.font = `500 ${taglineSize}px "Plus Jakarta Sans", sans-serif`;
  const taglineLines = tagline ? wrapText(ctx, tagline, maxTextWidth, 2) : [];

  const badgeSize = Math.round(w * 0.018);
  const badgeText = options.sizeLabel?.trim() || '';
  const lineHeight = fitted.size * 1.12;
  const taglineHeight = taglineSize * 1.35;
  const ruleGap = isLuxury ? fitted.size * 0.5 : fitted.size * 0.16;
  const blockHeight =
    fitted.lines.length * lineHeight +
    ruleGap +
    (taglineLines.length ? taglineLines.length * taglineHeight : 0) +
    (badgeText ? badgeSize * 2.8 : 0);

  let y = h - Math.round(h * 0.055) - blockHeight + fitted.size;

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
  ctx.shadowBlur = Math.round(w * 0.012);
  ctx.shadowOffsetY = Math.round(w * 0.003);

  ctx.font = `${headlineStyle} ${headlineWeight} ${fitted.size}px ${headlineFamily}`;
  ctx.fillStyle = isLuxury ? '#f3eadc' : '#ffffff';
  for (const line of fitted.lines) {
    ctx.fillText(line, padX, y);
    y += lineHeight;
  }

  if (isLuxury) {
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    y += Math.round(fitted.size * 0.18);
    ctx.strokeStyle = 'rgba(196, 165, 116, 0.85)';
    ctx.lineWidth = Math.max(1, w * 0.0016);
    ctx.beginPath();
    ctx.moveTo(padX, y);
    ctx.lineTo(padX + Math.min(maxTextWidth * 0.28, w * 0.18), y);
    ctx.stroke();
    y += Math.round(fitted.size * 0.32);
  } else {
    y += Math.round(fitted.size * 0.18);
  }

  if (taglineLines.length) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.28)';
    ctx.shadowBlur = Math.round(w * 0.008);
    ctx.font = `500 ${taglineSize}px "Plus Jakarta Sans", sans-serif`;
    ctx.fillStyle = isLuxury ? '#d9c7a8' : '#f6e4c4';
    for (const line of taglineLines) {
      ctx.fillText(line, padX, y);
      y += taglineHeight;
    }
  }

  if (badgeText) {
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.font = `700 ${badgeSize}px "Plus Jakarta Sans", sans-serif`;
    const label = badgeText.toUpperCase();
    const labelWidth = ctx.measureText(label).width;
    const pillPadX = badgeSize * 0.85;
    const pillH = badgeSize * 1.85;
    const pillW = labelWidth + pillPadX * 2;
    const pillY = y + badgeSize * 0.35;

    if (isLuxury) {
      ctx.strokeStyle = 'rgba(196, 165, 116, 0.7)';
      ctx.lineWidth = Math.max(1, w * 0.0014);
      drawRoundedRect(ctx, padX, pillY, pillW, pillH, pillH / 2);
      ctx.stroke();
      ctx.fillStyle = '#c4a574';
    } else {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
      drawRoundedRect(ctx, padX, pillY, pillW, pillH, pillH / 2);
      ctx.fill();
      ctx.fillStyle = '#fff8ee';
    }

    ctx.textBaseline = 'middle';
    ctx.fillText(label, padX + pillPadX, pillY + pillH / 2 + 0.5);
  }

  if (options.includeLogo) {
    try {
      await drawStudioLogo(ctx, w);
    } catch {
      // Keep the photo even if the logo asset fails to load.
    }
  }

  return canvas.toDataURL('image/png');
}
