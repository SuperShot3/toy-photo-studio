import type { ImageStyle, PersonScale, ProductKind } from "../src/types.js";

export interface StudioPromptParams {
  productName: string;
  toySizeCm?: string | number;
  productDescription: string;
  productKind: ProductKind;
  style: ImageStyle;
  personScale: PersonScale;
}

function isFloral(kind: ProductKind): boolean {
  return kind === "flowers";
}

function buildStyleInstructions(
  style: ImageStyle,
  floral: boolean
): { styleInstructions: string; backgroundGuidance: string } {
  if (style === "clean-catalog") {
    if (floral) {
      return {
        styleInstructions: `
STYLE 1 — CLEAN CATALOG:
- Create a crisp, ultra-clean professional e-commerce catalog photograph of flowers or a bouquet.
- Clean pure white or very light neutral studio background (solid #F8F9FA or pure white).
- The exact flowers from the reference image must be centered, standing naturally (in their wrapping, stems, or vase if present).
- Soft, professional diffused studio lighting from dual key/fill softboxes.
- Soft, realistic contact shadow on the surface beneath the stems, wrap, or vase.
- Razor-sharp petals and foliage with no background distraction, no clutter, no extra decorative props.
- Enhanced contrast, exposure, and color calibration to commercial florist / retail photography standards.
- No text, labels, or watermarks on the image.
`,
        backgroundGuidance:
          "clean pure white studio background with soft realistic contact shadow",
      };
    }
    return {
      styleInstructions: `
STYLE 1 — CLEAN CATALOG:
- Create a crisp, ultra-clean professional e-commerce catalog photograph.
- Clean pure white or very light neutral studio background (solid #F8F9FA or pure white).
- The exact toy from the reference image must be centered, upright or sitting naturally.
- Soft, professional diffused studio lighting from dual key/fill softboxes.
- Soft, realistic contact shadow on the floor surface beneath the toy.
- Razor-sharp, clean edges with no background distraction, no clutter, no decorative props.
- Enhanced contrast, exposure, and color calibration to commercial retail photography standards.
- No text, labels, or watermarks on the image.
`,
      backgroundGuidance:
        "clean pure white studio background with soft realistic contact shadow",
    };
  }

  if (style === "styled-promo") {
    if (floral) {
      return {
        styleInstructions: `
STYLE 2 — STYLED PROMO:
- Create an attractive, warm commercial lifestyle image suitable for selling flowers or bouquets online — composed like a florist ad or shop banner that will receive a product-name headline later.
- The EXACT flowers from the uploaded reference photo are the dominant, crisp foreground hero subject.
- Contextual background: A tasteful florist / botanical setting with soft shallow depth-of-field blur (such as a sunlit linen table, pale marble counter, ceramic vase, or airy flower-shop window light). Do NOT use a children's nursery or playroom.
- Warm, natural daylight with gentle rim glow on petals and rich ambient atmosphere.
- Keep the flowers 100% true to original reference in species, bloom count, colors, and arrangement.
- Realistic surface reflections and natural cast shadows.
- COMPOSITION FOR TYPE: Place the flowers in the upper two-thirds of the frame. Leave a clean, uncluttered lower band (about the bottom 22%) with soft falloff and no busy props, so a product name and selling line can sit on the photo.
- Do NOT render any text, letters, logos, captions, watermarks, or labels in the photograph.
`,
        backgroundGuidance:
          "tasteful soft-focus florist studio / linen table / marble lifestyle setting with open lower third for headline type",
      };
    }
    return {
      styleInstructions: `
STYLE 2 — STYLED PROMO:
- Create an attractive, warm commercial lifestyle image suitable for selling toys online — composed like a social ad or shop banner that will receive a product-name headline later.
- The EXACT toy from the uploaded reference photo is the dominant, crisp foreground hero subject.
- Contextual background: A tasteful, warm children's setting with soft shallow depth-of-field blur (such as a sunlit Scandinavian nursery, smooth blonde wooden play table, or cozy pastel playroom shelf).
- Warm, natural golden daylight with gentle rim glow and rich ambient atmosphere.
- Keep the toy 100% true to original reference in material, colors, and features.
- Realistic surface reflections and natural cast shadows.
- COMPOSITION FOR TYPE: Place the toy in the upper two-thirds of the frame. Leave a clean, uncluttered lower band (about the bottom 22%) with soft falloff and no busy props, so a product name and selling line can sit on the photo.
- Do NOT render any text, letters, logos, captions, watermarks, or labels in the photograph.
`,
      backgroundGuidance:
        "tasteful soft-focus warm nursery / wooden playroom lifestyle setting with open lower third for headline type",
    };
  }

  if (floral) {
    return {
      styleInstructions: `
STYLE 3 — LUXURY PROMO:
- Create a premium high-end luxury advertising campaign photo of flowers — composed like a magazine florist ad that will receive elegant product-name typography later.
- The EXACT flowers from the reference photo are displayed as a prestigious hero piece.
- Composition: Positioned elegantly in a fine ceramic or glass vase, atop a minimalist architectural podium, travertine stone plinth, or softly draped luxury textured fabric.
- Premium studio spotlighting with dramatic yet soft directional falloff, subtle warm rim lighting accentuating petal translucency and foliage.
- Clean luxury aesthetic, gift-like prestige presentation with rich, deep, refined tonality.
- Flawless commercial lighting and soft elegant shadows.
- COMPOSITION FOR TYPE: Keep the flowers in the upper two-thirds. Leave a calm, dark-to-soft lower band (about the bottom 24%) free of objects so a product name can be printed on the image.
- Do NOT render any text, letters, logos, captions, watermarks, or labels in the photograph.
`,
      backgroundGuidance:
        "architectural stone plinth or fine vase, luxury draped fabric, elegant high-end florist studio lighting with open lower third for headline type",
    };
  }

  return {
    styleInstructions: `
STYLE 3 — LUXURY PROMO:
- Create a premium high-end luxury advertising campaign photo — composed like a magazine ad that will receive elegant product-name typography later.
- The EXACT toy from the reference photo is displayed as a prestigious hero piece.
- Composition: Positioned elegantly atop a minimalist architectural podium, travertine stone plinth, or softly draped luxury textured fabric.
- Premium studio spotlighting with dramatic yet soft directional falloff, subtle warm rim lighting accentuating the toy's textures.
- Clean luxury aesthetic, gift-like prestige presentation with rich, deep, refined tonality.
- Flawless commercial lighting and soft elegant shadows.
- COMPOSITION FOR TYPE: Keep the toy in the upper two-thirds. Leave a calm, dark-to-soft lower band (about the bottom 24%) free of objects so a product name can be printed on the image.
- Do NOT render any text, letters, logos, captions, watermarks, or labels in the photograph.
`,
    backgroundGuidance:
      "architectural stone plinth, luxury draped fabric, elegant high-end studio lighting with open lower third for headline type",
  };
}

