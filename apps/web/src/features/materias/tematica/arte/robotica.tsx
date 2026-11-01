/*
  Kit de Robótica (D4): mecanismos y electrónica. Engranajes, tornillería,
  placa de circuito y brazo mecánico; solo el esquema de la materia, nada
  del material de la referencia.
*/
import type { ArteKit } from "../tipos";
import { engranaje, marcaTexto } from "./comun";

const PETROLEO = "#0a6a77";
const TURQUESA = "#3fb7c4";
const TURQUESA_CLARO = "#b4e3e8";
const PLACA = "#2f9e6a";
const PISTA = "#9fe0b9";
const AMARILLO = "#f2b52a";
const ACERO = "#a9b9bd";
const ACERO_HONDO = "#6c8186";
const ROJO = "#e8604c";

/** Tornillo vertical con cabeza en cruz. */
function tornillo(x: number, y: number, escala = 1) {
  return (
    <g transform={`translate(${x} ${y}) scale(${escala})`}>
      <rect x="-6" y="0" width="12" height="44" rx="3" fill={ACERO} />
      <g fill={ACERO_HONDO}>
        {[8, 16, 24, 32].map((v) => (
          <rect key={v} x="-6" y={v} width="12" height="3" rx="1.5" />
        ))}
      </g>
      <rect x="-14" y="-10" width="28" height="12" rx="5" fill={ACERO_HONDO} />
      <rect x="-7" y="-6" width="14" height="3" rx="1.5" fill={ACERO} />
    </g>
  );
}

export const arteRobotica: ArteKit = {
  piezas: {
    engranajes: (
      <g>
        <path d={engranaje(38, 58, 30, 10, 9)} fill={PETROLEO} fillRule="evenodd" />
        <path d={engranaje(74, 28, 20, 8, 6)} fill={AMARILLO} fillRule="evenodd" />
      </g>
    ),
    "brazo-mecanico": (
      <g>
        <rect x="14" y="82" width="44" height="12" rx="4" fill={ACERO_HONDO} />
        <rect x="28" y="50" width="14" height="36" rx="5" fill={TURQUESA} transform="rotate(-12 35 68)" />
        <circle cx="40" cy="50" r="9" fill={PETROLEO} />
        <rect x="38" y="30" width="44" height="13" rx="5" fill={TURQUESA} transform="rotate(-24 40 44)" />
        <circle cx="78" cy="26" r="7" fill={PETROLEO} />
        <path d="M80 26 L94 18 M80 26 L94 34" stroke={AMARILLO} strokeWidth="6" strokeLinecap="round" />
      </g>
    ),
    "placa-circuito": (
      <g transform="rotate(6 50 50)">
        <rect x="8" y="16" width="84" height="68" rx="8" fill={PLACA} />
        <g stroke={PISTA} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 30 H40 L48 38 H82" />
          <path d="M18 70 H34 L42 62 H58" />
          <path d="M70 74 V56 L82 48" />
        </g>
        <rect x="46" y="46" width="22" height="22" rx="3" fill={PETROLEO} />
        <g fill={ACERO}>
          {[48, 54, 60, 66].map((v) => (
            <rect key={v} x={v - 1} y="42" width="2" height="4" />
          ))}
        </g>
        <circle cx="82" cy="30" r="5" fill={AMARILLO} />
        <circle cx="18" cy="50" r="4" fill={PISTA} />
      </g>
    ),
    "tornillo-tuerca": (
      <g>
        {tornillo(36, 22)}
        <path d="M60 52 L70 46 L82 52 V64 L70 70 L60 64 Z" fill={ACERO_HONDO} transform="translate(0 4)" />
        <circle cx="71" cy="62" r="5" fill={TURQUESA_CLARO} />
      </g>
    ),
    "engranaje-solo": <path d={engranaje(50, 50, 40, 12, 12)} fill={TURQUESA} fillRule="evenodd" />,
    tuerca: (
      <g transform="rotate(14 50 50)">
        <path d="M50 10 L84 30 V70 L50 90 L16 70 V30 Z" fill={ACERO_HONDO} />
        <circle cx="50" cy="50" r="16" fill={ACERO} />
        <circle cx="50" cy="50" r="9" fill={TURQUESA_CLARO} />
      </g>
    ),
    bateria: (
      <g transform="rotate(-14 50 50)">
        <rect x="18" y="26" width="60" height="48" rx="8" fill={PETROLEO} />
        <rect x="78" y="40" width="8" height="20" rx="3" fill={ACERO_HONDO} />
        <rect x="26" y="34" width="14" height="32" rx="3" fill={PISTA} />
        <rect x="44" y="34" width="14" height="32" rx="3" fill={PISTA} />
        <rect x="62" y="34" width="8" height="32" rx="3" fill={TURQUESA} />
      </g>
    ),
    "clip-tornillo": tornillo(50, 26, 1.3),
    "chinche-led": (
      <g>
        <path d="M30 50 A20 20 0 0 1 70 50 V70 H30 Z" fill={ROJO} />
        <path d="M38 44 A12 12 0 0 1 50 34" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" fill="none" />
        <rect x="26" y="68" width="48" height="8" rx="3" fill={ACERO_HONDO} />
        <rect x="36" y="76" width="6" height="18" rx="2" fill={ACERO} />
        <rect x="58" y="76" width="6" height="12" rx="2" fill={ACERO} />
      </g>
    ),
  },
  marcas: {
    cero: marcaTexto("0"),
    uno: marcaTexto("1"),
    "engranaje-marca": <path d={engranaje(20, 20, 16, 8, 5)} fillRule="evenodd" />,
    "pista-circuito": (
      <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 10 H18 L26 18 V34" />
        <circle cx="30" cy="8" r="4" fill="currentColor" />
      </g>
    ),
  },
  cinta: {
    color: "#cfd8da",
    mosaico: (
      <g>
        <rect x="0" y="2" width="16" height="2.4" fill={ROJO} opacity="0.75" />
        <rect x="0" y="7" width="16" height="2.4" fill={AMARILLO} opacity="0.75" />
        <rect x="0" y="12" width="16" height="2.4" fill={TURQUESA} opacity="0.75" />
      </g>
    ),
  },
  marco: {
    ancho: 40,
    fondo: PLACA,
    mosaico: (
      <g>
        <path d="M0 7 H14 L18 3 H30 L34 7 H40" stroke={PISTA} strokeWidth="1.8" fill="none" />
        <circle cx="18" cy="3" r="1.8" fill={AMARILLO} />
        <circle cx="34" cy="7" r="1.8" fill={AMARILLO} />
      </g>
    ),
  },
};
