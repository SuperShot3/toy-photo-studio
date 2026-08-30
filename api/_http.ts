import type { ApiResult, JsonBody } from "../server/apiHandlers";

export async function handleJsonPost(
  request: Request,
  run: (body: JsonBody) => Promise<ApiResult>
): Promise<Response> {
  let body: JsonBody;
  try {
    body = (await request.json()) as JsonBody;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const result = await run(body);
  return Response.json(result.body, { status: result.status });
}
