import express, { NextFunction, Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { runGeneratePhoto, runHealth, runImproveDescription } from "./server/apiHandlers";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.get("/api/health", (_req: Request, res: Response) => {
  const result = runHealth();
  res.status(result.status).json(result.body);
});

app.post("/api/improve-description", async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await runImproveDescription(req.body ?? {});
    res.status(result.status).json(result.body);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error.";
    res.status(500).json({ error: message });
  }
});

app.post("/api/generate-photo", async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await runGeneratePhoto(req.body ?? {});
    res.status(result.status).json(result.body);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error.";
    res.status(500).json({ error: message });
  }
});

app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  const expressErr = err as { status?: number; statusCode?: number; type?: string; message?: string };
  const status = expressErr.status || expressErr.statusCode || 500;
  const message =
    expressErr.type === "entity.too.large"
      ? "The photo is too large. Please upload a smaller JPEG or PNG."
      : expressErr.message || "Server error.";

  console.error("Unhandled API error:", err);
  res.status(status).json({ error: message });
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
    console.log(`PhotoStudioAI server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
