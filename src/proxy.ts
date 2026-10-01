import { NextResponse, type NextRequest } from "next/server";

/**
 * Check OPTIMISTA (solo presencia de cookie de sesión) para redirigir a /login.
 * No es autorización: la verificación real se hace en el servidor con `auth()`
 * (docs/arquitectura-backend.md §6).
 *
 * 🔶 Por ahora solo se protege /cuenta; la maqueta (inicio, biblioteca,
 * clases…) sigue abierta hasta que producto decida qué exige sesión.
 */
const COOKIES_SESION = ["authjs.session-token", "__Secure-authjs.session-token"];

export function proxy(request: NextRequest) {
  const tieneSesion = COOKIES_SESION.some((n) => request.cookies.has(n));
  if (!tieneSesion) {
    const url = new URL("/login", request.url);
    url.searchParams.set("desde", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/cuenta/:path*"],
};
