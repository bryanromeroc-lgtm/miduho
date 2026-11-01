"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useMemo, type CSSProperties } from "react";
import { cifrasDecimal, decimalEnLetras, formatearDecimal, nombrePosicion, nombrePosicionCorto, partesDecimal } from "@/lib/numeros";
import { barajar } from "../../tipos/contrato";
import { Avanzar, Aviso, Marca, useFocoAlCambiar, type PropsJuego } from "../../reproductor/comun";
import rp from "../../reproductor/reproductor.module.css";
import { Armi, Controles, Guirnalda } from "../comun/piezas";
import { useRondas } from "../comun/rondas";
import e from "../comun/escena.module.css";
import { preguntaDe, respuestaCorrecta, type ContenidoPizarra, type RondaPizarra } from "./tipo";
import s from "./pizarra.module.css";

/*
  LA PIZARRA DEL MERCADO — juego 2 de Matemáticas de 5.° (decimales).
  En la plaza de mercado, Armi escribe en la pizarra del puesto cuánto pesa
  cada fruta. Misma regla que la pancarta: cuenta el primer intento, la
  pista enseña y se reintenta una vez.
*/

const UNIDAD_DECIMAL = ["", "décimas", "centésimas", "milésimas"] as const;

const ESCENA = { "--fondo": "url(/images/juegos/pizarra/mercado.webp)", "--fondo-pos": "center 60%", "--fondo-color": "#f6dfb5" } as CSSProperties;

export function JuegoPizarra({ contenido, semilla, alTerminar }: PropsJuego<ContenidoPizarra>) {
  const { indice, ronda: r, solucion, intentos, estados, acerto, cerrada, conPista, ultima, pose, responder, siguiente, voz, sonido } =
    useRondas<RondaPizarra, string | number>({ rondas: contenido.rondas, correcta: respuestaCorrecta, alTerminar });
  const titulo = useFocoAlCambiar<HTMLHeadingElement>(indice);
  const opciones = useMemo(
    () => (r.modo === "posicion" ? [] : barajar([r.numero, ...r.distractores], `${semilla}:${r.id}`)),
    [r, semilla],
  );
  const textoVoz = r.modo === "letras" ? `La pizarra dice: ${decimalEnLetras(r.numero)}. ${preguntaDe(r)}` : preguntaDe(r);

  return (
    <div className={e.juego}>
      <div className={e.barra}>
        <Guirnalda estados={estados} actual={indice} />
        <Controles voz={voz} sonido={sonido} texto={textoVoz} />
      </div>

      <div className={e.escena} style={ESCENA}>
        <div className={e.fondo} aria-hidden="true" />
        <div className={s.pizarra} key={r.id}>
          {r.modo === "letras" && <p className={s.letras}>{decimalEnLetras(r.numero)}</p>}
          {r.modo === "cifras" && <p className={s.cifras}>{formatearDecimal(r.numero)}</p>}
          {r.modo === "posicion" && <Cifras ronda={r} intentos={intentos} cerrada={cerrada} conPista={conPista} responder={responder} />}
        </div>
        <div className={s.suelo}>
          <div className={e.armi}>
            <Armi pose={pose} />
          </div>
          <Image src="/images/juegos/pizarra/bascula.webp" alt="" aria-hidden="true" width={533} height={420} className={s.bascula} sizes="200px" />
        </div>
      </div>

      <h2 ref={titulo} tabIndex={-1} className={e.pregunta}>
        {preguntaDe(r)}
      </h2>

      {r.modo !== "posicion" && (
        <div className={`${rp.opciones} ${e.opciones}`} data-largas={r.modo === "cifras" ? "" : undefined}>
          {opciones.map((n) => {
            const elegida = intentos.includes(n);
            const estado = n === solucion && cerrada ? "ok" : elegida ? "no" : undefined;
            return (
              <button key={n} type="button" className={`${rp.opcion} ${e.opcion}`} data-estado={estado} disabled={cerrada || elegida} onClick={() => responder(n)}>
                <span>{r.modo === "letras" ? formatearDecimal(n) : decimalEnLetras(n)}</span>
                <Marca estado={estado} />
              </button>
            );
          })}
        </div>
      )}

      <Aviso tono={intentos.length === 0 ? null : acerto ? "ok" : cerrada ? "no" : "neutro"}>{mensaje(r, intentos.length, acerto, cerrada)}</Aviso>

      {conPista && !cerrada && r.modo !== "posicion" && <Pista ronda={r} />}

      {cerrada && (
        <div className={rp.acciones}>
          <Avanzar onClick={siguiente}>
            {ultima ? "Ver resultado" : "Siguiente pizarra"}
            <ArrowRight size={20} strokeWidth={2.8} aria-hidden="true" />
          </Avanzar>
        </div>
      )}
    </div>
  );
}

