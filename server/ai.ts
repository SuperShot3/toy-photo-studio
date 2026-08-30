import { GoogleGenAI } from "@google/genai";
import OpenAI, { toFile } from "openai";
import {
  buildCopyPrompt,
  buildImproveDescriptionPrompt,
  buildStudioPrompt,
  GeneratedCopyResult,
  ImprovedCopyResult,
  parseJsonFromText,
  StudioPromptParams,
} from "./prompts";
import type { ImageStyle, PersonScale } from "../src/types";

export type AiProvider = "gemini" | "openai";

export interface AiConfig {
  provider: AiProvider;
  apiKey: string;
}

function resolveApiKey(config: AiConfig): string {
  const key = config.apiKey?.trim() || "";
  if (!key) {
    const envKey =
      config.provider === "gemini"
        ? process.env.GEMINI_API_KEY
        : process.env.OPENAI_API_KEY;
    if (envKey?.trim()) return envKey.trim();
    throw new Error(
      `No ${config.provider === "gemini" ? "Gemini" : "OpenAI"} API key provided. Add it in the app settings panel.`
    );
  }
  return key;
}

function getGeminiClient(apiKey: string): GoogleGenAI {
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
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

function extractErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    const msg = error.message;
    if (/organization must be verified/i.test(msg)) {
      return "This OpenAI organization must be verified to generate images. Verify it at platform.openai.com, then try again.";
    }
    if (/invalid api key|incorrect api key|authentication/i.test(msg)) {
      return "The API key was rejected. Check it in the settings panel and try again.";
    }
    if (/insufficient_quota|billing/i.test(msg)) {
      return "This API key is out of credit or billing is not enabled. Check the provider billing page, then try again.";
    }
    return msg;
  }
  return fallback;
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

type GeminiPart = {
  thought?: boolean;
  inlineData?: { data?: string; mimeType?: string };
};

function extractGeminiImage(response: {
  candidates?: Array<{ content?: { parts?: GeminiPart[] } }>;
}): string | null {
  const parts = response.candidates?.[0]?.content?.parts || [];
  for (let i = parts.length - 1; i >= 0; i--) {
    const part = parts[i];
    if (part.thought) continue;
    if (part.inlineData?.data) {
      const outMime = part.inlineData.mimeType || "image/png";
      return `data:${outMime};base64,${part.inlineData.data}`;
    }
  }
  return null;
}

export async function improveDescription(
  config: AiConfig,
  params: {
    productName?: string;
    toySizeCm?: string | number;
    roughDescription?: string;
    imageBase64?: string;
    mimeType?: string;
  }
): Promise<ImprovedCopyResult> {
  const apiKey = resolveApiKey(config);
  const fallback: ImprovedCopyResult = {
    productTitle: params.productName || "Handcrafted Classic Toy",
    sellingLine: "Delightful quality toy designed for joyful play and cherished memories.",
    productDescription:
      params.roughDescription ||
      "A beautifully crafted toy made with care, offering endless imagination and tactile delight for children and collectors alike.",
  };

  const promptText = buildImproveDescriptionPrompt(params);

  if (config.provider === "gemini") {
    const ai = getGeminiClient(apiKey);
    const parts: Array<{ text?: string; inlineData?: { data: string; mimeType: string } }> = [];

    if (params.imageBase64) {
      const decoded = decodeReferenceImage(params.imageBase64, params.mimeType || "image/jpeg");
      parts.push({
        inlineData: {
          data: decoded.cleanBase64,
          mimeType: decoded.mimeType,
        },
      });
    }

    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
      },
    });

    return parseJsonFromText(response.text || "{}", fallback);
  }

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

async function generateImageGemini(
  apiKey: string,
  cleanBase64: string,
  mimeType: string,
  masterPrompt: string,
  personScale: PersonScale
): Promise<string> {
  const ai = getGeminiClient(apiKey);
  const models = ["gemini-3.1-flash-image", "gemini-3.1-flash-lite-image"] as const;
  let lastError: unknown;

  for (const model of models) {
    try {
      const imgResponse = await ai.models.generateContent({
        model,
        contents: {
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: mimeType || "image/jpeg",
              },
            },
            { text: masterPrompt },
          ],
        },
        config: {
          responseModalities: ["TEXT", "IMAGE"],
          imageConfig: {
            aspectRatio: "1:1",
            imageSize: "1K",
            ...(personScale !== "none" ? { personGeneration: "ALLOW_ALL" } : {}),
          },
        },
      });

      const imageUrl = extractGeminiImage(imgResponse);
      if (imageUrl) return imageUrl;

      console.warn(`${model} returned no image payload.`);
    } catch (imgError: unknown) {
      lastError = imgError;
      console.warn(
        `${model} attempt error:`,
        imgError instanceof Error ? imgError.message : String(imgError)
      );
    }
  }

  throw new Error(
    extractErrorMessage(
      lastError,
      "Gemini did not return an image. Please try again with a clear JPEG or PNG photo."
    )
  );
}

