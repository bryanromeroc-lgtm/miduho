import type { ReactNode } from "react";
import type { Kit } from "../tematica/tipos";

/*
  Ilustración de la banda de la tarjeta (D7): el tipo de actividad (catálogo
  de fundacion-actividades, D4) dibujado CON los objetos del kit de la
  materia. Ordenar son tres piezas de menor a mayor; emparejar, dos parejas
  unidas; clasificar, piezas cayendo en dos cestas… Plano, sin trazos de
  tinta: los conectores van en el acento de la materia.
*/
const A = "var(--m-acento)";
const P = "var(--m-tarjeta)";

type Dibujo = (pieza: (n: number, x: number, y: number, tamano: number) => ReactNode) => ReactNode;

const DIBUJOS: Record<string, Dibujo> = {
  "seleccion-multiple": (pieza) => (
    <g>
      {[30, 80, 130].map((cx, i) => (
        <g key={cx}>
          <circle cx={cx} cy="45" r="22" fill={P} />
          {i === 1 && <circle cx={cx} cy="45" r="22" fill="none" stroke={A} strokeWidth="4" />}
          {pieza(i, cx - 15, 30, 30)}
        </g>
      ))}
    </g>
  ),
  ordenar: (pieza) => (
    <g>
      <rect x="14" y="76" width="132" height="5" rx="2.5" fill={P} />
      {pieza(0, 22, 50, 26)}
      {pieza(0, 58, 38, 38)}
      {pieza(0, 100, 24, 52)}
    </g>
  ),
  emparejar: (pieza) => (
    <g>
      <path d="M50 26 C80 26 80 64 110 64 M50 64 C80 64 80 26 110 26" fill="none" stroke={A} strokeWidth="4" strokeLinecap="round" />
      {pieza(0, 18, 12, 30)}
      {pieza(1, 18, 50, 30)}
      {pieza(1, 112, 12, 30)}
      {pieza(0, 112, 50, 30)}
    </g>
  ),
  clasificar: (pieza) => (
    <g>
      <path d="M14 56 H70 L64 84 H20 Z" fill={P} />
      <path d="M90 56 H146 L140 84 H96 Z" fill={P} />
      {pieza(0, 28, 8, 28)}
      {pieza(1, 104, 14, 28)}
      {pieza(0, 30, 50, 24)}
      {pieza(1, 106, 50, 24)}
    </g>
  ),
  completar: (pieza) => (
    <g>
      {pieza(0, 8, 30, 30)}
      {pieza(1, 44, 30, 30)}
      <circle cx="95" cy="45" r="16" fill={P} stroke={A} strokeWidth="3" strokeDasharray="5 5" />
      {pieza(0, 120, 30, 30)}
    </g>
  ),
  memoria: (pieza) => (
    <g>
      <rect x="36" y="10" width="40" height="70" rx="9" fill={A} transform="rotate(-8 56 45)" />
      <rect x="44" y="20" width="24" height="50" rx="6" fill={P} opacity="0.25" transform="rotate(-8 56 45)" />
      <rect x="84" y="10" width="40" height="70" rx="9" fill={P} transform="rotate(7 104 45)" />
      {pieza(0, 88, 29, 32)}
    </g>
  ),
  concurso: (pieza) => (
    <g>
      <rect x="74" y="4" width="12" height="9" rx="3" fill={A} />
      <circle cx="80" cy="48" r="34" fill={P} />
      <path d="M80 18 A30 30 0 0 1 110 48" fill="none" stroke={A} strokeWidth="5" strokeLinecap="round" />
      {pieza(0, 60, 28, 40)}
    </g>
  ),
  // Cuadrícula con una palabra marcada en diagonal y una pieza encima.
  "sopa-letras": (pieza) => (
    <g>
      {[0, 1, 2, 3].map((f) =>
        [0, 1, 2, 3, 4].map((c) => <rect key={`${f}-${c}`} x={36 + c * 18} y={6 + f * 20} width="14" height="16" rx="4" fill={P} />),
      )}
      <path d="M43 14 L115 74" stroke={A} strokeWidth="9" strokeLinecap="round" opacity="0.85" />
      {pieza(0, 118, 44, 34)}
    </g>
  ),
  // Casillas de una palabra, dos ya descubiertas con piezas, y la pista al lado.
  "palabra-secreta": (pieza) => (
    <g>
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <rect x={12 + i * 28} y="34" width="22" height="30" rx="5" fill={P} />
          <rect x={12 + i * 28} y="66" width="22" height="4" rx="2" fill={A} />
        </g>
      ))}
      {pieza(0, 41, 38, 20)}
      {pieza(1, 97, 38, 20)}
      <circle cx="146" cy="20" r="11" fill={A} />
    </g>
  ),
};

/** Banda de la tarjeta: el tipo armado con piezas del kit; un tipo desconocido usa el de selección múltiple. */
export function IlustracionTipo({ tipo, kit, indice, className }: { tipo: string; kit: Kit; indice: number; className?: string }) {
  // Cada tarjeta toma piezas distintas del kit para que dos vecinas no se repitan.
  const ids = [...kit.sueltos, ...kit.cabecera];
  const pieza = (n: number, x: number, y: number, tamano: number) => {
    const arte = kit.arte.piezas[ids[(indice + n) % ids.length]];
    return arte ? (
      <svg key={`${n}-${x}-${y}`} x={x} y={y} width={tamano} height={tamano} viewBox="0 0 100 100">
        {arte}
      </svg>
    ) : null;
  };
  const dibujo = DIBUJOS[tipo] ?? DIBUJOS["seleccion-multiple"];
  return (
    <svg className={className} viewBox="0 0 160 90" aria-hidden="true" focusable="false">
      {dibujo(pieza)}
    </svg>
  );
}
