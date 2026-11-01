"use client";

import { ArrowRight } from "lucide-react";
import { useMemo } from "react";
import { formatearNumero, numeroEnLetras, periodosEnLetras, POSICIONES, POSICIONES_CORTAS, cifraEn } from "@/lib/numeros";
import { barajar } from "../../tipos/contrato";
import { Avanzar, Aviso, Marca, useFocoAlCambiar, type PropsJuego } from "../../reproductor/comun";
import { Armi, Controles, Guirnalda } from "../comun/piezas";
import { useRondas } from "../comun/rondas";
import { preguntaDe, respuestaCorrecta, type ContenidoPancarta, type RondaPancarta } from "./tipo";
import rp from "../../reproductor/reproductor.module.css";
import e from "../comun/escena.module.css";
import s from "./pancarta.module.css";

/*
  LA PANCARTA DE LAS FIESTAS — juego 1 de Matemáticas de 5.°.
  Armi está en la plaza del pueblo y cada pancarta trae un número grande.
  Error que enseña: el primer fallo cuenta para la nota, pero no cierra la
  ronda: Armi muestra los periodos (o las posiciones) y se vuelve a intentar.
  Al segundo fallo se muestra la respuesta y se sigue.
*/

const NOMBRE_PERIODO = { millones: "Millones", miles: "Miles", unidades: "Unidades" } as const;

export function JuegoPancarta({ contenido, semilla, alTerminar }: PropsJuego<ContenidoPancarta>) {
  const { indice, ronda: r, solucion: correcta, intentos, estados, acerto, cerrada, conPista, ultima, pose, responder, siguiente, voz, sonido } =
    useRondas({ rondas: contenido.rondas, correcta: respuestaCorrecta, alTerminar });
  const titulo = useFocoAlCambiar<HTMLHeadingElement>(indice);

  const opciones = useMemo(
    () => (r.modo === "posicion" ? [] : barajar([r.numero, ...r.distractores], `${semilla}:${r.id}`)),
    [r, semilla],
  );

  // Lo que lee la voz: en «cifras» no se lee el número, porque leerlo es la respuesta.
  const textoVoz = r.modo === "letras" ? `La pancarta dice: ${numeroEnLetras(r.numero)}. ${preguntaDe(r)}` : preguntaDe(r);

  return (
    <div className={e.juego}>
      <div className={e.barra}>
        <Guirnalda estados={estados} actual={indice} />
        <Controles voz={voz} sonido={sonido} texto={textoVoz} />
      </div>

      <div className={e.escena} style={{ "--fondo": "url(/images/juegos/pancarta/plaza.webp)", "--fondo-pos": "center 72%" } as React.CSSProperties}>
        <div className={e.fondo} aria-hidden="true" />
        <div className={s.pancarta} key={r.id} data-modo={r.modo}>
          <Tela ronda={r} intentos={intentos} cerrada={cerrada} conPista={conPista} responder={responder} />
        </div>
        <div className={e.armi}>
          <Armi pose={pose} />
        </div>
      </div>

      <h2 ref={titulo} tabIndex={-1} className={e.pregunta}>
        {preguntaDe(r)}
      </h2>

      {r.modo !== "posicion" && (
        <div className={`${rp.opciones} ${e.opciones}`} data-largas={r.modo === "cifras" ? "" : undefined}>
          {opciones.map((n) => {
            const elegida = intentos.includes(n);
            const estado = n === correcta && (acerto || cerrada) ? "ok" : elegida ? "no" : undefined;
            return (
              <button
                key={n}
                type="button"
                className={`${rp.opcion} ${e.opcion}`}
                data-estado={estado}
                disabled={cerrada || elegida}
                onClick={() => responder(n)}
              >
                <span>{r.modo === "letras" ? formatearNumero(n) : numeroEnLetras(n)}</span>
                <Marca estado={estado} />
              </button>
            );
          })}
        </div>
      )}

      <Aviso tono={intentos.length === 0 ? null : acerto ? "ok" : cerrada ? "no" : "neutro"}>
        {mensaje(r, intentos, acerto, cerrada)}
      </Aviso>

      {conPista && !cerrada && r.modo !== "posicion" && <Pista ronda={r} />}

      {cerrada && (
        <div className={rp.acciones}>
          <Avanzar onClick={siguiente}>
            {ultima ? "Ver resultado" : "Siguiente pancarta"}
            <ArrowRight size={20} strokeWidth={2.8} aria-hidden="true" />
          </Avanzar>
        </div>
      )}
    </div>
  );
}

