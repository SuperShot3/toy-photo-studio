import { handleJsonPost } from "./_http";
import { runGeneratePhoto } from "../server/apiHandlers";

export async function POST(request: Request): Promise<Response> {
  return handleJsonPost(request, runGeneratePhoto);
}
