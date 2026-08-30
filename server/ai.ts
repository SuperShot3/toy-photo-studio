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
  return new OpenAI({ apiKey });
}

function extensionForMime(mimeType: string): string {
  if (mimeType.includes("png")) return "png";
  if (mimeType.includes("webp")) return "webp";
  return "jpg";
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
      const cleanBase64 = params.imageBase64.replace(/^data:[^;]+;base64,/, "");
      parts.push({
        inlineData: {
          data: cleanBase64,
          mimeType: params.mimeType || "image/jpeg",
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
    userContent.push({
      type: "image_url",
      image_url: { url: params.imageBase64 },
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
  masterPrompt: string
): Promise<string> {
  const ai = getGeminiClient(apiKey);

  try {
    const imgResponse = await ai.models.generateContent({
      model: "gemini-3.1-flash-image",
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
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: "1K",
        },
      },
    });

    if (imgResponse.candidates?.[0]?.content?.parts) {
      for (const part of imgResponse.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          const outMime = part.inlineData.mimeType || "image/png";
          return `data:${outMime};base64,${part.inlineData.data}`;
        }
      }
    }
  } catch (imgError: unknown) {
    const message = imgError instanceof Error ? imgError.message : String(imgError);
    console.warn("Primary Gemini image model attempt error:", message);

    const fallbackResponse = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-image",
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
        imageConfig: {
          aspectRatio: "1:1",
        },
      },
    });

    if (fallbackResponse.candidates?.[0]?.content?.parts) {
      for (const part of fallbackResponse.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          const outMime = part.inlineData.mimeType || "image/png";
          return `data:${outMime};base64,${part.inlineData.data}`;
        }
      }
    }
  }

  throw new Error("Gemini did not return an image. Please try again with a clear photo.");
}

async function generateImageOpenAI(
  apiKey: string,
  cleanBase64: string,
  mimeType: string,
  masterPrompt: string
): Promise<string> {
  const openai = getOpenAIClient(apiKey);
  const buffer = Buffer.from(cleanBase64, "base64");
  const ext = extensionForMime(mimeType);

  const imageFile = await toFile(buffer, `toy.${ext}`, { type: mimeType || "image/jpeg" });

  const response = await openai.images.edit({
    model: "gpt-image-1",
    image: imageFile,
    prompt: masterPrompt,
    size: "1024x1024",
    input_fidelity: "high",
    quality: "medium",
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

  throw new Error("OpenAI did not return an image. Please try again with a clear photo.");
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
  const cleanBase64 = params.imageBase64.replace(/^data:[^;]+;base64,/, "");

  const promptParams: StudioPromptParams = {
    productName: params.productName,
    toySizeCm: params.toySizeCm,
    productDescription: params.productDescription,
    style: params.style,
    personScale: params.personScale,
  };

  const masterPrompt = buildStudioPrompt(promptParams);

  const imageUrl =
    config.provider === "gemini"
      ? await generateImageGemini(apiKey, cleanBase64, params.mimeType, masterPrompt)
      : await generateImageOpenAI(apiKey, cleanBase64, params.mimeType, masterPrompt);

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
