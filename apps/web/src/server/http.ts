/**
 * Utilidades para Route Handlers: sesión + rol, validación Zod, paginación y
 * el envelope de error `{ error: { code, message } }` (arquitectura §7).
 */
import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { ErrorDominio } from "@/server/errores";
import { evaluarAcceso, origenCoincideConHost, type CodigoRol } from "@/server/http-acceso";
import { traducirErrorPrisma } from "@/server/modules/academico/servicio";

export { ROLES_ACADEMICO } from "@/server/http-acceso";

export function respuestaError(status: number, code: string, message: string) {
  return NextResponse.json({ error: { code, message } }, { status });
}

/** Lanza ErrorDominio 401/403 si la sesión no tiene alguno de los roles. */
export async function requerirRol(permitidos: CodigoRol[]) {
  const sesion = await auth();
  const roles = sesion?.user?.id ? sesion.user.roles : null;
  const fallo = evaluarAcceso(roles, permitidos);
  if (fallo === 401) throw new ErrorDominio("NO_AUTENTICADO", "Inicia sesión para continuar.", 401);
  if (fallo === 403) throw new ErrorDominio("SIN_PERMISO", "No tienes permiso para esta acción.", 403);
  if (sesion!.user.debeCambiarContrasena) {
    throw new ErrorDominio("CAMBIO_CONTRASENA_REQUERIDO", "Cambia tu contraseña temporal para continuar.", 403);
  }
  return sesion!.user;
}

/** CSRF para mutaciones en Route Handlers: el Origin debe ser el propio sitio. */
export function verificarOrigen(req: NextRequest) {
  const origen = req.headers.get("origin");
  if (!origenCoincideConHost(origen, req.nextUrl.protocol, req.headers.get("host"), req.nextUrl.origin)) {
    throw new ErrorDominio("ORIGEN_INVALIDO", "Solicitud rechazada por origen no permitido.", 403);
  }
}

export async function leerCuerpo<T extends z.ZodType>(req: NextRequest, esquema: T): Promise<z.output<T>> {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    throw new ErrorDominio("JSON_INVALIDO", "El cuerpo de la solicitud debe ser JSON válido.");
  }
  return validar(esquema, json);
}

export function leerConsulta<T extends z.ZodType>(req: NextRequest, esquema: T): z.output<T> {
  return validar(esquema, Object.fromEntries(req.nextUrl.searchParams));
}

function validar<T extends z.ZodType>(esquema: T, datos: unknown): z.output<T> {
  const r = esquema.safeParse(datos);
  if (!r.success) {
    const mensaje = r.error.issues.map((i) => i.message).join(" ");
    throw new ErrorDominio("DATOS_INVALIDOS", mensaje || "Datos inválidos.");
  }
  return r.data;
}

export function paginada<T>(data: T[], total: number, p: { page: number; pageSize: number }) {
  return NextResponse.json({ data, page: p.page, pageSize: p.pageSize, total });
}

/** Envuelve un handler: traduce errores de dominio/Prisma y oculta trazas internas. */
export async function manejar(fn: () => Promise<Response>): Promise<Response> {
  try {
    return await fn();
  } catch (e) {
    const dominio = e instanceof ErrorDominio ? e : traducirErrorPrisma(e);
    if (dominio) return respuestaError(dominio.status, dominio.code, dominio.message);
    console.error(e);
    return respuestaError(500, "ERROR_INTERNO", "Ocurrió un error inesperado. Intenta de nuevo.");
  }
}
