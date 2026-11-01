/*
  Kit de Ética y valores (D4): cuidado y convivencia. Corazones, manos
  unidas, balanza y paloma con rama de paz.
*/
import type { ArteKit } from "../tipos";
import { corazon, puntosEstrella } from "./comun";

const ROSA_HONDO = "#ae3555";
const ROSA = "#f4a8b8";
const ROSA_CLARO = "#fbd3dc";
const PIEL_A = "#e7a77c";
const PIEL_B = "#a8673f";
const DORADO = "#f2b52a";
const VERDE = "#5aa65c";
const CIELO = "#8fc6e8";
const PAPEL = "#ffffff";

/** Mano abierta, palma hacia el frente. */
function mano(color: string, giro = 0, x = 0) {
  return (
    <g transform={`translate(${x} 0) rotate(${giro} 50 60)`}>
      <rect x="32" y="44" width="36" height="40" rx="14" fill={color} />
      {[32, 41, 50, 59].map((dx, i) => (
        <rect key={dx} x={dx} y={i === 0 || i === 3 ? 26 : 20} width="9" height="32" rx="4.5" fill={color} />
      ))}
      <rect x="18" y="52" width="9" height="26" rx="4.5" fill={color} transform="rotate(-38 22 64)" />
    </g>
  );
}

export const arteEtica: ArteKit = {
  piezas: {
    "manos-unidas": (
      <g>
        <path d="M8 66 C20 52 36 50 50 58 C64 50 80 52 92 66 L80 84 C66 76 58 76 50 82 C42 76 34 76 20 84 Z" fill={PIEL_A} />
        <path d="M50 58 C64 50 80 52 92 66 L80 84 C66 76 58 76 50 82 Z" fill={PIEL_B} />
        <path d={corazon(50, 30, 16)} fill={ROSA_HONDO} />
      </g>
    ),
    "corazon-grande": (
      <g>
        <path d={corazon(50, 52, 38)} fill={ROSA_HONDO} />
        <path d="M28 36 C30 30 36 26 42 28" stroke={ROSA_CLARO} strokeWidth="6" strokeLinecap="round" fill="none" />
      </g>
    ),
    balanza: (
      <g>
        <rect x="46" y="16" width="8" height="70" rx="4" fill={DORADO} />
        <rect x="28" y="84" width="44" height="10" rx="5" fill={DORADO} />
        <rect x="12" y="20" width="76" height="6" rx="3" fill={DORADO} />
        <circle cx="50" cy="14" r="7" fill={ROSA_HONDO} />
        <path d="M20 26 L8 56 M20 26 L32 56 M80 26 L68 56 M80 26 L92 56" stroke="#d29a1c" strokeWidth="2.4" />
        <path d="M4 56 H36 A16 16 0 0 1 4 56 Z" fill={ROSA} />
        <path d="M64 56 H96 A16 16 0 0 1 64 56 Z" fill={ROSA} />
      </g>
    ),
    "paloma-paz": (
      <g>
        <path d="M14 52 C24 36 44 34 58 42 L86 26 C84 46 74 60 58 66 C46 72 26 70 14 52 Z" fill={PAPEL} />
        <path d="M30 50 C40 30 58 22 72 26 C66 40 54 50 36 56 Z" fill={CIELO} />
        <circle cx="76" cy="36" r="2.6" fill={ROSA_HONDO} />
        <path d="M86 38 L96 40 L86 44 Z" fill={DORADO} />
        <path d="M60 64 C56 74 48 82 38 86" stroke={VERDE} strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <ellipse cx="50" cy="76" rx="6" ry="3" fill={VERDE} transform="rotate(-30 50 76)" />
        <ellipse cx="42" cy="84" rx="6" ry="3" fill={VERDE} transform="rotate(20 42 84)" />
      </g>
    ),
    "corazon-suelto": <path d={corazon(50, 52, 36)} fill={ROSA} />,
    "rama-paz": (
      <g transform="rotate(-30 50 50)">
        <path d="M10 60 C34 50 62 48 92 50" stroke={VERDE} strokeWidth="4" fill="none" strokeLinecap="round" />
        {[22, 40, 58, 76].map((x, i) => (
          <g key={x}>
            <ellipse cx={x} cy={50 - (i % 2 ? 0 : 2)} rx="10" ry="4.5" fill={VERDE} transform={`rotate(-34 ${x} 46) translate(0 -6)`} />
            <ellipse cx={x + 6} cy="58" rx="10" ry="4.5" fill="#86c788" transform={`rotate(28 ${x + 6} 58)`} />
          </g>
        ))}
      </g>
    ),
    "mano-saludo": mano(PIEL_A, -12),
    "clip-corazon": (
      <g>
        <path d={corazon(50, 40, 26)} fill={ROSA_HONDO} />
        <rect x="45" y="56" width="10" height="38" rx="5" fill={ROSA_HONDO} />
      </g>
    ),
    "chinche-estrella": (
      <g>
        <circle cx="50" cy="50" r="38" fill={ROSA_CLARO} />
        <polygon points={puntosEstrella(50, 52, 28)} fill={DORADO} />
      </g>
    ),
  },
  marcas: {
    "corazon-marca": <path d={corazon(20, 22, 14)} />,
    "mano-marca": (
      <g>
        <rect x="12" y="18" width="16" height="18" rx="6" />
        {[12, 16.5, 21, 25.5].map((x, i) => (
          <rect key={x} x={x} y={i === 0 || i === 3 ? 10 : 6} width="4" height="14" rx="2" />
        ))}
      </g>
    ),
    "balanza-marca": (
      <g>
        <rect x="18.5" y="6" width="3" height="28" rx="1.5" />
        <rect x="6" y="8" width="28" height="3" rx="1.5" />
        <path d="M4 22 H16 A6 6 0 0 1 4 22 Z M24 22 H36 A6 6 0 0 1 24 22 Z" />
        <rect x="12" y="32" width="16" height="4" rx="2" />
      </g>
    ),
  },
  cinta: {
    color: "#fbdbe2",
    mosaico: <rect x="5" y="5" width="6" height="6" rx="3" fill={PIEL_A} opacity="0.7" />,
  },
  marco: {
    ancho: 20,
    fondo: ROSA_CLARO,
    mosaico: <path d={corazon(10, 7, 4.5)} fill={ROSA_HONDO} />,
  },
};
