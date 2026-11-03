import {
  exchangeTelegramCode,
  readOAuthState,
  TELEGRAM_OAUTH_COOKIE,
  TELEGRAM_SESSION_COOKIE,
  TELEGRAM_SESSION_SECONDS,
  getSafeRequestContext,
  logTelegramAuth,
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

function finishLogin(popup: boolean, success: boolean, diagnosticId?: string) {
  const baseUrl = getAppBaseUrl();
  const target = new URL("/checkout/blonde-formula", baseUrl);
  if (!success) {
    target.searchParams.set("telegram", "failed");
    if (diagnosticId) target.searchParams.set("diag", diagnosticId);
  }

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
  const requestContext = getSafeRequestContext(request);
  const hasOAuthCookie = Boolean(request.headers.get("cookie")?.split(";").some((item) => item.trim().startsWith(`${TELEGRAM_OAUTH_COOKIE}=`)));
  const hasCode = Boolean(url.searchParams.get("code"));
  const hasReturnedState = Boolean(url.searchParams.get("state"));
  const hasOAuthError = url.searchParams.has("error");
  let oauthState: ReturnType<typeof readOAuthState> = null;
  try {
    oauthState = readOAuthState(request);
  } catch (error) {
    logTelegramAuth("callback_state_read_error", {
      ...requestContext,
      hasOAuthCookie,
      errorName: error instanceof Error ? error.name : "UnknownError",
      errorMessage: error instanceof Error ? error.message.slice(0, 300) : "Unknown error",
    });
  }
  const diagnosticId = oauthState?.diagnosticId;
  logTelegramAuth("callback_received", {
    ...requestContext,
    diagnosticId,
    hasOAuthCookie,
    oauthCookieValid: Boolean(oauthState),
    hasCode,
    hasReturnedState,
    hasOAuthError,
    oauthError: url.searchParams.get("error")?.slice(0, 100),
    popup: oauthState?.popup,
    stateMatches: Boolean(oauthState && url.searchParams.get("state") === oauthState.state),
    stateAgeSeconds: oauthState ? Math.max(0, Math.floor(Date.now() / 1000) - (oauthState.exp - 600)) : undefined,
  });
  let responseForFailure: Response;
  try {
    responseForFailure = finishLogin(oauthState?.popup ?? false, false, diagnosticId);
    clearCookie(responseForFailure, TELEGRAM_OAUTH_COOKIE);
  } catch (error) {
    logTelegramAuth("callback_failure_response_error", {
      diagnosticId,
      errorName: error instanceof Error ? error.name : "UnknownError",
      errorMessage: error instanceof Error ? error.message.slice(0, 300) : "Unknown error",
    });
    return Response.json({ error: "Telegram login could not be completed", diagnosticId }, { status: 500 });
  }

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
    logTelegramAuth("callback_rejected", {
      diagnosticId,
      reason: !oauthState ? "missing_or_invalid_oauth_cookie" : oauthState.exp <= Date.now() / 1000 ? "oauth_state_expired" : !returnedState ? "missing_state" : returnedState !== oauthState.state ? "state_mismatch" : !code ? "missing_code" : "telegram_returned_error",
      hasCode,
      hasReturnedState,
      hasOAuthError,
    });
    return responseForFailure;
  }

  try {
    logTelegramAuth("callback_processing_started", { diagnosticId });
    const identity = await exchangeTelegramCode(code, oauthState);
    logTelegramAuth("telegram_user_upsert_started", { diagnosticId });
    const userId = BigInt(identity.telegramUserId);
    await getPrisma().telegramUser.upsert({
      where: { id: userId },
      create: { id: userId },
      update: {},
    });
    logTelegramAuth("telegram_user_upsert_succeeded", { diagnosticId });

    const session: TelegramSession = {
      telegramUserId: identity.telegramUserId,
      exp: Math.floor(Date.now() / 1000) + TELEGRAM_SESSION_SECONDS,
    };
    const response = finishLogin(oauthState.popup, true, diagnosticId);
    clearCookie(response, TELEGRAM_OAUTH_COOKIE);
    setSignedCookie(response, TELEGRAM_SESSION_COOKIE, session, TELEGRAM_SESSION_SECONDS);
    logTelegramAuth("callback_succeeded", { diagnosticId, popup: oauthState.popup, sessionCookieSet: true });
    return response;
  } catch (error) {
    logTelegramAuth("callback_processing_failed", {
      diagnosticId,
      errorName: error instanceof Error ? error.name : "UnknownError",
      errorMessage: error instanceof Error ? error.message.slice(0, 300) : "Unknown error",
      errorCode: typeof error === "object" && error !== null && "code" in error ? String(error.code).slice(0, 80) : undefined,
    });
    return responseForFailure;
  }
}
