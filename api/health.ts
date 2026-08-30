function healthBody() {
  return { status: "ok", timestamp: new Date().toISOString() };
}

function send(res: { statusCode: number; setHeader: Function; end: Function; status?: Function; json?: Function }, body: unknown) {
  if (typeof res.status === "function" && typeof res.json === "function") {
    res.status(200).json(body);
    return;
  }
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

export async function GET(): Promise<Response> {
  return Response.json(healthBody());
}

export default async function handler(_req: unknown, res?: { statusCode: number; setHeader: Function; end: Function; status?: Function; json?: Function }) {
  const body = healthBody();
  if (res && typeof res.end === "function") {
    send(res, body);
    return;
  }
  return Response.json(body);
}
