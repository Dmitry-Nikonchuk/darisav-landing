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
  } catch {
    return Response.redirect(
      new URL("/checkout/blonde-formula?telegram=unavailable", request.url),
    );
  }
}
