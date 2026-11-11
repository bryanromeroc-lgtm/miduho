"use client";

import { Volume2 } from "lucide-react";
import { createContext, useContext, useEffect, useRef, useSyncExternalStore } from "react";
import { useVozTarea } from "./voz";
import s from "./escuchar.module.css";

/*
  ESCUCHAR (juegos-primero, tareas 2.4–2.5). El reproductor da el grado por
  `ContextoActividad`; cada juego pone «Escuchar» junto a lo que hay que leer.
  En 1.° la consigna de cada ítem se lee sola una vez, si «Leer en voz alta»
  está en sí. La preferencia queda en este navegador (try/catch: sin
  almacenamiento dura la visita).
*/

export const ContextoActividad = createContext<{ grado: number }>({ grado: 0 });

const LLAVE = "miduho:juegos:leer-en-voz-alta";
const oyentes = new Set<() => void>();
let enMemoria: boolean | null = null;

function leer(): boolean {
  if (enMemoria !== null) return enMemoria;
  try {
    return window.localStorage.getItem(LLAVE) !== "0";
  } catch {
    return true;
  }
}
function guardar(v: boolean) {
  enMemoria = v;
  try {
    window.localStorage.setItem(LLAVE, v ? "1" : "0");
  } catch {
    /* sin almacenamiento */
  }
  oyentes.forEach((o) => o());
}
function suscribir(o: () => void) {
  oyentes.add(o);
  return () => oyentes.delete(o);
}

export function useLeerEnVozAlta() {
  const activo = useSyncExternalStore(suscribir, leer, () => true);
  return { activo, alternar: () => guardar(!leer()) };
}

/** Voz de la tarea con el grado de la actividad. */
export function useVozActividad() {
  const { grado } = useContext(ContextoActividad);
  return { grado, ...useVozTarea(grado) };
}

/** Botón «Escuchar»: dice `texto` (con su grabación si la hay). No aparece si no hay qué decir. */
export function Escuchar({ texto, audio, etiqueta = "Escuchar", soloIcono = false }: { texto: string; audio?: string | null; etiqueta?: string; soloIcono?: boolean }) {
  const { decir, hablando, puede } = useVozActividad();
  if (!puede(audio)) return null;
  return (
    <button
      type="button"
      className={`${s.escuchar} ${soloIcono ? s.soloIcono : ""}`}
      data-hablando={hablando ? "" : undefined}
      aria-label={`${etiqueta}: ${texto}`}
      onClick={() => decir(texto, audio)}
    >
      <Volume2 className={s.icono} size={22} strokeWidth={2.6} aria-hidden="true" />
      {!soloIcono && <span aria-hidden="true">{etiqueta}</span>}
    </button>
  );
}

/** Control «Leer en voz alta: sí/no». Solo se muestra donde hay lectura automática (1.°). */
export function LeerEnVozAlta() {
  const { grado } = useContext(ContextoActividad);
  const { activo, alternar } = useLeerEnVozAlta();
  if (grado !== 1) return null;
  return (
    <button type="button" className={s.alternar} aria-pressed={activo} onClick={alternar}>
      <Volume2 size={20} strokeWidth={2.6} aria-hidden="true" />
      Leer en voz alta: {activo ? "sí" : "no"}
    </button>
  );
}

/** En 1.°, lee `texto` una vez por `clave` (ítem) si la preferencia está en sí. */
export function useLecturaAutomatica(clave: string, texto: string, audio?: string | null) {
  const { grado, decir, puede } = useVozActividad();
  const { activo } = useLeerEnVozAlta();
  const leidas = useRef(new Set<string>());
  useEffect(() => {
    if (grado !== 1 || !activo || leidas.current.has(clave) || !puede(audio)) return;
    leidas.current.add(clave);
    decir(texto, audio);
  }, [grado, activo, clave, texto, audio, decir, puede]);
}
