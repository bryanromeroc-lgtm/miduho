export type RolSesion = "ADMIN" | "DOCENTE" | "ESTUDIANTE";
export type ContextoSesion = RolSesion;

const ROLES_VALIDOS: RolSesion[] = ["ADMIN", "DOCENTE", "ESTUDIANTE"];

export function normalizarRoles(roles: string[]): RolSesion[] {
  return ROLES_VALIDOS.filter((rol) => roles.includes(rol));
}

export function resolverContexto(rolesEntrada: string[], ultimo: string | null): ContextoSesion | null {
  const roles = normalizarRoles(rolesEntrada);
  if (roles.includes("ADMIN") && roles.includes("DOCENTE")) {
    return ultimo === "DOCENTE" ? "DOCENTE" : "ADMIN";
  }
  if (roles.includes("ADMIN")) return "ADMIN";
  if (roles.includes("DOCENTE")) return "DOCENTE";
  if (roles.includes("ESTUDIANTE")) return "ESTUDIANTE";
  return null;
}

export function puedeUsarContexto(rolesEntrada: string[], contexto: string): contexto is "ADMIN" | "DOCENTE" {
  const roles = normalizarRoles(rolesEntrada);
  return (contexto === "ADMIN" || contexto === "DOCENTE") && roles.includes(contexto);
}

export type FamiliaRuta = "ADMIN" | "GENERAL" | "BIBLIOTECA" | "MI_CURSO" | "CUENTA";

export function puedeAccederRuta(rolesEntrada: string[], familia: FamiliaRuta) {
  const roles = normalizarRoles(rolesEntrada);
  if (familia === "CUENTA" || familia === "BIBLIOTECA") return roles.length > 0;
  if (familia === "ADMIN") return roles.includes("ADMIN");
  if (familia === "MI_CURSO") return roles.includes("DOCENTE");
  return roles.includes("DOCENTE") || roles.includes("ESTUDIANTE");
}