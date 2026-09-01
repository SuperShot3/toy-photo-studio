import {
  STYLE_REF_PROMPT_MAX,
  defaultProductName,
  type ImageStyle,
  type PersonScale,
  type ProductKind,
} from "../src/types.js";

export interface StudioPromptParams {
  productName: string;
  toySizeCm?: string | number;
  productDescription: string;
  productKind: ProductKind;
  style: ImageStyle;
  personScale: PersonScale;
  styleRefPrompt?: string;
}

function subjectNoun(kind: ProductKind): string {
  if (kind === "flowers") return "flowers";
  if (kind === "balloons") return "balloons";
  if (kind === "candy") return "candy";
  if (kind === "other") return "product";
  return "toy";
}

function subjectLabel(kind: ProductKind): string {
  if (kind === "flowers") return "flowers / bouquet";
  if (kind === "balloons") return "balloons / balloon bouquet";
  if (kind === "candy") return "candy / confectionery";
  if (kind === "other") return "product";
  return "toy";
}

function subjectVerb(kind: ProductKind): "are" | "is" {
  return kind === "flowers" || kind === "balloons" || kind === "candy" ? "are" : "is";
}

function buildStyleInstructions(
  style: ImageStyle,
  kind: ProductKind
): { styleInstructions: string; backgroundGuidance: string } {
  if (style === "clean-catalog") {
    if (kind === "flowers") {
      return {
        styleInstructions: `
STYLE 1 — CLEAN CATALOG:
- Create a crisp, ultra-clean professional e-commerce catalog photograph of the exact flowers from the reference.
- Clean pure white or very light neutral studio background (solid #F8F9FA or pure white).
- The exact flowers from the reference image must be centered, standing naturally in their original wrapping, stems, or vase if present. Do not change the container.
- Soft, professional diffused studio lighting from dual key/fill softboxes. Change lighting and background only.
- Soft, realistic contact shadow on the surface beneath the stems, wrap, or vase.
- Keep petal color, saturation, and bloom appearance identical to the reference. Do not retouch, beautify, or recalibrate flower color.
- Razor-sharp petals and foliage with no background distraction, no clutter, no extra decorative props.
- No text, labels, or watermarks on the image.
`,
        backgroundGuidance:
          "clean pure white studio background with soft realistic contact shadow",
      };
    }
    if (kind === "balloons") {
      return {
        styleInstructions: `
STYLE 1 — CLEAN CATALOG:
- Create a crisp, ultra-clean professional e-commerce catalog photograph of the exact balloons from the reference.
- Clean pure white or very light neutral studio background (solid #F8F9FA or pure white).
- The exact balloons from the reference image must be centered, floating or standing naturally with their original strings, ribbons, or weight if present. Do not add extra balloons.
- Soft, professional diffused studio lighting from dual key/fill softboxes. Change lighting and background only.
- Soft, realistic contact shadow on the surface beneath the weight, strings, or clustered balloons.
- Keep balloon color, print, metallic or latex sheen, and inflation identical to the reference. Do not retouch, recolor, or invent new designs.
- Razor-sharp edges with no background distraction, no clutter, no extra party props, confetti, cake, or gifts.
- No text, labels, or watermarks on the image beyond prints already on the balloons.
`,
        backgroundGuidance:
          "clean pure white studio background with soft realistic contact shadow",
      };
    }
    if (kind === "candy") {
      return {
        styleInstructions: `
STYLE 1 — CLEAN CATALOG:
- Create a crisp, ultra-clean professional e-commerce catalog photograph of the exact candy from the reference.
- Clean pure white or very light neutral studio background (solid #F8F9FA or pure white).
- The exact candy from the reference image must be centered, arranged as in the original photo, with original wrappers, box, or bag if present. Do not add extra pieces.
- Soft, professional diffused studio lighting from dual key/fill softboxes. Change lighting and background only.
- Soft, realistic contact shadow on the surface beneath the candy, wrappers, or box.
- Keep wrapper colors, logos, foil, sugar texture, and piece count identical to the reference. Do not unwrap, rebrand, or invent new candy.
- Razor-sharp edges with no background distraction, no clutter, no extra decorative props.
- No text, labels, or watermarks on the image beyond packaging already on the product.
`,
        backgroundGuidance:
          "clean pure white studio background with soft realistic contact shadow",
      };
    }
    if (kind === "other") {
      return {
        styleInstructions: `
STYLE 1 — CLEAN CATALOG:
- Create a crisp, ultra-clean professional e-commerce catalog photograph of the exact product from the reference.
- Clean pure white or very light neutral studio background (solid #F8F9FA or pure white).
- The exact product from the reference image must be centered, shown as it naturally sits or stands. Do not restage into a different pose or container.
- Soft, professional diffused studio lighting from dual key/fill softboxes. Change lighting and background only.
- Soft, realistic contact shadow on the surface beneath the product.
- Keep color, materials, logos, packaging, and unique details identical to the reference. Do not retouch, rebrand, or invent new features.
- Razor-sharp edges with no background distraction, no clutter, no extra decorative props.
- No text, labels, or watermarks on the image beyond marks already on the product.
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
    if (kind === "flowers") {
      return {
        styleInstructions: `
STYLE 2 — STYLED PROMO:
- Create an attractive, warm commercial lifestyle image suitable for selling flowers or bouquets online — composed like a florist ad or shop banner that will receive a product-name headline later.
- The EXACT flowers from the uploaded reference photo are the dominant, crisp foreground hero subject.
- Contextual background: A tasteful florist / botanical setting with soft shallow depth-of-field blur (such as a sunlit linen table, pale marble counter, ceramic vase, or airy flower-shop window light). Do NOT use a children's nursery or playroom.
- Warm, natural daylight with gentle rim glow on petals and rich ambient atmosphere.
- Keep the flowers 100% identical to the original reference: species, bloom count, petal colors, saturation, and arrangement. Do not restyle or retouch the blooms.
- Realistic surface reflections and natural cast shadows.
- COMPOSITION FOR TYPE: Place the flowers in the upper two-thirds of the frame. Leave a clean, uncluttered lower band (about the bottom 22%) with soft falloff and no busy props, so a product name and selling line can sit on the photo.
- Do NOT render any text, letters, logos, captions, watermarks, or labels in the photograph.
`,
        backgroundGuidance:
          "tasteful soft-focus florist studio / linen table / marble lifestyle setting with open lower third for headline type",
      };
    }
    if (kind === "balloons") {
      return {
        styleInstructions: `
STYLE 2 — STYLED PROMO:
- Create an attractive, warm commercial lifestyle image suitable for selling balloons or balloon bouquets online — composed like a party-shop ad or celebration banner that will receive a product-name headline later.
- The EXACT balloons from the uploaded reference photo are the dominant, crisp foreground hero subject.
- Contextual background: A tasteful celebration / party-shop setting with soft shallow depth-of-field blur (such as a pale party table, airy event loft, or balloon-studio window light). Do NOT add extra balloons, cake, confetti cannons, or gifts that were not in the reference.
- Warm, natural daylight with gentle rim glow on latex or foil and rich ambient atmosphere.
- Keep the balloons 100% identical to the original reference: count, shapes, prints, colors, strings, and weight. Do not restyle or invent new balloon designs.
- Realistic surface reflections and natural cast shadows.
- COMPOSITION FOR TYPE: Place the balloons in the upper two-thirds of the frame. Leave a clean, uncluttered lower band (about the bottom 22%) with soft falloff and no busy props, so a product name and selling line can sit on the photo.
- Do NOT render any text, letters, logos, captions, watermarks, or labels in the photograph beyond prints already on the balloons.
`,
        backgroundGuidance:
          "tasteful soft-focus party studio / celebration table lifestyle setting with open lower third for headline type",
      };
    }
    if (kind === "candy") {
      return {
        styleInstructions: `
STYLE 2 — STYLED PROMO:
- Create an attractive, warm commercial lifestyle image suitable for selling candy or confectionery online — composed like a sweets-shop ad or gift banner that will receive a product-name headline later.
- The EXACT candy from the uploaded reference photo is the dominant, crisp foreground hero subject.
- Contextual background: A tasteful confectionery / gift setting with soft shallow depth-of-field blur (such as a marble dessert counter, candy-shop glass case, or linen gift table). Do NOT add extra sweets, cakes, or party clutter that were not in the reference.
- Warm, natural daylight with gentle rim glow on wrappers and rich ambient atmosphere.
- Keep the candy 100% identical to the original reference: wrappers, logos, piece count, colors, and packaging. Do not unwrap, rebrand, or invent new candy.
- Realistic surface reflections and natural cast shadows.
- COMPOSITION FOR TYPE: Place the candy in the upper two-thirds of the frame. Leave a clean, uncluttered lower band (about the bottom 22%) with soft falloff and no busy props, so a product name and selling line can sit on the photo.
- Do NOT render any text, letters, logos, captions, watermarks, or labels in the photograph beyond packaging already on the product.
`,
        backgroundGuidance:
          "tasteful soft-focus confectionery / gift-table lifestyle setting with open lower third for headline type",
      };
    }
    if (kind === "other") {
      return {
        styleInstructions: `
STYLE 2 — STYLED PROMO:
- Create an attractive, warm commercial lifestyle image suitable for selling this product online — composed like a shop ad or banner that will receive a product-name headline later.
- The EXACT product from the uploaded reference photo is the dominant, crisp foreground hero subject.
- Contextual background: A tasteful lifestyle setting that fits the product, with soft shallow depth-of-field blur (such as a linen table, marble counter, wooden shelf, or airy boutique window light). Do NOT add extra products or clutter that were not in the reference.
- Warm, natural daylight with gentle rim glow and rich ambient atmosphere.
- Keep the product 100% identical to the original reference: shape, materials, colors, logos, and packaging. Do not restyle, rebrand, or invent new details.
- Realistic surface reflections and natural cast shadows.
- COMPOSITION FOR TYPE: Place the product in the upper two-thirds of the frame. Leave a clean, uncluttered lower band (about the bottom 22%) with soft falloff and no busy props, so a product name and selling line can sit on the photo.
- Do NOT render any text, letters, logos, captions, watermarks, or labels in the photograph beyond marks already on the product.
`,
        backgroundGuidance:
          "tasteful soft-focus lifestyle / boutique setting with open lower third for headline type",
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

  if (kind === "flowers") {
    return {
      styleInstructions: `
STYLE 3 — LUXURY PROMO:
- Create a premium high-end luxury advertising campaign photo of flowers — composed like a magazine florist ad that will receive elegant product-name typography later.
- The EXACT flowers from the reference photo are displayed as a prestigious hero piece.
- Keep the original wrapping, ribbon, stems, or vase from the reference. Do NOT restage into a different vase or rearrange the bouquet.
- Place that unchanged arrangement in a luxury studio setting: a minimalist architectural podium, travertine stone plinth, or softly draped luxury textured fabric behind/beneath it.
- Premium studio spotlighting with dramatic yet soft directional falloff, subtle warm rim lighting. Lighting and background only — do not change petal color or bloom appearance.
- Clean luxury aesthetic, gift-like prestige presentation with rich, deep, refined tonality.
- Flawless commercial lighting and soft elegant shadows.
- COMPOSITION FOR TYPE: Keep the flowers in the upper two-thirds. Leave a calm, dark-to-soft lower band (about the bottom 24%) free of objects so a product name can be printed on the image.
- Do NOT render any text, letters, logos, captions, watermarks, or labels in the photograph.
`,
      backgroundGuidance:
        "architectural stone plinth, luxury draped fabric, elegant high-end florist studio lighting with open lower third for headline type — original wrapping or vase unchanged",
    };
  }

  if (kind === "balloons") {
    return {
      styleInstructions: `
STYLE 3 — LUXURY PROMO:
- Create a premium high-end luxury advertising campaign photo of balloons — composed like a magazine celebration ad that will receive elegant product-name typography later.
- The EXACT balloons from the reference photo are displayed as a prestigious hero piece.
- Keep the original balloon count, prints, strings, ribbons, or weight from the reference. Do NOT add extra balloons or restyle the bunch.
- Place that unchanged arrangement in a luxury studio setting: a minimalist architectural podium, travertine stone plinth, or softly draped luxury textured fabric behind/beneath it.
- Premium studio spotlighting with dramatic yet soft directional falloff, subtle warm rim lighting. Lighting and background only — do not change balloon color, print, or sheen.
- Clean luxury aesthetic, gift-like prestige presentation with rich, deep, refined tonality.
- Flawless commercial lighting and soft elegant shadows.
- COMPOSITION FOR TYPE: Keep the balloons in the upper two-thirds. Leave a calm, dark-to-soft lower band (about the bottom 24%) free of objects so a product name can be printed on the image.
- Do NOT render any text, letters, logos, captions, watermarks, or labels in the photograph beyond prints already on the balloons.
`,
      backgroundGuidance:
        "architectural stone plinth, luxury draped fabric, elegant high-end celebration studio lighting with open lower third for headline type — original balloons unchanged",
    };
  }

  if (kind === "candy") {
    return {
      styleInstructions: `
STYLE 3 — LUXURY PROMO:
- Create a premium high-end luxury advertising campaign photo of candy — composed like a magazine confectionery ad that will receive elegant product-name typography later.
- The EXACT candy from the reference photo is displayed as a prestigious hero piece.
- Keep the original wrappers, box, bag, piece count, and arrangement from the reference. Do NOT unwrap, rebrand, or add extra sweets.
- Place that unchanged product in a luxury studio setting: a minimalist architectural podium, travertine stone plinth, or softly draped luxury textured fabric behind/beneath it.
- Premium studio spotlighting with dramatic yet soft directional falloff, subtle warm rim lighting. Lighting and background only — do not change wrapper color or candy appearance.
- Clean luxury aesthetic, gift-like prestige presentation with rich, deep, refined tonality.
- Flawless commercial lighting and soft elegant shadows.
- COMPOSITION FOR TYPE: Keep the candy in the upper two-thirds. Leave a calm, dark-to-soft lower band (about the bottom 24%) free of objects so a product name can be printed on the image.
- Do NOT render any text, letters, logos, captions, watermarks, or labels in the photograph beyond packaging already on the product.
`,
      backgroundGuidance:
        "architectural stone plinth, luxury draped fabric, elegant high-end confectionery studio lighting with open lower third for headline type — original candy unchanged",
    };
  }

  if (kind === "other") {
    return {
      styleInstructions: `
STYLE 3 — LUXURY PROMO:
- Create a premium high-end luxury advertising campaign photo of this product — composed like a magazine ad that will receive elegant product-name typography later.
- The EXACT product from the reference photo is displayed as a prestigious hero piece.
- Keep the original shape, materials, packaging, logos, and arrangement from the reference. Do NOT restyle, rebrand, or add extra items.
- Place that unchanged product in a luxury studio setting: a minimalist architectural podium, travertine stone plinth, or softly draped luxury textured fabric behind/beneath it.
- Premium studio spotlighting with dramatic yet soft directional falloff, subtle warm rim lighting. Lighting and background only — do not change product color or appearance.
- Clean luxury aesthetic, gift-like prestige presentation with rich, deep, refined tonality.
- Flawless commercial lighting and soft elegant shadows.
- COMPOSITION FOR TYPE: Keep the product in the upper two-thirds. Leave a calm, dark-to-soft lower band (about the bottom 24%) free of objects so a product name can be printed on the image.
- Do NOT render any text, letters, logos, captions, watermarks, or labels in the photograph beyond marks already on the product.
`,
      backgroundGuidance:
        "architectural stone plinth, luxury draped fabric, elegant high-end studio lighting with open lower third for headline type — original product unchanged",
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
  kind: ProductKind,
  hasSceneLook: boolean
): string {
  const subject = subjectNoun(kind);
  const toyScaleLine = hasNumericSize(toySizeCm)
    ? `- VISUAL SCALE ACCURACY: The entered toy height is ${toySizeCm} cm. The scale of the toy relative to the child's hands and torso must realistically match ${toySizeCm} cm.`
    : `- Keep the toy at a natural, realistic scale relative to the child's hands and torso.`;
  const toyAdultScaleLine = hasNumericSize(toySizeCm)
    ? `- VISUAL SCALE ACCURACY: The entered toy height is ${toySizeCm} cm. The scale of the toy relative to the adult hands/body must realistically match ${toySizeCm} cm.`
    : `- Keep the toy at a natural, realistic scale relative to the adult hands/body.`;

  if (personScale === "child") {
    if (kind === "flowers") {
      return `
PERSON FOR SIZE REFERENCE:
- Include a realistic, cheerful child (approx 4-7 years old) naturally receiving or gently holding the bouquet as a gift.
- Keep the flowers at a natural, realistic scale relative to the child's hands and torso.
- The flowers must remain the unobstructed, crisp main hero subject in the foreground.
- The child must look natural, warm, and candid without covering key blooms.
`;
    }
    return `
PERSON FOR SIZE REFERENCE:
- Include a realistic, cheerful child (approx 4-7 years old) naturally sitting next to or gently holding/interacting with the toy.
${toyScaleLine}
- The toy must remain the unobstructed, crisp main hero subject in the foreground.
- The child must look natural, warm, and candid without covering key toy features.
`;
  }

  if (personScale === "adult") {
    if (kind === "flowers") {
      return `
PERSON FOR SIZE REFERENCE:
- Include realistic adult florist or gift-giver hands gently holding or presenting the flowers for clear visual scale comparison. Do not rearrange, restyle, or alter the blooms.
- Keep the flowers at a natural, realistic scale relative to the adult hands/body.
- The flowers must remain the unobstructed, sharp focal hero of the composition.
`;
    }
    return `
PERSON FOR SIZE REFERENCE:
- Include a realistic adult (hands gently holding or presenting the toy, or standing/sitting naturally beside it) for clear visual scale comparison.
${toyAdultScaleLine}
- The toy must remain the unobstructed, sharp focal hero of the composition.
`;
  }

  if (hasSceneLook) {
    return `
PERSON FOR SIZE REFERENCE:
- Follow the SCENE LOOK for whether a person appears. Do not add extra people, hands, or figures beyond that look.
`;
  }

  return `
PERSON FOR SIZE REFERENCE:
- No human figures or hands. The ${subject} ${subjectVerb(kind)} shown as a solo hero subject.
`;
}

function buildPreservationRules(kind: ProductKind): string {
  if (kind === "flowers") {
    return `
CRITICAL INSTRUCTION - PRODUCT PRESERVATION:
You are a world-class professional commercial product photographer specializing in florist and botanical catalog work.
The uploaded image contains the EXACT product reference flowers. Keep those flowers original.

MOST IMPORTANT RULE:
The uploaded flowers must ALWAYS be treated as the exact, unaltered product reference.
DO NOT CREATE DIFFERENT FLOWERS, A DIFFERENT BOUQUET, OR A TOY.
DO NOT improve, beautify, saturate, recolor, retouch, or "enhance" the blooms themselves.
PRESERVE 100% IDENTICALLY:
- species and bloom identity
- exact petal colors, shades, veining, saturation, and color distribution
- bloom count, size, and how open each flower is
- stem length, leaf placement, foliage, wrapping, ribbon, or vase if present
- overall arrangement silhouette and unique character

ONLY lighting, background, and studio setting may change.
Do NOT redesign, rearrange, add or remove blooms, change the container, or alter flower appearance.
`;
  }

  if (kind === "balloons") {
    return `
CRITICAL INSTRUCTION - PRODUCT PRESERVATION:
You are a world-class professional commercial product photographer specializing in balloon and party-product catalog work.
The uploaded image contains the EXACT product reference balloons. Keep those balloons original.

MOST IMPORTANT RULE:
The uploaded balloons must ALWAYS be treated as the exact, unaltered product reference.
DO NOT CREATE DIFFERENT BALLOONS, A DIFFERENT BUNCH, OR EXTRA PARTY PROPS.
DO NOT improve, recolor, reprint, retouch, or "enhance" the balloons themselves.
PRESERVE 100% IDENTICALLY:
- balloon count, shapes (round, foil, number, character), and how inflated each balloon is
- exact colors, prints, logos, metallic or latex sheen, and color distribution
- strings, ribbons, curling ribbon, weight, or holder if present
- overall bunch silhouette and unique character

ONLY lighting, background, and studio setting may change.
Do NOT add or remove balloons, change prints, or invent extra decorations.
`;
  }

  if (kind === "candy") {
    return `
CRITICAL INSTRUCTION - PRODUCT PRESERVATION:
You are a world-class professional commercial product photographer specializing in confectionery and sweets catalog work.
The uploaded image contains the EXACT product reference candy. Keep that candy original.

MOST IMPORTANT RULE:
The uploaded candy must ALWAYS be treated as the exact, unaltered product reference.
DO NOT CREATE DIFFERENT CANDY, A DIFFERENT ASSORTMENT, OR EXTRA SWEETS.
DO NOT unwrap, rebrand, recolor, retouch, or "enhance" the candy itself.
PRESERVE 100% IDENTICALLY:
- piece count, shapes, and arrangement
- exact wrapper colors, foil, logos, packaging, box, or bag if present
- sugar texture, chocolate sheen, and color distribution
- overall product silhouette and unique character

ONLY lighting, background, and studio setting may change.
Do NOT add or remove pieces, change wrappers, or invent extra decorations.
`;
  }

  if (kind === "other") {
    return `
CRITICAL INSTRUCTION - PRODUCT PRESERVATION:
You are a world-class professional commercial product photographer.
The uploaded image contains the EXACT product. Keep that product original.

MOST IMPORTANT RULE:
The uploaded product must ALWAYS be treated as the exact, unaltered product reference.
DO NOT CREATE A DIFFERENT PRODUCT.
DO NOT improve, beautify, recolor, retouch, or "enhance" the product itself.
PRESERVE 100% IDENTICALLY:
- exact shape, proportions, and silhouette
- colors, materials, textures, and finishes
- logos, labels, packaging, and unique details if present
- overall product identity and character

ONLY lighting, background, and studio setting may change.
Do NOT redesign, restage into a different object, or invent extra items.
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

export function buildSubjectClassifyPrompt(): string {
  return `
Look only at the uploaded photo. Classify the main product subject so studio lighting and copy can match it.

Return a JSON object with EXACTLY this key:
- "kind": one of "toy", "flowers", "balloons", "candy", or "other"

Rules:
- "toy": playthings, figures, dolls, plush, stuffed animals, wooden toys, action figures, toy vehicles. A manufactured toy that happens to look like a flower, balloon, or candy still counts as toy.
- "flowers": real flowers, blooms, bouquets, plants, potted flowers, florist arrangements. Not a toy.
- "balloons": latex, foil, Mylar, number, or character balloons, balloon bunches, balloon bouquets. The main product is balloons, not a toy that happens to hold a balloon.
- "candy": sweets, chocolate, lollipops, hard candy, wrapped confectionery, candy boxes or bags sold as the product. Not a meal, bakery cake, or unrelated food.
- "other": any other sellable product (home goods, clothing, furniture, electronics, kitchenware, cosmetics, and similar). Use this whenever the main subject is not a toy, flowers, balloons, or candy. Still photograph it as a product. Do not reject the photo.

Respond with valid JSON only. No markdown.
`;
}

const SCENE_VARIATIONS = [
  "Slightly raise the camera height.",
  "Slightly lower the camera height.",
  "Shift the key light a few degrees to the left.",
  "Shift the key light a few degrees to the right.",
  "Soften surface folds or texture slightly.",
  "Warm the rim light a touch.",
  "Cool the fill light a touch.",
];

function pickSceneVariation(): string {
  const index = Math.floor(Math.random() * SCENE_VARIATIONS.length);
  return `SCENE VARIATION: ${SCENE_VARIATIONS[index]} Keep the same materials, palette, and lighting mood. Do not copy a previous frame.`;
}

function buildSceneLookBlock(styleRefPrompt?: string): {
  sceneBlock: string;
  backgroundOverride?: string;
} {
  const trimmed = styleRefPrompt?.trim().slice(0, STYLE_REF_PROMPT_MAX);
  if (!trimmed) return { sceneBlock: "" };
  return {
    sceneBlock: `
SCENE LOOK:
Follow this scene direction for setting, lighting, pose, and composition. Place the exact product from the reference photo into that setting. Do not copy a previous frame.
${trimmed}

${pickSceneVariation()}
`,
    backgroundOverride: trimmed,
  };
}

export function buildStudioPrompt(params: StudioPromptParams): string {
  const {
    productName,
    toySizeCm,
    productDescription,
    productKind,
    style,
    personScale,
    styleRefPrompt,
  } = params;
  const { styleInstructions, backgroundGuidance } = buildStyleInstructions(style, productKind);
  const { sceneBlock, backgroundOverride } = buildSceneLookBlock(styleRefPrompt);
  const personScaleInstructions = buildPersonScaleInstructions(
    personScale,
    toySizeCm,
    productKind,
    Boolean(backgroundOverride)
  );
  const productLine =
    productKind === "toy" && hasNumericSize(toySizeCm)
      ? `The product is "${productName}" (${toySizeCm} cm tall).`
      : `The product is "${productName || defaultProductName(productKind)}".`;
  const sceneGuidance = backgroundOverride || backgroundGuidance;

  return `
${buildPreservationRules(productKind)}
${productLine}

${styleInstructions}
${sceneBlock}

${personScaleInstructions}

Product Notes: "${productDescription || productName}"
Overall scene: Photorealistic 8k commercial ${subjectLabel(productKind)} photo, master studio lighting, authentic textures, ${sceneGuidance}.
`;
}

export function buildImproveDescriptionPrompt(params: {
  productName?: string;
  toySizeCm?: string | number;
  productKind?: ProductKind;
  roughDescription?: string;
}): string {
  const { productName, toySizeCm, productKind, roughDescription } = params;
  const kind = productKind ?? "toy";

  if (kind === "flowers") {
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

  if (kind === "balloons") {
    return `
You are a professional e-commerce copywriter specializing in balloons, balloon bouquets, and party supplies for Etsy, party shops, and boutique stores.

Based on the provided balloon details:
- Product name input: "${productName || "Balloon Bouquet"}"
- Rough user notes/description: "${roughDescription || ""}"

Return a JSON object with EXACTLY these three keys:
1. "productTitle": A clean, SEO-optimized, appealing e-commerce title (approx 5-10 words). Include balloon type (latex, foil, number) and occasion if known.
2. "sellingLine": A single, punchy, emotive one-liner selling hook (10-20 words).
3. "productDescription": A concise, polished 2-3 paragraph marketing description highlighting colors, prints, latex or foil finish, bunch style, and celebration occasion (birthday, party, gift). Do NOT mention toys, play, size in cm, or age suitability.

Respond strictly with valid JSON only. Do not include markdown ticks or code fences if possible.
`;
  }

  if (kind === "candy") {
    return `
You are a professional e-commerce copywriter specializing in candy, sweets, chocolate, and confectionery gifts for Etsy, candy shops, and boutique stores.

Based on the provided candy details:
- Product name input: "${productName || "Candy"}"
- Rough user notes/description: "${roughDescription || ""}"

Return a JSON object with EXACTLY these three keys:
1. "productTitle": A clean, SEO-optimized, appealing e-commerce title (approx 5-10 words). Include candy type and a flavor or gift cue if known.
2. "sellingLine": A single, punchy, emotive one-liner selling hook (10-20 words).
3. "productDescription": A concise, polished 2-3 paragraph marketing description highlighting flavor, wrappers, piece count or box, and gift or party occasion. Do NOT mention toys, play, size in cm, or age suitability.

Respond strictly with valid JSON only. Do not include markdown ticks or code fences if possible.
`;
  }

  if (kind === "other") {
    return `
You are a professional e-commerce copywriter specializing in product listings for Amazon, Etsy, Shopify, and boutique shops.

Based on the provided product details:
- Product name input: "${productName || "Product"}"
- Rough user notes/description: "${roughDescription || ""}"

Return a JSON object with EXACTLY these three keys:
1. "productTitle": A clean, SEO-optimized, appealing e-commerce title (approx 5-10 words). Include the product type and a key material or use cue if known.
2. "sellingLine": A single, punchy, emotive one-liner selling hook (10-20 words).
3. "productDescription": A concise, polished 2-3 paragraph marketing description highlighting materials, craft, everyday use, and gift or shop appeal. Write for the actual product in the photo or notes. Do NOT assume it is a toy, flowers, balloons, or candy unless those details are clearly present.

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

export interface ImprovedCopyResult {
  productTitle: string;
  sellingLine: string;
  productDescription: string;
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
