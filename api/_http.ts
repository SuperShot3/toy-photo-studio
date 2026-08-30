type JsonBody = Record<string, unknown>;

interface ApiResult {
  status: number;
  body: Record<string, unknown>;
}

function sendNodeJson(res: NodeResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body);
  if (typeof res.status === "function" && typeof res.json === "function") {
    res.status(status).json(body);
    return;
  }
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(payload);
}

function isNodeResponse(res: unknown): res is NodeResponse {
  return !!res && typeof res === "object" && typeof (res as NodeResponse).end === "function";
}

interface NodeResponse {
  statusCode: number;
  setHeader(name: string, value: string): void;
  end(payload?: string): void;
  status?: (code: number) => NodeResponse;
  json?: (body: unknown) => void;
}

interface NodeRequest {
  method?: string;
  body?: unknown;
  on?(event: string, listener: (...args: unknown[]) => void): void;
}

async function readNodeBody(req: NodeRequest): Promise<JsonBody> {
  if (req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) {
    if (Array.isArray(req.body)) return {};
    return req.body as JsonBody;
  }
  if (typeof req.body === "string" && req.body.trim()) {
    return JSON.parse(req.body) as JsonBody;
  }
  if (typeof req.on !== "function") return {};

  const raw = await new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on!("data", (chunk: unknown) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
    });
    req.on!("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on!("error", (err: unknown) => reject(err));
  });

  if (!raw.trim()) return {};
  return JSON.parse(raw) as JsonBody;
}

function jsonError(message: string, status = 500): Response {
  return Response.json({ error: message }, { status });
}

export async function handleJsonPost(
  request: Request,
  run: (body: JsonBody) => Promise<ApiResult>
): Promise<Response> {
  let body: JsonBody;
  try {
    body = (await request.json()) as JsonBody;
  } catch {
    return jsonError("Invalid JSON body.", 400);
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return jsonError("Invalid JSON body.", 400);
  }

  try {
    const result = await run(body);
    return Response.json(result.body, { status: result.status });
  } catch (error: unknown) {
    console.error("Unhandled API error:", error);
    const message = error instanceof Error ? error.message : "Server error.";
    return jsonError(message);
  }
}

/**
 * Works for both Vercel Web handlers (Request/Response) and the Vite
 * Node runtime's (req, res) default export.
 */
export async function handleVercelInvoke(
  req: Request | NodeRequest,
  res: NodeResponse | undefined,
  allowedMethod: "GET" | "POST",
  run: (body: JsonBody) => Promise<ApiResult>
): Promise<Response | void> {
  const node = isNodeResponse(res);
  const method = node
    ? String((req as NodeRequest).method || "GET").toUpperCase()
    : String((req as Request).method || "GET").toUpperCase();

  if (method !== allowedMethod) {
    const body = { error: "Method not allowed." };
    if (node) {
      sendNodeJson(res, 405, body);
      return;
    }
    return Response.json(body, { status: 405 });
  }

  try {
    let payload: JsonBody = {};
    if (allowedMethod === "POST") {
      payload = node
        ? await readNodeBody(req as NodeRequest)
        : ((await (req as Request).json()) as JsonBody);
    }
    if (allowedMethod === "POST" && (!payload || typeof payload !== "object" || Array.isArray(payload))) {
      const body = { error: "Invalid JSON body." };
      if (node) {
        sendNodeJson(res, 400, body);
        return;
      }
      return Response.json(body, { status: 400 });
    }

    const result = await run(payload);
    if (node) {
      sendNodeJson(res, result.status, result.body);
      return;
    }
    return Response.json(result.body, { status: result.status });
  } catch (error: unknown) {
    console.error("Unhandled API error:", error);
    const message = error instanceof Error ? error.message : "Server error.";
    if (node) {
      sendNodeJson(res, 500, { error: message });
      return;
    }
    return jsonError(message);
  }
}
