import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth";

export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    // Skip static files and API routes that don't need auth
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
