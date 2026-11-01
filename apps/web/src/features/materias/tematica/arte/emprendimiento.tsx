/*
  Kit de Emprendimiento (D4): la tienda y la idea. Alcancía, monedas,
  bombillo, toldo de tienda y gráfico que crece. Pesos colombianos.
*/
import type { ArteKit } from "../tipos";
import { LETRA, marcaTexto } from "./comun";

const OCRE = "#865600";
const ORO = "#f2b52a";
const ORO_CLARO = "#fbd77a";
const VERDE = "#2f9e6a";
const VERDE_CLARO = "#a8dfc1";
const ROSA = "#f29bb0";
const ROSA_HONDO = "#d96b87";
const ROJO = "#e8604c";
const PAPEL = "#ffffff";

function moneda(cx: number, cy: number, r: number) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={ORO} />
      <circle cx={cx} cy={cy} r={r * 0.72} fill={ORO_CLARO} />
      <text x={cx} y={cy + r * 0.38} textAnchor="middle" fontSize={r * 1.05} fill={OCRE} {...LETRA}>
        $
      </text>
    </g>
  );
}

export const arteEmprendimiento: ArteKit = {
  piezas: {
    alcancia: (
      <g>
        <ellipse cx="50" cy="58" rx="38" ry="28" fill={ROSA} />
        <circle cx="84" cy="54" r="10" fill={ROSA_HONDO} />
        <circle cx="82" cy="52" r="2.4" fill={OCRE} />
        <circle cx="87" cy="52" r="2.4" fill={OCRE} />
        <path d="M58 30 L66 18 L72 34 Z" fill={ROSA_HONDO} />
        <rect x="38" y="30" width="22" height="5" rx="2.5" fill={ROSA_HONDO} />
        <rect x="26" y="78" width="10" height="14" rx="4" fill={ROSA_HONDO} />
        <rect x="62" y="78" width="10" height="14" rx="4" fill={ROSA_HONDO} />
        <circle cx="70" cy="48" r="3" fill={OCRE} />
        {moneda(48, 14, 11)}
      </g>
    ),
    "toldo-tienda": (
      <g>
        <rect x="14" y="44" width="72" height="48" rx="4" fill={VERDE_CLARO} />
        <rect x="24" y="58" width="24" height="34" rx="3" fill={VERDE} />
        <rect x="56" y="58" width="22" height="18" rx="3" fill={PAPEL} />
        <path d="M8 22 H92 V40 H8 Z" fill={PAPEL} />
        {[8, 29, 50, 71].map((x) => (
          <path key={x} d={`M${x} 22 H${x + 10.5} V40 A5.25 5.25 0 0 1 ${x} 40 Z`} fill={ROJO} />
        ))}
        {[18.5, 39.5, 60.5, 81.5].map((x) => (
          <path key={x} d={`M${x} 40 A5.25 5.25 0 0 0 ${x + 10.5} 40`} fill={PAPEL} />
        ))}
      </g>
    ),
    "bombillo-idea": (
      <g>
        <circle cx="50" cy="40" r="28" fill={ORO} />
        <path d="M38 58 H62 V68 H38 Z" fill={ORO} />
        <path d="M40 34 C40 26 46 22 52 22" stroke={PAPEL} strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M42 46 L50 56 L58 46" stroke={OCRE} strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="38" y="70" width="24" height="6" rx="3" fill="#a9b4bb" />
        <rect x="40" y="78" width="20" height="6" rx="3" fill="#a9b4bb" />
        <rect x="44" y="86" width="12" height="6" rx="3" fill={OCRE} />
        <g stroke={ORO} strokeWidth="5" strokeLinecap="round">
          <path d="M10 40 H4 M96 40 H90 M20 12 L16 8 M80 12 L84 8" />
        </g>
      </g>
    ),
    "pila-monedas": (
      <g>
        {[78, 68, 58, 48].map((y, i) => (
          <g key={y}>
            <rect x={22 + (i % 2) * 4} y={y} width="48" height="12" rx="6" fill={i % 2 ? ORO_CLARO : ORO} />
          </g>
        ))}
        {moneda(70, 30, 20)}
      </g>
    ),
    "moneda-suelta": moneda(50, 50, 38),
    "grafico-crece": (
      <g>
        <rect x="14" y="62" width="16" height="26" rx="3" fill={VERDE_CLARO} />
        <rect x="38" y="46" width="16" height="42" rx="3" fill={VERDE} />
        <rect x="62" y="28" width="16" height="60" rx="3" fill={ORO} />
        <path d="M14 50 L42 30 L58 38 L86 12" stroke={OCRE} strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M76 10 H88 V22" stroke={OCRE} strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    ),
    billete: (
      <g transform="rotate(-12 50 50)">
        <rect x="6" y="26" width="88" height="48" rx="8" fill={VERDE} />
        <rect x="14" y="34" width="72" height="32" rx="5" fill={VERDE_CLARO} />
        <circle cx="50" cy="50" r="12" fill={VERDE} />
        <text x="50" y="57" textAnchor="middle" fontSize="18" fill={PAPEL} {...LETRA}>
          $
        </text>
      </g>
    ),
    "clip-etiqueta": (
      <g transform="rotate(12 50 50)">
        <path d="M30 18 H64 L84 50 L64 82 H30 A8 8 0 0 1 22 74 V26 A8 8 0 0 1 30 18 Z" fill={ORO} />
        <circle cx="64" cy="50" r="7" fill={PAPEL} />
        <text x="40" y="58" textAnchor="middle" fontSize="24" fill={OCRE} {...LETRA}>
          $
        </text>
      </g>
    ),
    "chinche-moneda": moneda(50, 50, 40),
  },
  marcas: {
    pesos: marcaTexto("$"),
    barras: (
      <g>
        <rect x="6" y="22" width="7" height="14" rx="2" />
        <rect x="17" y="14" width="7" height="22" rx="2" />
        <rect x="28" y="6" width="7" height="30" rx="2" />
      </g>
    ),
    "bombillo-marca": (
      <g>
        <circle cx="20" cy="16" r="11" />
        <rect x="14" y="27" width="12" height="8" rx="3" />
      </g>
    ),
  },
  cinta: {
    color: "#f7e7b8",
    mosaico: <circle cx="8" cy="8" r="4" fill={ORO} opacity="0.8" />,
  },
  marco: {
    ancho: 24,
    fondo: PAPEL,
    mosaico: (
      <g>
        <path d="M0 0 H12 V9 A6 6 0 0 1 0 9 Z" fill={ROJO} />
      </g>
    ),
  },
};
