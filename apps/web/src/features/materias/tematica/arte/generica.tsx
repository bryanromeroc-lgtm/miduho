/*
  Kit genérico escolar (D2): para asignaturas sin tema propio. Útiles
  neutros —cuaderno, lápiz, regla, estrella— en planos sólidos.
*/
import type { ArteKit } from "../tipos";

const PIZARRA = "#3b4d66";
const PIZARRA_CLARA = "#a7b4c6";
const NIEBLA = "#d5dbe4";
const AMARILLO = "#f2b52a";
const MADERA = "#f6d2a2";
const ROSA = "#f4a8b8";

const estrella = (cx: number, cy: number, r: number) => {
  const puntos = Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const radio = i % 2 === 0 ? r : r * 0.45;
    return `${(cx + Math.cos(a) * radio).toFixed(1)},${(cy + Math.sin(a) * radio).toFixed(1)}`;
  });
  return puntos.join(" ");
};

export const arteGenerica: ArteKit = {
  piezas: {
    cuaderno: (
      <g transform="rotate(-6 50 50)">
        <rect x="18" y="10" width="66" height="82" rx="6" fill={PIZARRA_CLARA} />
        <rect x="26" y="10" width="58" height="82" rx="6" fill="#ffffff" />
        <g fill={NIEBLA}>
          {[28, 40, 52, 64, 76].map((y) => (
            <rect key={y} x="34" y={y} width="42" height="2.4" rx="1.2" />
          ))}
        </g>
        <g fill={PIZARRA}>
          {[18, 32, 46, 60, 74].map((y) => (
            <rect key={y} x="14" y={y} width="14" height="5" rx="2.5" />
          ))}
        </g>
      </g>
    ),
    lapiz: (
      <g transform="rotate(-38 50 50)">
        <rect x="6" y="41" width="12" height="18" rx="4" fill={ROSA} />
        <rect x="16" y="41" width="9" height="18" fill={PIZARRA_CLARA} />
        <rect x="25" y="41" width="50" height="18" fill={PIZARRA} />
        <path d="M75 41 L94 50 L75 59 Z" fill={MADERA} />
        <path d="M88 47.2 L94 50 L88 52.8 Z" fill={PIZARRA} />
      </g>
    ),
    regla: (
      <g transform="rotate(-14 50 50)">
        <rect x="2" y="37" width="96" height="26" rx="4" fill={NIEBLA} />
        <g fill={PIZARRA}>
          {Array.from({ length: 18 }, (_, i) => (
            <rect key={i} x={7 + i * 5} y="37" width="1.6" height={i % 5 === 0 ? 10 : 5} rx="0.8" />
          ))}
        </g>
      </g>
    ),
    estrella: <polygon points={estrella(50, 52, 42)} fill={AMARILLO} strokeLinejoin="round" />,
    borrador: (
      <g transform="rotate(12 50 50)">
        <rect x="14" y="34" width="72" height="34" rx="8" fill={ROSA} />
        <rect x="14" y="34" width="30" height="34" rx="8" fill={PIZARRA_CLARA} />
        <rect x="36" y="34" width="8" height="34" fill={PIZARRA_CLARA} />
      </g>
    ),
    clip: (
      <path
        d="M40 10 V70 a14 14 0 0 0 28 0 V24 a9 9 0 0 0 -18 0 V66"
        fill="none"
        stroke={PIZARRA}
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
    chinche: (
      <g>
        <circle cx="50" cy="50" r="40" fill={AMARILLO} />
        <circle cx="42" cy="42" r="12" fill="#f8cd63" />
      </g>
    ),
  },
  marcas: {
    estrella: <polygon points={estrella(20, 21, 16)} />,
    linea: <rect x="4" y="18" width="32" height="4" rx="2" />,
    punto: <circle cx="20" cy="20" r="6" />,
  },
  cinta: { color: "#e4e6ea", mosaico: null },
  marco: { ancho: 50, mosaico: null },
};
