"use client";

import React from "react";

/*
  ILUSTRACIONES INFANTILES VECTORIALES PARA LABORATORIOS
  Estilo amigable, trazos suaves, personajes expresivos y elementos científicos seguros.
  Incluyen microanimaciones sutiles y responden a estados hover del contenedor.
*/

// Laboratorio 1: Máquinas que ayudan (Robot amistoso y engranajes)
export function IlustracionRobotMaquinas({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full h-full select-none ${className}`}
      role="img"
      aria-label="Robot amistoso saludando junto a engranajes de colores y herramientas escolares seguras"
    >
      <defs>
        <linearGradient id="sky-rob1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e3f2fd" />
          <stop offset="100%" stopColor="#d0e8f8" />
        </linearGradient>
        <linearGradient id="bot-body" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
        <linearGradient id="bot-belly" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f0f9ff" />
        </linearGradient>
        <linearGradient id="gear-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>

      {/* Fondo orgánico suave */}
      <rect width="400" height="220" rx="18" fill="url(#sky-rob1)" />

      {/* Formas orgánicas de fondo */}
      <circle cx="80" cy="40" r="28" fill="#bae6fd" opacity="0.45" />
      <circle cx="340" cy="50" r="38" fill="#bae6fd" opacity="0.4" />
      <path
        d="M -20 180 Q 80 150 200 175 T 420 160 L 420 220 L -20 220 Z"
        fill="#c7e3f8"
        opacity="0.6"
      />

      {/* Destellos y estrellas científicas */}
      <g className="animate-pulse" style={{ animationDuration: "3s" }}>
        <path d="M 50 70 Q 55 75 50 80 Q 45 75 50 70 Z" fill="#f59e0b" />
        <circle cx="95" cy="110" r="3" fill="#38bdf8" />
        <circle cx="310" cy="90" r="4" fill="#fbbf24" />
        <path d="M 330 110 L 334 118 L 342 120 L 335 125 L 337 133 L 330 128 L 323 133 L 325 125 L 318 120 L 326 118 Z" fill="#fbbf24" opacity="0.75" />
      </g>

      {/* Engranajes flotantes (con giro en hover) */}
      <g className="transition-transform duration-700 group-hover:rotate-45 origin-[75px_130px]">
        <circle cx="75" cy="130" r="24" fill="url(#gear-gold)" />
        <circle cx="75" cy="130" r="9" fill="#e3f2fd" />
        <rect x="71" y="102" width="8" height="6" rx="2" fill="#f59e0b" />
        <rect x="71" y="152" width="8" height="6" rx="2" fill="#f59e0b" />
        <rect x="47" y="126" width="6" height="8" rx="2" fill="#f59e0b" />
        <rect x="97" y="126" width="6" height="8" rx="2" fill="#f59e0b" />
      </g>

      <g className="transition-transform duration-700 group-hover:-rotate-45 origin-[125px_155px]">
        <circle cx="125" cy="155" r="16" fill="#38bdf8" opacity="0.9" />
        <circle cx="125" cy="155" r="6" fill="#c7e3f8" />
        <rect x="122" y="136" width="6" height="5" rx="1.5" fill="#0284c7" />
        <rect x="122" y="169" width="6" height="5" rx="1.5" fill="#0284c7" />
        <rect x="106" y="152" width="5" height="6" rx="1.5" fill="#0284c7" />
        <rect x="139" y="152" width="5" height="6" rx="1.5" fill="#0284c7" />
      </g>

      {/* Robot Boti amistoso */}
      <g className="transition-transform duration-300 group-hover:-translate-y-1">
        {/* Antena */}
        <line x1="220" y1="52" x2="220" y2="35" stroke="#0369a1" strokeWidth="4" strokeLinecap="round" />
        <circle cx="220" cy="32" r="7" fill="#f43f5e" className="animate-ping" style={{ animationDuration: "2s" }} />
        <circle cx="220" cy="32" r="7" fill="#f43f5e" />

        {/* Cabeza */}
        <rect x="180" y="52" width="80" height="58" rx="18" fill="url(#bot-body)" stroke="#0369a1" strokeWidth="3" />
        <rect x="190" y="62" width="60" height="38" rx="12" fill="#0f172a" />

        {/* Ojos digitales felices */}
        <circle cx="205" cy="80" r="7" fill="#38bdf8" />
        <circle cx="207" cy="78" r="2.5" fill="#ffffff" />
        <circle cx="235" cy="80" r="7" fill="#38bdf8" />
        <circle cx="237" cy="78" r="2.5" fill="#ffffff" />

        {/* Sonrisa del robot */}
        <path d="M 213 88 Q 220 95 227 88" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* Orejitas / tuercas */}
        <rect x="173" y="68" width="7" height="18" rx="3" fill="#f59e0b" />
        <rect x="260" y="68" width="7" height="18" rx="3" fill="#f59e0b" />

        {/* Cuello */}
        <rect x="212" y="110" width="16" height="8" rx="3" fill="#94a3b8" />

        {/* Cuerpo */}
        <rect x="175" y="118" width="90" height="66" rx="20" fill="url(#bot-body)" stroke="#0369a1" strokeWidth="3" />
        {/* Pantalla en la panza */}
        <rect x="192" y="128" width="56" height="38" rx="10" fill="url(#bot-belly)" />
        <path d="M 200 148 Q 210 138 220 148 T 240 148" stroke="#10b981" strokeWidth="3" strokeLinecap="round" fill="none" />
        <circle cx="206" cy="136" r="3" fill="#f43f5e" />
        <circle cx="220" cy="136" r="3" fill="#fbbf24" />
        <circle cx="234" cy="136" r="3" fill="#10b981" />

        {/* Brazo izquierdo que saluda */}
        <g className="transition-transform duration-500 origin-[175px_130px] group-hover:rotate-12">
          <path d="M 175 130 Q 150 120 142 105" stroke="#0284c7" strokeWidth="8" strokeLinecap="round" fill="none" />
          <circle cx="140" cy="103" r="8" fill="#f59e0b" />
          {/* Manito saludando */}
          <path d="M 136 100 Q 130 92 136 86" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
          <path d="M 142 98 Q 140 88 146 84" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
        </g>

        {/* Brazo derecho */}
        <path d="M 265 130 Q 288 140 292 160" stroke="#0284c7" strokeWidth="8" strokeLinecap="round" fill="none" />
        <circle cx="292" cy="160" r="8" fill="#f59e0b" />

        {/* Rueditas / oruga de base */}
        <rect x="185" y="184" width="70" height="18" rx="9" fill="#334155" />
        <circle cx="198" cy="193" r="5" fill="#64748b" />
        <circle cx="220" cy="193" r="5" fill="#64748b" />
        <circle cx="242" cy="193" r="5" fill="#64748b" />
      </g>

      {/* Niño inventor curioso al lado */}
      <g className="transition-transform duration-300 group-hover:translate-x-1">
        {/* Cabello */}
        <ellipse cx="320" cy="120" rx="20" ry="18" fill="#78350f" />
        {/* Cara */}
        <circle cx="320" cy="126" r="16" fill="#fed7aa" />
        {/* Ojos alegres */}
        <circle cx="314" cy="125" r="2.5" fill="#1e293b" />
        <circle cx="324" cy="125" r="2.5" fill="#1e293b" />
        <path d="M 317 132 Q 320 136 323 132" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Gafas divertidas redondas */}
        <circle cx="314" cy="125" r="5.5" stroke="#ea580c" strokeWidth="2" fill="none" />
        <circle cx="324" cy="125" r="5.5" stroke="#ea580c" strokeWidth="2" fill="none" />
        <line x1="319.5" y1="125" x2="318.5" y2="125" stroke="#ea580c" strokeWidth="2" />
        {/* Bata / Camisa */}
        <path d="M 305 142 Q 320 140 335 142 L 340 185 L 300 185 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
        <rect x="312" y="146" width="16" height="12" rx="3" fill="#24617f" />
      </g>
    </svg>
  );
}

// Laboratorio 2: Sensores que miden (Niña científica, probetas y ondas)
export function IlustracionCientificaSensores({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full h-full select-none ${className}`}
      role="img"
      aria-label="Niña científica con bata escolar explorando con sensores y tubos de ensayo con burbujas de colores"
    >
      <defs>
        <linearGradient id="sky-sen" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f0fdf4" />
          <stop offset="100%" stopColor="#dcfce7" />
        </linearGradient>
        <linearGradient id="liquid-cyan" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
        <linearGradient id="liquid-pink" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fb7185" />
          <stop offset="100%" stopColor="#e11d48" />
        </linearGradient>
      </defs>

      {/* Fondo suave */}
      <rect width="400" height="220" rx="18" fill="url(#sky-sen)" />

      {/* Círculos decorativos */}
      <circle cx="330" cy="50" r="32" fill="#bbf7d0" opacity="0.5" />
      <circle cx="70" cy="60" r="24" fill="#bbf7d0" opacity="0.4" />
      <path
        d="M -20 175 Q 120 155 240 170 T 420 165 L 420 220 L -20 220 Z"
        fill="#bbf7d0"
        opacity="0.5"
      />

      {/* Burbujas flotantes animadas */}
      <g className="animate-bounce" style={{ animationDuration: "2.8s" }}>
        <circle cx="110" cy="65" r="7" fill="#38bdf8" opacity="0.75" />
        <circle cx="108" cy="63" r="2" fill="#ffffff" />
        <circle cx="125" cy="45" r="10" fill="#a7f3d0" opacity="0.8" />
        <circle cx="122" cy="42" r="3" fill="#ffffff" />
        <circle cx="140" cy="75" r="5" fill="#f43f5e" opacity="0.6" />
      </g>

      {/* Tubos de ensayo en gradilla */}
      <g className="transition-transform duration-300 group-hover:scale-105 origin-[100px_160px]">
        {/* Soporte de madera */}
        <rect x="50" y="170" width="85" height="10" rx="3" fill="#b45309" />
        <rect x="55" y="145" width="75" height="6" rx="2" fill="#d97706" />
        <rect x="62" y="145" width="5" height="30" fill="#b45309" />
        <rect x="118" y="145" width="5" height="30" fill="#b45309" />

        {/* Tubo 1: Cian */}
        <rect x="73" y="125" width="14" height="42" rx="7" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="2" />
        <rect x="75" y="142" width="10" height="23" rx="5" fill="url(#liquid-cyan)" />
        <ellipse cx="80" cy="142" rx="5" ry="2" fill="#7dd3fc" />

        {/* Tubo 2: Rosa */}
        <rect x="98" y="120" width="14" height="47" rx="7" fill="#ffe4e6" stroke="#fb7185" strokeWidth="2" />
        <rect x="100" y="138" width="10" height="27" rx="5" fill="url(#liquid-pink)" />
        <ellipse cx="105" cy="138" rx="5" ry="2" fill="#fda4af" />
      </g>

      {/* Ondas del sensor de medición */}
      <g className="transition-opacity duration-300 group-hover:opacity-100 opacity-70">
        <path d="M 270 90 A 20 20 0 0 1 270 120" stroke="#0284c7" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M 280 82 A 32 32 0 0 1 280 128" stroke="#0284c7" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.6" />
        <path d="M 290 74 A 45 45 0 0 1 290 136" stroke="#0284c7" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.35" />
      </g>

      {/* Niña Científica Sofia */}
      <g className="transition-transform duration-300 group-hover:-translate-y-1">
        {/* Cabello rizado castaño con lazos */}
        <circle cx="215" cy="100" r="28" fill="#451a03" />
        <circle cx="190" cy="98" r="14" fill="#451a03" />
        <circle cx="240" cy="98" r="14" fill="#451a03" />
        <circle cx="190" cy="108" r="6" fill="#f43f5e" />
        <circle cx="240" cy="108" r="6" fill="#f43f5e" />

        {/* Rostro feliz */}
        <circle cx="215" cy="106" r="20" fill="#ffedd5" />
        <circle cx="208" cy="104" r="3" fill="#1e293b" />
        <circle cx="222" cy="104" r="3" fill="#1e293b" />
        <circle cx="209" cy="103" r="1" fill="#ffffff" />
        <circle cx="223" cy="103" r="1" fill="#ffffff" />
        {/* Mejillas sonrosadas */}
        <circle cx="204" cy="112" r="4" fill="#fda4af" opacity="0.6" />
        <circle cx="226" cy="112" r="4" fill="#fda4af" opacity="0.6" />
        <path d="M 211 114 Q 215 119 219 114" stroke="#e11d48" strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* Gafas científicas moradas */}
        <rect x="201" y="99" width="13" height="11" rx="4" stroke="#7c3aed" strokeWidth="2.5" fill="none" />
        <rect x="216" y="99" width="13" height="11" rx="4" stroke="#7c3aed" strokeWidth="2.5" fill="none" />
        <line x1="214" y1="104" x2="216" y2="104" stroke="#7c3aed" strokeWidth="2.5" />

        {/* Bata blanca de laboratorio */}
        <path d="M 195 128 L 190 190 L 240 190 L 235 128 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
        <path d="M 215 128 L 215 190" stroke="#e2e8f0" strokeWidth="2" />
        <rect x="221" y="145" width="12" height="15" rx="2" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="1.5" />

        {/* Sensor de temperatura en su mano */}
        <g className="transition-transform duration-300 group-hover:rotate-6 origin-[240px_140px]">
          <path d="M 230 138 Q 248 135 255 120" stroke="#ffedd5" strokeWidth="7" strokeLinecap="round" fill="none" />
          {/* Dispositivo medidor */}
          <rect x="250" y="95" width="16" height="30" rx="5" fill="#0284c7" />
          <rect x="253" y="100" width="10" height="12" rx="2" fill="#67e8f9" />
          <line x1="258" y1="95" x2="258" y2="80" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
          <circle cx="258" cy="78" r="4" fill="#f43f5e" />
        </g>
      </g>

      {/* Microscopio infantil a la derecha */}
      <g className="transition-transform duration-300 group-hover:scale-105 origin-[330px_160px]">
        {/* Base */}
        <rect x="310" y="172" width="45" height="10" rx="4" fill="#334155" />
        <rect x="328" y="140" width="8" height="34" rx="2" fill="#64748b" />
        {/* Platina */}
        <rect x="316" y="152" width="28" height="4" rx="1" fill="#0f172a" />
        {/* Tubo óptico */}
        <path d="M 334 140 Q 338 120 326 114 L 320 122 Q 330 126 328 140 Z" fill="#0284c7" />
        <rect x="314" y="105" width="14" height="16" rx="4" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" transform="rotate(25 314 105)" />
        <circle cx="328" cy="148" r="3" fill="#f59e0b" />
      </g>
    </svg>
  );
}