async function generateImageOpenAI(
  apiKey: string,
  buffer: Buffer,
  mimeType: string,
  masterPrompt: string
): Promise<string> {
  const openai = getOpenAIClient(apiKey);
  const ext = extensionForMime(mimeType);
  const models = ["gpt-image-1.5", "gpt-image-1"] as const;
  let lastError: unknown;

  for (const model of models) {
    try {
      const imageFile = await toFile(buffer, `toy.${ext}`, { type: mimeType || "image/jpeg" });
      const response = await openai.images.edit({
        model,
        image: imageFile,
        prompt: masterPrompt,
        size: "1024x1024",
        input_fidelity: "high",
        quality: "medium",
        output_format: "png",
      });

      const b64 = response.data?.[0]?.b64_json;
      if (b64) {
        return `data:image/png;base64,${b64}`;
      }

      const url = response.data?.[0]?.url;
      if (url) {
        const imageResponse = await fetch(url);
        if (!imageResponse.ok) {
          throw new Error("Failed to download generated image from OpenAI.");
        }
        const arrayBuffer = await imageResponse.arrayBuffer();
        const outB64 = Buffer.from(arrayBuffer).toString("base64");
        const contentType = imageResponse.headers.get("content-type") || "image/png";
        return `data:${contentType};base64,${outB64}`;
      }

      console.warn(`${model} returned no image payload.`);
    } catch (imgError: unknown) {
      lastError = imgError;
      console.warn(
        `${model} attempt error:`,
        imgError instanceof Error ? imgError.message : String(imgError)
      );
    }
  }

  throw new Error(
    extractErrorMessage(
      lastError,
      "OpenAI did not return an image. Please try again with a clear JPEG or PNG photo."
    )
  );
}

async function generateCopy(
  config: AiConfig,
  params: {
    productName: string;
    toySizeCm: string | number;
    style: ImageStyle;
    personScale: PersonScale;
    productDescription: string;
  }
): Promise<GeneratedCopyResult> {
  const apiKey = resolveApiKey(config);
  const fallback: GeneratedCopyResult = {
    productTitle: params.productName || "Handcrafted Premium Toy",
    sellingLine: "Capture hearts with timeless charm and irresistible playtime quality.",
    marketingDescription: `Presenting the ${params.productName} (${params.toySizeCm} cm). Lovingly crafted with premium attention to detail, perfect for imaginative play or as a cherished keepsake.`,
  };

  const copyPrompt = buildCopyPrompt(params);

  if (config.provider === "gemini") {
    const ai = getGeminiClient(apiKey);
    const copyResponse = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: copyPrompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const copyJson = parseJsonFromText<Partial<GeneratedCopyResult>>(copyResponse.text || "{}", {});
    return {
      productTitle: copyJson.productTitle || fallback.productTitle,
      sellingLine: copyJson.sellingLine || fallback.sellingLine,
      marketingDescription: copyJson.marketingDescription || fallback.marketingDescription,
    };
  }

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

export async function generatePhoto(
  config: AiConfig,
  params: {
    imageBase64: string;
    mimeType: string;
    productName: string;
    toySizeCm: string | number;
    productDescription: string;
    style: ImageStyle;
    personScale: PersonScale;
  }
): Promise<{
  imageUrl: string;
  productTitle: string;
  sellingLine: string;
  marketingDescription: string;
}> {
  const apiKey = resolveApiKey(config);
  const decoded = decodeReferenceImage(params.imageBase64, params.mimeType);

  const promptParams: StudioPromptParams = {
    productName: params.productName,
    toySizeCm: params.toySizeCm,
    productDescription: params.productDescription,
    style: params.style,
    personScale: params.personScale,
  };

  const masterPrompt = buildStudioPrompt(promptParams);

  let imageUrl: string;
  try {
    imageUrl =
      config.provider === "gemini"
        ? await generateImageGemini(
            apiKey,
            decoded.cleanBase64,
            decoded.mimeType,
            masterPrompt,
            params.personScale
          )
        : await generateImageOpenAI(apiKey, decoded.buffer, decoded.mimeType, masterPrompt);
  } catch (imageErr) {
    throw new Error(
      extractErrorMessage(imageErr, "Failed to generate a studio photo. Please try again.")
    );
  }

  let copy: GeneratedCopyResult;
  try {
    copy = await generateCopy(config, {
      productName: params.productName,
      toySizeCm: params.toySizeCm,
      style: params.style,
      personScale: params.personScale,
      productDescription: params.productDescription,
    });
  } catch (copyErr) {
    console.warn("Copy generation notice:", copyErr);
    copy = {
      productTitle: params.productName || "Handcrafted Premium Toy",
      sellingLine: "Capture hearts with timeless charm and irresistible playtime quality.",
      marketingDescription: `Presenting the ${params.productName} (${params.toySizeCm} cm). Lovingly crafted with premium attention to detail, perfect for imaginative play or as a cherished keepsake.`,
    };
  }

  return {
    imageUrl,
    productTitle: copy.productTitle,
    sellingLine: copy.sellingLine,
    marketingDescription: copy.marketingDescription,
  };
}
