import {
  createHash,
  createPublicKey,
  randomBytes,
  verify as verifySignature,
} from "node:crypto";
import { getAppBaseUrl, getSessionSecret, readCookie, verifyPayload } from "@/lib/security";

export const TELEGRAM_SESSION_COOKIE = "bf_telegram_session";
export const TELEGRAM_OAUTH_COOKIE = "bf_telegram_oauth";
export const TELEGRAM_SESSION_SECONDS = 60 * 60 * 24 * 7;

export type TelegramSession = {
  telegramUserId: string;
  exp: number;
};

export type TelegramIdentity = { telegramUserId: string };

export type TelegramOAuthState = {
  state: string;
  nonce: string;
  verifier: string;
  popup: boolean;
  returnTo: "/checkout/blonde-formula";
  exp: number;
};

export function getTelegramClientId() {
  const clientId = process.env.TELEGRAM_LOGIN_CLIENT_ID;
  if (!clientId) throw new Error("TELEGRAM_LOGIN_CLIENT_ID is not configured");
  return clientId;
}

export function getTelegramCallbackUrl() {
  return new URL("/api/auth/telegram/callback", getAppBaseUrl()).toString();
}

export function createOAuthState(popup: boolean): TelegramOAuthState {
  return {
    state: randomBytes(32).toString("base64url"),
    nonce: randomBytes(32).toString("base64url"),
    verifier: randomBytes(48).toString("base64url"),
    popup,
    returnTo: "/checkout/blonde-formula",
    exp: Math.floor(Date.now() / 1000) + 600,
  };
}

export function createTelegramAuthorizationUrl(state: TelegramOAuthState) {
  const challenge = createHash("sha256")
    .update(state.verifier)
    .digest("base64url");
  const url = new URL("https://oauth.telegram.org/auth");
  url.search = new URLSearchParams({
    client_id: getTelegramClientId(),
    redirect_uri: getTelegramCallbackUrl(),
    response_type: "code",
    scope: "openid profile",
    state: state.state,
    nonce: state.nonce,
    code_challenge: challenge,
    code_challenge_method: "S256",
  }).toString();
  return url;
}

export function getTelegramSession(request: Request) {
  const token = readCookie(request, TELEGRAM_SESSION_COOKIE);
  if (!token) return null;
  const session = verifyPayload<TelegramSession>(token, getSessionSecret());
  if (
    !session ||
    !/^\d+$/.test(session.telegramUserId) ||
    session.exp <= Date.now() / 1000
  ) {
    return null;
  }
  return session;
}

export async function exchangeTelegramCode(code: string, state: TelegramOAuthState) {
  const clientId = getTelegramClientId();
  const clientSecret = process.env.TELEGRAM_LOGIN_CLIENT_SECRET;
  if (!clientSecret) {
    throw new Error("TELEGRAM_LOGIN_CLIENT_SECRET is not configured");
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const response = await fetch("https://oauth.telegram.org/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: getTelegramCallbackUrl(),
      client_id: clientId,
      code_verifier: state.verifier,
    }),
    signal: AbortSignal.timeout(10_000),
    cache: "no-store",
  });

  if (!response.ok) throw new Error("Telegram token exchange failed");
  const tokenResponse = (await response.json()) as { id_token?: string };
  if (!tokenResponse.id_token) throw new Error("Telegram did not return an ID token");
  return validateTelegramIdToken(tokenResponse.id_token, state.nonce, clientId);
}

type TelegramJwk = JsonWebKey & { kid?: string; alg?: string; use?: string };
type TelegramJwks = { keys: TelegramJwk[] };
type TelegramIdClaims = {
  iss?: string;
  aud?: string | string[];
  sub?: string;
  id?: number | string;
  exp?: number;
  iat?: number;
  nonce?: string;
};

let cachedJwks: { expiresAt: number; value: TelegramJwks } | null = null;

async function getTelegramJwks() {
  if (cachedJwks && cachedJwks.expiresAt > Date.now()) return cachedJwks.value;
  const response = await fetch("https://oauth.telegram.org/.well-known/jwks.json", {
    signal: AbortSignal.timeout(10_000),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Unable to fetch Telegram signing keys");
  const value = (await response.json()) as TelegramJwks;
  cachedJwks = { value, expiresAt: Date.now() + 60 * 60 * 1000 };
  return value;
}

async function validateTelegramIdToken(
  token: string,
  expectedNonce: string,
  clientId: string,
): Promise<TelegramIdentity> {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Malformed Telegram ID token");
  const [encodedHeader, encodedClaims, encodedSignature] = parts;
  const header = JSON.parse(
    Buffer.from(encodedHeader, "base64url").toString("utf8"),
  ) as { alg?: string; kid?: string };
  const claims = JSON.parse(
    Buffer.from(encodedClaims, "base64url").toString("utf8"),
  ) as TelegramIdClaims;
  if (header.alg !== "RS256" || !header.kid) {
    throw new Error("Unsupported Telegram ID token signature");
  }

  const jwks = await getTelegramJwks();
  const jwk = jwks.keys.find((key) => key.kid === header.kid);
  if (!jwk) throw new Error("Telegram ID token signing key was not found");
  const publicKey = createPublicKey({
    key: JSON.parse(JSON.stringify(jwk)),
    format: "jwk",
  });
  const validSignature = verifySignature(
    "RSA-SHA256",
    Buffer.from(`${encodedHeader}.${encodedClaims}`),
    publicKey,
    Buffer.from(encodedSignature, "base64url"),
  );

  const now = Math.floor(Date.now() / 1000);
  const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  const rawTelegramUserId =
    typeof claims.id === "number" && Number.isSafeInteger(claims.id) && claims.id > 0
      ? String(claims.id)
      : typeof claims.id === "string" && /^\d{1,19}$/.test(claims.id)
        ? claims.id
        : null;
  const telegramUserId = rawTelegramUserId &&
    BigInt(rawTelegramUserId) <= BigInt("9223372036854775807")
    ? rawTelegramUserId
    : null;
  if (
    !validSignature ||
    claims.iss !== "https://oauth.telegram.org" ||
    !audiences.includes(clientId) ||
    !claims.sub ||
    !telegramUserId ||
    !claims.exp ||
    claims.exp <= now ||
    !claims.iat ||
    claims.iat > now + 60 ||
    claims.iat < now - 10 * 60 ||
    !claims.nonce ||
    claims.nonce !== expectedNonce
  ) {
    throw new Error("Telegram ID token validation failed");
  }

  return { telegramUserId };
}

export function readOAuthState(request: Request) {
  const token = readCookie(request, TELEGRAM_OAUTH_COOKIE);
  if (!token) return null;
  return verifyPayload<TelegramOAuthState>(token, getSessionSecret());
}
