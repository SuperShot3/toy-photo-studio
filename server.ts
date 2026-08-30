import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { improveDescription, generatePhoto, AiProvider } from "./server/ai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

function parseAiConfig(body: { provider?: string; apiKey?: string }) {
  const provider: AiProvider = body.provider === "gemini" ? "gemini" : "openai";
  return {
    provider,
    apiKey: body.apiKey?.trim() || "",
  };
}

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.post("/api/improve-description", async (req: Request, res: Response): Promise<void> => {
  try {
    const { productName, toySizeCm, roughDescription, imageBase64, mimeType } = req.body;

    if (!productName && !roughDescription && !imageBase64) {
      res.status(400).json({ error: "Please provide a product name, description, or image." });
      return;
    }

    const aiConfig = parseAiConfig(req.body);
    const parsedData = await improveDescription(aiConfig, {
      productName,
      toySizeCm,
      roughDescription,
      imageBase64,
      mimeType,
    });

    res.json(parsedData);
  } catch (error: unknown) {
    console.error("Error in /api/improve-description:", error);
    const message = error instanceof Error ? error.message : "Failed to generate improved copy.";
    res.status(500).json({ error: message });
  }
});

app.post("/api/generate-photo", async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      imageBase64,
      mimeType = "image/jpeg",
      productName = "Toy",
      toySizeCm = 20,
      productDescription = "",
      style = "clean-catalog",
      personScale = "none",
    } = req.body;

    if (!imageBase64) {
      res.status(400).json({ error: "Missing required reference image." });
      return;
    }

    const aiConfig = parseAiConfig(req.body);
    const result = await generatePhoto(aiConfig, {
      imageBase64,
      mimeType,
      productName,
      toySizeCm,
      productDescription,
      style,
      personScale,
    });

    res.json({
      ...result,
      style,
      personScale,
      productName,
      toySizeCm,
      provider: aiConfig.provider,
    });
  } catch (error: unknown) {
    console.error("Error in /api/generate-photo:", error);
    const message =
      error instanceof Error ? error.message : "An error occurred while generating the studio photo.";
    res.status(500).json({ error: message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Toy Photo Studio server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
