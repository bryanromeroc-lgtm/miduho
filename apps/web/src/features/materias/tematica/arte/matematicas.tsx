/*
  Kit de Matemáticas (D4): útiles de geometría y números. Arte plano de
  autoría propia: rellenos sólidos, sin contornos de tinta ni sombras. Los
  trazos que aparecen (marcas de la regla, el clip) van en colores del kit.
*/
import type { ArteKit } from "../tipos";

const AZUL = "#1f5fbf";
const AZUL_CLARO = "#9cc0f0";
const AMARILLO = "#f2b52a";
const AMARILLO_HONDO = "#c48b0c";
const CORAL = "#ef7b5a";
const CORAL_CLARO = "#f7a68c";
const VERDE = "#2f9e6a";
const ACERO = "#a9bad0";
const MADERA = "#f6d2a2";
const GRAFITO = "#4a6488";
const ROSA = "#f4a8b8";

const NUMERO = {
  fontFamily: "var(--font-baloo), system-ui, sans-serif",
  fontWeight: 800,
} as const;

function marcasRegla(x: number, y: number, n: number, paso: number, color: string) {
  return (
    <g fill={color}>
      {Array.from({ length: n }, (_, i) => (
        <rect key={i} x={x + i * paso} y={y} width="1.6" height={i % 5 === 0 ? 10 : i % 5 === 2 ? 6 : 4} rx="0.8" />
      ))}
    </g>
  );
}

function marca(texto: string, tamano = 30) {
  return (
    <text x="20" y="30" textAnchor="middle" fontSize={tamano} {...NUMERO}>
      {texto}
    </text>
  );
}

export const arteMatematicas: ArteKit = {
  piezas: {
    regla: (
      <g transform="rotate(-14 50 50)">
        <rect x="2" y="37" width="96" height="26" rx="4" fill={AMARILLO} />
        {marcasRegla(7, 37, 18, 5, AMARILLO_HONDO)}
        <circle cx="90" cy="54" r="3" fill={MADERA} />
      </g>
    ),
    compas: (
      <g>
        <rect x="46" y="2" width="8" height="12" rx="3" fill={AZUL} />
        <path d="M46 18 L22 86 L29 89 L53 21 Z" fill={AZUL} />
        <path d="M54 18 L76 80 L69 83 L47 21 Z" fill={AZUL_CLARO} />
        <path d="M22 86 L24 97 L29 89 Z" fill={ACERO} />
        <path d="M69 83 L76 80 L78 92 Z" fill={AMARILLO} />
        <path d="M76.2 88 L78 92 L74 90 Z" fill={GRAFITO} />
        <circle cx="50" cy="19" r="8" fill={ACERO} />
        <circle cx="50" cy="19" r="3.5" fill={AZUL} />
      </g>
    ),
    escuadra: (
      <g>
        <path d="M10 90 L10 10 L90 90 Z M22 80 L60 80 L22 42 Z" fill={AZUL_CLARO} fillRule="evenodd" />
        <g fill={AZUL}>
          {Array.from({ length: 12 }, (_, i) => (
            <rect key={i} x="10" y={16 + i * 6} width={i % 2 === 0 ? 7 : 4} height="1.6" rx="0.8" />
          ))}
        </g>
      </g>
    ),
    numeros: (
      <g {...NUMERO} fontSize="46">
        <text x="8" y="62" fill={AZUL} transform="rotate(-10 20 50)">
          1
        </text>
        <text x="36" y="48" fill={CORAL}>
          2
        </text>
        <text x="64" y="70" fill={VERDE} transform="rotate(9 76 56)">
          3
        </text>
      </g>
    ),
    "lapiz-mate": (
      <g transform="rotate(-38 50 50)">
        <rect x="6" y="41" width="12" height="18" rx="4" fill={ROSA} />
        <rect x="16" y="41" width="9" height="18" fill={ACERO} />
        <rect x="25" y="41" width="50" height="18" fill={AMARILLO} />
        <rect x="25" y="47" width="50" height="6" fill={AMARILLO_HONDO} opacity="0.35" />
        <path d="M75 41 L94 50 L75 59 Z" fill={MADERA} />
        <path d="M88 47.2 L94 50 L88 52.8 Z" fill={GRAFITO} />
      </g>
    ),
    transportador: (
      <g>
        <path d="M6 74 A44 44 0 0 1 94 74 Z M30 74 A20 20 0 0 1 70 74 Z" fill={AZUL_CLARO} fillRule="evenodd" />
        <g fill={AZUL}>
          {Array.from({ length: 13 }, (_, i) => {
            const a = Math.PI - (i * Math.PI) / 12;
            const largo = i % 3 === 0 ? 9 : 5;
            const x1 = 50 + Math.cos(a) * 43;
            const y1 = 74 - Math.sin(a) * 43;
            const x2 = 50 + Math.cos(a) * (43 - largo);
            const y2 = 74 - Math.sin(a) * (43 - largo);
            return (
              <path
                key={i}
                d={`M${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}`}
                stroke={AZUL}
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            );
          })}
        </g>
        <circle cx="50" cy="74" r="3" fill={AZUL} />
      </g>
    ),
    "ficha-siete": (
      <g>
        <circle cx="50" cy="50" r="38" fill={CORAL} />
        <circle cx="50" cy="50" r="28" fill={CORAL_CLARO} />
        <text x="50" y="66" textAnchor="middle" fontSize="46" fill="#ffffff" {...NUMERO}>
          7
        </text>
      </g>
    ),
    igual: (
      <g transform="rotate(8 50 50)">
        <rect x="14" y="14" width="72" height="72" rx="18" fill={VERDE} />
        <rect x="30" y="36" width="40" height="9" rx="4.5" fill="#ffffff" />
        <rect x="30" y="55" width="40" height="9" rx="4.5" fill="#ffffff" />
      </g>
    ),
    "clip-papel": (
      <path
        d="M40 10 V70 a14 14 0 0 0 28 0 V24 a9 9 0 0 0 -18 0 V66"
        fill="none"
        stroke={AZUL}
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
    "chinche-ficha": (
      <g>
        <circle cx="50" cy="50" r="40" fill={AMARILLO} />
        <circle cx="50" cy="50" r="30" fill="#f8cd63" />
        <text x="50" y="67" textAnchor="middle" fontSize="48" fill={AZUL} {...NUMERO}>
          1
        </text>
      </g>
    ),
  },
  marcas: {
    mas: marca("+", 36),
    menos: marca("−", 36),
    por: marca("×", 34),
    entre: marca("÷", 34),
    menor: marca("<", 34),
    mayor: marca(">", 34),
    "igual-marca": marca("=", 36),
    dos: marca("2"),
    tres: marca("3"),
  },
  cinta: {
    color: "#cfe0f7",
    mosaico: <path d="M0 0.5 H16 M0.5 0 V16" stroke="#9cbbe6" strokeWidth="1" fill="none" />,
  },
  marco: {
    ancho: 50,
    mosaico: (
      <g fill={AMARILLO_HONDO}>
        <rect x="0" y="0" width="1.6" height="9" />
        <rect x="5" y="0" width="1.6" height="4" />
        <rect x="10" y="0" width="1.6" height="6" />
        <rect x="15" y="0" width="1.6" height="4" />
        <rect x="20" y="0" width="1.6" height="6" />
        <rect x="25" y="0" width="1.6" height="7" />
        <rect x="30" y="0" width="1.6" height="6" />
        <rect x="35" y="0" width="1.6" height="4" />
        <rect x="40" y="0" width="1.6" height="6" />
        <rect x="45" y="0" width="1.6" height="4" />
      </g>
    ),
  },
};
