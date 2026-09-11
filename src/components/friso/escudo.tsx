/*
  El escudo del colegio, redibujado como SVG en la gramática del sistema:
  contorno de escudo, casa, techo, puerta, prado. Los colores son los mismos
  que se muestrearon del LOGO.jpeg y que gobiernan toda la interfaz — el
  escudo y la codificación por área son literalmente el mismo material.
*/
export function Escudo({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      role="img"
      aria-label="Escudo del Colegio Mi Dulce Hogar"
    >
      <path
        d="M4 4h32v22c0 6-7 8-16 12C11 34 4 32 4 26V4Z"
        fill="#c5e0e7"
        stroke="#7a6b67"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* prado */}
      <path d="M7 27h26v3.2c-3.5 2.6-8.4 4.4-13 6.2-4.6-1.8-9.5-3.6-13-6.2V27Z" fill="#a6ce39" />
      {/* casa */}
      <path d="M14 18.5h13V28H14v-9.5Z" fill="#f9d2c1" stroke="#2d2e32" strokeWidth="1.4" />
      {/* techo */}
      <path d="M11.5 19 20.5 11l9 8H11.5Z" fill="#00adef" stroke="#2d2e32" strokeWidth="1.4" strokeLinejoin="round" />
      {/* puerta */}
      <rect x="18.5" y="22" width="4.2" height="6" fill="#ec8856" stroke="#2d2e32" strokeWidth="1.2" />
      {/* chimenea */}
      <rect x="24.5" y="13" width="2.6" height="3.6" fill="#ec8856" stroke="#2d2e32" strokeWidth="1.1" />
    </svg>
  );
}
