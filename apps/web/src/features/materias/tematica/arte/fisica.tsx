/*
  Kit de Física (decisión del operador del 2026-10-31: «fisica» es la
  ciencia, cercana a la física matemática). Péndulo, imán, polea, prisma con
  luz, resorte y ondas; las marcas de agua son fuerzas, imanes, luz y ondas
  (nada de fórmulas: es primaria).
*/
import type { ArteKit } from "../tipos";

const INDIGO = "#4343b5";
const INDIGO_CLARO = "#b9b9ee";
const NARANJA = "#f08a3c";
const ROJO = "#e8604c";
const AMARILLO = "#f2c12e";
const VERDE = "#3fae6a";
const AZUL = "#3f8fd6";
const ACERO = "#aab3c2";
const ACERO_HONDO = "#6f7891";
const VIDRIO = "#dfe7f8";
const PAPEL = "#ffffff";

/** Onda senoidal de `ciclos` ciclos entre x0 y x1. */
function senoide(x0: number, x1: number, y: number, amplitud: number, ciclos: number) {
  const paso = (x1 - x0) / (ciclos * 2);
  let d = `M${x0} ${y}`;
  for (let i = 0; i < ciclos * 2; i++) {
    const x = x0 + i * paso;
    const signo = i % 2 === 0 ? -1 : 1;
    d += ` Q${x + paso / 2} ${y + signo * amplitud * 2} ${x + paso} ${y}`;
  }
  return d;
}

