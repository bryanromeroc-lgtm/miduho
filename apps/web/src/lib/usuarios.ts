/**
 * Vocabulario compartido (servidor y cliente) de la administración de
 * usuarios — INC1R-05, requerimiento §2 y §4. Puro: sin Prisma ni Next.
 */

/** Combinaciones válidas (§2). No existen ESTUDIANTE+DOCENTE ni ESTUDIANTE+ADMIN. */
export const COMBINACIONES = ["DOCENTE", "ESTUDIANTE", "DOCENTE_ADMIN", "ADMIN"] as const;
export type Combinacion = (typeof COMBINACIONES)[number];

export const ESTADOS = ["PENDIENTE_ACTIVACION", "ACTIVO", "INACTIVO"] as const;
export type EstadoCuenta = (typeof ESTADOS)[number];

export const ETIQUETA_COMBINACION: Record<Combinacion, string> = {
  DOCENTE: "Docente",
  ESTUDIANTE: "Estudiante",
  DOCENTE_ADMIN: "Docente y administración",
  ADMIN: "Administración",
};

export const AYUDA_COMBINACION: Record<Combinacion, string> = {
  DOCENTE: "Recibe una contraseña temporal y debe cambiarla en su primer ingreso.",
  ESTUDIANTE: "Recibe una contraseña legible que se muestra una sola vez.",
  DOCENTE_ADMIN: "Docente con acceso a la administración; cambia entre ambos contextos.",
  ADMIN: "Solo administración. Recibe una invitación de 24 horas para crear su contraseña.",
};

export const ETIQUETA_ESTADO: Record<EstadoCuenta, string> = {
  PENDIENTE_ACTIVACION: "Pendiente de activación",
  ACTIVO: "Activo",
  INACTIVO: "Inactivo",
};

export function rolesDeCombinacion(c: Combinacion): ("ADMIN" | "DOCENTE" | "ESTUDIANTE")[] {
  if (c === "DOCENTE_ADMIN") return ["DOCENTE", "ADMIN"];
  return [c];
}

/** `null` si los roles no forman una combinación válida (p. ej. cuenta sin rol). */
export function combinacionDe(roles: string[]): Combinacion | null {
  const admin = roles.includes("ADMIN");
  const docente = roles.includes("DOCENTE");
  const estudiante = roles.includes("ESTUDIANTE");
  if (estudiante) return admin || docente ? null : "ESTUDIANTE";
  if (admin && docente) return "DOCENTE_ADMIN";
  if (admin) return "ADMIN";
  if (docente) return "DOCENTE";
  return null;
}

/** Las cuentas estudiantiles y las del personal no se convierten entre sí. */
export function esCambioDeCombinacionPermitido(actual: Combinacion | null, nueva: Combinacion) {
  if (actual === null) return true;
  return (actual === "ESTUDIANTE") === (nueva === "ESTUDIANTE");
}

/**
 * CSV de una credencial recién emitida, para descargarla en el navegador una
 * sola vez (mismo formato que el restablecimiento: BOM, correo,contrasena, y
 * celdas protegidas contra inyección de fórmulas).
 */
export function csvUnaCredencial(correo: string, contrasena: string) {
  const celda = (v: string) => {
    const seguro = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
    return /[",\r\n]/.test(seguro) ? `"${seguro.replace(/"/g, '""')}"` : seguro;
  };
  return `\uFEFFcorreo,contrasena\r\n${celda(correo)},${celda(contrasena)}\r\n`;
}
