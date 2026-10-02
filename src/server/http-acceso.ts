/** Reglas de acceso por rol, puras (sin sesión ni Next) para poder probarlas. */
export type CodigoRol = "ADMIN" | "DOCENTE" | "ESTUDIANTE";

/** La administración de la estructura académica corresponde exclusivamente a ADMIN. */
export const ROLES_ACADEMICO: CodigoRol[] = ["ADMIN"];

/** `null` = permitido; 401 sin sesión; 403 sin ninguno de los roles. */
export function evaluarAcceso(roles: string[] | null, permitidos: CodigoRol[]): 401 | 403 | null {
  if (roles === null) return 401;
  return roles.some((r) => (permitidos as string[]).includes(r)) ? null : 403;
}

/** Un docente sin rol administrativo solo puede consultar sus propias asignaciones. */
export function docenteIdSegunAlcance(roles: string[], usuarioId: string, docenteIdSolicitado?: string) {
  const tieneAlcanceAdministrativo = roles.includes("ADMIN");
  return tieneAlcanceAdministrativo ? docenteIdSolicitado : usuarioId;
}

/**
 * Un servidor ligado a `0.0.0.0` conserva esa dirección en `nextUrl`, aunque
 * el navegador haya llegado por localhost o por la IP de la LAN. Para CSRF se
 * compara el Origin con el Host efectivo de la solicitud, no con el binding.
 */
export function origenCoincideConHost(origen: string | null, protocolo: string, host: string | null, respaldo: string) {
  if (!origen) return true;
  return origen === (host ? `${protocolo}//${host}` : respaldo);
}
