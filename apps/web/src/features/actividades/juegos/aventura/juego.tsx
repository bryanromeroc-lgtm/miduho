"use client";

import { ArrowRight, Check, X } from "lucide-react";
import { useState, type CSSProperties } from "react";
import { Avanzar, Aviso, useFocoAlCambiar, type PropsJuego } from "../../reproductor/comun";
import { Chispas, useReaccion } from "../comun/efectos";
import { Frac } from "../comun/fraccion";
import { Armi, Controles, Guirnalda, type Pose } from "../comun/piezas";
import { useRondas } from "../comun/rondas";
import { Objeto } from "./objetos";
import { Pantalla } from "./pantalla";
import { cargaRestante, OBJETOS, type ContenidoAventura, type EscenaAventura, type Lugar, type Muestra, type Visual } from "./tipo";
import s from "./aventura.module.css";

/*
  LA ENTREGA DE ARMI — historia por escenas con preguntas de selección
  múltiple. Armi lleva una carga y cada lugar del camino (con su propia
  ilustración) le plantea un problema. Responder bien entrega la carga y
  hace avanzar la historia; el error da una pista, un segundo intento y,
  si hace falta, la respuesta explicada: la historia nunca se detiene.
  Cuenta el primer intento de cada escena (patrón de useRondas).
*/

type Fase = "inicio" | "escena" | "final";

const ESCENARIOS: Record<Lugar, string> = {
  gallinero: "linear-gradient(180deg, #ffd9a8 0%, #cfe29a 100%)",
  tienda: "linear-gradient(160deg, #fdebc8 0%, #f6cf94 100%)",
  puente: "linear-gradient(180deg, #bfe3f7 0%, #e5c48f 100%)",
  panaderia: "linear-gradient(160deg, #f8e2c4 0%, #e8bd8a 100%)",
  mercado: "linear-gradient(180deg, #cfe8f5 0%, #ecd2a0 100%)",
  salon: "linear-gradient(160deg, #fbe3d0 0%, #efb9a0 100%)",
  plaza: "linear-gradient(180deg, #f6a77b 0%, #c98c8c 100%)",
};

/** Fondo ilustrado del lugar; si la imagen no carga, se ve el degradado. */
const fondoDe = (lugar: Lugar) => `url(/images/juegos/aventura/${lugar}.webp), ${ESCENARIOS[lugar]}`;

const LETRAS = ["A", "B", "C", "D"];

/** Lugares al aire libre: ahí pasan nubes. */
const EXTERIORES = new Set<Lugar>(["gallinero", "puente", "mercado"]);

