import { improveDescription, generatePhoto, HttpError } from "./ai.js";
import { parseOpenAiImageModel, parseProductKind, STYLE_REF_PROMPT_MAX } from "../src/types.js";

export type JsonBody = Record<string, unknown>;

export interface ApiResult {
  status: number;
  body: Record<string, unknown>;
}

function asString(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return fallback;
}

export function parseAiConfig(body: JsonBody) {
  return {
    apiKey: asString(body.apiKey).trim(),
  };
}

export async function runImproveDescription(body: JsonBody): Promise<ApiResult> {
  const productName = asString(body.productName);
  const toySizeCm = body.toySizeCm as string | number | undefined;
  const productKind = parseProductKind(body.productKind);
  const roughDescription = asString(body.roughDescription);
  const imageBase64 = asString(body.imageBase64) || undefined;
  const mimeType = asString(body.mimeType) || undefined;

  if (!productName && !roughDescription && !imageBase64) {
    return {
      status: 400,
      body: { error: "Please provide a product name, description, or image." },
    };
  }

  try {
    const parsedData = await improveDescription(parseAiConfig(body), {
      productName,
      toySizeCm,
      productKind,
      roughDescription,
      imageBase64,
      mimeType,
    });
    return { status: 200, body: { ...parsedData } };
  } catch (error: unknown) {
    console.error("Error in /api/improve-description:", error);
    const message = error instanceof Error ? error.message : "Failed to generate improved copy.";
    const status =
      error instanceof HttpError && error.status >= 400 && error.status < 600
        ? error.status
        : 500;
    return { status, body: { error: message } };
  }
}

export async function runGeneratePhoto(body: JsonBody): Promise<ApiResult> {
  try {
    const imageBase64 = asString(body.imageBase64);
    const mimeType = asString(body.mimeType, "image/jpeg");
    const selectedKind = parseProductKind(body.productKind);
    const productName = asString(body.productName).trim();
    const toySizeCm = body.toySizeCm as string | number | undefined;
    const productDescription = asString(body.productDescription);
    const style = asString(body.style, "clean-catalog");
    const personScale = asString(body.personScale, "none");
    const styleRefPrompt = asString(body.styleRefPrompt).trim().slice(0, STYLE_REF_PROMPT_MAX);
    const openaiImageModel = parseOpenAiImageModel(
      body.openaiImageModel ?? body.openaiImageMode
    );

    if (!imageBase64) {
      return {
        status: 400,
        body: { error: "Missing required reference image." },
      };
    }

    const aiConfig = parseAiConfig(body);
    const result = await generatePhoto(aiConfig, {
      imageBase64,
      mimeType,
      productName,
      toySizeCm,
      productDescription,
      productKind: selectedKind,
      style: style as "clean-catalog" | "styled-promo" | "luxury-promo",
      personScale: personScale as "none" | "child" | "adult",
      ...(styleRefPrompt ? { styleRefPrompt } : {}),
      openaiImageModel,
    });

    return {
      status: 200,
      body: {
        ...result,
        style,
        personScale,
        productName: result.productName,
        toySizeCm: result.toySizeCm,
        productKind: result.productKind,
        openaiImageModel,
        ...(result.kindSwitchedFrom ? { kindSwitchedFrom: result.kindSwitchedFrom } : {}),
      },
    };
  } catch (error: unknown) {
    console.error("Error in /api/generate-photo:", error);
    const message =
      error instanceof Error ? error.message : "An error occurred while generating the studio photo.";
    const status =
      error instanceof HttpError
        ? error.status
        : error && typeof error === "object" && "status" in error && typeof (error as { status: unknown }).status === "number"
          ? (error as { status: number }).status
          : 500;
    return { status: status >= 400 && status < 600 ? status : 500, body: { error: message } };
  }
}

export function runHealth(): ApiResult {
  return {
    status: 200,
    body: { status: "ok", timestamp: new Date().toISOString() },
  };
}
