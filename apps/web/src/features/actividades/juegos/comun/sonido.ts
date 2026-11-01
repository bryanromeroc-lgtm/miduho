"use client";

import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";

/*
  Efectos de sonido sintetizados con Web Audio: no hay archivos de audio que
  cargar. Suaves y cortos; el error es un tono grave y amable, nunca un
  zumbido de castigo. La preferencia se recuerda en este navegador.
*/

export type Efecto = "acierto" | "error" | "fin" | "toque";

const LLAVE = "miduho:juegos:sonido";

// [frecuencia Hz, inicio s, duración s, forma, volumen]
const NOTAS: Record<Efecto, [number, number, number, OscillatorType, number][]> = {
  acierto: [
    [659.25, 0, 0.14, "triangle", 0.22],
    [987.77, 0.09, 0.22, "triangle", 0.2],
    [1318.5, 0.18, 0.18, "sine", 0.08],
  ],
  error: [
    [311.13, 0, 0.16, "sine", 0.2],
    [246.94, 0.13, 0.24, "sine", 0.18],
  ],
  fin: [
    [523.25, 0, 0.16, "triangle", 0.2],
    [659.25, 0.12, 0.16, "triangle", 0.2],
    [783.99, 0.24, 0.16, "triangle", 0.2],
    [1046.5, 0.36, 0.42, "triangle", 0.22],
  ],
  toque: [[880, 0, 0.05, "sine", 0.06]],
};

// Preferencia como almacén externo: el servidor la da por encendida y el cliente lee su navegador sin desajuste de hidratación.
const oyentes = new Set<() => void>();
let enMemoria: boolean | null = null;

function leerPreferencia(): boolean {
  if (enMemoria !== null) return enMemoria;
  try {
    return window.localStorage.getItem(LLAVE) !== "0";
  } catch {
    return true;
  }
}

function guardarPreferencia(activo: boolean) {
  enMemoria = activo;
  try {
    window.localStorage.setItem(LLAVE, activo ? "1" : "0");
  } catch {
    /* sin almacenamiento: la preferencia dura esta visita */
  }
  oyentes.forEach((o) => o());
}

function suscribir(oyente: () => void) {
  oyentes.add(oyente);
  return () => oyentes.delete(oyente);
}

export function useSonido() {
  const activo = useSyncExternalStore(suscribir, leerPreferencia, () => true);
  const ctx = useRef<AudioContext | null>(null);

  useEffect(
    () => () => {
      ctx.current?.close().catch(() => {});
    },
    [],
  );

  const alternar = useCallback(() => guardarPreferencia(!leerPreferencia()), []);

  const tocar = useCallback(
    (efecto: Efecto) => {
      if (!activo || typeof window === "undefined" || !("AudioContext" in window)) return;
      ctx.current ??= new AudioContext();
      const c = ctx.current;
      if (c.state === "suspended") c.resume().catch(() => {});
      const t0 = c.currentTime + 0.01;
      for (const [f, inicio, dur, forma, vol] of NOTAS[efecto]) {
        const o = c.createOscillator();
        const g = c.createGain();
        o.type = forma;
        o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t0 + inicio);
        g.gain.exponentialRampToValueAtTime(vol, t0 + inicio + 0.015);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + inicio + dur);
        o.connect(g).connect(c.destination);
        o.start(t0 + inicio);
        o.stop(t0 + inicio + dur + 0.02);
      }
    },
    [activo],
  );

  return { activo, alternar, tocar };
}
