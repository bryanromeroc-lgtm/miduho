/*
  Fondo del tablero: una sabana lavada (cielo pálido, sol tenue, cerros y
  colinas de baja saturación), quieta, para que el color fuerte quede solo en
  los cromos. Ilustración: sus colores son literales a propósito.
*/
export const COLORES_FONDO = {
  cielo: "#e6f5fb",
  halo: "#fbf3d6",
  sol: "#fde9a8",
  nube: "#ffffff",
  cerros: "#d4e8f0",
  colina: "#dcefd2",
  pradera: "#d0e8c2",
  pinos: "#c2dfb0",
} as const;

export function FondoSereno({ className }: { className?: string }) {
  const c = COLORES_FONDO;
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMax slice" className={className}>
      <rect width="1200" height="700" fill={c.cielo} />
      <circle cx="1050" cy="90" r="120" fill={c.halo} />
      <circle cx="1050" cy="90" r="64" fill={c.sol} />
      <g fill={c.nube} opacity="0.9">
        <rect x="120" y="70" width="170" height="30" rx="15" />
        <rect x="160" y="54" width="80" height="34" rx="17" />
        <rect x="700" y="48" width="140" height="26" rx="13" />
      </g>
      <path d="M0 330 L120 250 L230 300 L360 220 L480 300 L610 230 L740 300 L870 240 L1000 300 L1120 250 L1200 280 L1200 700 L0 700 Z" fill={c.cerros} />
      <path d="M0 400 C 200 360, 380 400, 600 380 S 1000 350, 1200 380 L1200 700 L0 700 Z" fill={c.colina} />
      <path d="M0 520 C 240 480, 520 530, 780 500 S 1080 480, 1200 500 L1200 700 L0 700 Z" fill={c.pradera} />
      <g fill={c.pinos}>
        <path d="M20 520 l18 -58 l18 58 z" />
        <path d="M48 526 l14 -44 l14 44 z" />
        <path d="M1130 500 l18 -58 l18 58 z" />
        <path d="M1158 506 l14 -44 l14 44 z" />
      </g>
    </svg>
  );
}