// Laboratorio 3: De la idea al prototipo (Inventor, bombillo y cohete ecológico)
export function IlustracionPrototipoCohete({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full h-full select-none ${className}`}
      role="img"
      aria-label="Estudiante inventor construyendo un prototipo de cohete ecológico con bombillo de ideas brillantes"
    >
      <defs>
        <linearGradient id="sky-proto" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fffbeb" />
          <stop offset="100%" stopColor="#fef3c7" />
        </linearGradient>
        <linearGradient id="rocket-body" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
        <linearGradient id="bulb-glow" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#facc15" />
        </linearGradient>
      </defs>

      {/* Fondo suave cálido */}
      <rect width="400" height="220" rx="18" fill="url(#sky-proto)" />

      {/* Círculos orgánicos */}
      <circle cx="80" cy="50" r="30" fill="#fde68a" opacity="0.5" />
      <circle cx="340" cy="60" r="35" fill="#fde68a" opacity="0.4" />
      <path
        d="M -20 170 Q 100 150 210 168 T 420 162 L 420 220 L -20 220 Z"
        fill="#fde68a"
        opacity="0.55"
      />

      {/* Bombillo de ideas luminosas que brilla */}
      <g className="transition-transform duration-300 group-hover:scale-110 origin-[100px_70px]">
        {/* Rayos de luz */}
        <line x1="100" y1="36" x2="100" y2="28" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
        <line x1="124" y1="46" x2="130" y2="40" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
        <line x1="76" y1="46" x2="70" y2="40" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
        <line x1="130" y1="70" x2="138" y2="70" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
        <line x1="70" y1="70" x2="62" y2="70" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />

        {/* Cristal del bombillo */}
        <circle cx="100" cy="68" r="20" fill="url(#bulb-glow)" />
        <path d="M 90 78 L 110 78 L 106 90 L 94 90 Z" fill="#facc15" />
        <rect x="93" y="90" width="14" height="6" rx="2" fill="#94a3b8" />
        {/* Filamento feliz */}
        <path d="M 95 72 Q 100 64 105 72" stroke="#d97706" strokeWidth="2" fill="none" />
        <circle cx="97" cy="64" r="2" fill="#ffffff" />
      </g>

      {/* Cohete de cartón / prototipo inventivo */}
      <g className="transition-transform duration-500 group-hover:-translate-y-2 group-hover:rotate-3 origin-[280px_120px]">
        {/* Fuego propulsor suave */}
        <path d="M 270 170 Q 280 195 285 170" fill="#f43f5e" />
        <path d="M 274 170 Q 280 188 283 170" fill="#fbbf24" />

        {/* Alas */}
        <polygon points="250,165 265,130 265,165" fill="#3b82f6" />
        <polygon points="310,165 295,130 295,165" fill="#3b82f6" />

        {/* Cuerpo del cohete */}
        <path d="M 265 165 L 265 115 Q 280 80 295 115 L 295 165 Z" fill="url(#rocket-body)" stroke="#c2410c" strokeWidth="2.5" />

        {/* Ventanilla circular con reflejo */}
        <circle cx="280" cy="125" r="10" fill="#bae6fd" stroke="#ffffff" strokeWidth="2.5" />
        <circle cx="278" cy="122" r="3" fill="#ffffff" />

        {/* Detalles de tornillos / prototipo manual */}
        <circle cx="272" cy="155" r="1.5" fill="#fef08a" />
        <circle cx="288" cy="155" r="1.5" fill="#fef08a" />
      </g>

      {/* Niño diseñador/constructor */}
      <g className="transition-transform duration-300 group-hover:translate-x-1">
        {/* Cabello liso oscuro */}
        <path d="M 180 100 Q 195 85 215 95 Q 225 105 220 118 L 175 118 Z" fill="#1e293b" />
        {/* Cara alegre */}
        <circle cx="195" cy="115" r="18" fill="#fde047" opacity="0.3" />
        <circle cx="195" cy="115" r="16" fill="#fed7aa" />
        <circle cx="190" cy="112" r="2.5" fill="#1e293b" />
        <circle cx="202" cy="112" r="2.5" fill="#1e293b" />
        <circle cx="191" cy="110" r="1" fill="#ffffff" />
        <circle cx="203" cy="110" r="1" fill="#ffffff" />
        <path d="M 192 122 Q 196 127 201 122" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" fill="none" />

        {/* Gorra o visera de creador */}
        <path d="M 178 102 Q 195 96 212 102" stroke="#ea580c" strokeWidth="6" strokeLinecap="round" fill="none" />
        <path d="M 205 101 Q 220 101 226 104" stroke="#c2410c" strokeWidth="4" strokeLinecap="round" fill="none" />

        {/* Camiseta verde emprendedora */}
        <path d="M 180 133 Q 195 130 210 133 L 215 185 L 175 185 Z" fill="#466232" />
        <rect x="187" y="145" width="16" height="18" rx="4" fill="#ffffff" opacity="0.2" />

        {/* Regla y lápiz en mano */}
        <g className="transition-transform duration-300 group-hover:-rotate-12 origin-[175px_150px]">
          <line x1="160" y1="165" x2="175" y2="145" stroke="#f59e0b" strokeWidth="5" strokeLinecap="round" />
          <polygon points="158,168 163,165 160,161" fill="#1e293b" />
        </g>
      </g>

      {/* Maceta ecológica con brote de planta inteligente */}
      <g className="transition-transform duration-300 group-hover:scale-105 origin-[50px_175px]">
        <rect x="35" y="165" width="28" height="22" rx="4" fill="#78350f" />
        <rect x="32" y="162" width="34" height="6" rx="2" fill="#92400e" />
        {/* Tallo y hojas */}
        <path d="M 49 162 Q 49 140 50 135" stroke="#16a34a" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <path d="M 50 145 Q 60 138 62 145 Q 56 150 50 148" fill="#22c55e" />
        <path d="M 49 140 Q 38 135 37 142 Q 44 146 49 143" fill="#22c55e" />
      </g>
    </svg>
  );
}

// Laboratorio 4: La feria de inventores (Stand escolar festivo, estrellas y robot presentador)
export function IlustracionFeriaInventos({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full h-full select-none ${className}`}
      role="img"
      aria-label="Feria escolar de inventores con banderines festivos, robot presentador y trofeo amigable"
    >
      <defs>
        <linearGradient id="sky-fair" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fdf4ff" />
          <stop offset="100%" stopColor="#fae8ff" />
        </linearGradient>
        <linearGradient id="ribbon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f43f5e" />
          <stop offset="100%" stopColor="#be123c" />
        </linearGradient>
      </defs>

      {/* Fondo suave violeta/festivo */}
      <rect width="400" height="220" rx="18" fill="url(#sky-fair)" />

      {/* Formas suaves */}
      <circle cx="60" cy="50" r="30" fill="#f5d0fe" opacity="0.5" />
      <circle cx="340" cy="60" r="35" fill="#f5d0fe" opacity="0.4" />
      <path
        d="M -20 175 Q 110 155 220 172 T 420 165 L 420 220 L -20 220 Z"
        fill="#f5d0fe"
        opacity="0.55"
      />

      {/* Banderines festivos colgando arriba */}
      <g>
        <path d="M 10 30 Q 100 55 200 35 Q 300 55 390 30" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="3 3" fill="none" />
        <polygon points="40,36 60,39 50,60" fill="#f43f5e" />
        <polygon points="80,43 100,45 90,67" fill="#fbbf24" />
        <polygon points="120,46 140,46 130,68" fill="#3b82f6" />
        <polygon points="160,43 180,41 170,64" fill="#10b981" />
        <polygon points="220,40 240,43 230,65" fill="#a855f7" />
        <polygon points="260,46 280,47 270,69" fill="#f97316" />
        <polygon points="300,46 320,44 310,67" fill="#06b6d4" />
        <polygon points="340,40 360,36 350,59" fill="#f43f5e" />
      </g>

      {/* Estrellitas centelleantes */}
      <g className="animate-pulse" style={{ animationDuration: "2.5s" }}>
        <path d="M 60 90 Q 64 94 60 98 Q 56 94 60 90 Z" fill="#fbbf24" />
        <path d="M 330 100 Q 334 104 330 108 Q 326 104 330 100 Z" fill="#a855f7" />
        <circle cx="360" cy="80" r="3" fill="#fbbf24" />
      </g>

      {/* Puesto / Mesa de presentación */}
      <rect x="70" y="165" width="260" height="25" rx="5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
      <path d="M 70 175 L 330 175" stroke="#f43f5e" strokeWidth="4" />
      {/* Borde mantel festivo */}
      <path d="M 70 178 Q 80 188 90 178 Q 100 188 110 178 Q 120 188 130 178 Q 140 188 150 178 Q 160 188 170 178 Q 180 188 190 178 Q 200 188 210 178 Q 220 188 230 178 Q 240 188 250 178 Q 260 188 270 178 Q 280 188 290 178 Q 300 188 310 178 Q 320 188 330 178" fill="#f43f5e" opacity="0.3" />

      {/* Trofeo / Medalla escolar al mérito inventivo */}
      <g className="transition-transform duration-300 group-hover:scale-110 origin-[120px_140px]">
        {/* Copa dorada */}
        <path d="M 108 130 L 132 130 Q 130 152 120 155 Q 110 152 108 130 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
        <path d="M 108 134 Q 100 134 102 144 Q 106 148 111 146" stroke="#d97706" strokeWidth="2" fill="none" />
        <path d="M 132 134 Q 140 134 138 144 Q 134 148 129 146" stroke="#d97706" strokeWidth="2" fill="none" />
        <rect x="117" y="155" width="6" height="10" fill="#d97706" />
        <rect x="112" y="162" width="16" height="5" rx="1.5" fill="#78350f" />
        {/* Estrella en la copa */}
        <circle cx="120" cy="140" r="4" fill="#ffffff" />
      </g>

      {/* Robot Mini-Presentador con megáfono */}
      <g className="transition-transform duration-300 group-hover:-translate-y-1">
        {/* Antena con corazón o bombillo */}
        <line x1="200" y1="92" x2="200" y2="78" stroke="#7c3aed" strokeWidth="3" strokeLinecap="round" />
        <circle cx="200" cy="76" r="6" fill="#f43f5e" />

        {/* Cabeza redonda */}
        <rect x="175" y="92" width="50" height="40" rx="14" fill="#8b5cf6" stroke="#6d28d9" strokeWidth="2.5" />
        <rect x="183" y="100" width="34" height="24" rx="8" fill="#1e1b4b" />
        {/* Ojos expresivos felices */}
        <path d="M 188 112 Q 192 107 196 112" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M 204 112 Q 208 107 212 112" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* Pajarita / Corbata de gala */}
        <polygon points="196,134 204,134 200,137" fill="#f43f5e" />
        <polygon points="196,140 204,140 200,137" fill="#f43f5e" />
        <circle cx="200" cy="137" r="2" fill="#fbbf24" />

        {/* Cuerpo */}
        <rect x="180" y="138" width="40" height="30" rx="10" fill="#a78bfa" stroke="#6d28d9" strokeWidth="2" />

        {/* Megáfono en mano */}
        <g className="transition-transform duration-300 group-hover:rotate-6 origin-[220px_145px]">
          <path d="M 220 145 L 240 138 L 244 154 L 222 150 Z" fill="#f59e0b" stroke="#d97706" strokeWidth="1.5" />
          <ellipse cx="243" cy="146" rx="3" ry="8" fill="#ef4444" />
          {/* Ondas de voz */}
          <path d="M 250 140 Q 255 146 250 152" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M 254 136 Q 261 146 254 156" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />
        </g>
      </g>

      {/* Cartel "PROYECTO 1-01" en el stand */}
      <g className="transition-transform duration-300 group-hover:scale-105 origin-[280px_140px]">
        <rect x="250" y="125" width="60" height="38" rx="6" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
        <rect x="254" y="129" width="52" height="12" rx="3" fill="#ec4899" />
        <line x1="256" y1="148" x2="285" y2="148" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
        <line x1="256" y1="154" x2="275" y2="154" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  );
}

