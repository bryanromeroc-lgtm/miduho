"use client";

import { Check, RotateCcw, Volume2, VolumeX, Headphones, Square } from "lucide-react";
import Image from "next/image";
import s from "./comun.module.css";

/*
  Piezas que comparten los juegos de Matemáticas: Armi (la guía de la
  materia) en sus poses, la guirnalda de rondas y los controles de voz y
  sonido. Armi es decorativo: lo que dice siempre está escrito al lado.
*/

export type Pose = "senala" | "celebra" | "piensa" | "lapiz" | "sello";

const POSES: Record<Pose, { ancho: number; alto: number }> = {
  senala: { ancho: 509, alto: 560 },
  celebra: { ancho: 592, alto: 560 },
  piensa: { ancho: 465, alto: 560 },
  lapiz: { ancho: 391, alto: 560 },
  sello: { ancho: 595, alto: 560 },
};

export function Armi({ pose, className }: { pose: Pose; className?: string }) {
  const { ancho, alto } = POSES[pose];
  return (
    <Image
      key={pose}
      src={`/images/juegos/armi/${pose}.webp`}
      alt=""
      aria-hidden="true"
      width={ancho}
      height={alto}
      sizes="(max-width: 600px) 30vw, 220px"
      className={`${s.armi} ${className ?? ""}`}
      data-pose={pose}
      draggable={false}
    />
  );
}

export type EstadoRonda = "pendiente" | "bien" | "corregida";

/** Guirnalda de banderines: una por ronda. Bien = chulo; corregida = flecha de nuevo intento. Nunca solo color. */
export function Guirnalda({ estados, actual }: { estados: EstadoRonda[]; actual: number }) {
  const hechas = estados.filter((e) => e !== "pendiente").length;
  return (
    <div className={s.guirnalda}>
      <p className={s.guirnaldaTexto}>
        Ronda {Math.min(actual + 1, estados.length)} de {estados.length}
      </p>
      <ol className={s.banderines} aria-label={`${hechas} de ${estados.length} rondas hechas`}>
        {estados.map((e, i) => (
          <li key={i} data-estado={e} data-actual={i === actual ? "" : undefined} aria-hidden="true">
            <svg className={s.bandera} viewBox="0 0 40 46">
              <path d="M2 2 H38 V26 L20 44 L2 26 Z" />
            </svg>
            {e === "bien" && <Check size={16} strokeWidth={3.4} />}
            {e === "corregida" && <RotateCcw size={14} strokeWidth={3.2} />}
          </li>
        ))}
      </ol>
    </div>
  );
}

type Voz = { disponible: boolean; hablando: boolean; hablar: (t: string) => void; callar: () => void };
type Sonido = { activo: boolean; alternar: () => void };

/** Escuchar (si el navegador tiene voz en español) y encender o apagar los efectos. */
export function Controles({ voz, sonido, texto }: { voz: Voz; sonido: Sonido; texto: string }) {
  return (
    <div className={s.controles}>
      {voz.disponible && (
        <button type="button" className={s.control} onClick={() => (voz.hablando ? voz.callar() : voz.hablar(texto))}>
          {voz.hablando ? <Square size={18} strokeWidth={2.8} aria-hidden="true" /> : <Headphones size={20} strokeWidth={2.6} aria-hidden="true" />}
          {voz.hablando ? "Detener" : "Escuchar"}
        </button>
      )}
      <button type="button" className={s.control} aria-pressed={sonido.activo} onClick={sonido.alternar}>
        {sonido.activo ? <Volume2 size={20} strokeWidth={2.6} aria-hidden="true" /> : <VolumeX size={20} strokeWidth={2.6} aria-hidden="true" />}
        <span>Efectos</span>
        <span className={s.solo}>{sonido.activo ? "encendidos" : "apagados"}</span>
      </button>
    </div>
  );
}