function hasNumericSize(toySizeCm: string | number | undefined): boolean {
  if (toySizeCm === undefined || toySizeCm === null) return false;
  return String(toySizeCm).trim() !== "";
}

function buildPersonScaleInstructions(
  personScale: PersonScale,
  toySizeCm: string | number | undefined,
  floral: boolean
): string {
  const subject = floral ? "flowers" : "toy";
  const toyScaleLine = hasNumericSize(toySizeCm)
    ? `- VISUAL SCALE ACCURACY: The entered toy height is ${toySizeCm} cm. The scale of the toy relative to the child's hands and torso must realistically match ${toySizeCm} cm.`
    : `- Keep the toy at a natural, realistic scale relative to the child's hands and torso.`;
  const toyAdultScaleLine = hasNumericSize(toySizeCm)
    ? `- VISUAL SCALE ACCURACY: The entered toy height is ${toySizeCm} cm. The scale of the toy relative to the adult hands/body must realistically match ${toySizeCm} cm.`
    : `- Keep the toy at a natural, realistic scale relative to the adult hands/body.`;

  if (personScale === "child") {
    return floral
      ? `
PERSON FOR SIZE REFERENCE:
- Include a realistic, cheerful child (approx 4-7 years old) naturally receiving or gently holding the bouquet as a gift.
- Keep the flowers at a natural, realistic scale relative to the child's hands and torso.
- The flowers must remain the unobstructed, crisp main hero subject in the foreground.
- The child must look natural, warm, and candid without covering key blooms.
`
      : `
PERSON FOR SIZE REFERENCE:
- Include a realistic, cheerful child (approx 4-7 years old) naturally sitting next to or gently holding/interacting with the toy.
${toyScaleLine}
- The toy must remain the unobstructed, crisp main hero subject in the foreground.
- The child must look natural, warm, and candid without covering key toy features.
`;
  }

  if (personScale === "adult") {
    return floral
      ? `
PERSON FOR SIZE REFERENCE:
- Include realistic adult florist or gift-giver hands gently holding, presenting, or arranging the flowers for clear visual scale comparison.
- Keep the flowers at a natural, realistic scale relative to the adult hands/body.
- The flowers must remain the unobstructed, sharp focal hero of the composition.
`
      : `
PERSON FOR SIZE REFERENCE:
- Include a realistic adult (hands gently holding or presenting the toy, or standing/sitting naturally beside it) for clear visual scale comparison.
${toyAdultScaleLine}
- The toy must remain the unobstructed, sharp focal hero of the composition.
`;
  }

  return `
PERSON FOR SIZE REFERENCE:
- No human figures or hands. The ${subject} ${floral ? "are" : "is"} shown as a solo hero subject.
`;
}