// Avatar del robot Boti para bocadillos de juego
export function AvatarBoti({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
      role="img"
      aria-label="Avatar de Boti el robot asistente"
    >
      <circle cx="32" cy="32" r="30" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="2.5" />
      {/* Antena */}
      <line x1="32" y1="14" x2="32" y2="8" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="32" cy="7" r="3.5" fill="#f43f5e" />
      {/* Cabeza */}
      <rect x="16" y="14" width="32" height="26" rx="8" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" />
      <rect x="20" y="18" width="24" height="18" rx="5" fill="#0f172a" />
      {/* Ojos */}
      <circle cx="26" cy="27" r="3" fill="#38bdf8" />
      <circle cx="27" cy="26" r="1" fill="#ffffff" />
      <circle cx="38" cy="27" r="3" fill="#38bdf8" />
      <circle cx="39" cy="26" r="1" fill="#ffffff" />
      {/* Sonrisa */}
      <path d="M 29 32 Q 32 35 35 32" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Orejitas */}
      <rect x="13" y="22" width="3" height="8" rx="1.5" fill="#f59e0b" />
      <rect x="48" y="22" width="3" height="8" rx="1.5" fill="#f59e0b" />
      {/* Cuerpo */}
      <path d="M 20 44 Q 32 42 44 44 L 46 56 Q 32 58 18 56 Z" fill="#0284c7" />
      <circle cx="32" cy="49" r="2.5" fill="#fde047" />
    </svg>
  );
}

