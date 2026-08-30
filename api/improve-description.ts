import { handleJsonPost } from "./_http";
import { runImproveDescription } from "../server/apiHandlers";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request): Promise<Response> {
  return handleJsonPost(request, runImproveDescription);
}
