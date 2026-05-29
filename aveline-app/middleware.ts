import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "aveline-dev-secret-change-in-production"
);

const PROTECTED  = ["/dashboard"];
const AUTH_ONLY  = ["/login", "/register", "/welcome"];

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
  if (token) {
    try {
      await jwtVerify(token, JWT_SECRET);
      isValid = true;
    } catch {
      isValid = false;
    }
  }

  // Protect /dashboard — redirect to login if not authenticated
  if (PROTECTED.some((p) => pathname.startsWith(p)) && !isValid) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Already logged in — redirect away from auth pages to dashboard
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