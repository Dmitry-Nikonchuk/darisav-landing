import { getSafeRequestContext, getTelegramSession, logTelegramAuth } from "@/lib/telegram-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const authenticated = Boolean(getTelegramSession(request));
    logTelegramAuth("session_endpoint", { ...getSafeRequestContext(request), result: authenticated ? "authenticated" : "anonymous" });
    return Response.json({ authenticated });
  } catch (error) {
    logTelegramAuth("session_endpoint_failed", {
      ...getSafeRequestContext(request),
      errorName: error instanceof Error ? error.name : "UnknownError",
      errorMessage: error instanceof Error ? error.message.slice(0, 300) : "Unknown error",
    });
    return Response.json({ authenticated: false }, { status: 500 });
  }
}
