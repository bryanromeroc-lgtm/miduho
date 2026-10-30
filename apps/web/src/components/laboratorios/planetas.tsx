"use client";

import React from "react";

/*
  LOS DOS MUNDOS · cuerpos celestes propios

  Cada planeta es un SVG autoral, no una foto ni un gradiente genérico:
  se construye con la familia de color de su área (DESIGN.md) llevada a
  luminosidad de bóveda, y su superficie CUENTA de qué trata el mundo —
  circuitos y antenas en Robótica, cultivos y talleres en Emprendimiento.

  Nítidos a cualquier tamaño, sin peso de descarga y con texto real
  siempre fuera de la imagen: el rótulo del mundo vive en el DOM.
*/

type PlanetaProps = { className?: string };

export function PlanetaRobotica({ className = "" }: PlanetaProps) {
  return (
    <svg
      viewBox="0 0 300 300"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id="pr-cuerpo" cx="34%" cy="28%" r="78%">
          <stop offset="0%" stopColor="#8ee0ff" />
          <stop offset="42%" stopColor="#3d9ecb" />
          <stop offset="78%" stopColor="#1b5f86" />
          <stop offset="100%" stopColor="#0b2f4c" />
        </radialGradient>
        <radialGradient id="pr-luz" cx="28%" cy="20%" r="46%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity=".62" />
          <stop offset="46%" stopColor="#ffffff" stopOpacity=".14" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="pr-terminador" cx="30%" cy="24%" r="88%">
          <stop offset="38%" stopColor="#020a18" stopOpacity="0" />
          <stop offset="72%" stopColor="#020a18" stopOpacity=".42" />
          <stop offset="100%" stopColor="#01060f" stopOpacity=".92" />
        </radialGradient>
        <clipPath id="pr-globo">
          <circle cx="150" cy="150" r="118" />
        </clipPath>
      </defs>

      {/* Cuerpo */}
      <circle cx="150" cy="150" r="118" fill="url(#pr-cuerpo)" />

      <g clipPath="url(#pr-globo)">
        {/* Continentes de placa metálica */}
        <path
          d="M46 96 q30-24 66-14 t58 6 q26 4 40-12 l24 14 q-16 30-52 32 t-64 6 q-38 2-56-10 z"
          fill="#0f4569"
          opacity=".72"
        />
        <path
          d="M62 196 q34 16 74 8 t72-4 q22 0 38 12 l-6 26 q-28-10-62-4 t-74 2 q-30-2-46-16 z"
          fill="#0f4569"
          opacity=".6"
        />

        {/* Circuitos luminosos: los ríos de este mundo */}
        <g stroke="#7ef0ff" strokeWidth="2.4" fill="none" strokeLinecap="round" opacity=".95">
          <path d="M40 132 h44 l16-16 h52 l14 14 h58" />
          <path d="M58 168 h30 l18 18 h74 l16-16 h46" />
          <path d="M96 88 v24 l14 14" />
          <path d="M188 214 v-22 l-16-16" />
        </g>
        <g fill="#b9f6ff">
          <circle cx="100" cy="116" r="4" />
          <circle cx="166" cy="130" r="4" />
          <circle cx="106" cy="186" r="4" />
          <circle cx="188" cy="192" r="4" />
          <circle cx="224" cy="152" r="3.4" />
        </g>

        {/* Cráteres suaves */}
        <g fill="#083150" opacity=".42">
          <ellipse cx="214" cy="104" rx="20" ry="14" />
          <ellipse cx="74" cy="222" rx="16" ry="11" />
        </g>

        {/* Torres y antenas en la curva del horizonte */}
        <g stroke="#cdefff" strokeWidth="3" strokeLinecap="round" fill="none">
          <path d="M150 32 v-16" />
          <path d="M142 20 l8-8 8 8" />
          <path d="M104 40 v-12" />
          <path d="M198 44 v-11" />
        </g>
        <circle cx="150" cy="12" r="4.6" fill="#ffe07a" />

        {/* Terminador: la sombra que le da volumen */}
        <circle cx="150" cy="150" r="118" fill="url(#pr-terminador)" />
        <circle cx="150" cy="150" r="118" fill="url(#pr-luz)" />
      </g>

      {/* Borde de atmósfera */}
      <circle cx="150" cy="150" r="118" fill="none" stroke="#a7e6ff" strokeWidth="1.6" opacity=".55" />
    </svg>
  );
}

