/**
 * Avatares del explorador (D6). Personajes originales y provisionales 🔶,
 * derivados del escudo y del paisaje del colegio. Sin elección, Casita.
 */

export const AVATARES = ["CASITA", "PINO", "GOTA", "SOL"] as const;
export type Avatar = (typeof AVATARES)[number];

export const AVATAR_POR_DEFECTO: Avatar = "CASITA";

/** Nombre visible bajo el botón y nombre completo para el lector de pantalla. */
export const NOMBRE_AVATAR: Record<Avatar, { corto: string; completo: string }> = {
  CASITA: { corto: "Casita", completo: "Casita" },
  PINO: { corto: "Pino", completo: "Pino" },
  GOTA: { corto: "Gota", completo: "Gota de río" },
  SOL: { corto: "Sol", completo: "Sol" },
};

export function avatarOPorDefecto(valor: string | null | undefined): Avatar {
  return (AVATARES as readonly string[]).includes(valor ?? "") ? (valor as Avatar) : AVATAR_POR_DEFECTO;
}
