"use client";

import React from "react";

/*
  ILUSTRACIONES VECTORIALES ADICIONALES PARA MUNDOS DE JUEGO (MIDUHO)
  Estilo amigable infantil, paletas institucionales cálidas, optimizadas para rendimiento.
*/

// Detectives de necesidades (Emprendimiento Estación 1)
export function IlustracionDetectivesNecesidades({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full h-full select-none ${className}`}
      role="img"
      aria-label="Niños detectives escolares investigando con lupa gigante y libreta de campo"
    >
      <defs>
        <linearGradient id="sky-det" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f0fdf4" />
          <stop offset="100%" stopColor="#dcfce7" />
        </linearGradient>
      </defs>
      <rect width="400" height="220" rx="18" fill="url(#sky-det)" />
      <circle cx="90" cy="50" r="30" fill="#bbf7d0" opacity="0.5" />
      <circle cx="330" cy="60" r="35" fill="#bbf7d0" opacity="0.4" />
      <path d="M -20 175 Q 120 155 240 172 T 420 165 L 420 220 L -20 220 Z" fill="#bbf7d0" opacity="0.55" />

      {/* Bombillo de ideas animado */}
      <g className="animate-pulse" style={{ animationDuration: "2.8s" }}>
        <circle cx="320" cy="80" r="16" fill="#fef08a" />
        <circle cx="320" cy="80" r="22" stroke="#facc15" strokeWidth="2" strokeDasharray="3 3" opacity="0.7" />
        <path d="M 314 96 L 326 96 L 324 104 L 316 104 Z" fill="#eab308" />
        <path d="M 316 80 Q 320 74 324 80" stroke="#ca8a04" strokeWidth="2" fill="none" />
      </g>

      {/* Libreta de notas escolar */}
      <g className="transition-transform duration-300 group-hover:rotate-6 origin-[100px_140px]">
        <rect x="70" y="115" width="55" height="70" rx="6" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
        <rect x="70" y="115" width="12" height="70" rx="3" fill="#15803d" />
        <line x1="90" y1="135" x2="115" y2="135" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
        <line x1="90" y1="145" x2="115" y2="145" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
        <line x1="90" y1="155" x2="110" y2="155" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
        {/* Lápiz amarillo */}
        <rect x="110" y="105" width="6" height="40" rx="2" fill="#eab308" transform="rotate(25 110 105)" />
        <polygon points="128,145 133,144 130,150" fill="#1e293b" />
      </g>

      {/* Lupa gigante con reflejo y personaje observador */}
      <g className="transition-transform duration-300 group-hover:scale-105 origin-[210px_130px]">
        {/* Cabeza del niño */}
        <circle cx="210" cy="110" r="24" fill="#334155" />
        <circle cx="210" cy="116" r="20" fill="#fed7aa" />
        <circle cx="204" cy="114" r="3" fill="#1e293b" />
        <circle cx="216" cy="114" r="3" fill="#1e293b" />
        <path d="M 207 122 Q 210 126 213 122" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Camiseta verde */}
        <path d="M 195 138 Q 210 134 225 138 L 230 190 L 190 190 Z" fill="#466232" />

        {/* Lupa en mano */}
        <circle cx="240" cy="110" r="26" fill="#e0f2fe" stroke="#3b82f6" strokeWidth="4" opacity="0.9" />
        <circle cx="236" cy="104" r="6" fill="#ffffff" opacity="0.8" />
        <line x1="258" y1="128" x2="280" y2="155" stroke="#b45309" strokeWidth="7" strokeLinecap="round" />
      </g>
    </svg>
  );
}

// El Gran Trueque y Conteo (Emprendimiento Estación 2)
export function IlustracionMercaditoTrueque({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full h-full select-none ${className}`}
      role="img"
      aria-label="Balanza escolar con frutas y bloques de madera representando el trueque y el precio justo"
    >
      <defs>
        <linearGradient id="sky-tru" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fefce8" />
          <stop offset="100%" stopColor="#fef08a" />
        </linearGradient>
      </defs>
      <rect width="400" height="220" rx="18" fill="url(#sky-tru)" />
      <circle cx="70" cy="50" r="30" fill="#fef9c3" />
      <circle cx="330" cy="50" r="30" fill="#fef9c3" />
      <path d="M -20 175 Q 120 155 240 172 T 420 165 L 420 220 L -20 220 Z" fill="#fde047" opacity="0.4" />

      {/* Toldo festivo de mercado escolar */}
      <g>
        <path d="M 60 40 Q 200 25 340 40 L 330 65 Q 200 50 70 65 Z" fill="#f97316" />
        <path d="M 70 65 Q 100 78 130 65 Q 160 78 190 65 Q 220 78 250 65 Q 280 78 310 65 Q 330 72 330 65" fill="#ea580c" />
      </g>

      {/* Balanza de dos platos amigable */}
      <g className="transition-transform duration-500 group-hover:rotate-2 origin-[200px_100px]">
        {/* Base */}
        <rect x="194" y="90" width="12" height="85" rx="3" fill="#d97706" />
        <polygon points="175,175 225,175 200,160" fill="#b45309" />
        {/* Barra superior */}
        <line x1="120" y1="105" x2="280" y2="105" stroke="#f59e0b" strokeWidth="5" strokeLinecap="round" />
        <circle cx="200" cy="105" r="5" fill="#b45309" />

        {/* Plato Izquierdo (Manzana y bloques) */}
        <line x1="135" y1="105" x2="125" y2="135" stroke="#94a3b8" strokeWidth="2" />
        <line x1="135" y1="105" x2="145" y2="135" stroke="#94a3b8" strokeWidth="2" />
        <ellipse cx="135" cy="138" rx="24" ry="5" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" />
        {/* Manzana roja */}
        <circle cx="135" cy="130" r="10" fill="#ef4444" />
        <path d="M 135 120 Q 138 114 135 112" stroke="#15803d" strokeWidth="2" fill="none" />

        {/* Plato Derecho (Juguete o bloques) */}
        <line x1="265" y1="105" x2="255" y2="140" stroke="#94a3b8" strokeWidth="2" />
        <line x1="265" y1="105" x2="275" y2="140" stroke="#94a3b8" strokeWidth="2" />
        <ellipse cx="265" cy="143" rx="24" ry="5" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" />
        {/* Cubo de madera escolar */}
        <rect x="257" y="128" width="16" height="15" rx="2" fill="#3b82f6" />
        <text x="261" y="140" fontSize="10" fontWeight="bold" fill="#ffffff">A</text>
      </g>
    </svg>
  );
}

