"use client";

import { ArrowRight } from "lucide-react";
import { useMemo, useState, type CSSProperties } from "react";
import { barajar } from "../../tipos/contrato";
import { Avanzar, Aviso, useFocoAlCambiar, type PropsJuego } from "../../reproductor/comun";
import rp from "../../reproductor/reproductor.module.css";
import { Armi, Controles, Guirnalda } from "../comun/piezas";
import { useRondas } from "../comun/rondas";
import { Teclado } from "../comun/teclado";
import e from "../comun/escena.module.css";
import { Bisectriz, Transportador } from "./figura";
import { candidatos, correcta, type ContenidoAngulos, type RondaAngulos } from "./tipo";
import s from "./angulos.module.css";

/*
  EL MES DE LAS COMETAS — juego 14 de Matemáticas de 5.° (medida y
  bisectriz de un ángulo). Armi arma cometas y necesita sus ángulos.
  «Medir»: el transportador ya está puesto; se escribe la medida. La pista
  resalta la escala que empieza en 0 sobre el primer lado. «Bisectriz»:
  se toca el rayo que parte el ángulo en dos iguales.
*/

const ESCENA = { "--fondo": "url(/images/juegos/angulos/cometas.webp)", "--fondo-pos": "center 40%", "--fondo-color": "#cfe6f7" } as CSSProperties;

export function JuegoAngulos({ contenido, semilla, alTerminar }: PropsJuego<ContenidoAngulos>) {
  const { indice, ronda: r, intentos, estados, acerto, cerrada, conPista, ultima, pose, responder, siguiente, voz, sonido } = useRondas<RondaAngulos, number>({
    rondas: contenido.rondas,
    correcta,
    alTerminar,
  });
  const [texto, setTexto] = useState("");
  const titulo = useFocoAlCambiar<HTMLHeadingElement>(indice);
  const rayos = useMemo(
    () => (r.modo === "bisectriz" ? barajar(candidatos(r.angulo), `${semilla}:${r.id}`).map((g, i) => ({ grados: g, letra: String.fromCharCode(65 + i) })) : []),
    [r, semilla],
  );
  const pregunta = r.modo === "medir" ? "¿Cuántos grados mide el ángulo de la cometa?" : "¿Cuál rayo es la bisectriz del ángulo?";

  function medir() {
    if (texto === "") return;
    responder(Number(texto));
    setTexto("");
  }

  function avanzar() {
    setTexto("");
    siguiente();
  }

  const resaltar = r.modo === "medir" && (conPista || cerrada) ? (r.desde === "derecha" ? "afuera" : "adentro") : null;

  return (
    <div className={e.juego}>
      <div className={e.barra}>
        <Guirnalda estados={estados} actual={indice} />
        <Controles voz={voz} sonido={sonido} texto={pregunta} />
      </div>

      <div className={e.escena} style={ESCENA}>
        <div className={e.fondo} aria-hidden="true" />
        <div className={s.panel} key={r.id}>
          {r.modo === "medir" ? (
            <Transportador angulo={r.angulo} desde={r.desde} resaltar={resaltar} />
          ) : (
            <Bisectriz
              angulo={r.angulo}
              rayos={rayos}
              elegir={(g) => responder(g)}
              estados={Object.fromEntries(rayos.map(({ grados }) => [grados, cerrada && grados === r.angulo / 2 ? "ok" : intentos.includes(grados) ? "no" : undefined]))}
              deshabilitado={(g) => cerrada || intentos.includes(g)}
            />
          )}
          {r.modo === "medir" && (
            <p className={s.lectura}>
              <span>El ángulo mide</span>
              <input
                className={s.entrada}
                value={cerrada ? String(r.angulo) : texto}
                inputMode="none"
                autoComplete="off"
                readOnly={cerrada}
                data-estado={cerrada ? (acerto ? "ok" : "no") : undefined}
                aria-label="Grados que mide el ángulo"
                onChange={(ev) => setTexto(ev.target.value.replace(/\D/g, "").slice(0, 3))}
                onKeyDown={(ev) => ev.key === "Enter" && medir()}
              />
              <span>grados</span>
            </p>
          )}
        </div>
        <div className={e.armi}>
          <Armi pose={pose} />
        </div>
      </div>

      <h2 ref={titulo} tabIndex={-1} className={e.pregunta}>
        {pregunta}
      </h2>

      {r.modo === "medir" && !cerrada && (
        <div className={s.mando}>
          <Teclado onDigito={(d) => setTexto((t) => (t + d).slice(0, 3))} onBorrar={() => setTexto((t) => t.slice(0, -1))} />
          <button type="button" className={rp.principal} disabled={texto === ""} onClick={medir}>
            Comprobar
          </button>
        </div>
      )}

      <Aviso tono={intentos.length === 0 ? null : acerto ? "ok" : cerrada ? "no" : "neutro"}>{mensaje(r, intentos, acerto, cerrada)}</Aviso>

      {cerrada && (
        <div className={rp.acciones}>
          <Avanzar onClick={avanzar}>
            {ultima ? "Ver resultado" : "Siguiente cometa"}
            <ArrowRight size={20} strokeWidth={2.8} aria-hidden="true" />
          </Avanzar>
        </div>
      )}
    </div>
  );
}

function mensaje(r: RondaAngulos, intentos: number[], acerto: boolean, cerrada: boolean) {
  const ultimo = intentos.at(-1);
  if (ultimo === undefined) return "";
  if (r.modo === "medir") {
    if (acerto) return `${intentos.length === 1 ? "¡Bien medido!" : "¡Ahora sí!"} El ángulo mide ${r.angulo}°.`;
    const escala = r.desde === "derecha" ? "la de afuera" : "la de adentro";
    if (!cerrada) {
      if (ultimo === 180 - r.angulo) return `Leíste la otra escala. Cuenta desde el 0 que está sobre el primer lado: aquí es ${escala}, que Armi resaltó.`;
      return `Todavía no. Usa la escala que empieza en 0 sobre el primer lado (${escala}) y mira dónde cae el otro lado.`;
    }
    return `Mide ${r.angulo}°: se lee en ${escala}, que empieza en 0 sobre el primer lado.`;
  }
  if (acerto) return `${intentos.length === 1 ? "¡Eso es!" : "¡Ahora sí!"} La bisectriz parte los ${r.angulo}° en dos ángulos de ${r.angulo / 2}°.`;
  if (!cerrada) return `Ese rayo deja un lado más grande que el otro. La bisectriz deja dos ángulos iguales, de ${r.angulo / 2}° cada uno.`;
  return `La bisectriz es el rayo que deja dos ángulos de ${r.angulo / 2}°.`;
}
