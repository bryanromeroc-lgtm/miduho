/**
 * Color de la vista de cada materia (vistas-de-materia, D4–D5). Planos
 * sólidos: el contraste lo da el relleno, nunca una sombra ni un contorno.
 *
 * - fondo:   pastel neutro de la página (OKLCH croma ≤ 0.03).
 * - marca:   color de las marcas de agua; se pinta con OPACIDAD_MARCAS.
 * - tarjeta: plano de la tarjeta y de la cabecera.
 * - banda:   plano de la ilustración de la tarjeta y de los chips.
 * - acento:  botón y relleno principal de la utilería; lleva texto blanco.
 * - tinta:   texto principal.
 * - suave:   texto secundario.
 * - apoyo:   segundo color de la utilería, estrellas y sueltos. Nunca lleva
 *            texto encima: con la tinta no alcanza 4.5:1 en todas las materias.
 *
 * Paleta propia del proyecto; no es identidad oficial del colegio.
 */
import type { Escena } from "@/lib/escenas";

export type TokensMateria = {
  fondo: string;
  marca: string;
  tarjeta: string;
  banda: string;
  acento: string;
  sobreAcento: string;
  tinta: string;
  suave: string;
  apoyo: string;
};

export const OPACIDAD_MARCAS = 0.1;

const t = (fondo: string, banda: string, acento: string, tinta: string, suave: string, apoyo: string): TokensMateria => ({
  fondo,
  marca: suave,
  tarjeta: "#ffffff",
  banda,
  acento,
  sobreAcento: "#ffffff",
  tinta,
  suave,
  apoyo,
});

export const TOKENS: Record<Escena, TokensMateria> = {
  matematicas: t("#eef3fa", "#dce8f8", "#1f5fbf", "#132f57", "#3b5578", "#f2b52a"),
  lectura: t("#faf3ed", "#f8e3d3", "#b14a1c", "#46210e", "#6e4630", "#3f8fbf"),
  naturales: t("#eef6ef", "#d9eedc", "#1d7639", "#123a20", "#3b5a43", "#3db7c9"),
  ingles: t("#f4f1fa", "#e6dff6", "#6438b0", "#2c1757", "#53487a", "#f2a93b"),
  robotica: t("#ecf5f6", "#d5ecee", "#0a6a77", "#0b363e", "#365c62", "#f2b52a"),
  emprendimiento: t("#faf6ea", "#f4e8c5", "#865600", "#3f2c06", "#64502a", "#2f9e6a"),
  etica: t("#fbf1f3", "#f7dde3", "#ae3555", "#4d1424", "#734552", "#f4a8b8"),
  artistica: t("#f8f1f7", "#f0dcef", "#963888", "#43163d", "#6a4564", "#f2b52a"),
  fisica: t("#f1f1fa", "#e0e0f6", "#4343b5", "#1f1f58", "#4a4a7a", "#f08a3c"),
  sociales: t("#f4f4ea", "#e7e9cf", "#566615", "#2c330b", "#535a35", "#2f8ec4"),
  generica: t("#f3f3f1", "#e4e6ea", "#3b4d66", "#1d2836", "#4b5563", "#f2b52a"),
};

/** Propiedades CSS de la vista: `--m-fondo`, `--m-tinta`, … */
export function variablesDe(escena: Escena): Record<string, string> {
  return Object.fromEntries(Object.entries(TOKENS[escena]).map(([k, v]) => [`--m-${k}`, v]));
}

/** Pares de texto que usa la vista (texto sobre plano), verificados a 4.5:1. */
export const PARES_TEXTO: { texto: keyof TokensMateria; fondo: keyof TokensMateria; uso: string }[] = [
  { texto: "tinta", fondo: "tarjeta", uso: "título y datos de la tarjeta, cabecera" },
  { texto: "suave", fondo: "tarjeta", uso: "subtítulo, intentos y estado vacío" },
  { texto: "tinta", fondo: "banda", uso: "chip de estado" },
  { texto: "tinta", fondo: "tarjeta", uso: "botón «¡Listo!» del aviso" },
  { texto: "tinta", fondo: "fondo", uso: "paginador y encabezado" },
  { texto: "suave", fondo: "fondo", uso: "página no disponible del paginador" },
  { texto: "sobreAcento", fondo: "acento", uso: "botón de la tarjeta y rótulo «Datos de ejemplo»" },
  { texto: "acento", fondo: "tarjeta", uso: "enlace «Volver» y acción secundaria" },
  { texto: "acento", fondo: "fondo", uso: "«Volver» y páginas sobre el fondo" },
  { texto: "tinta", fondo: "banda", uso: "aviso de primera visita" },
];
