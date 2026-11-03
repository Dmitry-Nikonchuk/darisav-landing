import {
  createOAuthState,
  createTelegramAuthorizationUrl,
  getSafeRequestContext,
  logTelegramAuth,
  TELEGRAM_OAUTH_COOKIE,
} from "@/lib/telegram-auth";
import { setSignedCookie } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestContext = getSafeRequestContext(request);
  let diagnosticId: string | undefined;
  try {
    const url = new URL(request.url);
    const popup = url.searchParams.get("popup") === "1";
    const state = createOAuthState(popup);
    diagnosticId = state.diagnosticId;
    logTelegramAuth("oauth_start", {
      ...requestContext,
      diagnosticId,
      popup,
      configuredClientId: Boolean(process.env.TELEGRAM_LOGIN_CLIENT_ID),
      configuredSessionSecret: Boolean(process.env.APP_SESSION_SECRET),
      baseUrlConfigured: Boolean(process.env.APP_BASE_URL),
    });
    const authorizationUrl = createTelegramAuthorizationUrl(state);
    // Response.redirect() returns immutable headers in the Next.js runtime,
    // but the OAuth state cookie must be appended before returning the redirect.
    const response = new Response(null, {
      status: 302,
      headers: { Location: authorizationUrl.toString() },
    });
    setSignedCookie(response, TELEGRAM_OAUTH_COOKIE, state, 600);
    logTelegramAuth("oauth_redirect_sent", { diagnosticId, redirectHost: new URL(authorizationUrl).host });
    return response;
  } catch (error) {
    // Keep diagnostics useful without ever logging OAuth credentials or cookies.
    console.error("[telegram-auth] Unable to start OAuth", {
      ...requestContext,
      diagnosticId,
      reason: error instanceof Error ? error.message : "Unknown error",
    });

    // A relative Location keeps the browser on the public host behind proxies;
    // request.url can contain an internal address such as 0.0.0.0:10002.
    return new Response(null, {
      status: 303,
      headers: { Location: "/checkout/blonde-formula?telegram=unavailable" },
    });
  }
}