// Avatar de Mía la pequeña emprendedora
export function AvatarMia({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
      role="img"
      aria-label="Avatar de Mía la pequeña inventora"
    >
      <circle cx="32" cy="32" r="30" fill="#f0fdf4" stroke="#4ade80" strokeWidth="2.5" />
      {/* Cabello */}
      <circle cx="32" cy="26" r="18" fill="#78350f" />
      <circle cx="16" cy="26" r="6" fill="#78350f" />
      <circle cx="48" cy="26" r="6" fill="#78350f" />
      <circle cx="16" cy="31" r="3.5" fill="#f43f5e" />
      <circle cx="48" cy="31" r="3.5" fill="#f43f5e" />
      {/* Cara */}
      <circle cx="32" cy="30" r="13" fill="#fed7aa" />
      <circle cx="27" cy="29" r="2" fill="#1e293b" />
      <circle cx="37" cy="29" r="2" fill="#1e293b" />
      <circle cx="28" cy="28" r="0.7" fill="#ffffff" />
      <circle cx="38" cy="28" r="0.7" fill="#ffffff" />
      {/* Mejillas */}
      <circle cx="24" cy="34" r="2.5" fill="#fca5a5" opacity="0.6" />
      <circle cx="40" cy="34" r="2.5" fill="#fca5a5" opacity="0.6" />
      <path d="M 29 35 Q 32 38 35 35" stroke="#e11d48" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Camiseta verde */}
      <path d="M 22 46 Q 32 43 42 46 L 44 58 Q 32 60 20 58 Z" fill="#466232" />
      <path d="M 32 46 L 32 52" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

