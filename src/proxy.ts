import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { puedeAccederRuta, type FamiliaRuta } from "@/server/auth/sesion";

/**
 * Defensa de navegación. `auth()` revalida estado, roles y versión de sesión
 * contra la BD; las APIs vuelven a autorizar mediante `requerirRol`.
 */
const RUTAS_PUBLICAS = ["/login", "/recuperar"];
const RUTA_CAMBIO = "/cuenta/contrasena";

function familia(pathname: string): FamiliaRuta {
  if (pathname.startsWith("/biblioteca")) return "BIBLIOTECA";
  if (pathname.startsWith("/cuenta")) return "CUENTA";
  if (pathname.startsWith("/mi-curso")) return "MI_CURSO";
  if (/^\/(admin|usuarios|estructura|asignaciones)(\/|$)/.test(pathname)) return "ADMIN";
  return "GENERAL";
}

export const proxy = auth((request) => {
  const pathname = request.nextUrl.pathname;
  if (RUTAS_PUBLICAS.some((ruta) => pathname === ruta || pathname.startsWith(`${ruta}/`))) {
    return NextResponse.next();
  }

  const usuario = request.auth?.user;
  if (!usuario?.id) {
    const url = new URL("/login", request.url);
    url.searchParams.set("desde", `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(url);
  }

  // Contraseña temporal (DOCENTE): solo se permite cambiarla (requerimiento §4.2).
  if (usuario.debeCambiarContrasena && pathname !== RUTA_CAMBIO) {
    return NextResponse.redirect(new URL(RUTA_CAMBIO, request.url));
  }

  if (!puedeAccederRuta(usuario.roles, familia(pathname))) {
    return NextResponse.redirect(new URL("/cuenta?sinPermiso=1", request.url));
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
