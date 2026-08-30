import OpenAI, { toFile } from "openai";
import {
  buildCopyPrompt,
  buildImproveDescriptionPrompt,
  buildStudioPrompt,
  GeneratedCopyResult,
  ImprovedCopyResult,
  parseJsonFromText,
  StudioPromptParams,
} from "./prompts.js";
import {
  parseOpenAiImageModel,
  parseProductKind,
  type ImageStyle,
  type OpenAiImageModel,
  type PersonScale,
  type ProductKind,
} from "../src/types.js";

export interface AiConfig {
  apiKey: string;
}

function resolveApiKey(config: AiConfig): string {
  const key = config.apiKey?.trim() || "";
  if (!key) {
    const envKey = process.env.OPENAI_API_KEY;
    if (envKey?.trim()) return envKey.trim();
    throw new HttpError(
      "No OpenAI API key provided. Add it in the app settings panel.",
      400
    );
  }
  return key;
}

function getOpenAIClient(apiKey: string): OpenAI {
  return new OpenAI({
    apiKey,
    timeout: 10 * 60 * 1000,
    maxRetries: 1,
  });
}

function extensionForMime(mimeType: string): string {
  if (mimeType.includes("png")) return "png";
  if (mimeType.includes("webp")) return "webp";
  return "jpg";
}

export class HttpError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

function getErrorStatus(error: unknown): number | undefined {
  if (error && typeof error === "object" && "status" in error) {
    const status = (error as { status?: unknown }).status;
    if (typeof status === "number" && status >= 400 && status < 600) return status;
  }
  return undefined;
}

function getRawErrorText(error: unknown): string {
  if (typeof error === "string") return error;
  if (!error || typeof error !== "object") return "";
  const e = error as {
    message?: unknown;
    error?: { message?: unknown } | string;
  };
  if (typeof e.error === "object" && typeof e.error?.message === "string") {
    return e.error.message;
  }
  if (typeof e.error === "string") return e.error;
  if (typeof e.message === "string") return e.message;
  return "";
}

function unknownParameterName(error: unknown): string | null {
  const match = getRawErrorText(error).match(
    /Unknown parameter:\s*['"]?([A-Za-z0-9_[\]]+)/i
  );
  return match?.[1] ?? null;
}

function shouldFallbackModel(error: unknown): boolean {
  const text = getRawErrorText(error);
  return /invalid value:.*gpt-image|must be ['"]dall-e-2['"]|model_not_found|does not have access to model|unknown model|invalid model/i.test(
    text
  );
}

function extractErrorMessage(error: unknown, fallback: string): string {
  const msg = getRawErrorText(error) || (error instanceof Error ? error.message : "");
  if (!msg) return fallback;

  if (/organization must be verified/i.test(msg)) {
    return "This OpenAI organization must be verified to generate images. Verify it at platform.openai.com, then try again.";
  }
  if (/invalid api key|incorrect api key|authentication/i.test(msg)) {
    return "The API key was rejected. Check it in the settings panel and try again.";
  }
  if (/insufficient_quota|billing/i.test(msg)) {
    return "This API key is out of credit or billing is not enabled. Check the provider billing page, then try again.";
  }
  if (/safety system|moderation/i.test(msg)) {
    return "OpenAI blocked this photo. Try a clearer product snapshot without people, then try again.";
  }
  return msg;
}

function normalizeMime(mimeType?: string): string {
  const mime = (mimeType || "").toLowerCase();
  if (mime.includes("png")) return "image/png";
  if (mime.includes("webp")) return "image/webp";
  if (mime.includes("jpeg") || mime.includes("jpg")) return "image/jpeg";
  return mime || "image/jpeg";
}

function decodeReferenceImage(
  imagePayload: string,
  mimeType: string
): { cleanBase64: string; mimeType: string; buffer: Buffer } {
  let mime = normalizeMime(mimeType);
  let payload = imagePayload.trim();

  if (/^data:image\/svg/i.test(payload) || /(?:;|^)utf-?8,/i.test(payload.split(",")[0] || "")) {
    throw new Error(
      "This photo format is not supported. Please upload a JPEG, PNG, or WEBP image."
    );
  }

  const dataUrlMatch = payload.match(/^data:([^;,]+)?(?:;charset=[^;,]+)?(;base64)?,(.*)$/s);
  if (dataUrlMatch) {
    mime = normalizeMime(dataUrlMatch[1] || mime);
    const isBase64 = dataUrlMatch[2] === ";base64";
    const data = dataUrlMatch[3] || "";
    if (!isBase64) {
      throw new Error(
        "This photo format is not supported. Please upload a JPEG, PNG, or WEBP image."
      );
    }
    payload = data;
  }

  if (mime.includes("svg") || mime.includes("heic") || mime.includes("heif") || mime.includes("tiff")) {
    throw new Error(
      `Unsupported image format (${mime}). Please upload a JPEG, PNG, or WEBP photo.`
    );
  }

  const buffer = Buffer.from(payload.replace(/\s/g, ""), "base64");
  if (buffer.length < 32) {
    throw new Error("The reference image could not be read. Please try another photo.");
  }

  return { cleanBase64: payload, mimeType: mime, buffer };
}

export async function improveDescription(
  config: AiConfig,
  params: {
    productName?: string;
    toySizeCm?: string | number;
    productKind?: ProductKind;
    roughDescription?: string;
    imageBase64?: string;
    mimeType?: string;
  }
): Promise<ImprovedCopyResult> {
  const apiKey = resolveApiKey(config);
  const floral = parseProductKind(params.productKind) === "flowers";
  const fallback: ImprovedCopyResult = floral
    ? {
        productTitle: params.productName || "Fresh Garden Bouquet",
        sellingLine: "A hand-tied arrangement of true-to-life blooms, ready to gift or display.",
        productDescription:
          params.roughDescription ||
          "A carefully arranged bouquet with vivid color and natural foliage, photographed as it will look on arrival.",
      }
    : {
        productTitle: params.productName || "Handcrafted Classic Toy",
        sellingLine: "Delightful quality toy designed for joyful play and cherished memories.",
        productDescription:
          params.roughDescription ||
          "A beautifully crafted toy made with care, offering endless imagination and tactile delight for children and collectors alike.",
      };

  const promptText = buildImproveDescriptionPrompt(params);

  const openai = getOpenAIClient(apiKey);
  const userContent: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [];

  if (params.imageBase64) {
    const decoded = decodeReferenceImage(params.imageBase64, params.mimeType || "image/jpeg");
    userContent.push({
      type: "image_url",
      image_url: { url: `data:${decoded.mimeType};base64,${decoded.cleanBase64}` },
    });
  }

  userContent.push({ type: "text", text: promptText });

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: userContent }],
    response_format: { type: "json_object" },
  });

  const rawText = response.choices[0]?.message?.content || "{}";
  return parseJsonFromText(rawText, fallback);
}

