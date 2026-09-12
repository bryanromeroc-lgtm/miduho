"use client";

import { useEffect, useState } from "react";

/*
  EL DESPEGUE · pantalla de entrada a Laboratorios

  No es un girador esperando en el vacío: es el primer segundo del
  universo. El cielo y las estrellas son los mismos tokens de la bóveda,
  de modo que cuando la vista real aparece no hay costura visual.

  La espera SE CUENTA. La barra avanza y el mensaje cambia porque quien
  espera —una docente con 25 niños mirando el proyector, o un niño de
  seis años— necesita ver que algo ocurre. Un girador mudo no dice nada.

  El progreso es honesto en su forma: avanza rápido al principio y se
  frena cerca del final, donde de verdad está esperando al servidor.
  Nunca llega solo al 100%: llega cuando la vista está lista y la
  reemplaza.
*/

const PASOS = [
  "Encendiendo los motores…",
  "Calculando la ruta entre los mundos…",
  "Saludando a Boti y a Mía…",
  "Abriendo la escotilla del laboratorio…",
];

export function Despegue() {
  const [avance, setAvance] = useState(8);
  const [paso, setPaso] = useState(0);

  useEffect(() => {
    /* La curva se acerca al 92% y ahí se queda: el último tramo lo
       completa la llegada real de la vista, no una mentira de reloj. */
    const t = window.setInterval(() => {
      setAvance((a) => (a >= 92 ? 92 : a + Math.max(1, (92 - a) * 0.14)));
    }, 180);

    const p = window.setInterval(() => {
      setPaso((i) => (i + 1) % PASOS.length);
    }, 1400);

    return () => {
      window.clearInterval(t);
      window.clearInterval(p);
    };
  }, []);

  return (
    <div
      className="cos-despegue"
      role="status"
      aria-live="polite"
      aria-label="Entrando a los laboratorios"
    >
      <div className="cos-despegue-cielo" aria-hidden="true" />
      <div className="cos-despegue-campo cos-despegue-campo-lento" aria-hidden="true" />
      <div className="cos-despegue-campo" aria-hidden="true" />

      <div className="cos-despegue-nucleo">
        <div className="cos-despegue-nave">
          <span className="cos-despegue-halo" aria-hidden="true" />
          <Nave />
        </div>

        <div>
          <p className="cos-despegue-titulo">Preparando tu universo</p>
          <p className="cos-despegue-paso">
            {/* La clave hace que cada mensaje entre por sí mismo. */}
            <span key={paso}>{PASOS[paso]}</span>
          </p>
        </div>

        <div
          className="cos-despegue-barra"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(avance)}
          aria-label="Progreso de la carga"
        >
          <i style={{ width: `${avance}%` }} />
        </div>

        <p className="cos-despegue-pie">Laboratorios MIDUHO</p>
      </div>
    </div>
  );
}

/*
  La nave. Dibujada aquí y no tomada de una librería de iconos porque es
  el personaje del momento, no un símbolo de interfaz: lleva la ventana
  por la que se asoma el mundo al que vas, y una llama que late.
*/
function Nave() {
  return (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="nave-casco" x1="30%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="52%" stopColor="#dce9fb" />
          <stop offset="100%" stopColor="#9db6d6" />
        </linearGradient>
        <linearGradient id="nave-aleta" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff9a4d" />
          <stop offset="100%" stopColor="#e2562a" />
        </linearGradient>
        <radialGradient id="nave-ojo" cx="36%" cy="30%" r="72%">
          <stop offset="0%" stopColor="#b9f0ff" />
          <stop offset="58%" stopColor="#3fa8dc" />
          <stop offset="100%" stopColor="#14567f" />
        </radialGradient>
        <linearGradient id="nave-llama" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#fff3b0" />
          <stop offset="46%" stopColor="#ffc23d" />
          <stop offset="100%" stopColor="#ff6a2b" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Llama: dos lenguas desfasadas, la interior más corta y clara. */}
      <g className="cos-despegue-llama">
        <path
          className="cos-despegue-llama-ext"
          d="M60 84 q11 15 0 30 q-11-15 0-30 Z"
          fill="url(#nave-llama)"
          opacity=".95"
        />
        <path
          className="cos-despegue-llama-int"
          d="M60 84 q6 9 0 18 q-6-9 0-18 Z"
          fill="#fff6cf"
          opacity=".9"
        />
      </g>

      {/* Aletas */}
      <path d="M44 62 q-16 8-17 26 q12-3 20-12 Z" fill="url(#nave-aleta)" />
      <path d="M76 62 q16 8 17 26 q-12-3-20-12 Z" fill="url(#nave-aleta)" />

      {/* Casco */}
      <path
        d="M60 10 q19 18 19 45 q0 18-5 29 h-28 q-5-11-5-29 q0-27 19-45 Z"
        fill="url(#nave-casco)"
      />
      {/* Sombra del costado: le da volumen de cilindro. */}
      <path
        d="M69 16 q10 17 10 39 q0 18-5 29 h-6 q5-11 5-29 q0-24-9-39 Z"
        fill="#7e9ac0"
        opacity=".38"
      />

      {/* Ventana: por aquí se asoma el mundo al que vas. */}
      <circle cx="60" cy="44" r="14" fill="#20365c" />
      <circle cx="60" cy="44" r="11" fill="url(#nave-ojo)" />
      <circle cx="55" cy="39" r="3.6" fill="#ffffff" opacity=".78" />
      <circle cx="60" cy="44" r="14" fill="none" stroke="#ffffff" strokeWidth="3" />

      {/* Banda inferior */}
      <path d="M46 74 h28 q-1 6-2 10 h-24 q-1-4-2-10 Z" fill="#e2562a" />
    </svg>
  );
}
