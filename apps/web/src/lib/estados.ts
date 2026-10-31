/**
 * Vocabulario de estado cerrado de clases y materias. Cada estado se
 * comunica con una marca (icono) y un texto, nunca solo con color, para
 * que siga siendo identificable en escala de grises.
 */

export const ESTADOS = [
  "ahora",
  "programada",
  "lista",
  "hecha",
  "sin-material",
  "en-preparacion",
  "nuevo",
] as const;

export type Estado = (typeof ESTADOS)[number];

/** Nombre del icono de lucide-react que hace de marca del estado. */
export type MarcaEstado =
  | "CirclePlay"
  | "CalendarClock"
  | "BookOpenCheck"
  | "CircleCheckBig"
  | "CircleDashed"
  | "Hourglass"
  | "Sparkles";

/** Tono de fondo del chip; sale de las rampas de globals.css. */
export type TonoEstado = "sol" | "cielo" | "lima" | "pino" | "niebla" | "durazno";

export type DefinicionEstado = { texto: string; marca: MarcaEstado; tono: TonoEstado };

export const DEFINICION_ESTADO: Record<Estado, DefinicionEstado> = {
  ahora: { texto: "Ahora", marca: "CirclePlay", tono: "sol" },
  programada: { texto: "Programada", marca: "CalendarClock", tono: "cielo" },
  lista: { texto: "Lista", marca: "BookOpenCheck", tono: "lima" },
  hecha: { texto: "Hecha", marca: "CircleCheckBig", tono: "pino" },
  "sin-material": { texto: "Sin material", marca: "CircleDashed", tono: "niebla" },
  "en-preparacion": { texto: "En preparación", marca: "Hourglass", tono: "durazno" },
  nuevo: { texto: "¡Nuevo!", marca: "Sparkles", tono: "sol" },
};