export function JuegoAventura({ contenido, alTerminar }: PropsJuego<ContenidoAventura>) {
  const [fase, setFase] = useState<Fase>("inicio");
  const [pendientes, setPendientes] = useState<Record<string, unknown>>({});
  const fin = useReaccion();

  const r = useRondas<EscenaAventura, number>({
    rondas: contenido.escenas,
    correcta: (e) => e.correcta,
    alTerminar: (resp) => {
      setPendientes(resp);
      setFase("final");
      fin.disparar("acierto");
    },
  });

  const e = r.ronda;
  const objeto = OBJETOS[contenido.carga.objeto];
  const primeras = contenido.escenas.filter((x) => pendientes[x.id] === x.correcta).length;
  const titulo = useFocoAlCambiar<HTMLHeadingElement>(`${fase}-${r.indice}`);

  const hechas = fase === "inicio" ? 0 : fase === "final" ? contenido.escenas.length : r.indice + (r.cerrada ? 1 : 0);
  const carga = cargaRestante(contenido, hechas);
  const lugar: Lugar = fase === "inicio" ? contenido.escenas[0].lugar : fase === "final" ? contenido.escenas[contenido.escenas.length - 1].lugar : e.lugar;
  const entrego = fase === "escena" && r.cerrada && e.entrega > 0;
  const pose: Pose = fase === "escena" ? r.pose : fase === "final" ? "celebra" : "senala";

  const textoVoz =
    fase === "inicio" ? contenido.inicio : fase === "final" ? contenido.final : `${e.narracion} ${e.pregunta}`;

  return (
    <Pantalla
      escena={lugar}
      fondo={fondoDe(lugar)}
      barra={
        <>
          <Guirnalda estados={r.estados} actual={fase === "final" ? contenido.escenas.length : fase === "inicio" ? 0 : r.indice} />
          <Controles voz={r.voz} sonido={r.sonido} texto={textoVoz} />
          <Carreta objeto={objeto.plural} cantidad={carga} entrego={entrego ? e.entrega : 0} clave={`${r.indice}-${entrego}`} />
        </>
      }
    >
      <Chispas reaccion={fase === "final" ? fin.reaccion : r.reaccion} />
      <Ambiente nubes={EXTERIORES.has(lugar)} />

      <div className={s.escenario}>
        {fase === "inicio" && (
          <section className={s.pergamino} data-grande="" aria-labelledby="titulo-inicio">
            <h2 id="titulo-inicio" ref={titulo} tabIndex={-1} className={s.titulo}>
              El encargo de Armi
            </h2>
            <p className={s.relato}>{contenido.inicio}</p>
          </section>
        )}

        {fase === "escena" && (
          <>
            <section className={s.pergamino} key={e.id} aria-label={`Escena ${r.indice + 1}`}>
              <p className={s.relato}>{e.narracion}</p>
            </section>
            {e.visual && <Apoyo v={e.visual} partido={r.conPista || r.cerrada} clave={`${e.id}-${r.conPista || r.cerrada}`} />}
            {!e.visual && e.muestra && <Pila m={e.muestra} clave={e.id} />}
          </>
        )}

        {fase === "final" && (
          <section className={s.pergamino} data-grande="" aria-labelledby="titulo-final">
            <h2 id="titulo-final" ref={titulo} tabIndex={-1} className={s.titulo}>
              ¡Entrega completa!
            </h2>
            <p className={s.relato}>{contenido.final}</p>
            <p className={s.resumen}>
              Resolviste {primeras} de {contenido.escenas.length} escenas a la primera.
            </p>
          </section>
        )}
      </div>

      <div className={s.pie} data-fase={fase}>
        <div className={s.dialogo}>
          <div className={s.armi} key={fase === "escena" ? e.id : fase}>
            <Armi pose={pose} />
          </div>
          {fase === "escena" && (
            <div className={s.globo}>
              <h2 ref={titulo} tabIndex={-1} className={s.pregunta}>
                {e.pregunta}
              </h2>
              <Aviso tono={r.intentos.length === 0 ? null : r.acerto ? "ok" : r.cerrada ? "no" : "neutro"}>{mensaje(e, r.intentos, r.acerto, r.cerrada, objeto.plural, carga)}</Aviso>
            </div>
          )}
        </div>

        {fase === "escena" && (
          <div className={s.opciones} role="group" aria-label="Respuestas">
            {e.opciones.map((o, i) => {
              const elegida = r.intentos.includes(i);
              const estado = r.cerrada ? (i === e.correcta ? "ok" : elegida ? "no" : undefined) : elegida ? "no" : undefined;
              return (
                <button key={`${e.id}-${i}`} type="button" className={s.opcion} data-estado={estado} disabled={r.cerrada || elegida} onClick={() => r.responder(i)}>
                  <span className={s.letra} aria-hidden="true">
                    {LETRAS[i]}
                  </span>
                  <span className={s.textoOpcion}>
                    <Texto valor={o} />
                  </span>
                  {estado === "ok" && <Check className={s.marca} size={26} strokeWidth={3.2} aria-hidden="true" />}
                  {estado === "no" && <X className={s.marca} size={26} strokeWidth={3.2} aria-hidden="true" />}
                </button>
              );
            })}
          </div>
        )}

        {fase === "inicio" && (
          <div className={s.accion}>
            <Avanzar onClick={() => setFase("escena")}>
              Empezar la entrega
              <ArrowRight size={20} strokeWidth={2.8} aria-hidden="true" />
            </Avanzar>
          </div>
        )}
        {fase === "escena" && r.cerrada && (
          <div className={s.accion}>
            <Avanzar onClick={r.siguiente}>
              {r.ultima ? "Terminar la entrega" : "Seguir el camino"}
              <ArrowRight size={20} strokeWidth={2.8} aria-hidden="true" />
            </Avanzar>
          </div>
        )}
        {fase === "final" && (
          <div className={s.accion}>
            <Avanzar onClick={() => alTerminar(pendientes)}>
              Ver mi resultado
              <ArrowRight size={20} strokeWidth={2.8} aria-hidden="true" />
            </Avanzar>
          </div>
        )}
      </div>
    </Pantalla>
  );
}

/** Una opción que parece fracción («1/3») se escribe en vertical; el lector oye «1/3». */
function Texto({ valor }: { valor: string }) {
  const m = /^(\d+)\/(\d+)$/.exec(valor);
  return m ? <Frac n={m[1]} d={m[2]} /> : <>{valor}</>;
}

function mensaje(e: EscenaAventura, intentos: number[], acerto: boolean, cerrada: boolean, plural: string, carga: number): string {
  if (intentos.length === 0) return "";
  const entrega = e.entrega > 0 ? ` Armi entrega ${e.entrega} ${plural}; en la carreta quedan ${carga}.` : "";
  if (acerto) return (intentos.length === 1 ? "¡Muy bien! " : "¡Ahora sí! ") + e.explicacion + entrega;
  if (!cerrada) return `Casi. ${e.pista}`;
  return `La respuesta era ${e.opciones[e.correcta]}. ${e.explicacion}` + entrega;
}

