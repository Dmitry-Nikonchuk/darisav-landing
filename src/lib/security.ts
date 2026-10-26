import { createHmac, timingSafeEqual } from "node:crypto";

export function getAppBaseUrl() {
  const value = process.env.APP_BASE_URL;
  if (!value) throw new Error("APP_BASE_URL is not configured");
  const url = new URL(value);
  if (process.env.NODE_ENV === "production" && url.protocol !== "https:") {
    throw new Error("APP_BASE_URL must use HTTPS in production");
  }
  return url;
}

export function getSessionSecret() {
  const secret = process.env.APP_SESSION_SECRET;
  if (!secret || Buffer.byteLength(secret) < 32) {
    throw new Error("APP_SESSION_SECRET must contain at least 32 bytes");
  }
  return secret;
}

export function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

export function signPayload(payload: object, secret: string) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${signature}`;
}

export function verifyPayload<T>(token: string, secret: string): T | null {
  const [body, signature, extra] = token.split(".");
  if (!body || !signature || extra) return null;

  const expected = createHmac("sha256", secret).update(body).digest("base64url");
  if (!safeEqual(signature, expected)) return null;

  try {
    return JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
}

export function readCookie(request: Request, name: string) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  for (const item of cookieHeader.split(";")) {
    const separator = item.indexOf("=");
    if (separator < 0) continue;
    if (item.slice(0, separator).trim() === name) {
      return decodeURIComponent(item.slice(separator + 1).trim());
    }
  }
  return null;
}

export function cookieOptions(maxAge: number) {
  const secure = getAppBaseUrl().protocol === "https:" ? "; Secure" : "";
  return `Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

export function clearCookie(response: Response, name: string) {
  response.headers.append("Set-Cookie", `${name}=; ${cookieOptions(0)}`);
}

export function setSignedCookie(
  response: Response,
  name: string,
  payload: object,
  maxAge: number,
) {
  response.headers.append(
    "Set-Cookie",
    `${name}=${encodeURIComponent(signPayload(payload, getSessionSecret()))}; ${cookieOptions(maxAge)}`,
  );
}

export function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export function isSameOriginRequest(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return process.env.NODE_ENV !== "production";
  try {
    return new URL(origin).origin === getAppBaseUrl().origin;
  } catch {
    return false;
  }
}
