/*
  Retroalimentación visual de los juegos («juice» ligero). Solo datos puros:
  el movimiento lo hace CSS (transform y opacity), sin bucle de animación,
  sin librerías ni canvas. Ver efectos.tsx y efectos.module.css.
*/

export type TipoReaccion = "acierto" | "corregida";

export type Reaccion = { tipo: TipoReaccion; n: number };

export type Pieza = {
  /** Desplazamiento final, en % del ancho de la escena (x) y de su alto (y; negativo = arriba). */
  dx: number;
  dy: number;
  /** Giro final en grados. */
  giro: number;
  /** Retardo en ms. */
  retardo: number;
};

// Tabla fija (sin azar): el mismo resultado en servidor y cliente, y pruebas estables.
const PIEZAS: Pieza[] = [
  { dx: -34, dy: -46, giro: -240, retardo: 0 },
  { dx: -22, dy: -62, giro: 180, retardo: 30 },
  { dx: -10, dy: -52, giro: -120, retardo: 10 },
  { dx: 0, dy: -70, giro: 300, retardo: 50 },
  { dx: 10, dy: -54, giro: -200, retardo: 20 },
  { dx: 22, dy: -64, giro: 150, retardo: 60 },
  { dx: 34, dy: -44, giro: -280, retardo: 40 },
  { dx: -42, dy: -22, giro: 220, retardo: 70 },
  { dx: 42, dy: -24, giro: -160, retardo: 80 },
  { dx: -16, dy: -36, giro: 260, retardo: 90 },
  { dx: 16, dy: -38, giro: -90, retardo: 100 },
  { dx: 4, dy: -28, giro: 120, retardo: 110 },
];

// Niveles de importancia: acertar a la primera celebra más que acertar corrigiendo.
const CANTIDAD: Record<TipoReaccion, number> = { acierto: 12, corregida: 5 };

/** Las piezas de confeti para cada reacción. El error no lleva confeti: solo sonido, Armi y el aviso. */
export function piezasDe(tipo: TipoReaccion): Pieza[] {
  return PIEZAS.slice(0, CANTIDAD[tipo]);
}