function buildPreservationRules(floral: boolean): string {
  if (floral) {
    return `
CRITICAL INSTRUCTION - PRODUCT PRESERVATION:
You are a world-class professional commercial product photographer and editor specializing in florist and botanical catalog work.
The uploaded image contains the EXACT product reference flowers.

MOST IMPORTANT RULE:
The uploaded flowers must ALWAYS be treated as the exact product reference.
DO NOT CREATE DIFFERENT FLOWERS, A DIFFERENT BOUQUET, OR A TOY.
PRESERVE 100% ACCURATELY:
- species and bloom identity
- exact petal colors, shades, veining, and color distribution
- bloom count, size, and how open each flower is
- stem length, leaf placement, foliage, wrapping, ribbon, or vase if present
- overall arrangement silhouette and unique character

The purpose is to improve the original product photography and lighting in a professional studio setting, NOT redesign, rearrange, or add extra blooms.
`;
  }

  return `
CRITICAL INSTRUCTION - PRODUCT PRESERVATION:
You are a world-class professional commercial product photographer and editor.
The uploaded image contains the EXACT product reference toy.

MOST IMPORTANT RULE:
The uploaded toy must ALWAYS be treated as the exact product reference.
DO NOT CREATE A DIFFERENT TOY.
PRESERVE 100% ACCURATELY:
- exact colors, shades, and color distribution
- facial features, eyes, expressions, nose, mouth
- proportions and silhouette
- materials, fabric textures, wood grains, or plastic finish
- clothing, stitching, seams, bow ties, or accessories
- overall toy identity and unique character

The purpose is to improve the original product photography and lighting in a professional studio setting, NOT redesign or alter the product.
`;
}

export function buildStudioPrompt(params: StudioPromptParams): string {
  const { productName, toySizeCm, productDescription, productKind, style, personScale } =
    params;
  const floral = isFloral(productKind);
  const { styleInstructions, backgroundGuidance } = buildStyleInstructions(style, floral);
  const personScaleInstructions = buildPersonScaleInstructions(
    personScale,
    toySizeCm,
    floral
  );
  const subjectLabel = floral ? "flowers / bouquet" : "toy";
  const productLine = floral
    ? `The product is "${productName || "Bouquet"}".`
    : hasNumericSize(toySizeCm)
      ? `The product is "${productName}" (${toySizeCm} cm tall).`
      : `The product is "${productName}".`;

  return `
${buildPreservationRules(floral)}
${productLine}

${styleInstructions}

${personScaleInstructions}

Product Notes: "${productDescription || productName}"
Overall scene: Photorealistic 8k commercial ${subjectLabel} photo, master studio lighting, authentic textures, ${backgroundGuidance}.
`;
}

