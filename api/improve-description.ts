import { handleJsonPost } from "./_http";
import { runImproveDescription } from "../server/apiHandlers";

export async function POST(request: Request): Promise<Response> {
  return handleJsonPost(request, runImproveDescription);
}
