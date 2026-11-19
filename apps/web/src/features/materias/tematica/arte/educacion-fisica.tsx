/* Objetos del patio y la clase de Educación Física; SVG original del proyecto. */
import type { ArteKit } from "../tipos";

const VERDE = "#1d7c4b";
const VERDE_CLARO = "#88c99d";
const NARANJA = "#e97736";
const AZUL = "#3684c4";
const TINTA = "#17452e";

export const arteEducacionFisica: ArteKit = {
  piezas: {
    "balon-patio": (
      <g>
        <circle cx="50" cy="50" r="37" fill="#fff" stroke={TINTA} strokeWidth="4" />
        <path d="M50 25 65 37 60 57 40 57 35 37Z" fill={AZUL} />
        <path d="M35 37 18 29M65 37 82 29M40 57 30 79M60 57 70 79" fill="none" stroke={TINTA} strokeWidth="3" />
      </g>
    ),
    "cono-patio": (
      <g>
        <path d="M38 14h24l20 68H18Z" fill={NARANJA} stroke={TINTA} strokeWidth="3" />
        <path d="M31 56h38l6 18H25Z" fill="#fff" />
        <rect x="10" y="80" width="80" height="10" rx="4" fill={TINTA} />
      </g>
    ),
    "cronometro-patio": (
      <g>
        <rect x="42" y="5" width="16" height="10" rx="3" fill={TINTA} />
        <circle cx="50" cy="55" r="37" fill="#fff" stroke={AZUL} strokeWidth="6" />
        <path d="M50 55V29M50 55l18 9" stroke={TINTA} strokeWidth="4" strokeLinecap="round" />
        <circle cx="50" cy="55" r="5" fill={NARANJA} />
      </g>
    ),
    "cuerda-salto": (
      <g>
        <path d="M17 22C8 88 92 88 83 22" fill="none" stroke={AZUL} strokeWidth="6" strokeLinecap="round" />
        <rect x="10" y="12" width="14" height="24" rx="5" fill={NARANJA} />
        <rect x="76" y="12" width="14" height="24" rx="5" fill={NARANJA} />
      </g>
    ),
    "zapatilla-patio": (
      <g>
        <path d="M12 57c18 1 24-12 39-21l14 16 22 5 3 22H10Z" fill={VERDE_CLARO} stroke={TINTA} strokeWidth="3" />
        <path d="M12 72h76M46 48l15 4M40 55l14 3" stroke={TINTA} strokeWidth="3" strokeLinecap="round" />
      </g>
    ),
    "aros-patio": (
      <g fill="none" strokeWidth="7">
        <ellipse cx="39" cy="52" rx="29" ry="33" stroke={NARANJA} />
        <ellipse cx="63" cy="52" rx="29" ry="33" stroke={AZUL} />
      </g>
    ),
    "silbato-patio": (
      <g>
        <path d="M18 41h46a19 19 0 1 1 0 38H30a18 18 0 0 1-12-38Z" fill={NARANJA} stroke={TINTA} strokeWidth="3" />
        <circle cx="65" cy="60" r="7" fill="#fff" />
        <path d="M20 42c-10-9-7-22 3-27" fill="none" stroke={AZUL} strokeWidth="4" />
      </g>
    ),
    "clip-balón-patio": <circle cx="50" cy="50" r="29" fill={AZUL} stroke={TINTA} strokeWidth="4" />,
    "chinche-balón-patio": <circle cx="50" cy="50" r="33" fill={NARANJA} stroke={TINTA} strokeWidth="4" />,
  },
  marcas: {
    "balon-marca-patio": <circle cx="20" cy="20" r="15" fill="none" stroke="currentColor" strokeWidth="4" />,
    "pista-marca-patio": <path d="M4 30h32M4 20h20M4 10h32" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />,
    "paso-marca-patio": <path d="M13 6c-5 4-4 11 0 14l5 2 6-10-4-6ZM22 22c-5 4-4 11 0 14l5 2 6-10-4-6Z" />,
  },
  cinta: {
    color: "#d9eedf",
    mosaico: <path d="M2 14h12M8 4v20" fill="none" stroke={VERDE} strokeWidth="1.5" />,
  },
  marco: {
    ancho: 32,
    fondo: VERDE_CLARO,
    mosaico: <path d="M0 10h32M16 0v14" fill="none" stroke={VERDE} strokeWidth="2" />,
  },
};
