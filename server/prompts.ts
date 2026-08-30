import type { ImageStyle, PersonScale } from "../src/types";

export interface StudioPromptParams {
  productName: string;
  toySizeCm: string | number;
  productDescription: string;
  style: ImageStyle;
  personScale: PersonScale;
}

export function buildStudioPrompt(params: StudioPromptParams): string {
  const { productName, toySizeCm, productDescription, style, personScale } = params;

  let styleInstructions = "";
  let backgroundGuidance = "";

  if (style === "clean-catalog") {
    styleInstructions = `
STYLE 1 — CLEAN CATALOG:
- Create a crisp, ultra-clean professional e-commerce catalog photograph.
- Clean pure white or very light neutral studio background (solid #F8F9FA or pure white).
- The exact toy from the reference image must be centered, upright or sitting naturally.
- Soft, professional diffused studio lighting from dual key/fill softboxes.
- Soft, realistic contact shadow on the floor surface beneath the toy.
- Razor-sharp, clean edges with no background distraction, no clutter, no decorative props.
- Enhanced contrast, exposure, and color calibration to commercial retail photography standards.
- No text, labels, or watermarks on the image.
`;
    backgroundGuidance = "clean pure white studio background with soft realistic contact shadow";
  } else if (style === "styled-promo") {
    styleInstructions = `
STYLE 2 — STYLED PROMO:
- Create an attractive, warm commercial lifestyle image suitable for selling toys online — composed like a social ad or shop banner that will receive a product-name headline later.
- The EXACT toy from the uploaded reference photo is the dominant, crisp foreground hero subject.
- Contextual background: A tasteful, warm children's setting with soft shallow depth-of-field blur (such as a sunlit Scandinavian nursery, smooth blonde wooden play table, or cozy pastel playroom shelf).
- Warm, natural golden daylight with gentle rim glow and rich ambient atmosphere.
- Keep the toy 100% true to original reference in material, colors, and features.
- Realistic surface reflections and natural cast shadows.
- COMPOSITION FOR TYPE: Place the toy in the upper two-thirds of the frame. Leave a clean, uncluttered lower band (about the bottom 22%) with soft falloff and no busy props, so a product name and selling line can sit on the photo.
- Do NOT render any text, letters, logos, captions, watermarks, or labels in the photograph.
`;
    backgroundGuidance = "tasteful soft-focus warm nursery / wooden playroom lifestyle setting with open lower third for headline type";
  } else {
    styleInstructions = `
STYLE 3 — LUXURY PROMO:
- Create a premium high-end luxury advertising campaign photo — composed like a magazine ad that will receive elegant product-name typography later.
- The EXACT toy from the reference photo is displayed as a prestigious hero piece.
- Composition: Positioned elegantly atop a minimalist architectural podium, travertine stone plinth, or softly draped luxury textured fabric.
- Premium studio spotlighting with dramatic yet soft directional falloff, subtle warm rim lighting accentuating the toy's textures.
- Clean luxury aesthetic, gift-like prestige presentation with rich, deep, refined tonality.
- Flawless commercial lighting and soft elegant shadows.
- COMPOSITION FOR TYPE: Keep the toy in the upper two-thirds. Leave a calm, dark-to-soft lower band (about the bottom 24%) free of objects so a product name can be printed on the image.
- Do NOT render any text, letters, logos, captions, watermarks, or labels in the photograph.
`;
    backgroundGuidance = "architectural stone plinth, luxury draped fabric, elegant high-end studio lighting with open lower third for headline type";
  }

  let personScaleInstructions = "";
  if (personScale === "child") {
    personScaleInstructions = `
PERSON FOR SIZE REFERENCE:
- Include a realistic, cheerful child (approx 4-7 years old) naturally sitting next to or gently holding/interacting with the toy.
- VISUAL SCALE ACCURACY: The entered toy height is ${toySizeCm} cm. The scale of the toy relative to the child's hands and torso must realistically match ${toySizeCm} cm.
- The toy must remain the unobstructed, crisp main hero subject in the foreground.
- The child must look natural, warm, and candid without covering key toy features.
`;
  } else if (personScale === "adult") {
    personScaleInstructions = `
PERSON FOR SIZE REFERENCE:
- Include a realistic adult (hands gently holding or presenting the toy, or standing/sitting naturally beside it) for clear visual scale comparison.
- VISUAL SCALE ACCURACY: The entered toy height is ${toySizeCm} cm. The scale of the toy relative to the adult hands/body must realistically match ${toySizeCm} cm.
- The toy must remain the unobstructed, sharp focal hero of the composition.
`;
  } else {
    personScaleInstructions = `
PERSON FOR SIZE REFERENCE:
- No human figures or hands. The toy is shown as a solo hero subject.
`;
  }

  return `
CRITICAL INSTRUCTION - PRODUCT PRESERVATION:
You are a world-class professional commercial product photographer and editor.
The uploaded image contains the EXACT product reference toy: "${productName}" (${toySizeCm} cm tall).

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

${styleInstructions}

${personScaleInstructions}

Product Notes: "${productDescription || productName}"
Overall scene: Photorealistic 8k commercial product photo, master studio lighting, authentic textures, ${backgroundGuidance}.
`;
}

export function buildImproveDescriptionPrompt(params: {
  productName?: string;
  toySizeCm?: string | number;
  roughDescription?: string;
}): string {
  const { productName, toySizeCm, roughDescription } = params;

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
  toySizeCm: string | number;
  style: ImageStyle;
  personScale: PersonScale;
  productDescription: string;
}): string {
  const { productName, toySizeCm, style, personScale, productDescription } = params;

  return `
Generate concise e-commerce copy for this toy product:
- Product name: "${productName}"
- Size: ${toySizeCm} cm
- Style rendered: ${style} (${personScale === "none" ? "solo product" : personScale === "child" ? "with child for scale" : "with adult for scale"})
- Notes: "${productDescription}"

Return a JSON object with:
1. "productTitle": High-converting e-commerce listing title (e.g. Amazon/Etsy style).
2. "sellingLine": One short selling line / hook.
3. "marketingDescription": 2-3 short paragraphs describing why buyers will love it, its size (${toySizeCm} cm), craftsmanship, and play/gift appeal.
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
