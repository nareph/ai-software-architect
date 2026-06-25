import { auth } from '@/lib/auth/config';

export default auth;

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/projects/:path*',
    '/api/projects/:path*',
    '/api/generate/:path*',
    '/api/artifacts/:path*',
    '/api/export/:path*',
  ],
};