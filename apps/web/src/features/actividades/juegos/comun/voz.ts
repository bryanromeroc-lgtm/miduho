"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/*
  Voz de los juegos con la síntesis del navegador (Web Speech API). No hay voz
  grabada todavía 🔶: si el navegador no tiene una voz en español, el botón de
  escuchar no aparece y el juego sigue igual (todo está escrito).
*/

const PREFERIDAS = ["es-co", "es-419", "es-mx", "es-us", "es-"];

function elegirVoz(voces: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  for (const prefijo of PREFERIDAS) {
    const v = voces.find((x) => x.lang.toLowerCase().replace("_", "-").startsWith(prefijo));
    if (v) return v;
  }
  return undefined;
}

export function useVoz() {
  const [voz, setVoz] = useState<SpeechSynthesisVoice>();
  const [hablando, setHablando] = useState(false);
  const actual = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const s = window.speechSynthesis;
    const cargar = () => setVoz(elegirVoz(s.getVoices()));
    cargar();
    s.addEventListener("voiceschanged", cargar);
    return () => {
      s.removeEventListener("voiceschanged", cargar);
      s.cancel();
    };
  }, []);

  const callar = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setHablando(false);
  }, []);

  const hablar = useCallback(
    (texto: string) => {
      if (!voz) return;
      const s = window.speechSynthesis;
      s.cancel();
      const u = new SpeechSynthesisUtterance(texto);
      u.voice = voz;
      u.lang = voz.lang;
      u.rate = 0.92;
      u.onend = u.onerror = () => {
        if (actual.current === u) setHablando(false);
      };
      actual.current = u;
      setHablando(true);
      s.speak(u);
    },
    [voz],
  );

  return { disponible: Boolean(voz), hablando, hablar, callar };
}
