"use client";

import { ArrowRight } from "lucide-react";
import type { CSSProperties } from "react";
import { Avanzar, Aviso, useFocoAlCambiar, type PropsJuego } from "../../reproductor/comun";
import rp from "../../reproductor/reproductor.module.css";
import { Armi, Controles, Guirnalda, type Pose } from "../comun/piezas";
import { useRondas } from "../comun/rondas";
import e from "../comun/escena.module.css";
import { fila, objetivo, type ContenidoMultiplos, type RondaMultiplos } from "./tipo";
import s from "./multiplos.module.css";

/*
  LA TERMINAL DE CHIVAS (MCM) y EL CULTIVO DE FLORES (MCD) — juegos 10 y 11
  de Matemáticas de 5.°. Dos filas de fichas: múltiplos (cuándo sale cada
  chiva) o divisores (en cuántos ramos iguales se pueden repartir). Se toca
  el número que se repite: el menor (MCM) o el mayor (MCD). Al fallar, Armi
  marca los que sí se repiten y hay un segundo intento.
*/

const ESCENAS: Record<ContenidoMultiplos["escena"], CSSProperties> = {
  terminal: { "--fondo": "url(/images/juegos/multiplos/terminal.webp)", "--fondo-pos": "center 40%", "--fondo-color": "#cfe7f2" } as CSSProperties,
  flores: { "--fondo": "url(/images/juegos/multiplos/flores.webp)", "--fondo-pos": "center 45%", "--fondo-color": "#e7f0e0" } as CSSProperties,
};

export function JuegoMultiplos({ contenido, alTerminar }: PropsJuego<ContenidoMultiplos>) {
  const { modo, filas } = contenido;
  const { indice, ronda: r, solucion, intentos, estados, acerto, cerrada, conPista, ultima, pose, responder, siguiente, voz, sonido } = useRondas<RondaMultiplos, number>({
    rondas: contenido.rondas,
    correcta: (x) => objetivo(modo, x),
    alTerminar,
  });
  const titulo = useFocoAlCambiar<HTMLHeadingElement>(indice);
  const filaA = fila(modo, r.a, r.b);
  const filaB = fila(modo, r.b, r.a);
  const comunes = new Set(filaA.filter((x) => filaB.includes(x)));
  const pregunta =
    modo === "mcm" ? "¿Cuál es el primer minuto en que salen juntas? Toca el menor número que está en las dos filas." : "¿Cuántos ramos iguales, como máximo? Toca el mayor número que está en las dos filas.";

  return (
    <div className={e.juego}>
      <div className={e.barra}>
        <Guirnalda estados={estados} actual={indice} />
        <Controles voz={voz} sonido={sonido} texto={`${r.contexto} ${pregunta}`} />
      </div>

      <div className={e.escena} style={ESCENAS[contenido.escena]}>
        <div className={e.fondo} aria-hidden="true" />
        <div className={s.tablero} key={r.id}>
          {[
            { nombre: filas[0], n: r.a, lista: filaA, tono: "a" },
            { nombre: filas[1], n: r.b, lista: filaB, tono: "b" },
          ].map((f) => (
            <div key={f.tono} className={s.fila} data-tono={f.tono} role="group" aria-label={`${f.nombre}: ${modo === "mcm" ? `múltiplos de ${f.n}` : `divisores de ${f.n}`}`}>
              <p className={s.nombre}>
                {f.nombre}
                <span>{modo === "mcm" ? `cada ${f.n} min` : `${f.n} flores`}</span>
              </p>
              <div className={s.fichas}>
                {f.lista.map((x) => {
                  const elegida = intentos.includes(x);
                  const estado = cerrada && x === solucion ? "ok" : elegida ? "no" : undefined;
                  return (
                    <button
                      key={x}
                      type="button"
                      className={s.ficha}
                      data-estado={estado}
                      data-comun={(conPista || cerrada) && comunes.has(x) ? "" : undefined}
                      disabled={cerrada || elegida}
                      onClick={() => responder(x)}
                    >
                      {x}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div className={e.armi}>
          <Armi pose={pose as Pose} />
        </div>
      </div>

      <p className={s.contexto}>{r.contexto}</p>
      <h2 ref={titulo} tabIndex={-1} className={e.pregunta}>
        {pregunta}
      </h2>

      <Aviso tono={intentos.length === 0 ? null : acerto ? "ok" : cerrada ? "no" : "neutro"}>{mensaje(modo, r, solucion, intentos, comunes, acerto, cerrada)}</Aviso>

      {cerrada && (
        <div className={rp.acciones}>
          <Avanzar onClick={siguiente}>
            {ultima ? "Ver resultado" : "Siguiente"}
            <ArrowRight size={20} strokeWidth={2.8} aria-hidden="true" />
          </Avanzar>
        </div>
      )}
    </div>
  );
}

function mensaje(modo: "mcm" | "mcd", r: RondaMultiplos, sol: number, intentos: number[], comunes: Set<number>, acerto: boolean, cerrada: boolean) {
  const ultimo = intentos.at(-1);
  if (ultimo === undefined) return "";
  const sigla = modo === "mcm" ? "m.c.m." : "m.c.d.";
  if (acerto) return `${intentos.length === 1 ? "¡Eso es!" : "¡Ahora sí!"} El ${sigla} de ${r.a} y ${r.b} es ${sol}.`;
  if (!cerrada) {
    const lista = [...comunes].join(", ");
    if (!comunes.has(ultimo)) return `El ${ultimo} no está en las dos filas. Armi marcó los que se repiten: ${lista}.`;
    return modo === "mcm"
      ? `El ${ultimo} sí se repite, pero hay uno menor. Los que se repiten son: ${lista}.`
      : `El ${ultimo} sí se repite, pero hay uno mayor. Los que se repiten son: ${lista}.`;
  }
  return `Era ${sol}: es el ${modo === "mcm" ? "menor" : "mayor"} número que está en las dos filas.`;
}
