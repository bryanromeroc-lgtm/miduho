import type { ReactNode } from "react";
import type { Escena } from "@/lib/escenas";

/**
 * Un kit temático (D4). La declaración es solo datos —ids de los elementos—
 * para que la prueba del catálogo la verifique sin dibujar nada; el arte vive
 * aparte, en `arte/<escena>.tsx`, con una pieza SVG por id.
 */
export type DeclaracionKit = {
  escena: Escena;
  /** Escenografía de la cabecera: la mitad va a cada lado del título. */
  cabecera: string[];
  /** Elementos que flotan en los márgenes, fuera de la zona de texto (≥ 3). */
  sueltos: string[];
  /** Símbolos del patrón de marcas de agua (≥ 3). */
  marcas: string[];
  /** Utilería escolar reinterpretada por la materia. */
  utileria: { clip: string; cinta: string; chinche: string };
  /** Borde temático de la tarjeta. */
  marco: string;
};

/**
 * Arte de un kit. Cada pieza es un fragmento SVG plano que se dibuja en un
 * lienzo de 100×100 (las marcas, en 40×40). Sin trazos de tinta oscura, sin
 * sombras ni degradados de volumen.
 */
export type ArteKit = {
  piezas: Record<string, ReactNode>;
  marcas: Record<string, ReactNode>;
  /** Patrón de la cinta: fragmento en un mosaico de 16×16 sobre el color de la cinta. */
  cinta: { color: string; mosaico: ReactNode };
  /** Marco de la tarjeta: franja superior en un mosaico de `ancho`×14, sobre `fondo` (o el apoyo de la materia). */
  marco: { ancho: number; mosaico: ReactNode; fondo?: string };
};

export type Kit = DeclaracionKit & { arte: ArteKit };
