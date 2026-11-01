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
  // Dos postes con su tela tendida y una pieza del kit en el centro.
  pancarta: (pieza) => (
    <g>
      <rect x="18" y="8" width="7" height="78" rx="3.5" fill={A} />
      <rect x="135" y="8" width="7" height="78" rx="3.5" fill={A} />
      <path d="M25 18 H135 V58 Q80 66 25 58 Z" fill={P} />
      {pieza(0, 64, 22, 32)}
    </g>
  ),
  // Pizarra colgada con una coma decimal entre dos piezas.
  "pizarra-decimales": (pieza) => (
    <g>
      <path d="M52 6 L44 18 M108 6 L116 18" stroke={A} strokeWidth="3" strokeLinecap="round" />
      <rect x="22" y="18" width="116" height="62" rx="9" fill={A} />
      <rect x="30" y="26" width="100" height="46" rx="5" fill={P} />
      {pieza(0, 38, 32, 34)}
      <circle cx="82" cy="64" r="4" fill={A} />
      {pieza(1, 90, 32, 34)}
    </g>
  ),
  // Una hoja con un renglón tachado y la corrección encima.
  corrector: (pieza) => (
    <g>
      <rect x="30" y="10" width="100" height="72" rx="8" fill={P} />
      <rect x="44" y="30" width="56" height="6" rx="3" fill={A} opacity="0.35" />
      <rect x="44" y="50" width="30" height="6" rx="3" fill={A} opacity="0.35" />
      <path d="M78 53 H104" stroke={A} strokeWidth="5" strokeLinecap="round" />
      {pieza(0, 104, 40, 34)}
    </g>
  ),
  // Letrero con una pieza y un sello estampado de lado.
  sello: (pieza) => (
    <g>
      <rect x="20" y="14" width="96" height="58" rx="8" fill={P} />
      {pieza(0, 46, 22, 40)}
      <rect x="104" y="44" width="40" height="22" rx="5" fill="none" stroke={A} strokeWidth="4" transform="rotate(-14 124 55)" />
    </g>
  ),
  // La galera: dividendo, la escuadra del divisor y una pieza como cociente.
  division: (pieza) => (
    <g>
      <rect x="18" y="20" width="50" height="22" rx="6" fill={P} />
      <path d="M80 14 V48 H146" stroke={A} strokeWidth="5" strokeLinecap="round" fill="none" />
      <rect x="90" y="20" width="44" height="20" rx="6" fill={P} />
      <rect x="30" y="58" width="30" height="20" rx="6" fill={P} opacity="0.7" />
      {pieza(0, 96, 52, 32)}
    </g>
  ),
  // Dos barras: una en tercios y otra en sextos, con la misma parte pintada.
  bocadillo: (pieza) => (
    <g>
      <rect x="18" y="16" width="96" height="20" rx="5" fill={P} />
      <rect x="18" y="16" width="64" height="20" rx="5" fill={A} />
      <rect x="18" y="48" width="96" height="20" rx="5" fill={P} />
      <rect x="18" y="48" width="64" height="20" rx="5" fill={A} opacity="0.7" />
      <path d="M50 48 V68 M34 48 V68 M66 48 V68 M98 48 V68" stroke={P} strokeWidth="2.5" />
      {pieza(0, 120, 28, 32)}
    </g>
  ),
  // Dos vasos con líquido y uno lleno: la suma de partes.
  jarras: (pieza) => (
    <g>
      {[20, 62, 104].map((x, i) => (
        <g key={x}>
          <rect x={x} y="16" width="34" height="62" rx="6" fill={P} />
          <rect x={x + 3} y={i === 2 ? 34 : i === 0 ? 56 : 62} width="28" height={i === 2 ? 41 : i === 0 ? 19 : 13} rx="3" fill={A} />
        </g>
      ))}
      {pieza(0, 128, 2, 26)}
    </g>
  ),
  // Etiqueta de precio con una flecha que sube.
  porcentaje: (pieza) => (
    <g>
      <path d="M40 20 H120 V70 H40 L22 45 Z" fill={P} />
      <circle cx="36" cy="45" r="5" fill={A} />
      {pieza(0, 64, 26, 38)}
      <path d="M118 30 L140 12 M140 12 H128 M140 12 V24" stroke={A} strokeWidth="5" strokeLinecap="round" fill="none" />
    </g>
  ),
  // Dos filas de fichas con una ficha común resaltada.
  multiplos: (pieza) => (
    <g>
      {[0, 1, 2, 3].map((k) => (
        <rect key={`a${k}`} x={16 + k * 30} y="18" width="24" height="22" rx="5" fill={P} />
      ))}
      {[0, 1, 2].map((k) => (
        <rect key={`b${k}`} x={16 + k * 45} y="52" width="24" height="22" rx="5" fill={P} />
      ))}
      <rect x="73" y="15" width="30" height="28" rx="7" fill="none" stroke={A} strokeWidth="4" />
      <rect x="58" y="49" width="30" height="28" rx="7" fill="none" stroke={A} strokeWidth="4" />
      {pieza(0, 128, 28, 30)}
    </g>
  ),
  // Escalones que suben con una pieza en la cima.
  operaciones: (pieza) => (
    <g>
      <rect x="16" y="66" width="30" height="14" rx="3" fill={P} />
      <rect x="46" y="52" width="30" height="28" rx="3" fill={P} />
      <rect x="76" y="38" width="30" height="42" rx="3" fill={P} />
      <rect x="106" y="24" width="30" height="56" rx="3" fill={A} />
      {pieza(0, 106, -4, 30)}
    </g>
  ),
  // Dos paralelas y una perpendicular que las cruza.
  rectas: (pieza) => (
    <g>
      <path d="M14 30 H146 M14 62 H146" stroke={P} strokeWidth="6" strokeLinecap="round" />
      <path d="M96 10 V82" stroke={A} strokeWidth="6" strokeLinecap="round" />
      {pieza(0, 30, 34, 26)}
    </g>
  ),
  // Transportador con un ángulo marcado.
  angulos: (pieza) => (
    <g>
      <path d="M24 80 A56 56 0 0 1 136 80 Z" fill={P} />
      <path d="M80 80 L136 80 M80 80 L112 34" stroke={A} strokeWidth="5" strokeLinecap="round" />
      <path d="M100 80 A20 20 0 0 0 92 63" fill="none" stroke={A} strokeWidth="3" />
      {pieza(0, 30, 44, 26)}
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
