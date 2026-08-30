import { handleJsonPost, handleVercelInvoke } from "./_http";

export const config = {
  maxDuration: 60,
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

async function run(body: Record<string, unknown>) {
  const { runImproveDescription } = await import("../server/apiHandlers");
  return runImproveDescription(body);
}

export async function POST(request: Request): Promise<Response> {
  return handleJsonPost(request, run);
}

export default async function handler(req: unknown, res?: unknown) {
  return handleVercelInvoke(
    req as Request,
    res as Parameters<typeof handleVercelInvoke>[1],
    "POST",
    run
  );
}
