"use client";

import { ArrowRight } from "lucide-react";
import { useMemo, type CSSProperties } from "react";
import { barajar } from "../../tipos/contrato";
import { Avanzar, Aviso, Marca, useFocoAlCambiar, type PropsJuego } from "../../reproductor/comun";
import rp from "../../reproductor/reproductor.module.css";
import { Armi, Controles, Guirnalda } from "../comun/piezas";
import { useRondas } from "../comun/rondas";
import e from "../comun/escena.module.css";
import { FiguraRectas } from "./figura";
import { categoria, EXPLICACIONES, PREGUNTAS, type ContenidoRectas, type RondaRectas, type Tarjeta } from "./tipo";
import s from "./rectas.module.css";

/*
  LOS PLANOS DEL PUEBLO — juego 13 de Matemáticas de 5.° (posiciones
  relativas de rectas). Tres tarjetas del plano; se toca la que cumple. Al
  fallar, las rectas de la tarjeta elegida se prolongan (punteado) para ver
  si se cortan, y hay un segundo intento.
*/

const ESCENA = { "--fondo": "url(/images/juegos/rectas/pueblo.webp)", "--fondo-pos": "center 50%", "--fondo-color": "#d9ead2" } as CSSProperties;

function describir(t: Tarjeta, revelar: boolean): string {
  if (t.figura === "linea") return "Una línea";
  return revelar ? `Dos rectas ${t.relacion === "paralelas" ? "que no se cortan" : "que se cortan"}` : "Dos rectas";
}

export function JuegoRectas({ contenido, semilla, alTerminar }: PropsJuego<ContenidoRectas>) {
  const { indice, ronda: r, intentos, estados, acerto, cerrada, ultima, pose, responder, siguiente, voz, sonido } = useRondas<RondaRectas, number>({
    rondas: contenido.rondas,
    correcta: (x) => x.opciones.findIndex((t) => categoria(t) === x.busca),
    alTerminar,
  });
  const titulo = useFocoAlCambiar<HTMLHeadingElement>(indice);
  const orden = useMemo(() => barajar(r.opciones.map((_, i) => i), `${semilla}:${r.id}`), [r, semilla]);
  const pregunta = PREGUNTAS[r.busca];

  return (
    <div className={e.juego}>
      <div className={e.barra}>
        <Guirnalda estados={estados} actual={indice} />
        <Controles voz={voz} sonido={sonido} texto={pregunta} />
      </div>

      <div className={e.escena} style={ESCENA}>
        <div className={e.fondo} aria-hidden="true" />
        <div className={s.plano} key={r.id}>
          <h2 ref={titulo} tabIndex={-1} className={s.pregunta}>
            {pregunta}
          </h2>
          <div className={s.tarjetas} role="group" aria-label="Tarjetas del plano">
            {orden.map((i, pos) => {
              const t = r.opciones[i];
              const elegida = intentos.includes(i);
              const correcta = categoria(t) === r.busca;
              const estado = cerrada && correcta ? "ok" : elegida ? "no" : undefined;
              const revelar = elegida || (cerrada && correcta);
              return (
                <button
                  key={i}
                  type="button"
                  className={s.tarjeta}
                  data-estado={estado}
                  disabled={cerrada || elegida}
                  aria-label={`Tarjeta ${String.fromCharCode(65 + pos)}: ${describir(t, revelar)}`}
                  onClick={() => responder(i)}
                >
                  <span className={s.letra} aria-hidden="true">
                    {String.fromCharCode(65 + pos)}
                  </span>
                  <FiguraRectas tarjeta={t} revelar={revelar} />
                  <span className={s.marca}>
                    <Marca estado={estado} />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <div className={e.armi}>
          <Armi pose={pose} />
        </div>
      </div>

      <Aviso tono={intentos.length === 0 ? null : acerto ? "ok" : cerrada ? "no" : "neutro"}>{mensaje(r, intentos, acerto, cerrada)}</Aviso>

      {cerrada && (
        <div className={rp.acciones}>
          <Avanzar onClick={siguiente}>
            {ultima ? "Ver resultado" : "Siguiente plano"}
            <ArrowRight size={20} strokeWidth={2.8} aria-hidden="true" />
          </Avanzar>
        </div>
      )}
    </div>
  );
}

function mensaje(r: RondaRectas, intentos: number[], acerto: boolean, cerrada: boolean) {
  const ultimo = intentos.at(-1);
  if (ultimo === undefined) return "";
  if (acerto) return `${intentos.length === 1 ? "¡Eso es!" : "¡Ahora sí!"} ${EXPLICACIONES[r.busca]}`;
  const elegida = categoria(r.opciones[ultimo]);
  const queEra = `Esa tarjeta muestra ${elegida === "paralelas" || elegida === "perpendiculares" || elegida === "secantes" ? `rectas ${elegida}` : `un${elegida === "recta" || elegida === "semirrecta" ? "a" : ""} ${elegida}`}.`;
  if (!cerrada) return `${queEra} Armi la prolongó para que veas por qué. Prueba otra.`;
  return `${queEra} ${EXPLICACIONES[r.busca]}`;
}
