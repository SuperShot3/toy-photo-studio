import { runHealth } from "../server/apiHandlers";

export async function GET(): Promise<Response> {
  const result = runHealth();
  return Response.json(result.body, { status: result.status });
}