export const arteFisica: ArteKit = {
  piezas: {
    pendulo: (
      <g>
        <rect x="12" y="8" width="76" height="8" rx="4" fill={ACERO_HONDO} />
        <path d="M50 16 L70 70" stroke={ACERO_HONDO} strokeWidth="3" strokeLinecap="round" />
        <path d="M50 16 L50 72" stroke={INDIGO_CLARO} strokeWidth="2.4" strokeDasharray="4 5" strokeLinecap="round" />
        <path d="M30 70 A44 44 0 0 0 70 70" stroke={INDIGO_CLARO} strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx="72" cy="74" r="13" fill={NARANJA} />
        <circle cx="68" cy="70" r="4" fill="#f7b98a" />
      </g>
    ),
    "iman-herradura": (
      <g transform="rotate(-20 50 50)">
        <path d="M18 30 A32 32 0 0 1 82 30 V70 H62 V30 A12 12 0 0 0 38 30 V70 H18 Z" fill={ROJO} />
        <rect x="18" y="70" width="20" height="16" fill={ACERO} />
        <rect x="62" y="70" width="20" height="16" fill={ACERO} />
        <g stroke={INDIGO} strokeWidth="3" strokeLinecap="round" fill="none">
          <path d="M28 94 V98 M50 92 V98 M72 94 V98" />
        </g>
      </g>
    ),
    polea: (
      <g>
        <rect x="20" y="4" width="60" height="8" rx="4" fill={ACERO_HONDO} />
        <rect x="47" y="10" width="6" height="16" fill={ACERO_HONDO} />
        <circle cx="50" cy="38" r="20" fill={INDIGO} />
        <circle cx="50" cy="38" r="12" fill={INDIGO_CLARO} />
        <circle cx="50" cy="38" r="4" fill={INDIGO} />
        <path d="M30 38 V80 M70 38 V60" stroke={NARANJA} strokeWidth="3.5" strokeLinecap="round" />
        <rect x="20" y="78" width="20" height="18" rx="3" fill={AMARILLO} />
        <rect x="62" y="58" width="16" height="14" rx="3" fill={VERDE} />
      </g>
    ),
    "prisma-luz": (
      <g>
        <path d="M2 54 L40 46" stroke={PAPEL} strokeWidth="5" strokeLinecap="round" />
        <path d="M50 14 L82 72 H18 Z" fill={VIDRIO} />
        <path d="M50 14 L82 72 H66 Z" fill={INDIGO_CLARO} />
        {[
          [ROJO, 40],
          [NARANJA, 48],
          [AMARILLO, 56],
          [VERDE, 64],
          [AZUL, 72],
        ].map(([c, y]) => (
          <path
            key={c as string}
            d={`M64 ${42 + ((y as number) - 40) / 3} L98 ${y}`}
            stroke={c as string}
            strokeWidth="4"
            strokeLinecap="round"
          />
        ))}
      </g>
    ),
    resorte: (
      <g transform="rotate(-12 50 50)">
        <rect x="20" y="6" width="60" height="8" rx="4" fill={ACERO_HONDO} />
        <path
          d="M50 14 L50 18 L30 24 L70 32 L30 40 L70 48 L30 56 L70 64 L50 70 L50 74"
          stroke={INDIGO}
          strokeWidth="4.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          fill="none"
        />
        <rect x="34" y="74" width="32" height="20" rx="4" fill={NARANJA} />
      </g>
    ),
    "onda-suelta": (
      <g>
        <path d={senoide(8, 92, 50, 14, 2)} stroke={INDIGO} strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M8 76 H92" stroke={INDIGO_CLARO} strokeWidth="3" strokeLinecap="round" />
        <path d="M84 70 L92 76 L84 82" stroke={INDIGO_CLARO} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
    ),
    rampa: (
      <g>
        <path d="M6 86 H94 V30 Z" fill={INDIGO_CLARO} />
        <rect x="46" y="38" width="22" height="18" rx="3" fill={NARANJA} transform="rotate(-32 57 47)" />
        <path d="M44 66 L22 80" stroke={INDIGO} strokeWidth="3.5" strokeLinecap="round" />
        <path d="M22 72 L20 81 L29 82" stroke={INDIGO} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M72 86 A22 22 0 0 0 76 74" stroke={INDIGO} strokeWidth="2.6" fill="none" />
      </g>
    ),
    "clip-iman": (
      <g>
        <path d="M30 34 A20 20 0 0 1 70 34 V86 H56 V34 A6 6 0 0 0 44 34 V86 H30 Z" fill={ROJO} />
        <rect x="30" y="74" width="14" height="14" fill={ACERO} />
        <rect x="56" y="74" width="14" height="14" fill={ACERO} />
      </g>
    ),
    "chinche-esfera": (
      <g>
        <circle cx="50" cy="50" r="38" fill={NARANJA} />
        <circle cx="38" cy="38" r="12" fill="#f7b98a" />
      </g>
    ),
  },
  marcas: {
    "flecha-fuerza": (
      <g>
        <rect x="4" y="14" width="10" height="12" rx="2" />
        <rect x="16" y="18" width="14" height="4" rx="2" />
        <path d="M28 12 L38 20 L28 28 Z" />
      </g>
    ),
    "iman-marca": <path d="M8 12 A12 12 0 0 1 32 12 V34 H25 V12 A5 5 0 0 0 15 12 V34 H8 Z" />,
    "rayo-luz": (
      <g>
        <circle cx="12" cy="20" r="7" />
        <rect x="22" y="18.5" width="16" height="3" rx="1.5" />
        <rect x="20" y="9" width="14" height="3" rx="1.5" transform="rotate(-28 20 10)" />
        <rect x="20" y="28" width="14" height="3" rx="1.5" transform="rotate(28 20 30)" />
      </g>
    ),
    "onda-marca": <path d={senoide(2, 38, 20, 6, 2)} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />,
  },
  cinta: {
    color: "#dcdcf6",
    mosaico: <path d={senoide(0, 16, 8, 2.5, 1)} stroke={INDIGO} strokeWidth="1.6" fill="none" opacity="0.6" />,
  },
  marco: {
    ancho: 32,
    fondo: INDIGO_CLARO,
    mosaico: <path d={senoide(0, 32, 7, 2.6, 1)} stroke={INDIGO} strokeWidth="2" fill="none" />,
  },
};
