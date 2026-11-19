"use client";

import { useCallback, useEffect, useRef } from "react";
import { useSonido } from "../comun/sonido";

/*
  Efectos CC0 (ver public/audio/juegos/golpea/LICENCIAS.md) tocados con Web
  Audio: se decodifican una vez y se programan al milisegundo, para que el
  golpe suene justo cuando el mazo toca al topo. Respetan el mismo botón de
  efectos que el resto de juegos (preferencia de useSonido).
*/

export type EfectoGolpea = "golpe" | "golpecito" | "acierto" | "error" | "aparecer";

const ARCHIVOS: Record<EfectoGolpea, string> = {
  golpe: "/audio/juegos/golpea/golpe.mp3",
  golpecito: "/audio/juegos/golpea/golpecito.mp3",
  acierto: "/audio/juegos/golpea/acierto.mp3",
  error: "/audio/juegos/golpea/error.mp3",
  aparecer: "/audio/juegos/golpea/aparecer.mp3",
};

const VOLUMEN: Record<EfectoGolpea, number> = { golpe: 0.8, golpecito: 0.55, acierto: 0.6, error: 0.45, aparecer: 0.3 };

export function useEfectosGolpea() {
  const { activo, alternar } = useSonido();
  const ctx = useRef<AudioContext | null>(null);
  const buferes = useRef<Partial<Record<EfectoGolpea, AudioBuffer>>>({});

  /** Se llama desde un gesto (botón «Jugar»): crea el contexto y carga los archivos. */
  const preparar = useCallback(() => {
    if (typeof window === "undefined" || !("AudioContext" in window)) return;
    ctx.current ??= new AudioContext();
    const c = ctx.current;
    if (c.state === "suspended") c.resume().catch(() => {});
    for (const [efecto, ruta] of Object.entries(ARCHIVOS) as [EfectoGolpea, string][]) {
      if (buferes.current[efecto]) continue;
      fetch(ruta)
        .then((r) => r.arrayBuffer())
        .then((datos) => c.decodeAudioData(datos))
        .then((b) => { buferes.current[efecto] = b; })
        .catch(() => { /* sin el archivo, el juego sigue en silencio */ });
    }
  }, []);

  const tocar = useCallback(
    (efecto: EfectoGolpea, retrasoMs = 0) => {
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
