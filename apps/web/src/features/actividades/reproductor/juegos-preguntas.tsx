"use client";

import { Timer } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { barajar } from "../tipos/contrato";
import type { Frase, Pregunta } from "../tipos/preguntas";
import { Avanzar, Aviso, Marca, Progreso, useFocoAlCambiar, type PropsJuego } from "./comun";
import s from "./reproductor.module.css";

/*
  Quiz y concurso: una pregunta a la vez. Al tocar una opción se ve de una
  vez si acertó, cuál era la correcta y por qué; la primera respuesta es la
  que cuenta. El concurso añade un reloj que anima pero nunca corta.
*/
function Preguntas({ contenido, semilla, alTerminar, segundos }: PropsJuego<{ preguntas: Pregunta[] }> & { segundos?: number }) {
  const [indice, setIndice] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, number>>({});
  const p = contenido.preguntas[indice];
  const elegida = respuestas[p.id];
  const respondida = elegida !== undefined;
  const orden = useMemo(
    () =>
      barajar(
        p.opciones.map((_, i) => i),
        `${semilla}:${p.id}`,
      ),
    [p, semilla],
  );
  const ultima = indice === contenido.preguntas.length - 1;
  const titulo = useFocoAlCambiar<HTMLHeadingElement>(indice);

  return (
    <div className={s.juego}>
      <div className={s.juegoCabeza}>
        <Progreso actual={indice + 1} total={contenido.preguntas.length} />
        {segundos && <Reloj key={p.id} segundos={segundos} detenido={respondida} />}
      </div>
      <h2 ref={titulo} tabIndex={-1} className={s.enunciado}>
        {p.enunciado}
      </h2>
      <div className={s.opciones} data-dos={p.opciones.length === 2 ? "" : undefined}>
        {orden.map((i) => {
          const estado = respondida ? (i === p.correcta ? "ok" : i === elegida ? "no" : undefined) : undefined;
          return (
            <button
              key={i}
              type="button"
              className={s.opcion}
              data-estado={estado}
              aria-pressed={respondida ? i === elegida : undefined}
              disabled={respondida}
              onClick={() => setRespuestas((r) => ({ ...r, [p.id]: i }))}
            >
              <span>{p.opciones[i]}</span>
              <Marca estado={estado} />
            </button>
          );
        })}
      </div>
      <Aviso tono={respondida ? (elegida === p.correcta ? "ok" : "no") : null}>
        {respondida &&
          (elegida === p.correcta ? "¡Correcto!" : `La respuesta es «${p.opciones[p.correcta]}».`) +
            (p.explicacion ? ` ${p.explicacion}` : "")}
      </Aviso>
      {respondida && (
        <div className={s.acciones}>
          <Avanzar onClick={() => (ultima ? alTerminar(respuestas) : setIndice(indice + 1))}>
            {ultima ? "Ver resultado" : "Siguiente"}
          </Avanzar>
        </div>
      )}
    </div>
  );
}

/** Reloj del concurso: cuenta hacia atrás y, al llegar a cero, avisa que igual se puede responder. */
function Reloj({ segundos, detenido }: { segundos: number; detenido: boolean }) {
  const [quedan, setQuedan] = useState(segundos);
  useEffect(() => {
    if (detenido || quedan <= 0) return;
    const t = setTimeout(() => setQuedan((q) => q - 1), 1000);
    return () => clearTimeout(t);
  }, [quedan, detenido]);
  return (
    <span className={s.reloj} data-fin={quedan <= 0 ? "" : undefined}>
      <Timer size={20} strokeWidth={2.6} aria-hidden="true" />
      <span className={s.relojBarra} aria-hidden="true">
        <span style={{ width: `${(quedan / segundos) * 100}%` }} />
      </span>
      {/* El conteo no se anuncia cada segundo; solo el fin del tiempo. */}
      <span aria-hidden={quedan > 0}>{quedan > 0 ? `${quedan} s` : "¡Tiempo! Igual puedes responder"}</span>
    </span>
  );
}

export function Quiz(props: PropsJuego<{ preguntas: Pregunta[] }>) {
  return <Preguntas {...props} />;
}

export function Concurso(props: PropsJuego<{ segundos: number; preguntas: Pregunta[] }>) {
  return <Preguntas {...props} segundos={props.contenido.segundos} />;
}

/** Completar: la frase con su hueco y el banco de palabras; el hueco se llena con lo elegido. */
export function Completar({ contenido, semilla, alTerminar }: PropsJuego<{ frases: Frase[] }>) {
  const [indice, setIndice] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const f = contenido.frases[indice];
  const elegida = respuestas[f.id];
  const respondida = elegida !== undefined;
  const acierto = elegida === f.correcta;
  const opciones = useMemo(() => barajar(f.opciones, `${semilla}:${f.id}`), [f, semilla]);
  const ultima = indice === contenido.frases.length - 1;
  const titulo = useFocoAlCambiar<HTMLHeadingElement>(indice);

  return (
    <div className={s.juego}>
      <Progreso actual={indice + 1} total={contenido.frases.length} nombre="Frase" />
      <h2 ref={titulo} tabIndex={-1} className={s.enunciado}>
        {f.antes}{" "}
        <span className={s.hueco} data-estado={respondida ? (acierto ? "ok" : "no") : undefined}>
          {respondida ? elegida : <span className={s.solo}>espacio en blanco</span>}
        </span>
        {/^[.,;:!?]/.test(f.despues) ? "" : " "}
        {f.despues}
      </h2>
      <div className={s.banco} role="group" aria-label="Banco de palabras">
        {opciones.map((o) => {
          const estado = respondida ? (o === f.correcta ? "ok" : o === elegida ? "no" : undefined) : undefined;
          return (
            <button
              key={o}
              type="button"
              className={s.ficha}
              data-estado={estado}
              disabled={respondida}
              onClick={() => setRespuestas((r) => ({ ...r, [f.id]: o }))}
            >
              {o}
              <Marca estado={estado} />
            </button>
          );
        })}
      </div>
      <Aviso tono={respondida ? (acierto ? "ok" : "no") : null}>
        {respondida && (acierto ? "¡Correcto!" : `La palabra es «${f.correcta}».`) + (f.explicacion ? ` ${f.explicacion}` : "")}
      </Aviso>
      {respondida && (
        <div className={s.acciones}>
          <Avanzar onClick={() => (ultima ? alTerminar(respuestas) : setIndice(indice + 1))}>
            {ultima ? "Ver resultado" : "Siguiente"}
          </Avanzar>
        </div>
      )}
    </div>
  );
}
