import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isLoginPage = req.nextUrl.pathname === "/admin/login";

  // Not logged in and not on login page → redirect to login
  if (!token && !isLoginPage) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  // Already logged in and on login page → redirect to dashboard
  if (token && isLoginPage) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  // Pass a header so the layout knows it's the login page (no sidebar needed)
  const response = NextResponse.next();
  response.headers.set("x-is-login", isLoginPage ? "1" : "0");
  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
