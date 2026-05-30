import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "aveline-dev-secret-change-in-production"
);

const PROTECTED = ["/dashboard"];
const AUTH_ONLY = ["/login", "/register", "/welcome"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Redirect old /home path to /dashboard
  if (pathname === "/home" || pathname.startsWith("/home/")) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.replace(/^\/home/, "/dashboard");
    return NextResponse.redirect(url);
  }

  const token = req.cookies.get("aveline_token")?.value;
  let isValid = false;
  let userId: string | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      isValid = true;
      userId = payload.sub as string;
    } catch {
      isValid = false;
    }
  }

  // ── If JWT looks valid, verify the user still exists in the DB ──────────────
  // This catches the case where the account was deleted but the cookie remains.
  if (isValid && userId && pathname.startsWith("/dashboard")) {
    try {
      const apiUrl = new URL("/api/auth/check-user", req.url);
      apiUrl.searchParams.set("userId", userId);

      const check = await fetch(apiUrl.toString(), {
        headers: { "x-internal-check": "1" },
      });

      if (!check.ok) {
        // User no longer exists — clear the stale cookie and send to login
        const res = NextResponse.redirect(new URL("/login", req.url));
        res.cookies.set("aveline_token", "", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 0,
          path: "/",
        });
        return res;
      }
    } catch {
      // If the check itself fails (e.g. DB down), let the request through —
      // the dashboard's own getAuth() + DB query will handle it gracefully.
    }
  }

  // ── Protect /dashboard — redirect to login if not authenticated ─────────────
  if (PROTECTED.some((p) => pathname.startsWith(p)) && !isValid) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // ── Already logged in — redirect away from auth pages to dashboard ──────────
  if (AUTH_ONLY.some((p) => pathname.startsWith(p)) && isValid) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/home/:path*", "/dashboard/:path*", "/login", "/register", "/welcome"],
};