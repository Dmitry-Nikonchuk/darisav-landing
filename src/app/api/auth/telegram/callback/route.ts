import {
  exchangeTelegramCode,
  readOAuthState,
  TELEGRAM_OAUTH_COOKIE,
  TELEGRAM_SESSION_COOKIE,
  TELEGRAM_SESSION_SECONDS,
  type TelegramSession,
} from "@/lib/telegram-auth";
import {
  clearCookie,
  getAppBaseUrl,
  setSignedCookie,
} from "@/lib/security";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function finishLogin(popup: boolean, success: boolean) {
  const baseUrl = getAppBaseUrl();
  const target = new URL("/checkout/blonde-formula", baseUrl);
  if (!success) target.searchParams.set("telegram", "failed");

  if (!popup) return Response.redirect(target);

  const targetOrigin = JSON.stringify(baseUrl.origin);
  const targetUrl = JSON.stringify(target.toString());
  const response = new Response(
    `<!doctype html><html lang="ru"><meta charset="utf-8"><title>Telegram</title><body><p>Вход завершён. Это окно можно закрыть.</p><script>if(window.opener){window.opener.postMessage({type:"blonde-formula-telegram-login",success:${success}},${targetOrigin});window.close()}else{window.location.replace(${targetUrl})}</script></body></html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
  return response;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const oauthState = readOAuthState(request);
  const responseForFailure = finishLogin(oauthState?.popup ?? false, false);
  clearCookie(responseForFailure, TELEGRAM_OAUTH_COOKIE);

  const returnedState = url.searchParams.get("state");
  const code = url.searchParams.get("code");
  if (
    !oauthState ||
    oauthState.exp <= Date.now() / 1000 ||
    !returnedState ||
    returnedState !== oauthState.state ||
    !code ||
    url.searchParams.has("error")
  ) {
    return responseForFailure;
  }

  try {
    const telegramUserId = await exchangeTelegramCode(code, oauthState);
    const userId = BigInt(telegramUserId);
    await getPrisma().telegramUser.upsert({
      where: { id: userId },
      create: { id: userId },
      update: {},
    });

    const session: TelegramSession = {
      sub: telegramUserId,
      exp: Math.floor(Date.now() / 1000) + TELEGRAM_SESSION_SECONDS,
    };
    const response = finishLogin(oauthState.popup, true);
    clearCookie(response, TELEGRAM_OAUTH_COOKIE);
    setSignedCookie(response, TELEGRAM_SESSION_COOKIE, session, TELEGRAM_SESSION_SECONDS);
    return response;
  } catch {
    return responseForFailure;
  }
}
