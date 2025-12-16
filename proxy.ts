import { NextResponse } from "next/server";

export default function middleware(req: { nextUrl: { pathname: any; }; cookies: { get: (arg0: string) => any; }; url: string | URL; }) {

  const { pathname } = req.nextUrl;
  const accessToken = req.cookies.get("access_token");

  // ✅ Public pages
  const publicRoutes = ["/login", "/register"];
  if (publicRoutes.some(r => pathname.startsWith(r)) && accessToken) {
    return NextResponse.redirect(new URL("/chat", req.url));
  }

  // ✅ Protected pages
  const protectedRoutes = ["/chat", "/settings", "/profile"];
  if (protectedRoutes.some(r => pathname.startsWith(r)) && !accessToken) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/register", "/chat/:path*", "/settings/:path*", "/profile/:path*"],
};
