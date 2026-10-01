/** Reglas de acceso por rol, puras (sin sesión ni Next) para poder probarlas. */
export type CodigoRol = "ADMIN" | "COORDINACION" | "DOCENTE" | "ESTUDIANTE" | "ACUDIENTE";

/** Académico: lectura y escritura para ADMIN/COORDINACION (arquitectura §6–7, §14). */
export const ROLES_ACADEMICO: CodigoRol[] = ["ADMIN", "COORDINACION"];

/** `null` = permitido; 401 sin sesión; 403 sin ninguno de los roles. */
export function evaluarAcceso(roles: string[] | null, permitidos: CodigoRol[]): 401 | 403 | null {
  if (roles === null) return 401;
  return roles.some((r) => (permitidos as string[]).includes(r)) ? null : 403;
}

/** Un docente sin rol administrativo solo puede consultar sus propias asignaciones. */
export function docenteIdSegunAlcance(roles: string[], usuarioId: string, docenteIdSolicitado?: string) {
  const tieneAlcanceAdministrativo = roles.some((rol) => rol === "ADMIN" || rol === "COORDINACION");
  return tieneAlcanceAdministrativo ? docenteIdSolicitado : usuarioId;
}
