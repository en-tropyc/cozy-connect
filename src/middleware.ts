import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  async function middleware(req) {
    // If trying to access the home page, check for profile
    if (req.nextUrl.pathname === '/') {
      // Skip profile check if newProfile parameter is present
      if (req.nextUrl.searchParams.has('newProfile')) {
        return NextResponse.next();
      }
      
      try {
        // Get the session cookie
        const cookie = req.headers.get('cookie') || '';
        
        // Make the profile check request with retries
        let profileResponse;
        let retries = 3;
        
        while (retries > 0) {
          profileResponse = await fetch(`${req.nextUrl.origin}/api/profile`, {
            headers: {
              cookie,
              'Cache-Control': 'no-cache'
            }
          });
          
          if (profileResponse.ok) {
            break;
          }
          
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
          retries--;
        }
        
        if (!profileResponse?.ok) {
          // If we still don't have a profile after retries, redirect to link-or-create
          return NextResponse.redirect(new URL('/auth/link-or-create', req.url));
        }
      } catch (error) {
        console.error('Error checking profile in middleware:', error);
        // On error, allow the request to proceed to avoid redirect loops
        return NextResponse.next();
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
