"use client";

import { useCallback, useEffect, useRef } from "react";
import { useSonido } from "../comun/sonido";
import { rutaVoz } from "./palabras";

/*
  Efectos CC0 (ver public/audio/juegos/ruta-palabras/LICENCIAS.md) tocados con
  Web Audio: se decodifican una vez y se programan al milisegundo para que el
  golpe suene justo cuando Armi llega al cartel. Respetan el botón de efectos.

  La VOZ de cada palabra es la tarea misma: va aparte, con un elemento de
  audio, y no se apaga con el botón de efectos.
*/

export type EfectoRuta = "golpe" | "golpecito" | "acierto" | "error" | "aparecer";

const ARCHIVOS: Record<EfectoRuta, string> = {
  golpe: "/audio/juegos/ruta-palabras/golpe.mp3",
  golpecito: "/audio/juegos/ruta-palabras/golpecito.mp3",
  acierto: "/audio/juegos/ruta-palabras/acierto.mp3",
  error: "/audio/juegos/ruta-palabras/error.mp3",
  aparecer: "/audio/juegos/ruta-palabras/aparecer.mp3",
};

const VOLUMEN: Record<EfectoRuta, number> = { golpe: 0.8, golpecito: 0.55, acierto: 0.6, error: 0.45, aparecer: 0.3 };

export function useEfectosRuta() {
  const { activo, alternar } = useSonido();
  const ctx = useRef<AudioContext | null>(null);
  const buferes = useRef<Partial<Record<EfectoRuta, AudioBuffer>>>({});

  /** Se llama desde un gesto (botón «Jugar»): crea el contexto y carga los archivos. */
  const preparar = useCallback(() => {
    if (typeof window === "undefined" || !("AudioContext" in window)) return;
    ctx.current ??= new AudioContext();
    const c = ctx.current;
    if (c.state === "suspended") c.resume().catch(() => {});
    for (const [efecto, ruta] of Object.entries(ARCHIVOS) as [EfectoRuta, string][]) {
      if (buferes.current[efecto]) continue;
      fetch(ruta)
        .then((r) => r.arrayBuffer())
        .then((datos) => c.decodeAudioData(datos))
        .then((b) => { buferes.current[efecto] = b; })
        .catch(() => { /* sin el archivo, el juego sigue en silencio */ });
    }
  }, []);

  const tocar = useCallback(
    (efecto: EfectoRuta, retrasoMs = 0) => {
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

/** Dice una palabra con su grabación. Si el navegador no deja reproducir, el juego sigue con la palabra escrita. */
export function useVozPalabra() {
  const actual = useRef<HTMLAudioElement | null>(null);

  const hablar = useCallback((clave: string) => {
    if (typeof window === "undefined") return;
    actual.current?.pause();
    const audio = new Audio(rutaVoz(clave));
    actual.current = audio;
    void audio.play().catch(() => { /* sin permiso de audio: queda el botón «Escuchar» */ });
  }, []);

  const callar = useCallback(() => actual.current?.pause(), []);

  useEffect(() => () => actual.current?.pause(), []);

  return { hablar, callar };
}
