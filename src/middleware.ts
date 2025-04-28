import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  async function middleware(req) {
    // If trying to access the home page, check for profile
    if (req.nextUrl.pathname === '/') {
      try {
        const profileResponse = await fetch(`${req.nextUrl.origin}/api/profile`, {
          headers: {
            cookie: req.headers.get('cookie') || ''
          }
        });
        
        if (!profileResponse.ok) {
          // No profile found, redirect to link-or-create
          return NextResponse.redirect(new URL('/auth/link-or-create', req.url));
        }
      } catch (error) {
        console.error('Error checking profile in middleware:', error);
      }
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth routes)
     * - auth (sign in pages)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth|auth|_next/static|_next/image|favicon.ico).*)",
  ],
}; 