// Mecanismos en movimiento (Robótica Misión 3)
export function IlustracionMecanismoRobo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full h-full select-none ${className}`}
      role="img"
      aria-label="Brazo mecánico y vehículo con engranajes en movimiento"
    >
      <defs>
        <linearGradient id="sky-mec" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e0f2fe" />
          <stop offset="100%" stopColor="#bae6fd" />
        </linearGradient>
      </defs>
      <rect width="400" height="220" rx="18" fill="url(#sky-mec)" />
      <circle cx="80" cy="50" r="28" fill="#7dd3fc" opacity="0.4" />
      <circle cx="320" cy="50" r="32" fill="#7dd3fc" opacity="0.4" />
      <path d="M -20 175 Q 120 155 240 170 T 420 165 L 420 220 L -20 220 Z" fill="#7dd3fc" opacity="0.5" />

      {/* Engranajes en cascada con giro al hacer hover */}
      <g className="transition-transform duration-700 group-hover:rotate-90 origin-[90px_100px]">
        <circle cx="90" cy="100" r="26" fill="#f59e0b" />
        <circle cx="90" cy="100" r="10" fill="#e0f2fe" />
        <rect x="86" y="68" width="8" height="8" rx="2" fill="#d97706" />
        <rect x="86" y="124" width="8" height="8" rx="2" fill="#d97706" />
        <rect x="58" y="96" width="8" height="8" rx="2" fill="#d97706" />
        <rect x="114" y="96" width="8" height="8" rx="2" fill="#d97706" />
      </g>

      {/* Brazo robótico infantil articulado */}
      <g className="transition-transform duration-500 group-hover:-rotate-6 origin-[220px_170px]">
        {/* Base */}
        <rect x="185" y="165" width="70" height="18" rx="6" fill="#1e293b" />
        <circle cx="220" cy="165" r="12" fill="#0284c7" />

        {/* Tramo 1 */}
        <rect x="214" y="110" width="12" height="55" rx="4" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" />
        <circle cx="220" cy="110" r="9" fill="#f59e0b" />

        {/* Tramo 2 (antebrazo) */}
        <rect x="214" y="65" width="12" height="48" rx="4" fill="#0284c7" stroke="#0369a1" strokeWidth="2" transform="rotate(25 220 110)" />

        {/* Pinza / Garra amigable sosteniendo una estrella */}
        <g className="transition-transform duration-300 group-hover:scale-110 origin-[265px_75px]">
          <path d="M 260 70 Q 255 58 265 52" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M 268 74 Q 275 64 270 55" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" fill="none" />
          <polygon points="266,54 269,60 275,61 270,65 272,71 266,67 261,71 263,65 258,61 264,60" fill="#fbbf24" />
        </g>
      </g>
    </svg>
  );
}

// El robot que presenta (Robótica Misión 4)
export function IlustracionRobotPresentador({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full h-full select-none ${className}`}
      role="img"
      aria-label="Robot en escenario escolar presentando el proyecto con luces y confeti"
    >
      <defs>
        <linearGradient id="sky-pres" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f3e8ff" />
          <stop offset="100%" stopColor="#e9d5ff" />
        </linearGradient>
      </defs>
      <rect width="400" height="220" rx="18" fill="url(#sky-pres)" />
      <circle cx="80" cy="50" r="30" fill="#d8b4fe" opacity="0.4" />
      <circle cx="320" cy="50" r="32" fill="#d8b4fe" opacity="0.4" />
      <path d="M -20 175 Q 120 155 240 170 T 420 165 L 420 220 L -20 220 Z" fill="#c084fc" opacity="0.35" />

      {/* Confeti festivo */}
      <g className="animate-pulse" style={{ animationDuration: "2.5s" }}>
        <rect x="80" y="40" width="6" height="6" rx="1" fill="#ec4899" transform="rotate(20 80 40)" />
        <rect x="140" y="30" width="5" height="5" rx="1" fill="#eab308" transform="rotate(45 140 30)" />
        <rect x="260" y="35" width="7" height="7" rx="1" fill="#06b6d4" transform="rotate(15 260 35)" />
        <circle cx="310" cy="45" r="3" fill="#a855f7" />
        <circle cx="100" cy="70" r="3.5" fill="#22c55e" />
      </g>

      {/* Escenario de presentación */}
      <rect x="90" y="160" width="220" height="25" rx="5" fill="#475569" />
      <path d="M 90 170 L 310 170" stroke="#f59e0b" strokeWidth="3" />

      {/* Robot presentador con micrófono */}
      <g className="transition-transform duration-300 group-hover:-translate-y-1">
        {/* Antena luminosa */}
        <line x1="200" y1="80" x2="200" y2="65" stroke="#7c3aed" strokeWidth="3" strokeLinecap="round" />
        <circle cx="200" cy="62" r="5" fill="#facc15" />

        {/* Cabeza */}
        <rect x="175" y="80" width="50" height="38" rx="12" fill="#9333ea" stroke="#6b21a8" strokeWidth="2.5" />
        <rect x="183" y="87" width="34" height="22" rx="7" fill="#0f172a" />
        {/* Ojos expresivos */}
        <circle cx="193" cy="98" r="3.5" fill="#38bdf8" />
        <circle cx="207" cy="98" r="3.5" fill="#38bdf8" />
        <path d="M 197 103 Q 200 106 203 103" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" fill="none" />

        {/* Pajarita elegante */}
        <polygon points="196,120 204,120 200,123" fill="#f43f5e" />
        <polygon points="196,126 204,126 200,123" fill="#f43f5e" />

        {/* Cuerpo */}
        <rect x="178" y="124" width="44" height="36" rx="10" fill="#a855f7" />

        {/* Micrófono en atril */}
        <g className="transition-transform duration-300 group-hover:scale-105 origin-[240px_130px]">
          <line x1="240" y1="160" x2="240" y2="115" stroke="#94a3b8" strokeWidth="3" />
          <circle cx="240" cy="112" r="7" fill="#334155" stroke="#64748b" strokeWidth="1.5" />
          {/* Ondas sonoras de voz */}
          <path d="M 248 106 Q 254 112 248 118" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" fill="none" />
        </g>
      </g>
    </svg>
  );
}

