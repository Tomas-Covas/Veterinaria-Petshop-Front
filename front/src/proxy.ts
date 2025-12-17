import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();

  const role = request.cookies.get('role')?.value;
  const isVet = role === 'veterinarian';

  // ✅ Rutas permitidas para veterinarios
  const allowedForVets = ['/dashboard', '/change-password'];

  const isAllowed = allowedForVets.some(path =>
    url.pathname === path || url.pathname.startsWith(path)
  );

  // ✅ Bloquear TODO excepto dashboard y change-password
  if (isVet && !isAllowed) {
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|api|static|favicon.ico).*)'
  ],
};
