/*
  Kit de Ciencias naturales (D4): laboratorio escolar y vida. Tubos de
  ensayo, lupa, microscopio, hojas y gotas, en planos sólidos.
*/
import type { ArteKit } from "../tipos";
import { gota } from "./comun";

const VERDE = "#1d7639";
const VERDE_MEDIO = "#4fae5f";
const VERDE_CLARO = "#a8dcae";
const AGUA = "#3db7c9";
const AGUA_CLARA = "#a9e2ea";
const VIDRIO = "#e3f3f5";
const LILA = "#a78bd6";
const CORAL = "#f08a6c";
const ACERO = "#9fb2b8";
const ACERO_HONDO = "#5f7a80";

/** Hoja con su nervio central, apuntando hacia arriba a la derecha. */
function hoja(color: string, nervio: string, giro = 0) {
  return (
    <g transform={`rotate(${giro} 50 50)`}>
      <path d="M18 82 C18 40 44 16 84 16 C84 56 60 82 18 82 Z" fill={color} />
      <path d="M22 78 L72 28" stroke={nervio} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M40 60 L40 44 M52 48 L52 34 M40 60 L56 60 M52 48 L66 48" stroke={nervio} strokeWidth="2.5" strokeLinecap="round" />
    </g>
  );
}

export const arteNaturales: ArteKit = {
  piezas: {
    "tubos-ensayo": (
      <g>
        <rect x="8" y="70" width="84" height="10" rx="3" fill={ACERO} />
        {[
          [20, AGUA],
          [44, VERDE_MEDIO],
          [68, CORAL],
        ].map(([x, color]) => (
          <g key={x as number} transform={`translate(${x} 0)`}>
            <path d="M0 12 H14 V66 A7 7 0 0 1 0 66 Z" fill={VIDRIO} />
            <path d="M0 40 H14 V66 A7 7 0 0 1 0 66 Z" fill={color as string} />
            <rect x="-2" y="8" width="18" height="6" rx="3" fill={ACERO_HONDO} />
          </g>
        ))}
        <rect x="8" y="80" width="6" height="12" rx="2" fill={ACERO} />
        <rect x="86" y="80" width="6" height="12" rx="2" fill={ACERO} />
      </g>
    ),
    lupa: (
      <g>
        <rect x="58" y="56" width="14" height="40" rx="7" fill={VERDE} transform="rotate(-45 65 76)" />
        <circle cx="40" cy="40" r="30" fill={VERDE_MEDIO} />
        <circle cx="40" cy="40" r="22" fill={AGUA_CLARA} />
        <path d="M27 32 A15 15 0 0 1 38 22" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" fill="none" />
      </g>
    ),
    microscopio: (
      <g>
        <rect x="16" y="84" width="64" height="10" rx="5" fill={VERDE} />
        <path d="M58 84 C80 74 80 40 56 32" stroke={VERDE_MEDIO} strokeWidth="9" fill="none" strokeLinecap="round" />
        <rect x="26" y="62" width="40" height="7" rx="3" fill={ACERO_HONDO} />
        <g transform="rotate(-28 44 34)">
          <rect x="36" y="6" width="16" height="44" rx="5" fill={AGUA} />
          <rect x="33" y="2" width="22" height="9" rx="4" fill={VERDE} />
          <rect x="40" y="50" width="8" height="10" rx="2" fill={ACERO_HONDO} />
        </g>
        <circle cx="66" cy="54" r="5" fill={ACERO} />
      </g>
    ),
    "hoja-grande": hoja(VERDE_MEDIO, VERDE_CLARO, 0),
    "hoja-suelta": hoja(VERDE_CLARO, VERDE_MEDIO, 30),
    "gota-agua": (
      <g>
        <path d={gota(50, 56, 30)} fill={AGUA} />
        <path d="M36 60 A14 14 0 0 0 46 74" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" fill="none" />
      </g>
    ),
    brote: (
      <g>
        <path d="M14 86 H86 C80 74 20 74 14 86 Z" fill="#c9a77c" />
        <path d="M50 80 V42" stroke={VERDE} strokeWidth="6" strokeLinecap="round" />
        <path d="M50 52 C30 52 20 38 22 24 C38 24 50 36 50 52 Z" fill={VERDE_MEDIO} />
        <path d="M50 46 C66 46 78 34 78 18 C60 18 50 30 50 46 Z" fill={VERDE_CLARO} />
      </g>
    ),
    mariposa: (
      <g transform="rotate(-10 50 50)">
        <ellipse cx="32" cy="38" rx="20" ry="22" fill={LILA} />
        <ellipse cx="68" cy="38" rx="20" ry="22" fill={LILA} />
        <ellipse cx="34" cy="68" rx="14" ry="15" fill={CORAL} />
        <ellipse cx="66" cy="68" rx="14" ry="15" fill={CORAL} />
        <circle cx="32" cy="36" r="6" fill="#ffffff" />
        <circle cx="68" cy="36" r="6" fill="#ffffff" />
        <rect x="46" y="26" width="8" height="56" rx="4" fill={VERDE} />
        <path d="M48 28 C44 18 40 14 34 12 M52 28 C56 18 60 14 66 12" stroke={VERDE} strokeWidth="3" strokeLinecap="round" fill="none" />
      </g>
    ),
    "clip-pinza": (
      <g>
        <rect x="38" y="6" width="24" height="38" rx="6" fill={ACERO_HONDO} />
        <path d="M40 44 L36 94 H46 L50 50 L54 94 H64 L60 44 Z" fill={ACERO} />
        <rect x="44" y="14" width="12" height="20" rx="4" fill={ACERO} />
      </g>
    ),
    "chinche-gota": (
      <g>
        <path d={gota(50, 58, 32)} fill={AGUA} />
        <circle cx="40" cy="58" r="8" fill={AGUA_CLARA} />
      </g>
    ),
  },
  marcas: {
    semilla: (
      <g>
        <ellipse cx="20" cy="24" rx="10" ry="13" />
        <path d="M20 12 C20 6 24 3 30 3 C30 9 26 12 20 12 Z" />
      </g>
    ),
    "hoja-marca": <path d="M6 34 C6 16 18 6 34 6 C34 24 24 34 6 34 Z" />,
    huella: (
      <g>
        <ellipse cx="20" cy="26" rx="9" ry="8" />
        <circle cx="9" cy="15" r="4" />
        <circle cx="16" cy="9" r="4" />
        <circle cx="24" cy="9" r="4" />
        <circle cx="31" cy="15" r="4" />
      </g>
    ),
    "gota-marca": <path d={gota(20, 24, 11)} />,
  },
  cinta: {
    color: "#cdebd2",
    mosaico: <path d="M4 12 C4 7 7 4 12 4 C12 9 9 12 4 12 Z" fill={VERDE_MEDIO} opacity="0.55" />,
  },
  marco: {
    ancho: 28,
    fondo: VERDE_CLARO,
    mosaico: (
      <g>
        <path d="M2 12 C2 6 6 2 12 2 C12 8 8 12 2 12 Z" fill={VERDE_MEDIO} />
        <path d={gota(20, 8, 3.2)} fill={AGUA} />
      </g>
    ),
  },
};
