"use client";

import { useCallback, useEffect, useRef } from "react";
import { useSonido } from "./sonido";

/*
  Efectos grabados (archivos MP3) con Web Audio: se decodifican una vez y
  suenan sin retraso, también varios a la vez. Respetan la misma preferencia
  «Sonidos: sí/no» que los efectos sintetizados. Cada efecto puede tener
  variantes que se turnan (levantar-1, levantar-2…), como en la referencia.
*/
export function useEfectosGrabados<N extends string>(rutas: Record<N, string[]>) {
  const { activo, alternar } = useSonido();
  const ctx = useRef<AudioContext | null>(null);
  const buferes = useRef(new Map<string, Promise<AudioBuffer | null>>());
  const turno = useRef<Partial<Record<N, number>>>({});

  useEffect(
    () => () => {
      ctx.current?.close().catch(() => {});
    },
    [],
  );

  /** Crea el contexto y descarga todo. Llamarla dentro de un gesto del usuario (desbloquea el audio). */
  const preparar = useCallback(() => {
    if (typeof window === "undefined" || !("AudioContext" in window)) return null;
    ctx.current ??= new AudioContext();
    const c = ctx.current;
    if (c.state === "suspended") c.resume().catch(() => {});
    for (const url of Object.values<string[]>(rutas).flat()) {
      if (!buferes.current.has(url))
        buferes.current.set(
          url,
          fetch(url)
            .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(url))))
            .then((b) => c.decodeAudioData(b))
            .catch(() => null),
        );
    }
    return c;
  }, [rutas]);

  const tocar = useCallback(
    (nombre: N, volumen = 0.9) => {
      if (!activo) return;
      const c = preparar();
      const lista = rutas[nombre];
      if (!c || !lista?.length) return;
      const i = ((turno.current[nombre] ?? -1) + 1) % lista.length;
      turno.current[nombre] = i;
      void buferes.current.get(lista[i])?.then((b) => {
        if (!b) return;
        const fuente = c.createBufferSource();
        const g = c.createGain();
        g.gain.value = volumen;
        fuente.buffer = b;
        fuente.connect(g).connect(c.destination);
        fuente.start();
      });
    },
    [activo, preparar, rutas],
  );

  return { activo, alternar, preparar, tocar };
}
