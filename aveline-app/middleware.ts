import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "aveline-dev-secret-change-in-production"
);

const PROTECTED = ["/home"];
const AUTH_ONLY = ["/login", "/register"]; // redirect logged-in users away

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("aveline_token")?.value;

  let isValid = false;
  if (token) {
    try {
      await jwtVerify(token, JWT_SECRET);
      isValid = true;
    } catch {
      isValid = false;
    }
  }

  // Protect /home — redirect to login if not authenticated
  if (PROTECTED.some((p) => pathname.startsWith(p)) && !isValid) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  // Already logged in — redirect away from login/register to dashboard
  if (AUTH_ONLY.some((p) => pathname.startsWith(p)) && isValid) {
    const homeUrl = req.nextUrl.clone();
    homeUrl.pathname = "/home";
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/home/:path*", "/login", "/register"],
};