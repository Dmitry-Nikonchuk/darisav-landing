import {
  createOAuthState,
  createTelegramAuthorizationUrl,
  TELEGRAM_OAUTH_COOKIE,
} from "@/lib/telegram-auth";
import { setSignedCookie } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const popup = url.searchParams.get("popup") === "1";
    const state = createOAuthState(popup);
    const response = Response.redirect(createTelegramAuthorizationUrl(state));
    setSignedCookie(response, TELEGRAM_OAUTH_COOKIE, state, 600);
    return response;
  } catch (error) {
    // Keep diagnostics useful without ever logging OAuth credentials or cookies.
    console.error("[telegram-auth] Unable to start OAuth", {
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
