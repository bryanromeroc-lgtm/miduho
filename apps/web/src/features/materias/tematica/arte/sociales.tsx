/*
  Kit de Ciencias sociales (D4): orientarse en el mundo. Globo terráqueo,
  mapa, brújula, pergamino, catalejo y reloj de arena; la bandera de
  Colombia por decisión del operador (2026-10-31). Sin banderas de otros países.
*/
import type { ArteKit } from "../tipos";

const OLIVA = "#566615";
const OLIVA_CLARO = "#c9d48a";
const MAR = "#2f8ec4";
const MAR_CLARO = "#a9d4ee";
const TIERRA = "#7dbb5a";
const ARENA = "#f1dfb2";
const ARENA_HONDA = "#d8b878";
const ROJO = "#e8604c";
const ACERO = "#b3bbc2";
const PAPEL = "#ffffff";
// Colores de la bandera de Colombia.
const BANDERA_AMARILLO = "#fcd116";
const BANDERA_AZUL = "#003893";
const BANDERA_ROJO = "#ce1126";

/** Rosa de los vientos de cuatro puntas. */
function rosa(cx: number, cy: number, r: number, norte: string, resto: string) {
  const c = r * 0.22;
  return (
    <g>
      <path d={`M${cx} ${cy - r} L${cx + c} ${cy} L${cx - c} ${cy} Z`} fill={norte} />
      <path d={`M${cx} ${cy + r} L${cx + c} ${cy} L${cx - c} ${cy} Z`} fill={resto} />
      <path d={`M${cx - r} ${cy} L${cx} ${cy - c} L${cx} ${cy + c} Z M${cx + r} ${cy} L${cx} ${cy - c} L${cx} ${cy + c} Z`} fill={resto} />
    </g>
  );
}

