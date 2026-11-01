"use client";

import { Check, X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import s from "./reproductor.module.css";

/** Lo que recibe cada juego: su contenido, una semilla para barajar y a quién entregar las respuestas. */
export type PropsJuego<C> = {
  contenido: C;
  /** Cambia en cada partida: el orden barajado no se repite al jugar otra vez. */
  semilla: string;
  alTerminar: (respuestas: Record<string, unknown>) => void;
};

/** «Pregunta 3 de 8» con su barra; la barra es decorativa, el texto lo lee el lector de pantalla. */
export function Progreso({ actual, total, nombre = "Pregunta" }: { actual: number; total: number; nombre?: string }) {
  return (
    <div className={s.progreso}>
      <span className={s.progresoTexto}>
        {nombre} {Math.min(actual, total)} de {total}
      </span>
      <span className={s.progresoBarra} aria-hidden="true">
        <span style={{ width: `${(Math.min(actual, total) / total) * 100}%` }} />
      </span>
    </div>
  );
}

/**
 * Retroalimentación en palabras, con ícono: nunca solo con color. Vive en una
 * región `status` que existe desde el inicio para que el lector la anuncie.
 */
export function Aviso({ tono, children }: { tono: "ok" | "no" | "neutro" | null; children?: ReactNode }) {
  return (
    <p className={s.aviso} role="status" data-tono={tono ?? undefined}>
      {tono === "ok" && <Check size={22} strokeWidth={3} aria-hidden="true" />}
      {tono === "no" && <X size={22} strokeWidth={3} aria-hidden="true" />}
      {children}
    </p>
  );
}

/** Botón de avance («Siguiente», «Ver resultado»). Al aparecer recibe el foco para seguir con el teclado. */
export function Avanzar({ children, onClick, enfocar = true }: { children: ReactNode; onClick: () => void; enfocar?: boolean }) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (enfocar) ref.current?.focus({ preventScroll: false });
  }, [enfocar]);
  return (
    <button ref={ref} type="button" className={s.principal} onClick={onClick}>
      {children}
    </button>
  );
}

/** Marca del estado de una opción: ✓ correcta, ✗ elegida y equivocada. */
export function Marca({ estado }: { estado?: "ok" | "no" }) {
  if (estado === "ok") return <Check className={s.marcaIcono} size={22} strokeWidth={3} aria-hidden="true" />;
  if (estado === "no") return <X className={s.marcaIcono} size={22} strokeWidth={3} aria-hidden="true" />;
  return null;
}

/**
 * Lleva el foco al enunciado cuando cambia la pregunta (no al cargar): el
 * teclado sigue el juego. Compara con el valor anterior, no con «primera
 * vez», porque en desarrollo React ejecuta los efectos dos veces.
 */
export function useFocoAlCambiar<T extends HTMLElement>(valor: unknown) {
  const ref = useRef<T>(null);
  const previo = useRef(valor);
  useEffect(() => {
    if (Object.is(previo.current, valor)) return;
    previo.current = valor;
    ref.current?.focus();
  }, [valor]);
  return ref;
}