function mensaje(r: RondaPizarra, intentos: number, acerto: boolean, cerrada: boolean): string {
  if (intentos === 0) return "";
  if (acerto) {
    if (r.modo === "posicion") return `¡Eso es! Esa cifra está en las ${nombrePosicion(r.posicion)}.`;
    return intentos === 1 ? "¡Eso es! Leíste bien la pizarra." : "¡Ahora sí! Ya lo encontraste.";
  }
  if (!cerrada) {
    return r.modo === "posicion"
      ? "Casi. Armi escribió el nombre de cada posición: después de la coma vienen décimas, centésimas y milésimas."
      : "Casi. Fíjate en cuántas cifras van después de la coma y vuelve a intentarlo.";
  }
  if (r.modo === "posicion") {
    const cifra = cifrasDecimal(r.numero).find((c) => c.posicion === r.posicion)!.cifra;
    return `Era el ${cifra}: está en las ${nombrePosicion(r.posicion)}.`;
  }
  return r.modo === "letras" ? `La pizarra dice ${formatearDecimal(r.numero)}.` : `Se lee «${decimalEnLetras(r.numero)}».`;
}

function Cifras({
  ronda: r,
  intentos,
  cerrada,
  conPista,
  responder,
}: {
  ronda: Extract<RondaPizarra, { modo: "posicion" }>;
  intentos: (string | number)[];
  cerrada: boolean;
  conPista: boolean;
  responder: (v: number) => void;
}) {
  const cifras = cifrasDecimal(r.numero);
  return (
    <div className={s.tablero} role="group" aria-label={`Cifras de ${formatearDecimal(r.numero)}`}>
      {cifras.map(({ cifra, posicion }, i) => {
        const elegida = intentos.includes(posicion);
        const estado = posicion === r.posicion && cerrada ? "ok" : elegida ? "no" : undefined;
        return (
          <span key={i} className={s.casilla} data-coma={posicion === 0 ? "" : undefined} data-miles={posicion > 0 && posicion % 3 === 0 ? "" : undefined}>
            <button
              type="button"
              className={s.cifra}
              data-estado={estado}
              disabled={cerrada || elegida}
              aria-label={`${cifra}, cifra ${i + 1} de ${cifras.length}`}
              onClick={() => responder(posicion)}
            >
              {cifra}
            </button>
            {(conPista || cerrada) && (
              <abbr className={s.rotulo} title={nombrePosicion(posicion)}>
                {nombrePosicionCorto(posicion)}
              </abbr>
            )}
          </span>
        );
      })}
    </div>
  );
}

/** Pista: la parte entera y la decimal por separado; el nombre de la última unidad dice cuántas cifras van después de la coma. */
function Pista({ ronda: r }: { ronda: Exclude<RondaPizarra, { modo: "posicion" }> }) {
  const { entero, decimales } = partesDecimal(r.numero);
  const lectura = decimalEnLetras(r.numero);
  const [parteEntera, parteDecimal] = lectura.includes(" con ") ? lectura.split(" con ") : ["cero enteros", lectura];
  const unidad = UNIDAD_DECIMAL[decimales.length];
  return (
    <section className={e.pista} aria-label="Pista de Armi">
      <p className={e.pistaTitulo}>Pista de Armi: décimas, 1 cifra después de la coma; centésimas, 2; milésimas, 3.</p>
      <dl className={e.periodos}>
        <div className={e.periodo}>
          <dt>Parte entera</dt>
          <dd>{r.modo === "letras" ? parteEntera : `${entero}`}</dd>
        </div>
        <div className={e.periodo}>
          <dt>Parte decimal</dt>
          <dd>{r.modo === "letras" ? parteDecimal : `${decimales.length} ${decimales.length === 1 ? "cifra" : "cifras"} después de la coma: ${unidad}`}</dd>
        </div>
      </dl>
      {r.modo === "letras" && <p className={e.pistaNota}>Si faltan cifras para llegar a la unidad que se nombra, se completan con ceros después de la coma.</p>}
    </section>
  );
}
