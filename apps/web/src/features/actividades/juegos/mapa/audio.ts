"use client";

import { useCallback, useEffect, useRef } from "react";
import { useSonido } from "../comun/sonido";

/*
  Efectos CC0 (ver public/audio/juegos/mapa/LICENCIAS.md) tocados con Web
  Audio: se decodifican una vez y se programan al milisegundo, para que la
  chincheta suene justo cuando se clava. Respetan el mismo botón de efectos
  que el resto de juegos (preferencia de useSonido).
*/

export type EfectoMapa = "lanzar" | "clavar" | "toque" | "acierto" | "error" | "aparecer";

const ARCHIVOS: Record<EfectoMapa, string> = {
  lanzar: "/audio/juegos/mapa/lanzar.mp3",
  clavar: "/audio/juegos/mapa/clavar.mp3",
  toque: "/audio/juegos/mapa/toque.mp3",
  acierto: "/audio/juegos/mapa/acierto.mp3",
  error: "/audio/juegos/mapa/error.mp3",
  aparecer: "/audio/juegos/mapa/aparecer.mp3",
};

const VOLUMEN: Record<EfectoMapa, number> = { lanzar: 0.45, clavar: 0.8, toque: 0.5, acierto: 0.6, error: 0.4, aparecer: 0.3 };

export function useEfectosMapa() {
  const { activo, alternar } = useSonido();
  const ctx = useRef<AudioContext | null>(null);
  const buferes = useRef<Partial<Record<EfectoMapa, AudioBuffer>>>({});

  /** Se llama desde un gesto (botón «Jugar»): crea el contexto y carga los archivos. */
  const preparar = useCallback(() => {
    if (typeof window === "undefined" || !("AudioContext" in window)) return;
    ctx.current ??= new AudioContext();
    const c = ctx.current;
    if (c.state === "suspended") c.resume().catch(() => {});
    for (const [efecto, ruta] of Object.entries(ARCHIVOS) as [EfectoMapa, string][]) {
      if (buferes.current[efecto]) continue;
      fetch(ruta)
        .then((r) => r.arrayBuffer())
        .then((datos) => c.decodeAudioData(datos))
        .then((b) => { buferes.current[efecto] = b; })
        .catch(() => { /* sin el archivo, el juego sigue en silencio */ });
    }
  }, []);

  const tocar = useCallback(
    (efecto: EfectoMapa, retrasoMs = 0) => {
      const c = ctx.current;
      const bufer = buferes.current[efecto];
      if (!activo || !c || !bufer) return;
      const fuente = c.createBufferSource();
      const ganancia = c.createGain();
      fuente.buffer = bufer;
      ganancia.gain.value = VOLUMEN[efecto];
      fuente.connect(ganancia).connect(c.destination);
      fuente.start(c.currentTime + retrasoMs / 1000);
    },
    [activo],
  );

  useEffect(() => () => { ctx.current?.close().catch(() => {}); }, []);

  return { activo, alternar, preparar, tocar };
}
