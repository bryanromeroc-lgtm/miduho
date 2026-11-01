"use client";

import { useRef, useState, type RefObject } from "react";
import type { EstadoRonda } from "./piezas";
import { useSonido } from "./sonido";
import { useVoz } from "./voz";

/*
  Flujo de los juegos donde se escriben números en casillas (teclado en
  pantalla o físico): cuenta la primera comprobación; si falla, se borran
  solo las casillas equivocadas y hay un segundo intento con pista; al
  segundo fallo se muestra la solución. Cada casilla vale un punto.
*/
export function useCasillas<R extends { id: string }, C extends string>({
  rondas,
  campos,
  solucion,
  alTerminar,
  maxCifras = 6,
}: {
  rondas: R[];
  campos: readonly C[];
  solucion: (r: R) => Record<C, number>;
  alTerminar: (respuestas: Record<string, unknown>) => void;
  maxCifras?: number;
}) {
  const vacio = () => Object.fromEntries(campos.map((c) => [c, ""])) as Record<C, string>;
  const [indice, setIndice] = useState(0);
  const [valores, setValores] = useState<Record<C, string>>(vacio);
  const [activo, setActivo] = useState<C>(campos[0]);
  const [intentos, setIntentos] = useState<Record<C, number>[]>([]);
  const [respuestas, setRespuestas] = useState<Record<string, Record<C, number>>>({});
  const [estados, setEstados] = useState<EstadoRonda[]>(() => rondas.map(() => "pendiente"));
  const refs = useRef({} as Record<C, HTMLInputElement | null>);
  const voz = useVoz();
  const sonido = useSonido();

  const ronda = rondas[indice];
  const sol = solucion(ronda);
  const ultimo = intentos.at(-1);
  const bien = (c: C) => ultimo?.[c] === sol[c];
  const acerto = Boolean(ultimo) && campos.every(bien);
  const cerrada = acerto || intentos.length >= 2;
  const ultima = indice === rondas.length - 1;
  const listo = campos.every((c) => valores[c] !== "");

  function escribir(campo: C, texto: string) {
    if (cerrada) return;
    setValores((v) => ({ ...v, [campo]: texto.replace(/\D/g, "").slice(0, maxCifras) }));
  }

  function comprobar() {
    if (cerrada || !listo) return;
    voz.callar();
    const r = Object.fromEntries(campos.map((c) => [c, Number(valores[c])])) as Record<C, number>;
    const nuevos = [...intentos, r];
    setIntentos(nuevos);
    if (nuevos.length === 1) setRespuestas((x) => ({ ...x, [ronda.id]: r }));
    const todoBien = campos.every((c) => r[c] === sol[c]);
    sonido.tocar(todoBien ? "acierto" : "error");
    if (todoBien || nuevos.length >= 2) {
      setEstados((es) => es.map((v, k) => (k === indice ? (nuevos.length === 1 && todoBien ? "bien" : "corregida") : v)));
      if (!todoBien) setValores(Object.fromEntries(campos.map((c) => [c, String(sol[c])])) as Record<C, string>);
    } else {
      const corregir = campos.find((c) => r[c] !== sol[c])!;
      setValores((v) => Object.fromEntries(campos.map((c) => [c, r[c] === sol[c] ? v[c] : ""])) as Record<C, string>);
      setActivo(corregir);
      requestAnimationFrame(() => refs.current[corregir]?.focus());
    }
  }

  function siguiente() {
    voz.callar();
    if (ultima) {
      sonido.tocar("fin");
      alTerminar(respuestas);
      return;
    }
    setIndice((i) => i + 1);
    setIntentos([]);
    setValores(vacio());
    setActivo(campos[0]);
  }

  /** Estado visible de una casilla: neutra mientras se corrige. */
  function estado(c: C): "ok" | "no" | undefined {
    if (!ultimo) return undefined;
    if (cerrada || bien(c)) return "ok";
    return valores[c] === "" ? "no" : undefined;
  }

  /** Props para una casilla <input>. */
  function casilla(c: C) {
    return {
      ref: (el: HTMLInputElement | null) => {
        refs.current[c] = el;
      },
      value: valores[c],
      inputMode: "none" as const,
      autoComplete: "off",
      readOnly: cerrada,
      "aria-invalid": estado(c) === "no" || undefined,
      "data-activo": activo === c && !cerrada ? "" : undefined,
      "data-estado": estado(c),
      onFocus: () => setActivo(c),
      onChange: (ev: React.ChangeEvent<HTMLInputElement>) => escribir(c, ev.target.value),
      onKeyDown: (ev: React.KeyboardEvent) => ev.key === "Enter" && comprobar(),
    };
  }

  const teclado = {
    onDigito: (d: string) => escribir(activo, valores[activo] + d),
    onBorrar: () => escribir(activo, valores[activo].slice(0, -1)),
  };

  return { indice, ronda, sol, valores, intentos, ultimo, bien, acerto, cerrada, ultima, listo, estados, comprobar, siguiente, estado, casilla, teclado, voz, sonido };
}

export type RefCasilla = RefObject<HTMLInputElement | null>;
