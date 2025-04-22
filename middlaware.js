import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (!token || token.role !== "admin") {
      const url = req.nextUrl.clone();
      url.pathname = "/api/auth/signin";
      url.searchParams.set("callbackUrl", "/admin");
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};