function supportsInputFidelity(model: OpenAiImageModel): boolean {
  return model === "gpt-image-1" || model === "gpt-image-1.5";
}

type ImageEditExtras = {
  quality?: "medium";
  output_format?: "jpeg";
  output_compression?: number;
  input_fidelity?: "low";
};

function fallbackModels(preferred: OpenAiImageModel): OpenAiImageModel[] {
  const rest: OpenAiImageModel[] = ["gpt-image-1.5", "gpt-image-1-mini", "gpt-image-1"];
  return [preferred, ...rest.filter((item) => item !== preferred)];
}

async function readGeneratedImage(
  response: { data?: Array<{ b64_json?: string; url?: string }> | null }
): Promise<string> {
  const b64 = response.data?.[0]?.b64_json;
  if (b64) {
    return `data:image/jpeg;base64,${b64}`;
  }

  const url = response.data?.[0]?.url;
  if (url) {
    const imageResponse = await fetch(url);
    if (!imageResponse.ok) {
      throw new Error("Failed to download generated image from OpenAI.");
    }
    const arrayBuffer = await imageResponse.arrayBuffer();
    const outB64 = Buffer.from(arrayBuffer).toString("base64");
    const contentType = imageResponse.headers.get("content-type") || "image/jpeg";
    return `data:${contentType};base64,${outB64}`;
  }

  throw new Error("OpenAI did not return an image. Please try again with a clear JPEG or PNG photo.");
}

async function generateImageOpenAI(
  apiKey: string,
  buffer: Buffer,
  mimeType: string,
  masterPrompt: string,
  model: OpenAiImageModel
): Promise<string> {
  const openai = getOpenAIClient(apiKey);
  const ext = extensionForMime(mimeType);
  const bytes = new Uint8Array(buffer);
  let lastError: unknown;

  for (const candidate of fallbackModels(model)) {
    const extras: ImageEditExtras = {
      quality: "medium",
      output_format: "jpeg",
      output_compression: 85,
      ...(supportsInputFidelity(candidate) ? { input_fidelity: "low" as const } : {}),
    };

    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const imageFile = await toFile(bytes, `reference.${ext}`, {
          type: mimeType || "image/jpeg",
        });
        const response = await openai.images.edit({
          model: candidate,
          image: imageFile,
          prompt: masterPrompt,
          size: "1024x1024",
          ...extras,
        });
        return await readGeneratedImage(response);
      } catch (imgError: unknown) {
        lastError = imgError;
        const unknown = unknownParameterName(imgError);
        if (unknown && unknown in extras) {
          delete extras[unknown as keyof ImageEditExtras];
          continue;
        }

        const status = getErrorStatus(imgError);
        if (status === 401 || status === 403 || status === 429) {
          throw new HttpError(
            extractErrorMessage(
              imgError,
              "OpenAI did not return an image. Please try again with a clear JPEG or PNG photo."
            ),
            status
          );
        }

        if (shouldFallbackModel(imgError) || status === 404 || candidate === "gpt-image-2") {
          break;
        }

        throw new HttpError(
          extractErrorMessage(
            imgError,
            "OpenAI did not return an image. Please try again with a clear JPEG or PNG photo."
          ),
          status ?? 500
        );
      }
    }
  }

  throw new HttpError(
    extractErrorMessage(
      lastError,
      "OpenAI did not return an image. Please try again with a clear JPEG or PNG photo."
    ),
    getErrorStatus(lastError) ?? 500
  );
}

