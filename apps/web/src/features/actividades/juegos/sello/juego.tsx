"use client";

import { ArrowRight, Check, X } from "lucide-react";
import type { CSSProperties } from "react";
import { Avanzar, Aviso, useFocoAlCambiar, type PropsJuego } from "../../reproductor/comun";
import rp from "../../reproductor/reproductor.module.css";
import { Armi, Controles, Guirnalda, type Pose } from "../comun/piezas";
import { useRondas } from "../comun/rondas";
import e from "../comun/escena.module.css";
import { Figura } from "./figura";
import type { Afirmacion, ContenidoSello } from "./tipo";
import s from "./sello.module.css";

/*
  EL SELLO DE LA VERDAD — verdadero o falso con sello de caucho. Juego 4 de
  Matemáticas de 5.° (cuadrado y cubo) y molde para los demás temas V/F.
  Se estampa una sola vez: la explicación y la figura enseñan después.
*/

const ESCENAS: Record<ContenidoSello["escena"], CSSProperties> = {
  bodega: { "--fondo": "url(/images/juegos/sello/bodega.webp)", "--fondo-pos": "center 45%", "--fondo-color": "#ead7b8" } as CSSProperties,
  panaderia: { "--fondo": "url(/images/juegos/sello/panaderia.webp)", "--fondo-pos": "center 45%", "--fondo-color": "#f1dcc0" } as CSSProperties,
};

export function JuegoSello({ contenido, alTerminar }: PropsJuego<ContenidoSello>) {
  const { indice, ronda: a, intentos, estados, acerto, cerrada, ultima, responder, siguiente, voz, sonido } = useRondas<Afirmacion, 0 | 1>({
    rondas: contenido.afirmaciones,
    correcta: (x) => (x.verdadera ? 1 : 0),
    alTerminar: (r) => alTerminar(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v === 1]))),
    maxIntentos: 1,
  });
  const titulo = useFocoAlCambiar<HTMLHeadingElement>(indice);
  const elegido = intentos[0];
  const pose: Pose = !cerrada ? "sello" : acerto ? "celebra" : "piensa";

  return (
    <div className={e.juego}>
      <div className={e.barra}>
        <Guirnalda estados={estados} actual={indice} />
        <Controles voz={voz} sonido={sonido} texto={`${a.texto} ¿Es verdadero o falso?`} />
      </div>

      <div className={e.escena} style={ESCENAS[contenido.escena]}>
        <div className={e.fondo} aria-hidden="true" />
        <div className={s.letrero} key={a.id}>
          <div className={s.contenido} data-figura={a.figura ? "" : undefined}>
            <p className={s.afirmacion}>{a.texto}</p>
            {a.figura && <Figura figura={a.figura} />}
          </div>
          {elegido !== undefined && (
            <span className={s.estampa} data-valor={elegido ? "v" : "f"} aria-hidden="true">
              {elegido ? "Verdadero" : "Falso"}
            </span>
          )}
        </div>
        <div className={e.armi}>
          <Armi pose={pose} />
        </div>
      </div>

      <h2 ref={titulo} tabIndex={-1} className={e.pregunta}>
        ¿Lo que dice el letrero es verdadero o falso?
      </h2>

      <div className={s.sellos} role="group" aria-label="Estampa tu respuesta">
        <button type="button" className={s.boton} data-valor="v" aria-pressed={cerrada ? elegido === 1 : undefined} disabled={cerrada} onClick={() => responder(1)}>
          <Check size={26} strokeWidth={3.2} aria-hidden="true" />
          Verdadero
        </button>
        <button type="button" className={s.boton} data-valor="f" aria-pressed={cerrada ? elegido === 0 : undefined} disabled={cerrada} onClick={() => responder(0)}>
          <X size={26} strokeWidth={3.2} aria-hidden="true" />
          Falso
        </button>
      </div>

      <Aviso tono={cerrada ? (acerto ? "ok" : "no") : null}>
        {cerrada && `${acerto ? "¡Bien sellado! " : `Era ${a.verdadera ? "verdadero" : "falso"}. `}${a.explicacion}`}
      </Aviso>

      {cerrada && (
        <div className={rp.acciones}>
          <Avanzar onClick={siguiente}>
            {ultima ? "Ver resultado" : "Siguiente letrero"}
            <ArrowRight size={20} strokeWidth={2.8} aria-hidden="true" />
          </Avanzar>
        </div>
      )}
    </div>
  );
}
