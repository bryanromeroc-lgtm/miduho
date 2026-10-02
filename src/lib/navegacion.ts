/*
  Navegación autorizada por contexto (requerimiento Inc. 1R §2.1–2.3).

  Lógica pura, sin React ni sesión: la consume el shell (Marco) y la cubren
  pruebas. La autorización real vive en proxy.ts + servidor; este módulo solo
  decide qué enlaces se muestran, nunca concede acceso.
*/

export type ContextoShell = "ADMIN" | "DOCENTE" | "ESTUDIANTE";

export type IdRuta =
  | "hoy"
  | "clases"
  | "biblioteca"
  | "laboratorios"
  | "agenda"
  | "mi-curso"
  | "dashboard"
  | "usuarios"
  | "estructura"
  | "asignaciones"
  | "cuenta";

export interface RutaNav {
  id: IdRuta;
  href: string;
  etiqueta: string;
}

const R: Record<IdRuta, RutaNav> = {
  hoy: { id: "hoy", href: "/", etiqueta: "Hoy" },
  clases: { id: "clases", href: "/clases", etiqueta: "Mis clases" },
  biblioteca: { id: "biblioteca", href: "/biblioteca", etiqueta: "Biblioteca" },
  laboratorios: { id: "laboratorios", href: "/laboratorios", etiqueta: "Laboratorios" },
  agenda: { id: "agenda", href: "/agenda", etiqueta: "Agenda" },
  "mi-curso": { id: "mi-curso", href: "/mi-curso", etiqueta: "Mi curso" },
  dashboard: { id: "dashboard", href: "/admin", etiqueta: "Dashboard" },
  usuarios: { id: "usuarios", href: "/admin/usuarios", etiqueta: "Usuarios" },
  estructura: { id: "estructura", href: "/admin/estructura", etiqueta: "Estructura" },
  asignaciones: { id: "asignaciones", href: "/admin/asignaciones", etiqueta: "Asignaciones" },
  cuenta: { id: "cuenta", href: "/cuenta", etiqueta: "Cuenta" },
};

const POR_CONTEXTO: Record<ContextoShell, IdRuta[]> = {
  ESTUDIANTE: ["hoy", "clases", "biblioteca", "laboratorios", "agenda", "cuenta"],
  DOCENTE: ["hoy", "clases", "biblioteca", "laboratorios", "agenda", "mi-curso", "cuenta"],
  ADMIN: ["dashboard", "usuarios", "estructura", "asignaciones", "cuenta"],
};

export function rutasPorContexto(contexto: ContextoShell | null): RutaNav[] {
  if (!contexto) return [R.cuenta];
  return POR_CONTEXTO[contexto].map((id) => R[id]);
}

/** Destino inicial de cada contexto: ADMIN entra al Dashboard, el resto a Hoy. */
export function inicioDeContexto(contexto: ContextoShell | null): string {
  if (contexto === "ADMIN") return "/admin";
  if (contexto === "DOCENTE" || contexto === "ESTUDIANTE") return "/";
  return "/cuenta";
}

export function esRutaAdmin(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

/** Marca activa: "/" y "/admin" solo coinciden exactos; el resto por prefijo de segmento. */
export function rutaActiva(href: string, pathname: string) {
  if (href === "/" || href === "/admin") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Rutas de la maqueta general (Hoy, clases, laboratorios, agenda) y Mi curso. */
export function esRutaMaqueta(pathname: string) {
  if (pathname === "/") return true;
  return ["/clases", "/laboratorios", "/agenda", "/emprendimiento", "/mi-curso"].some(
    (base) => pathname === base || pathname.startsWith(`${base}/`),
  );
}

/**
 * Contexto que pinta el shell. Una cuenta DOCENTE + ADMIN que abre una ruta de
 * administración ve la navegación ADMIN aunque su último contexto sea DOCENTE,
 * y la de DOCENTE dentro de la maqueta o Mi curso: la barra nunca contradice
 * la página. Biblioteca y Cuenta, comunes a todos, conservan el contexto guardado.
 */
export function contextoVisible(
  contexto: ContextoShell | null,
  roles: string[],
  pathname: string,
): ContextoShell | null {
  if (esRutaAdmin(pathname) && roles.includes("ADMIN")) return "ADMIN";
  if (esRutaMaqueta(pathname) && contexto === "ADMIN" && roles.includes("DOCENTE")) return "DOCENTE";
  return contexto;
}

const NOMBRE_ROL: Record<string, string> = {
  ADMIN: "Administración",
  DOCENTE: "Docente",
  ESTUDIANTE: "Estudiante",
};

export function nombreRol(rol: string) {
  return NOMBRE_ROL[rol] ?? rol;
}

/** "1°" + "01" → "1°-01", la forma en que el colegio nombra sus grupos. */
export function etiquetaGrupo(grado: string, identificador: string) {
  return `${grado}-${identificador}`;
}
