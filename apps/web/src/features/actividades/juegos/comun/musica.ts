"use client";

import { useEffect, useRef, useState } from "react";
import { useBajarMusicaConVoz } from "./voz";

export function musicaDebeSonar(ruta: string | undefined, enJuego: boolean, activa: boolean, visible: boolean) {
  return Boolean(ruta && enJuego && activa && visible);
}

/** Pista opcional de un juego: bucle bajo, voz prioritaria y pausa al ocultar. */
export function useMusicaJuego(ruta: string | undefined, enJuego: boolean) {
  const musica = useRef<HTMLAudioElement>(null);
  const [musicaActiva, setMusicaActiva] = useState(true);
  useBajarMusicaConVoz(musica);

  useEffect(() => {
    if (!ruta || !musica.current) return;
    musica.current.volume = 0.2;
  }, [ruta]);

  useEffect(() => {
    if (!ruta || !musica.current) return;
    if (musicaDebeSonar(ruta, enJuego, musicaActiva, !document.hidden)) void musica.current.play().catch(() => setMusicaActiva(false));
    else musica.current.pause();
  }, [ruta, enJuego, musicaActiva]);

  useEffect(() => {
    if (!ruta) return;
    const visibilidad = () => {
      if (!musica.current) return;
      if (musicaDebeSonar(ruta, enJuego, musicaActiva, !document.hidden)) void musica.current.play().catch(() => setMusicaActiva(false));
      else musica.current.pause();
    };
    document.addEventListener("visibilitychange", visibilidad);
    return () => document.removeEventListener("visibilitychange", visibilidad);
  }, [ruta, enJuego, musicaActiva]);

  useEffect(() => () => { musica.current?.pause(); }, []);
  return { musica, musicaActiva, setMusicaActiva };
}
