/*
  Piezas parametrizables de los kits (D4, D8): cada una dibuja el arte que
  le entrega el kit. Todas son decorativas (aria-hidden) y planas.
*/
import { useId, type CSSProperties } from "react";
import { OPACIDAD_MARCAS } from "./tokens";
import type { Kit } from "./tipos";

type Comun = { className?: string; style?: CSSProperties };

/** Una pieza del kit (suelto, cabecera, clip o chinche) en su lienzo de 100×100. */
export function Pieza({ kit, id, className, style }: Comun & { kit: Kit; id: string }) {
  const arte = kit.arte.piezas[id];
  if (!arte) return null;
  return (
    <svg className={className} style={style} viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      {arte}
    </svg>
  );
}

/** Cinta adhesiva de la materia: color del kit y su mosaico (cuadrícula, renglones…). */
export function Cinta({ kit, className, style }: Comun & { kit: Kit }) {
  const id = useId();
  const { color, mosaico } = kit.arte.cinta;
  return (
    <svg className={className} style={style} viewBox="0 0 96 28" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <defs>
        <pattern id={id} width="16" height="16" patternUnits="userSpaceOnUse">
          {mosaico}
        </pattern>
      </defs>
      <path d="M2 2 L94 0 L96 6 L93 12 L96 18 L94 28 L2 26 L0 20 L3 14 L0 8 Z" fill={color} opacity="0.92" />
      {mosaico && <path d="M2 2 L94 0 L96 6 L93 12 L96 18 L94 28 L2 26 L0 20 L3 14 L0 8 Z" fill={`url(#${id})`} />}
    </svg>
  );
}

/** Franja superior de la tarjeta con el borde temático (regla, renglones, circuito…). */
export function MarcoTarjeta({ kit, className, color }: Comun & { kit: Kit; color: string }) {
  const id = useId();
  const { ancho, mosaico, fondo } = kit.arte.marco;
  return (
    <svg className={className} width="100%" height="14" aria-hidden="true" focusable="false">
      <defs>
        <pattern id={id} width={ancho} height="14" patternUnits="userSpaceOnUse">
          {mosaico}
        </pattern>
      </defs>
      <rect width="100%" height="14" fill={fondo ?? color} />
      {mosaico && <rect width="100%" height="14" fill={`url(#${id})`} />}
    </svg>
  );
}

/*
  Posiciones de las marcas en un mosaico de 280×280: variadas en tamaño y
  giro para que el patrón no se lea como cuadrícula. Fijas, para que el
  servidor y el cliente pinten lo mismo.
*/
const LUGARES: [x: number, y: number, escala: number, giro: number][] = [
  [12, 14, 1.1, -12],
  [118, 6, 0.8, 18],
  [208, 30, 1.3, -6],
  [62, 92, 0.9, 24],
  [160, 104, 1.2, -20],
  [242, 132, 0.8, 10],
  [20, 176, 1.25, 8],
  [110, 196, 0.85, -16],
  [196, 214, 1.05, 14],
  [64, 248, 0.75, -4],
];

/** Capa de fondo con las marcas de agua de la materia (opacidad ≤ 0.12). */
export function PatronMarcas({ kit, color, className }: Comun & { kit: Kit; color: string }) {
  const id = useId();
  const marcas = kit.marcas.map((m) => kit.arte.marcas[m]).filter(Boolean);
  return (
    <svg className={className} width="100%" height="100%" aria-hidden="true" focusable="false" style={{ pointerEvents: "none" }}>
      <defs>
        <pattern id={id} width="280" height="280" patternUnits="userSpaceOnUse">
          <g fill={color} style={{ color }}>
            {LUGARES.map(([x, y, escala, giro], i) => (
              <g key={i} transform={`translate(${x} ${y}) rotate(${giro} 20 20) scale(${escala})`}>
                {marcas[i % marcas.length]}
              </g>
            ))}
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} opacity={OPACIDAD_MARCAS} />
    </svg>
  );
}