export function PlanetaEmprendimiento({ className = "" }: PlanetaProps) {
  return (
    <svg
      viewBox="0 0 300 300"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id="pe-cuerpo" cx="34%" cy="28%" r="78%">
          <stop offset="0%" stopColor="#c6f5c2" />
          <stop offset="40%" stopColor="#5cba79" />
          <stop offset="76%" stopColor="#2b7d51" />
          <stop offset="100%" stopColor="#0f3a2c" />
        </radialGradient>
        <radialGradient id="pe-luz" cx="28%" cy="20%" r="46%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity=".62" />
          <stop offset="46%" stopColor="#ffffff" stopOpacity=".14" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="pe-terminador" cx="30%" cy="24%" r="88%">
          <stop offset="38%" stopColor="#04140d" stopOpacity="0" />
          <stop offset="72%" stopColor="#04140d" stopOpacity=".42" />
          <stop offset="100%" stopColor="#020c07" stopOpacity=".92" />
        </radialGradient>
        <clipPath id="pe-globo">
          <circle cx="150" cy="150" r="118" />
        </clipPath>
      </defs>

      <circle cx="150" cy="150" r="118" fill="url(#pe-cuerpo)" />

      <g clipPath="url(#pe-globo)">
        {/* Océanos y bahías */}
        <path
          d="M32 120 q34 22 76 16 t70 10 q28 6 48-8 l16 22 q-30 22-74 16 t-78-6 q-40-4-58-22 z"
          fill="#1b7d8e"
          opacity=".6"
        />
        <ellipse cx="88" cy="72" rx="34" ry="18" fill="#1b7d8e" opacity=".45" />

        {/* Parcelas cultivadas: el trabajo hecho en este mundo */}
        <g stroke="#e8fbd8" strokeWidth="2.2" opacity=".75" strokeLinecap="round">
          <path d="M186 190 l38-8" />
          <path d="M184 200 l40-8" />
          <path d="M182 210 l40-8" />
          <path d="M62 158 l34 6" />
          <path d="M60 168 l34 6" />
        </g>

        {/* Techos del taller y del mercadito */}
        <g>
          <path d="M108 118 l22-18 22 18 v22 h-44 z" fill="#f5c451" />
          <path d="M104 118 h52" stroke="#8a5f14" strokeWidth="3" strokeLinecap="round" />
          <rect x="122" y="126" width="14" height="14" rx="2" fill="#8a5f14" opacity=".7" />
          <path d="M166 134 l16-13 16 13 v16 h-32 z" fill="#e88a4e" />
          <path d="M163 134 h38" stroke="#8a4a1c" strokeWidth="2.6" strokeLinecap="round" />
        </g>

        {/* Brotes: el emprendimiento que crece */}
        <g stroke="#d9f7a8" strokeWidth="2.6" fill="none" strokeLinecap="round">
          <path d="M78 208 v-16" />
          <path d="M78 198 q-9-5-11-14" />
          <path d="M78 200 q9-5 11-14" />
          <path d="M232 132 v-14" />
          <path d="M232 124 q-8-4-10-12" />
        </g>

        {/* Nubes bajas */}
        <g fill="#ffffff" opacity=".34">
          <ellipse cx="196" cy="88" rx="30" ry="11" />
          <ellipse cx="96" cy="244" rx="26" ry="9" />
        </g>

        <circle cx="150" cy="150" r="118" fill="url(#pe-terminador)" />
        <circle cx="150" cy="150" r="118" fill="url(#pe-luz)" />
      </g>

      <circle cx="150" cy="150" r="118" fill="none" stroke="#b6f0be" strokeWidth="1.6" opacity=".55" />
    </svg>
  );
}
