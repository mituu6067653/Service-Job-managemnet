import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'serviceflow_jwt_secret_super_key_2026_prod_ready'
);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public assets, login, register, track portal, and auth/health APIs
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/track') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/track') ||
    pathname.startsWith('/api/health')
  ) {
    return NextResponse.next();
  }

  // Extract session token
  const token = req.cookies.get('sf_session')?.value;

  if (!token) {
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    const userRole = (payload as any).role as string;

    // 1. TECHNICIAN Role Security Lockdown
    if (userRole === 'TECHNICIAN') {
      const forbiddenForTech = [
        '/jobs',
        '/customers',
        '/invoices',
        '/payments',
        '/requests',
        '/reports',
        '/settings',
        '/technicians',
      ];

      const isForbiddenPage = forbiddenForTech.some((route: string) => pathname.startsWith(route));
      if (isForbiddenPage) {
        const dashboardUrl = new URL('/dashboard', req.url);
        return NextResponse.redirect(dashboardUrl);
      }

      // Block API endpoints for Technician
      const forbiddenTechAPIs = [
        '/api/customers',
        '/api/invoices',
        '/api/payments',
        '/api/reports',
        '/api/settings',
        '/api/technicians',
        '/api/audit-logs',
        '/api/service-requests',
      ];

      const isForbiddenAPI = forbiddenTechAPIs.some((route) => pathname.startsWith(route));
      if (isForbiddenAPI) {
        return NextResponse.json(
          { error: 'FORBIDDEN_ACCESS: Action restricted to Admin & Manager' },
          { status: 403 }
        );
      }
    }

    // 2. MANAGER Role Security Lockdown
    if (userRole === 'MANAGER') {
      const forbiddenForManager = [
        '/settings',
        '/technicians',
      ];

      const isForbiddenPage = forbiddenForManager.some((route) => pathname.startsWith(route));
      if (isForbiddenPage) {
        const dashboardUrl = new URL('/dashboard', req.url);
        return NextResponse.redirect(dashboardUrl);
      }

      const forbiddenManagerAPIs = [
        '/api/audit-logs',
        '/api/technicians',
        '/api/settings',
      ];

      const isForbiddenAPI = forbiddenManagerAPIs.some((route) => pathname.startsWith(route));
      if (isForbiddenAPI) {
        return NextResponse.json(
          { error: 'FORBIDDEN_ACCESS: Action restricted to Admin only' },
          { status: 403 }
        );
      }
    }

    // 3. Root Path Redirect to Dashboard
    if (pathname === '/') {
      const dashboardUrl = new URL('/dashboard', req.url);
      return NextResponse.redirect(dashboardUrl);
    }

    return NextResponse.next();
  } catch (err) {
    const response = NextResponse.redirect(new URL('/login', req.url));
    response.cookies.delete('sf_session');
    return response;
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
