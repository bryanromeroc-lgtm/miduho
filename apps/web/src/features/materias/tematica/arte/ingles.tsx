/*
  Kit de Inglés (D4): conversación y abecedario. Globos de diálogo
  («Hello», «Yes!», «Hi!»), audífonos, micrófono y letras; sin banderas ni
  íconos de países.
*/
import type { ArteKit } from "../tipos";
import { LETRA, marcaTexto } from "./comun";

const VIOLETA = "#6438b0";
const VIOLETA_CLARO = "#c9b6ef";
const NARANJA = "#f2a93b";
const VERDE = "#2fae6a";
const VERDE_CLARO = "#9fe0b9";
const ROJO = "#e8604c";
const AZUL = "#3f8fd6";
const PAPEL = "#ffffff";

/** Globo de diálogo con texto real del idioma (decorativo, aria-hidden). */
function globo(texto: string, fondo: string, tinta: string, tamano = 26) {
  return (
    <g>
      <path
        d="M10 18 A12 12 0 0 1 22 6 H78 A12 12 0 0 1 90 18 V58 A12 12 0 0 1 78 70 H40 L22 90 L26 70 H22 A12 12 0 0 1 10 58 Z"
        fill={fondo}
      />
      <text x="50" y={38 + tamano / 3} textAnchor="middle" fontSize={tamano} fill={tinta} {...LETRA}>
        {texto}
      </text>
    </g>
  );
}

export const arteIngles: ArteKit = {
  piezas: {
    "globo-hello": globo("Hello", VIOLETA, PAPEL),
    "globo-yes": globo("Yes!", VERDE, PAPEL, 30),
    audifonos: (
      <g>
        <path d="M18 60 V50 A32 32 0 0 1 82 50 V60" stroke={VIOLETA} strokeWidth="9" fill="none" strokeLinecap="round" />
        <rect x="10" y="52" width="22" height="36" rx="10" fill={NARANJA} />
        <rect x="68" y="52" width="22" height="36" rx="10" fill={NARANJA} />
        <rect x="16" y="60" width="10" height="20" rx="5" fill={VIOLETA_CLARO} />
        <rect x="74" y="60" width="10" height="20" rx="5" fill={VIOLETA_CLARO} />
      </g>
    ),
    abecedario: (
      <g {...LETRA} fontSize="34">
        {[
          ["A", 8, 40, VIOLETA],
          ["B", 36, 30, ROJO],
          ["C", 64, 42, VERDE],
          ["D", 22, 82, NARANJA],
          ["E", 54, 80, AZUL],
        ].map(([l, x, y, c]) => (
          <text key={l as string} x={x as number} y={y as number} fill={c as string}>
            {l}
          </text>
        ))}
      </g>
    ),
    "globo-hi": globo("Hi!", NARANJA, VIOLETA, 32),
    "cubo-abc": (
      <g transform="rotate(-8 50 50)">
        <rect x="14" y="14" width="72" height="72" rx="14" fill={VERDE} />
        <rect x="24" y="24" width="52" height="52" rx="10" fill={VERDE_CLARO} />
        <text x="50" y="68" textAnchor="middle" fontSize="44" fill={VIOLETA} {...LETRA}>
          Bb
        </text>
      </g>
    ),
    microfono: (
      <g>
        <rect x="36" y="8" width="28" height="48" rx="14" fill={VIOLETA} />
        <g fill={VIOLETA_CLARO}>
          <rect x="40" y="20" width="20" height="3" rx="1.5" />
          <rect x="40" y="28" width="20" height="3" rx="1.5" />
          <rect x="40" y="36" width="20" height="3" rx="1.5" />
        </g>
        <path d="M26 46 A24 24 0 0 0 74 46" stroke={NARANJA} strokeWidth="6" fill="none" strokeLinecap="round" />
        <rect x="46" y="70" width="8" height="16" rx="3" fill={NARANJA} />
        <rect x="32" y="84" width="36" height="8" rx="4" fill={NARANJA} />
      </g>
    ),
    "clip-globo": (
      <g>
        <path
          d="M18 14 A10 10 0 0 1 28 4 H72 A10 10 0 0 1 82 14 V52 A10 10 0 0 1 72 62 H44 L30 80 L32 62 H28 A10 10 0 0 1 18 52 Z"
          fill={NARANJA}
        />
        <circle cx="36" cy="33" r="5" fill={PAPEL} />
        <circle cx="50" cy="33" r="5" fill={PAPEL} />
        <circle cx="64" cy="33" r="5" fill={PAPEL} />
      </g>
    ),
    "chinche-exclamacion": (
      <g>
        <circle cx="50" cy="50" r="38" fill={ROJO} />
        <rect x="44" y="24" width="12" height="34" rx="6" fill={PAPEL} />
        <circle cx="50" cy="70" r="7" fill={PAPEL} />
      </g>
    ),
  },
  marcas: {
    "hi-marca": marcaTexto("hi", 26),
    "abc-marca": marcaTexto("ABC", 18),
    "yes-marca": marcaTexto("yes", 20),
    "globo-marca": <path d="M6 10 A6 6 0 0 1 12 4 H28 A6 6 0 0 1 34 10 V22 A6 6 0 0 1 28 28 H18 L10 36 L12 28 A6 6 0 0 1 6 22 Z" />,
  },
  cinta: {
    color: "#e4dbf6",
    mosaico: (
      <text x="8" y="12" textAnchor="middle" fontSize="10" fill={VIOLETA} opacity="0.6" {...LETRA}>
        A
      </text>
    ),
  },
  marco: {
    ancho: 24,
    fondo: VIOLETA_CLARO,
    mosaico: <path d="M4 3 H16 A3 3 0 0 1 19 6 V8 A3 3 0 0 1 16 11 H9 L6 14 L6.5 11 H4 A3 3 0 0 1 1 8 V6 A3 3 0 0 1 4 3 Z" fill={PAPEL} />,
  },
};
