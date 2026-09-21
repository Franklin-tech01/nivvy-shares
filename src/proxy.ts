import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const PUBLIC_PATHS = ["/login", "/register", "/forgot-password"];

/**
 * Optimistic gate only: checks that a session cookie exists. Real session
 * validation happens server-side in `requireUser()` (see `@/lib/data`).
 */
export function proxy(request: NextRequest) {
  const hasSession = !!getSessionCookie(request);
  const path = request.nextUrl.pathname;
  const isPublic = PUBLIC_PATHS.some((p) => path === p || path.startsWith(`${p}/`));

  if (!hasSession && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  // Never redirect away from public pages here: a stale cookie would bounce
  // between /login and /dashboard forever. The (auth) layout checks the real
  // session server-side and forwards genuinely signed-in users.
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