async function generateCopy(
  config: AiConfig,
  params: {
    productName: string;
    toySizeCm?: string | number;
    productKind?: ProductKind;
    style: ImageStyle;
    personScale: PersonScale;
    productDescription: string;
  }
): Promise<GeneratedCopyResult> {
  const apiKey = resolveApiKey(config);
  const floral = parseProductKind(params.productKind) === "flowers";
  const fallback: GeneratedCopyResult = floral
    ? {
        productTitle: params.productName || "Fresh Garden Bouquet",
        sellingLine: "True-to-life blooms, arranged for gifts, tables, and special days.",
        marketingDescription: `Presenting ${params.productName || "this bouquet"}. A studio-ready floral arrangement with natural color, foliage, and gift appeal.`,
      }
    : {
        productTitle: params.productName || "Handcrafted Premium Toy",
        sellingLine: "Capture hearts with timeless charm and irresistible playtime quality.",
        marketingDescription: params.toySizeCm
          ? `Presenting the ${params.productName} (${params.toySizeCm} cm). Lovingly crafted with premium attention to detail, perfect for imaginative play or as a cherished keepsake.`
          : `Presenting the ${params.productName}. Lovingly crafted with premium attention to detail, perfect for imaginative play or as a cherished keepsake.`,
      };

  const copyPrompt = buildCopyPrompt(params);

  const openai = getOpenAIClient(apiKey);
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: copyPrompt }],
    response_format: { type: "json_object" },
  });

  const copyJson = parseJsonFromText<Partial<GeneratedCopyResult>>(
    response.choices[0]?.message?.content || "{}",
    {}
  );

  return {
    productTitle: copyJson.productTitle || fallback.productTitle,
    sellingLine: copyJson.sellingLine || fallback.sellingLine,
    marketingDescription: copyJson.marketingDescription || fallback.marketingDescription,
  };
}

function copyFallback(
  productName: string,
  toySizeCm: string | number | undefined,
  productKind: ProductKind
): GeneratedCopyResult {
  if (parseProductKind(productKind) === "flowers") {
    return {
      productTitle: productName || "Fresh Garden Bouquet",
      sellingLine: "True-to-life blooms, arranged for gifts, tables, and special days.",
      marketingDescription: `Presenting ${productName || "this bouquet"}. A studio-ready floral arrangement with natural color, foliage, and gift appeal.`,
    };
  }
  return {
    productTitle: productName || "Handcrafted Premium Toy",
    sellingLine: "Capture hearts with timeless charm and irresistible playtime quality.",
    marketingDescription: toySizeCm
      ? `Presenting the ${productName} (${toySizeCm} cm). Lovingly crafted with premium attention to detail, perfect for imaginative play or as a cherished keepsake.`
      : `Presenting the ${productName}. Lovingly crafted with premium attention to detail, perfect for imaginative play or as a cherished keepsake.`,
  };
}

export async function generatePhoto(
  config: AiConfig,
  params: {
    imageBase64: string;
    mimeType: string;
    productName: string;
    toySizeCm?: string | number;
    productDescription: string;
    productKind?: ProductKind;
    style: ImageStyle;
    personScale: PersonScale;
    openaiImageModel?: OpenAiImageModel;
  }
): Promise<{
  imageUrl: string;
  productTitle: string;
  sellingLine: string;
  marketingDescription: string;
}> {
  const apiKey = resolveApiKey(config);
  const decoded = decodeReferenceImage(params.imageBase64, params.mimeType);

  const productKind = parseProductKind(params.productKind);
  const promptParams: StudioPromptParams = {
    productName: params.productName,
    toySizeCm: params.toySizeCm,
    productDescription: params.productDescription,
    productKind,
    style: params.style,
    personScale: params.personScale,
  };

  const masterPrompt = buildStudioPrompt(promptParams);

  let imageUrl: string;
  try {
    imageUrl = await generateImageOpenAI(
      apiKey,
      decoded.buffer,
      decoded.mimeType,
      masterPrompt,
      parseOpenAiImageModel(params.openaiImageModel)
    );
  } catch (imageErr) {
    if (imageErr instanceof HttpError) throw imageErr;
    throw new HttpError(
      extractErrorMessage(imageErr, "Failed to generate a studio photo. Please try again."),
      getErrorStatus(imageErr) ?? 500
    );
  }

  let copy: GeneratedCopyResult;
  try {
    copy = await generateCopy(config, {
      productName: params.productName,
      toySizeCm: params.toySizeCm,
      productKind,
      style: params.style,
      personScale: params.personScale,
      productDescription: params.productDescription,
    });
  } catch (copyErr) {
    console.warn("Copy generation notice:", copyErr);
    copy = copyFallback(params.productName, params.toySizeCm, productKind);
  }

  return {
    imageUrl,
    productTitle: copy.productTitle,
    sellingLine: copy.sellingLine,
    marketingDescription: copy.marketingDescription,
  };
}
