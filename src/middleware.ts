import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { SESSION_COOKIE_NAME } from "@/lib/auth";

function getSecretKey() {
  return new TextEncoder().encode(process.env.SESSION_SECRET ?? "");
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // El login (página + endpoint) queda siempre accesible.
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi =
    pathname.startsWith("/api/guests") ||
    pathname.startsWith("/api/clues") ||
    pathname.startsWith("/api/alerts") ||
    pathname.startsWith("/api/votes") ||
    pathname.startsWith("/api/reveal");

  if (!isAdminPage && !isAdminApi) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  let authenticated = false;

  if (token) {
    try {
      await jwtVerify(token, getSecretKey());
      authenticated = true;
    } catch {
      authenticated = false;
    }
  }

  if (!authenticated) {
    if (isAdminApi) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/guests/:path*",
    "/api/clues/:path*",
    "/api/alerts/:path*",
    "/api/votes/:path*",
    "/api/reveal/:path*",
  ],
};
