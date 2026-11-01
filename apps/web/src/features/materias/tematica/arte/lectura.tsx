/*
  Kit de Lectura (D4): libros, pluma, tintero y la ortografía del español
  (ñ, ¿?, « »). Planos sólidos en terracota y azul tinta clara.
*/
import type { ArteKit } from "../tipos";
import { LETRA, marcaTexto } from "./comun";

const TERRACOTA = "#b14a1c";
const DURAZNO = "#f2a37a";
const CREMA = "#fff7ec";
const PAPEL = "#ffffff";
const RENGLON = "#c9dcef";
const AZUL = "#3f8fbf";
const AZUL_CLARO = "#a9d0ea";
const AMARILLO = "#f2b52a";
const VINO = "#8e3b52";

export const arteLectura: ArteKit = {
  piezas: {
    "libro-abierto": (
      <g>
        <path d="M4 30 C20 22 40 22 50 32 C60 22 80 22 96 30 V84 C80 76 60 76 50 86 C40 76 20 76 4 84 Z" fill={TERRACOTA} />
        <path d="M10 28 C24 20 40 22 48 30 V80 C40 72 24 72 10 78 Z" fill={PAPEL} />
        <path d="M90 28 C76 20 60 22 52 30 V80 C60 72 76 72 90 78 Z" fill={CREMA} />
        <g stroke={RENGLON} strokeWidth="2.6" strokeLinecap="round">
          {[38, 48, 58, 66].map((y) => (
            <path key={y} d={`M16 ${y} C26 ${y - 5} 34 ${y - 5} 42 ${y - 1} M58 ${y - 1} C66 ${y - 5} 74 ${y - 5} 84 ${y}`} />
          ))}
        </g>
        <path d="M66 22 V48 L72 42 L78 48 V22 Z" fill={AMARILLO} />
      </g>
    ),
    pluma: (
      <g transform="rotate(32 50 50)">
        <path d="M50 4 C70 18 70 56 52 78 L48 78 C30 56 30 18 50 4 Z" fill={AZUL_CLARO} />
        <path d="M50 10 V80" stroke={AZUL} strokeWidth="3" strokeLinecap="round" />
        <path d="M40 30 L50 38 M38 46 L50 54 M60 30 L50 38 M62 46 L50 54" stroke={AZUL} strokeWidth="2.4" strokeLinecap="round" />
        <path d="M46 78 H54 L50 96 Z" fill={TERRACOTA} />
      </g>
    ),
    "letras-abc": (
      <g {...LETRA} fontSize="42">
        <text x="6" y="58" fill={TERRACOTA} transform="rotate(-12 18 46)">
          A
        </text>
        <text x="38" y="44" fill={AZUL}>
          b
        </text>
        <text x="64" y="74" fill={AMARILLO} transform="rotate(10 74 60)">
          ñ
        </text>
      </g>
    ),
    marcalibros: (
      <g transform="rotate(-8 50 50)">
        <path d="M34 6 H66 V92 L50 78 L34 92 Z" fill={VINO} />
        <rect x="34" y="6" width="32" height="10" fill={DURAZNO} />
        <circle cx="50" cy="40" r="7" fill={DURAZNO} />
      </g>
    ),
    "libro-cerrado": (
      <g transform="rotate(-10 50 50)">
        <rect x="16" y="14" width="60" height="74" rx="5" fill={AZUL} />
        <rect x="70" y="18" width="12" height="66" rx="3" fill={CREMA} />
        <rect x="16" y="14" width="10" height="74" rx="4" fill="#2f6f97" />
        <rect x="34" y="32" width="30" height="7" rx="3.5" fill={AZUL_CLARO} />
        <rect x="34" y="44" width="20" height="5" rx="2.5" fill={AZUL_CLARO} />
      </g>
    ),
    tintero: (
      <g>
        <path d="M24 46 H76 V82 A8 8 0 0 1 68 90 H32 A8 8 0 0 1 24 82 Z" fill={AZUL} />
        <rect x="36" y="34" width="28" height="14" rx="4" fill={AZUL_CLARO} />
        <rect x="30" y="58" width="40" height="16" rx="5" fill={CREMA} />
        <path d="M58 36 C66 20 74 10 88 4 C84 18 74 28 62 38 Z" fill={DURAZNO} />
      </g>
    ),
    "letra-ene": (
      <g transform="rotate(6 50 50)">
        <rect x="12" y="12" width="76" height="76" rx="18" fill={TERRACOTA} />
        <text x="50" y="74" textAnchor="middle" fontSize="60" fill={PAPEL} {...LETRA}>
          ñ
        </text>
      </g>
    ),
    comillas: (
      <g transform="rotate(-6 50 50)">
        <rect x="8" y="20" width="84" height="60" rx="30" fill={AMARILLO} />
        <text x="50" y="68" textAnchor="middle" fontSize="50" fill={TERRACOTA} {...LETRA}>
          «»
        </text>
      </g>
    ),
    "clip-marcapaginas": (
      <g>
        <path d="M34 4 H66 V96 L50 82 L34 96 Z" fill={TERRACOTA} />
        <circle cx="50" cy="22" r="7" fill={CREMA} />
      </g>
    ),
    "chinche-punto": (
      <g>
        <circle cx="50" cy="50" r="38" fill={AZUL_CLARO} />
        <circle cx="50" cy="50" r="18" fill={TERRACOTA} />
      </g>
    ),
  },
  marcas: {
    "letra-a": marcaTexto("A"),
    "letra-b": marcaTexto("b"),
    "letra-enie": marcaTexto("ñ"),
    "pregunta-abre": marcaTexto("¿"),
    "pregunta-cierra": marcaTexto("?"),
    "comilla-abre": marcaTexto("«"),
    "comilla-cierra": marcaTexto("»"),
  },
  cinta: {
    color: "#fbe8d6",
    mosaico: <path d="M0 12.5 H16" stroke={RENGLON} strokeWidth="1.6" fill="none" />,
  },
  marco: {
    ancho: 20,
    fondo: CREMA,
    mosaico: (
      <g>
        <rect x="0" y="4" width="20" height="1.6" fill={RENGLON} />
        <rect x="0" y="9" width="20" height="1.6" fill={RENGLON} />
        <rect x="0" y="12.4" width="20" height="1.6" fill={DURAZNO} />
      </g>
    ),
  },
};