/** Carreta de Armi: cuánta carga lleva ahora y, al entregar, cuánta bajó. */
function Carreta({ objeto, cantidad, entrego, clave }: { objeto: string; cantidad: number; entrego: number; clave: string }) {
  return (
    <div className={s.carreta}>
      <svg className={s.carretaDibujo} viewBox="0 0 64 44" aria-hidden="true" focusable="false">
        <path d="M6 10 H52 L46 30 H12 Z" fill="#b97a44" stroke="#1b2440" strokeWidth="2.4" strokeLinejoin="round" />
        <path d="M12 16 H48 M14 22 H45" stroke="#7a4a26" strokeWidth="2" />
        <circle cx="20" cy="35" r="7" fill="#fff3d6" stroke="#1b2440" strokeWidth="2.4" />
        <circle cx="42" cy="35" r="7" fill="#fff3d6" stroke="#1b2440" strokeWidth="2.4" />
        <path d="M52 10 L62 4" stroke="#1b2440" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
      <p className={s.carretaTexto}>
        <span className={s.carretaEtiqueta}>En la carreta</span>
        <span className={s.carretaCantidad} key={clave}>
          {cantidad} {objeto}
        </span>
      </p>
      {entrego > 0 && (
        <span className={s.baja} key={`b${clave}`} aria-hidden="true">
          −{entrego}
        </span>
      )}
    </div>
  );
}

/** Qué lugar ocupa la parte `k`: primer uso, segundo uso o lo que queda. */
function usoDe(v: Visual, k: number): 0 | 1 | 2 {
  const primero = v.usos[0].num;
  if (k < primero) return 1;
  if (v.usos[1] && k < primero + v.usos[1].num) return 2;
  return 0;
}

/**
 * Dibujo de apoyo. Al empezar la escena muestra todos los objetos juntos
 * (el todo); al corregir, los parte en cajones iguales con las partes del
 * problema resaltadas y su leyenda escrita.
 */
function Apoyo({ v, partido, clave }: { v: Visual; partido: boolean; clave: string }) {
  const parte = v.total / v.den;
  const objeto = OBJETOS[v.objeto];
  const columnas = v.den <= 5 ? v.den : Math.ceil(v.den / 2);
  return (
    <aside className={s.apoyo} key={clave} aria-label="Dibujo de apoyo">
      <p className={s.apoyoTitulo}>
        {partido ? `Así se reparten los ${v.total} ${objeto.plural}: ${v.den} partes de ${parte}` : `Los ${v.total} ${objeto.plural} de esta escena`}
      </p>
      {partido ? (
        <>
          <div className={s.bandeja} style={{ "--cols": columnas } as CSSProperties} role="group" aria-label={`${v.total} ${objeto.plural} partidos en ${v.den} partes de ${parte}`}>
            {Array.from({ length: v.den }, (_, k) => (
              <div key={k} className={s.parte} data-uso={usoDe(v, k)} style={{ "--i": k } as CSSProperties}>
                <span className={s.numero} aria-hidden="true">
                  {k + 1}
                </span>
                {Array.from({ length: parte }, (_, i) => (
                  <Objeto key={i} tipo={v.objeto} />
                ))}
              </div>
            ))}
          </div>
          <ul className={s.leyenda}>
            {v.usos.map((u, i) => (
              <li key={u.nombre}>
                <span className={s.marcaLey} data-uso={i + 1} aria-hidden="true" />
                {u.nombre}: {u.num} {u.num === 1 ? "parte" : "partes"}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className={s.monton} role="group" aria-label={`${v.total} ${objeto.plural} juntos, sin partir`}>
          {Array.from({ length: v.total }, (_, i) => (
            <Objeto key={i} tipo={v.objeto} />
          ))}
        </div>
      )}
    </aside>
  );
}

/** Una pila de objetos que la escena quiere mostrar (sin partirla). */
function Pila({ m, clave }: { m: Muestra; clave: string }) {
  const objeto = OBJETOS[m.objeto];
  return (
    <aside className={s.apoyo} key={clave} aria-label="Dibujo de apoyo">
      <p className={s.apoyoTitulo}>{m.titulo}</p>
      <div className={s.monton} role="group" aria-label={`${m.cantidad} ${m.cantidad === 1 ? objeto.singular : objeto.plural}`}>
        {Array.from({ length: m.cantidad }, (_, i) => (
          <Objeto key={i} tipo={m.objeto} />
        ))}
      </div>
    </aside>
  );
}

/** Nubes que pasan despacio y destellos suaves: decoración sola, sin información. */
function Ambiente({ nubes }: { nubes: boolean }) {
  return (
    <div className={s.ambiente} aria-hidden="true">
      {nubes && (
        <svg className={s.nube} viewBox="0 0 120 50">
          <path d="M20 44 Q4 44 6 30 Q8 18 24 20 Q28 4 48 6 Q64 -2 76 14 Q96 10 100 28 Q116 30 112 42 Q110 46 100 44 Z" fill="#fff" opacity="0.9" />
        </svg>
      )}
      {[
        { x: "10%", y: "34%", d: "0s" },
        { x: "88%", y: "26%", d: "-1.4s" },
        { x: "64%", y: "12%", d: "-2.6s" },
      ].map((p, i) => (
        <svg key={i} className={s.destello} style={{ left: p.x, top: p.y, animationDelay: p.d } as CSSProperties} viewBox="0 0 24 24">
          <path d="M12 1 L14.6 9.4 L23 12 L14.6 14.6 L12 23 L9.4 14.6 L1 12 L9.4 9.4 Z" fill="#fff6b8" />
        </svg>
      ))}
    </div>
  );
}