function mensaje(r: RondaPancarta, intentos: number[], acerto: boolean, cerrada: boolean): string {
  if (intentos.length === 0) return "";
  if (acerto) {
    if (r.modo === "posicion") {
      return `¡Eso es! En las ${POSICIONES[r.posicion]} está el ${cifraEn(r.numero, r.posicion)}.`;
    }
    return intentos.length === 1 ? "¡Eso es! Leíste bien la pancarta." : "¡Ahora sí! Ya lo encontraste.";
  }
  if (!cerrada) {
    return r.modo === "posicion"
      ? "Casi. Armi puso el nombre de cada posición debajo de las cifras: cuenta desde la derecha y vuelve a intentarlo."
      : "Casi. Mira cómo Armi partió el número por periodos y vuelve a intentarlo.";
  }
  if (r.modo === "posicion") return `Era el ${cifraEn(r.numero, r.posicion)}: está en las ${POSICIONES[r.posicion]}.`;
  return r.modo === "letras"
    ? `La pancarta dice ${formatearNumero(r.numero)}.`
    : `Se lee «${numeroEnLetras(r.numero)}».`;
}

/** Lo que va escrito en la tela, según el modo. En «posicion» las cifras son botones. */
function Tela({
  ronda: r,
  intentos,
  cerrada,
  conPista,
  responder,
}: {
  ronda: RondaPancarta;
  intentos: number[];
  cerrada: boolean;
  conPista: boolean;
  responder: (v: number) => void;
}) {
  if (r.modo === "letras") return <p className={s.letras}>{numeroEnLetras(r.numero)}</p>;
  if (r.modo === "cifras") return <p className={s.cifras}>{formatearNumero(r.numero)}</p>;

  const cifras = String(r.numero).split("");
  const total = cifras.length;
  return (
    <div className={s.tablero} role="group" aria-label={`Cifras de ${formatearNumero(r.numero)}`}>
      {cifras.map((c, i) => {
        const pos = total - 1 - i;
        const elegida = intentos.includes(pos);
        const estado = pos === r.posicion && (cerrada || intentos.at(-1) === pos) ? "ok" : elegida ? "no" : undefined;
        return (
          <span key={i} className={s.casilla} data-grupo={pos % 3 === 0 && pos > 0 ? "" : undefined}>
            <button
              type="button"
              className={s.cifra}
              data-estado={estado}
              disabled={cerrada || elegida}
              aria-label={`${c}, cifra ${i + 1} de ${total}`}
              onClick={() => responder(pos)}
            >
              {c}
            </button>
            {(conPista || cerrada) && (
              <abbr className={s.rotulo} title={POSICIONES[pos]}>
                {POSICIONES_CORTAS[pos]}
              </abbr>
            )}
          </span>
        );
      })}
    </div>
  );
}

/** Pista: el número de la pancarta partido por periodos (sin dar las cifras en «letras»). */
function Pista({ ronda: r }: { ronda: RondaPancarta }) {
  const periodos = periodosEnLetras(r.numero);
  return (
    <section className={e.pista} aria-label="Pista de Armi">
      <p className={e.pistaTitulo}>Pista de Armi: cada periodo tiene tres cifras.</p>
      <dl className={e.periodos}>
        {periodos.map((p) => (
          <div key={p.periodo} className={e.periodo}>
            <dt>{NOMBRE_PERIODO[p.periodo]}</dt>
            <dd>{r.modo === "letras" ? p.texto : `${p.cifras} ${p.periodo === "millones" ? (p.cifras === 1 ? "millón" : "millones") : p.periodo === "miles" ? "mil" : ""}`.trim()}</dd>
          </div>
        ))}
      </dl>
      <p className={e.pistaNota}>Si un periodo no aparece, sus tres cifras son ceros: 000.</p>
    </section>
  );
}