export const arteSociales: ArteKit = {
  piezas: {
    "globo-terraqueo": (
      <g>
        <rect x="30" y="88" width="40" height="8" rx="4" fill={OLIVA} />
        <rect x="47" y="76" width="6" height="14" fill={OLIVA} />
        <path d="M18 44 A34 34 0 0 0 84 56" stroke={OLIVA} strokeWidth="5" fill="none" strokeLinecap="round" />
        <circle cx="50" cy="44" r="28" fill={MAR} />
        <path d="M36 24 C44 22 50 30 46 38 C42 44 34 42 30 48 C26 40 28 30 36 24 Z" fill={TIERRA} />
        <path d="M56 46 C64 44 72 50 70 60 C66 66 58 66 54 60 C52 54 54 50 56 46 Z" fill={TIERRA} />
        <path d="M22 44 H78 M50 16 C40 28 40 60 50 72" stroke={MAR_CLARO} strokeWidth="1.8" fill="none" />
      </g>
    ),
    "mapa-doblado": (
      <g transform="rotate(-6 50 50)">
        <path d="M6 22 L34 14 L66 22 L94 14 V80 L66 88 L34 80 L6 88 Z" fill={ARENA} />
        <path d="M34 14 L66 22 V88 L34 80 Z" fill={ARENA_HONDA} />
        <path
          d="M14 66 C24 50 40 60 50 44 S74 40 84 28"
          stroke={ROJO}
          strokeWidth="3"
          strokeDasharray="5 5"
          fill="none"
          strokeLinecap="round"
        />
        <path d="M80 22 L88 30 M88 22 L80 30" stroke={ROJO} strokeWidth="3.5" strokeLinecap="round" />
        <path d="M14 30 C20 26 26 32 22 38 C18 40 12 36 14 30 Z" fill={TIERRA} />
      </g>
    ),
    brujula: (
      <g>
        <circle cx="50" cy="52" r="40" fill={OLIVA} />
        <circle cx="50" cy="52" r="32" fill={PAPEL} />
        <rect x="44" y="6" width="12" height="10" rx="4" fill={OLIVA} />
        {rosa(50, 52, 26, ROJO, OLIVA_CLARO)}
        <circle cx="50" cy="52" r="4" fill={OLIVA} />
      </g>
    ),
    pergamino: (
      <g transform="rotate(8 50 50)">
        <rect x="18" y="16" width="64" height="68" fill={ARENA} />
        <rect x="12" y="10" width="76" height="12" rx="6" fill={ARENA_HONDA} />
        <rect x="12" y="78" width="76" height="12" rx="6" fill={ARENA_HONDA} />
        <g fill={ARENA_HONDA}>
          <rect x="28" y="32" width="44" height="4" rx="2" />
          <rect x="28" y="44" width="36" height="4" rx="2" />
          <rect x="28" y="56" width="40" height="4" rx="2" />
        </g>
      </g>
    ),
    "bandera-colombia": (
      <g>
        <rect x="14" y="10" width="6" height="84" rx="3" fill={ACERO} />
        <path d="M20 14 C40 8 60 22 88 14 V40 C60 48 40 34 20 40 Z" fill={BANDERA_AMARILLO} />
        <path d="M20 40 C40 34 60 48 88 40 V53 C60 61 40 47 20 53 Z" fill={BANDERA_AZUL} />
        <path d="M20 53 C40 47 60 61 88 53 V66 C60 74 40 60 20 66 Z" fill={BANDERA_ROJO} />
      </g>
    ),
    catalejo: (
      <g transform="rotate(-30 50 50)">
        <rect x="6" y="40" width="30" height="20" rx="4" fill={OLIVA} />
        <rect x="34" y="42" width="30" height="16" rx="3" fill={ARENA_HONDA} />
        <rect x="62" y="44" width="30" height="12" rx="3" fill={OLIVA_CLARO} />
        <rect x="4" y="38" width="6" height="24" rx="3" fill={MAR} />
      </g>
    ),
    "reloj-arena": (
      <g transform="rotate(10 50 50)">
        <rect x="22" y="8" width="56" height="10" rx="5" fill={OLIVA} />
        <rect x="22" y="82" width="56" height="10" rx="5" fill={OLIVA} />
        <path d="M30 18 H70 C70 36 54 44 54 50 C54 56 70 64 70 82 H30 C30 64 46 56 46 50 C46 44 30 36 30 18 Z" fill={MAR_CLARO} />
        <path d="M38 30 H62 C60 38 52 42 50 46 C48 42 40 38 38 30 Z" fill={ARENA_HONDA} />
        <path d="M34 80 C36 70 46 66 50 64 C54 66 64 70 66 80 Z" fill={ARENA_HONDA} />
      </g>
    ),
    "clip-brujula": (
      <g>
        <rect x="44" y="2" width="12" height="16" rx="4" fill={OLIVA} />
        <circle cx="50" cy="54" r="34" fill={OLIVA} />
        <circle cx="50" cy="54" r="26" fill={PAPEL} />
        {rosa(50, 54, 20, ROJO, OLIVA_CLARO)}
      </g>
    ),
    "chinche-pin": (
      <g>
        <path d="M50 94 C42 76 18 62 18 40 A32 32 0 0 1 82 40 C82 62 58 76 50 94 Z" fill={ROJO} />
        <circle cx="50" cy="40" r="12" fill={PAPEL} />
      </g>
    ),
  },
  marcas: {
    "rosa-vientos": rosa(20, 20, 17, "currentColor", "currentColor"),
    meridiano: (
      <g fill="none" stroke="currentColor" strokeWidth="2.6">
        <circle cx="20" cy="20" r="15" />
        <path d="M20 5 C12 12 12 28 20 35 C28 28 28 12 20 5 M5 20 H35" />
      </g>
    ),
    "pin-marca": (
      <path d="M20 37 C16 29 8 24 8 15 A12 12 0 0 1 32 15 C32 24 24 29 20 37 Z M20 10 A5 5 0 1 0 20.1 10 Z" fillRule="evenodd" />
    ),
  },
  cinta: {
    color: "#ece2c2",
    mosaico: (
      <g>
        <path d="M0 16 V9 C4 7 6 11 10 9 C13 7 14 10 16 9 V16 Z" fill={MAR_CLARO} />
        <circle cx="5" cy="4" r="1.6" fill={ROJO} />
      </g>
    ),
  },
  marco: {
    ancho: 28,
    fondo: MAR_CLARO,
    mosaico: (
      <g>
        <path d="M14 0 C10 4 10 10 14 14" stroke={MAR} strokeWidth="1.6" fill="none" />
        <path d="M0 7 H28" stroke={MAR} strokeWidth="1.2" />
      </g>
    ),
  },
};
