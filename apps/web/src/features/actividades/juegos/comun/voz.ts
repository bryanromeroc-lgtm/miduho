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

/*
  VOZ DE LA TAREA (juegos-primero, decisión 8). Un solo canal para toda la
  página: al empezar una voz se calla la anterior. Primero la grabación citada
  en el contenido; si no hay o falla, la síntesis del navegador, pero solo en
  1.° y 2.° (los grados que aún no leen con soltura). Mientras habla se emite
  `miduho:voz` en `window` para que la música baje. La voz no depende de los
  interruptores de efectos ni de música.
*/

export type FuenteVoz = "grabacion" | "sintesis" | null;

/** Qué fuente usar. Lógica pura, probada en voz.test.ts. */
export function elegirFuente({
  audio,
  grado,
  sintesis,
  grabacionFallo = false,
}: {
  audio?: string | null;
  grado: number;
  sintesis: boolean;
  grabacionFallo?: boolean;
}): FuenteVoz {
  if (audio && !grabacionFallo) return "grabacion";
  if (sintesis && grado <= 2) return "sintesis";
  return null;
}

export const EVENTO_VOZ = "miduho:voz";

type Canal = { audio: HTMLAudioElement | null; frase: SpeechSynthesisUtterance | null; turno: number };
const canal: Canal = { audio: null, frase: null, turno: 0 };

function avisar(hablando: boolean) {
  window.dispatchEvent(new CustomEvent(EVENTO_VOZ, { detail: { hablando } }));
}

/** Calla cualquier voz de la tarea que esté sonando en la página. */
export function callarVozTarea() {
  if (typeof window === "undefined") return;
  canal.turno++;
  canal.audio?.pause();
  canal.audio = null;
  if (canal.frase && "speechSynthesis" in window) window.speechSynthesis.cancel();
  canal.frase = null;
  avisar(false);
}

export function useVozTarea(grado: number) {
  const [voz, setVoz] = useState<SpeechSynthesisVoice>();
  const [hablando, setHablando] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const s = window.speechSynthesis;
    const cargar = () => setVoz(elegirVoz(s.getVoices()));
    cargar();
    s.addEventListener("voiceschanged", cargar);
    return () => s.removeEventListener("voiceschanged", cargar);
  }, []);

  useEffect(() => () => callarVozTarea(), []);

  const sintetizar = useCallback(
    (texto: string, turno: number) => {
      if (!voz || turno !== canal.turno) return;
      const u = new SpeechSynthesisUtterance(texto);
      u.voice = voz;
      u.lang = voz.lang;
      u.rate = 0.9;
      u.onend = u.onerror = () => {
        if (canal.frase !== u) return;
        canal.frase = null;
        setHablando(false);
        avisar(false);
      };
      canal.frase = u;
      window.speechSynthesis.speak(u);
    },
    [voz],
  );

  const decir = useCallback(
    (texto: string, audio?: string | null) => {
      if (typeof window === "undefined") return;
      callarVozTarea();
      const turno = canal.turno;
      const fuente = elegirFuente({ audio, grado, sintesis: Boolean(voz) });
      if (!fuente) return;
      setHablando(true);
      avisar(true);
      const plan = (fallo: boolean) => {
        if (turno !== canal.turno) return;
        if (elegirFuente({ audio, grado, sintesis: Boolean(voz), grabacionFallo: fallo }) === "sintesis") sintetizar(texto, turno);
        else {
          setHablando(false);
          avisar(false);
        }
      };
      if (fuente === "sintesis") return sintetizar(texto, turno);
      const a = new Audio(audio!);
      canal.audio = a;
      a.onended = () => {
        if (canal.audio !== a) return;
        canal.audio = null;
        setHablando(false);
        avisar(false);
      };
      a.onerror = () => plan(true);
      void a.play().catch(() => plan(true));
    },
    [grado, voz, sintetizar],
  );

  const callar = useCallback(() => {
    callarVozTarea();
    setHablando(false);
  }, []);

  /** Hay algo que decir para este ítem (grabación o síntesis permitida). */
  const puede = useCallback((audio?: string | null) => elegirFuente({ audio, grado, sintesis: Boolean(voz) }) !== null, [grado, voz]);

  return { decir, callar, hablando, puede };
}

/** Baja la música a un cuarto mientras habla la voz de la tarea y la devuelve al terminar. */
export function useBajarMusicaConVoz(musica: { current: HTMLAudioElement | null }) {
  useEffect(() => {
    let antes: number | null = null;
    const oir = (ev: Event) => {
      const m = musica.current;
      if (!m) return;
      const { hablando } = (ev as CustomEvent<{ hablando: boolean }>).detail;
      if (hablando && antes === null) {
        antes = m.volume;
        m.volume = antes * 0.25;
      } else if (!hablando && antes !== null) {
        m.volume = antes;
        antes = null;
      }
    };
    window.addEventListener(EVENTO_VOZ, oir);
    return () => window.removeEventListener(EVENTO_VOZ, oir);
  }, [musica]);
}
