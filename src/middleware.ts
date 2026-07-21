import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Intercept routes starting with /admin
  if (path.startsWith('/admin')) {
    // Allow access to /admin/login
    if (path === '/admin/login') {
      return NextResponse.next();
    }

    const adminSession = request.cookies.get('admin_session')?.value;
    const secretToken = process.env.ADMIN_SECRET_TOKEN;

    // Check if the admin_session cookie exists and matches ADMIN_SECRET_TOKEN
    if (!adminSession || adminSession !== secretToken || !secretToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