export function buildImproveDescriptionPrompt(params: {
  productName?: string;
  toySizeCm?: string | number;
  productKind?: ProductKind;
  roughDescription?: string;
}): string {
  const { productName, toySizeCm, productKind, roughDescription } = params;
  const floral = isFloral(productKind ?? "toy");

  if (floral) {
    return `
You are a professional e-commerce copywriter specializing in flowers, bouquets, florist shops, and botanical gifts for Etsy, florist sites, and boutique shops.

Based on the provided flower details:
- Product name input: "${productName || "Bouquet"}"
- Rough user notes/description: "${roughDescription || ""}"

Return a JSON object with EXACTLY these three keys:
1. "productTitle": A clean, SEO-optimized, appealing e-commerce title (approx 5-10 words). Include bloom type and arrangement style.
2. "sellingLine": A single, punchy, emotive one-liner selling hook (10-20 words).
3. "productDescription": A concise, polished 2-3 paragraph marketing description highlighting bloom variety, color, freshness, occasion (gift, wedding, home), and how it will look on arrival. Do NOT mention toys, play, size in cm, or age suitability.

Respond strictly with valid JSON only. Do not include markdown ticks or code fences if possible.
`;
  }

  return `
You are a professional e-commerce copywriter specializing in toys, kids gifts, and handcrafted products for Amazon, Etsy, and boutique shops.

Based on the provided toy details:
- Product name input: "${productName || "Toy"}"
- Physical size: ${toySizeCm ? `${toySizeCm} cm` : "Not specified"}
- Rough user notes/description: "${roughDescription || ""}"

Return a JSON object with EXACTLY these three keys:
1. "productTitle": A clean, SEO-optimized, appealing e-commerce title (approx 5-10 words). Include key descriptor and toy type.
2. "sellingLine": A single, punchy, emotive one-liner selling hook (10-20 words).
3. "productDescription": A concise, polished 2-3 paragraph marketing description highlighting tactile feel, safety/quality, play value, age suitability, and gift appeal.

Respond strictly with valid JSON only. Do not include markdown ticks or code fences if possible.
`;
}

export function buildCopyPrompt(params: {
  productName: string;
  toySizeCm?: string | number;
  productKind?: ProductKind;
  style: ImageStyle;
  personScale: PersonScale;
  productDescription: string;
}): string {
  const { productName, toySizeCm, productKind, style, personScale, productDescription } = params;
  const floral = isFloral(productKind ?? "toy");
  const scaleNote =
    personScale === "none"
      ? "solo product"
      : personScale === "child"
        ? "with child for scale"
        : "with adult for scale";

  if (floral) {
    return `
Generate concise e-commerce copy for this floral product:
- Product name: "${productName}"
- Style rendered: ${style} (${scaleNote})
- Notes: "${productDescription}"

Return a JSON object with:
1. "productTitle": High-converting e-commerce listing title (florist / Etsy style).
2. "sellingLine": One short selling line / hook.
3. "marketingDescription": 2-3 short paragraphs describing why buyers will love it, bloom quality, occasion, and gift appeal. Do not mention toys, play, or a size in cm.
`;
  }

  const sizeLine = hasNumericSize(toySizeCm) ? `- Size: ${toySizeCm} cm` : "- Size: Not specified";
  const sizeCopy = hasNumericSize(toySizeCm)
    ? `its size (${toySizeCm} cm), craftsmanship, and play/gift appeal`
    : "craftsmanship, and play/gift appeal";

  return `
Generate concise e-commerce copy for this toy product:
- Product name: "${productName}"
${sizeLine}
- Style rendered: ${style} (${scaleNote})
- Notes: "${productDescription}"

Return a JSON object with:
1. "productTitle": High-converting e-commerce listing title (e.g. Amazon/Etsy style).
2. "sellingLine": One short selling line / hook.
3. "marketingDescription": 2-3 short paragraphs describing why buyers will love it, ${sizeCopy}.
`;
}

export interface ImprovedCopyResult {
  productTitle: string;
  sellingLine: string;
  productDescription: string;
}

export interface GeneratedCopyResult {
  productTitle: string;
  sellingLine: string;
  marketingDescription: string;
}

export function parseJsonFromText<T>(rawText: string, fallback: T): T {
  try {
    return JSON.parse(rawText) as T;
  } catch {
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as T;
    }
    return fallback;
  }
}
