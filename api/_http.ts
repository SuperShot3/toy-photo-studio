type JsonBody = Record<string, unknown>;

interface ApiResult {
  status: number;
  body: Record<string, unknown>;
}

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

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  try {
    const result = await run(body);
    return Response.json(result.body, { status: result.status });
  } catch (error: unknown) {
    console.error("Unhandled API error:", error);
    const message = error instanceof Error ? error.message : "Server error.";
    return Response.json({ error: message }, { status: 500 });
  }
}
