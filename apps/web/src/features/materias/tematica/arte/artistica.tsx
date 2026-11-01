/*
  Kit de Educación artística (D4): pintura y música. Paleta, pinceles,
  acuarelas, tubos de pintura y notas; pinceladas planas, sin texturas.
*/
import type { ArteKit } from "../tipos";
import { gota } from "./comun";

const MAGENTA = "#963888";
const MAGENTA_CLARO = "#e3b6dc";
const AMARILLO = "#f2b52a";
const AZUL = "#3f8fd6";
const VERDE = "#3fae6a";
const ROJO = "#e8604c";
const MADERA_CLARA = "#f3d9b1";
const ACERO = "#b5bec6";
const PAPEL = "#ffffff";

function pincel(color: string, giro: number) {
  return (
    <g transform={`rotate(${giro} 50 50)`}>
      <rect x="46" y="4" width="8" height="54" rx="4" fill={MAGENTA} />
      <rect x="44" y="56" width="12" height="12" rx="2" fill={ACERO} />
      <path d="M44 68 H56 C58 80 54 90 50 96 C46 90 42 80 44 68 Z" fill={color} />
    </g>
  );
}

export const arteArtistica: ArteKit = {
  piezas: {
    paleta: (
      <g transform="rotate(-10 50 50)">
        <path
          d="M50 10 C80 10 96 30 92 52 C88 70 70 66 64 74 C58 84 66 92 52 92 C24 92 6 72 8 48 C10 26 26 10 50 10 Z M30 70 A7 7 0 1 0 30 70.1 Z"
          fill={MADERA_CLARA}
          fillRule="evenodd"
        />
        <circle cx="34" cy="32" r="8" fill={ROJO} />
        <circle cx="56" cy="26" r="8" fill={AMARILLO} />
        <circle cx="76" cy="40" r="8" fill={AZUL} />
        <circle cx="24" cy="52" r="8" fill={VERDE} />
      </g>
    ),
    pincel: pincel(AZUL, 28),
    acuarelas: (
      <g transform="rotate(6 50 50)">
        <rect x="6" y="30" width="88" height="44" rx="8" fill={MAGENTA} />
        {[
          [12, ROJO],
          [32, AMARILLO],
          [52, VERDE],
          [72, AZUL],
        ].map(([x, c]) => (
          <g key={x as number}>
            <rect x={x as number} y="38" width="16" height="14" rx="4" fill={PAPEL} />
            <rect x={(x as number) + 2} y="40" width="12" height="10" rx="3" fill={c as string} />
          </g>
        ))}
        <rect x="12" y="58" width="76" height="8" rx="4" fill={MAGENTA_CLARO} />
      </g>
    ),
    "notas-musicales": (
      <g>
        <ellipse cx="26" cy="74" rx="12" ry="9" fill={MAGENTA} transform="rotate(-20 26 74)" />
        <ellipse cx="70" cy="64" rx="12" ry="9" fill={MAGENTA} transform="rotate(-20 70 64)" />
        <rect x="34" y="20" width="6" height="56" rx="3" fill={MAGENTA} />
        <rect x="78" y="10" width="6" height="56" rx="3" fill={MAGENTA} />
        <path d="M34 20 L84 10 V24 L34 34 Z" fill={MAGENTA} />
      </g>
    ),
    "tubo-pintura": (
      <g transform="rotate(-24 50 50)">
        <path d="M30 22 H70 L64 80 H36 Z" fill={AMARILLO} />
        <rect x="30" y="16" width="40" height="8" rx="3" fill={ACERO} />
        <rect x="40" y="80" width="20" height="10" rx="3" fill={ACERO} />
        <rect x="38" y="40" width="24" height="16" rx="4" fill={PAPEL} />
        <path d={gota(50, 52, 6)} fill={ROJO} transform="rotate(180 50 49)" />
      </g>
    ),
    "nota-corchea": (
      <g>
        <ellipse cx="38" cy="76" rx="16" ry="12" fill={AZUL} transform="rotate(-20 38 76)" />
        <rect x="48" y="14" width="7" height="62" rx="3.5" fill={AZUL} />
        <path d="M55 14 C70 22 78 32 72 50 C70 38 64 32 55 30 Z" fill={AZUL} />
      </g>
    ),
    crayon: (
      <g transform="rotate(34 50 50)">
        <rect x="38" y="24" width="24" height="64" rx="4" fill={VERDE} />
        <rect x="38" y="40" width="24" height="26" fill={PAPEL} opacity="0.85" />
        <path d="M38 24 L50 4 L62 24 Z" fill={VERDE} />
      </g>
    ),
    "clip-pincel": pincel(ROJO, 0),
    "chinche-gota-pintura": (
      <g>
        <path d={gota(50, 58, 32)} fill={MAGENTA} />
        <circle cx="40" cy="58" r="8" fill={MAGENTA_CLARO} />
      </g>
    ),
  },
  marcas: {
    "nota-marca": (
      <g>
        <ellipse cx="14" cy="30" rx="7" ry="5.5" transform="rotate(-20 14 30)" />
        <rect x="19" y="6" width="3.5" height="25" rx="1.75" />
        <path d="M22.5 6 C30 10 33 15 30 23 C29 17 26 14 22.5 13 Z" />
      </g>
    ),
    "gota-pintura-marca": <path d={gota(20, 24, 11)} />,
    "pincelada-marca": <path d="M4 26 C10 14 22 12 36 14 C30 22 20 28 4 26 Z" />,
    "clave-sol": (
      <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 36 V5 C29 8 28 16 16 22 C8 26 10 33 18 33 C26 33 27 25 20 23" />
        <circle cx="16" cy="37" r="2.5" fill="currentColor" stroke="none" />
      </g>
    ),
  },
  cinta: {
    color: "#f2dcef",
    mosaico: <path d="M1 11 C5 6 10 6 15 8" stroke={AZUL} strokeWidth="2.4" strokeLinecap="round" fill="none" opacity="0.55" />,
  },
  marco: {
    ancho: 36,
    fondo: PAPEL,
    mosaico: (
      <g>
        <path d="M0 4 C4 1 10 1 14 4 C10 9 4 9 0 4 Z" fill={ROJO} />
        <path d="M12 9 C16 6 22 6 26 9 C22 13 16 13 12 9 Z" fill={AMARILLO} />
        <path d="M24 4 C28 1 33 1 36 4 C33 9 28 9 24 4 Z" fill={AZUL} />
      </g>
    ),
  },
};
