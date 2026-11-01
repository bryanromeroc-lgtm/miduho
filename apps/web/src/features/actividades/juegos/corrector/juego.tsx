"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useMemo, useState, type CSSProperties } from "react";
import { barajar } from "../../tipos/contrato";
import { Avanzar, Aviso, Marca, useFocoAlCambiar, type PropsJuego } from "../../reproductor/comun";
import rp from "../../reproductor/reproductor.module.css";
import { Armi, Controles, Guirnalda, type EstadoRonda, type Pose } from "../comun/piezas";
import { useSonido } from "../comun/sonido";
import { useVoz } from "../comun/voz";
import e from "../comun/escena.module.css";
import { oracion, type ContenidoCorrector, type RespuestaCorrector } from "./tipo";
import s from "./corrector.module.css";

/*
  EL CORRECTOR DE LA CARTELERA — juego 3 de Matemáticas de 5.° (divisibilidad).
  Las notas del club de matemáticas tienen un error. Paso 1: tocar la parte
  equivocada. Paso 2: elegir qué va en su lugar. En cada paso cuenta el
  primer intento; al fallar hay un segundo intento con pista, y luego se
  muestra la solución. Nada se arrastra (WCAG 2.5.7).
*/

type Paso = "buscar" | "cambiar" | "hecho";

const ESCENA = { "--fondo": "url(/images/juegos/corrector/salon.webp)", "--fondo-pos": "center 40%", "--fondo-color": "#efe2c8" } as CSSProperties;

export function JuegoCorrector({ contenido, semilla, alTerminar }: PropsJuego<ContenidoCorrector>) {
  const [indice, setIndice] = useState(0);
  const [paso, setPaso] = useState<Paso>("buscar");
  const [toques, setToques] = useState<number[]>([]);
  const [elegidas, setElegidas] = useState<number[]>([]);
  const [respuestas, setRespuestas] = useState<Record<string, RespuestaCorrector>>({});
  const [estados, setEstados] = useState<EstadoRonda[]>(() => contenido.notas.map(() => "pendiente"));
  const voz = useVoz();
  const sonido = useSonido();
  const titulo = useFocoAlCambiar<HTMLHeadingElement>(`${indice}:${paso === "buscar" ? "b" : "c"}`);

  const n = contenido.notas[indice];
  const ultima = indice === contenido.notas.length - 1;
  const encontro = toques.at(-1) === n.error;
  const cambioBien = elegidas.at(-1) === n.correcta;
  const orden = useMemo(() => barajar(n.opciones.map((_, i) => i), `${semilla}:${n.id}`), [n, semilla]);

  const ultimoFallo = paso === "buscar" ? toques.length > 0 && !encontro : paso === "cambiar" ? elegidas.length > 0 && !cambioBien : false;
  const pose: Pose = paso === "hecho" ? (cambioBien ? "celebra" : "piensa") : ultimoFallo ? "piensa" : paso === "cambiar" ? "celebra" : "lapiz";

  function tocar(i: number) {
    if (paso !== "buscar" || toques.includes(i)) return;
    voz.callar();
    const nuevos = [...toques, i];
    setToques(nuevos);
    if (nuevos.length === 1) setRespuestas((r) => ({ ...r, [n.id]: { error: i, cambio: null } }));
    const bien = i === n.error;
    sonido.tocar(bien ? "acierto" : "error");
    if (bien || nuevos.length >= 2) setPaso("cambiar");
  }

  function elegir(j: number) {
    if (paso !== "cambiar" || elegidas.includes(j)) return;
    voz.callar();
    const nuevas = [...elegidas, j];
    setElegidas(nuevas);
    if (nuevas.length === 1) setRespuestas((r) => ({ ...r, [n.id]: { error: r[n.id]?.error ?? toques[0], cambio: j } }));
    const bien = j === n.correcta;
    sonido.tocar(bien ? "acierto" : "error");
    if (bien || nuevas.length >= 2) {
      setPaso("hecho");
      const perfecto = toques[0] === n.error && nuevas[0] === n.correcta;
      setEstados((es) => es.map((v, k) => (k === indice ? (perfecto ? "bien" : "corregida") : v)));
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
    setPaso("buscar");
    setToques([]);
    setElegidas([]);
  }

  const pregunta =
    paso === "buscar" ? "Toca la parte de la nota que está equivocada." : paso === "cambiar" ? "¿Qué va en su lugar? Elige la corrección." : "¡Nota corregida!";
  const reemplazo = paso === "hecho" ? n.opciones[n.correcta] : undefined;

  return (
    <div className={e.juego}>
      <div className={e.barra}>
        <Guirnalda estados={estados} actual={indice} />
        <Controles voz={voz} sonido={sonido} texto={`La nota dice: ${oracion(n)} ${pregunta}`} />
      </div>

      <div className={e.escena} style={ESCENA}>
        <div className={e.fondo} aria-hidden="true" />
        <div className={s.hoja} key={n.id}>
          <Image src="/images/juegos/corrector/chinche.webp" alt="" aria-hidden="true" width={190} height={221} className={s.chinche} />
          <p className={s.nota} data-paso={paso}>
            {n.partes.map((p, i) => {
              const esError = i === n.error;
              const marcada = esError && paso !== "buscar";
              const fallida = toques.includes(i) && !esError;
              if (marcada) {
                return (
                  <span key={i} className={s.marcada}>
                    <del className={s.tachado}>{p}</del>
                    {reemplazo !== undefined && <ins className={s.nuevo}>{reemplazo}</ins>}
                    {paso === "cambiar" && <span className={s.hueco} aria-hidden="true" />}
                    {i < n.partes.length - 1 && " "}
                  </span>
                );
              }
              return (
                <span key={i}>
                  <button
                    type="button"
                    className={s.parte}
                    data-estado={fallida ? "no" : undefined}
                    disabled={paso !== "buscar" || fallida}
                    onClick={() => tocar(i)}
                  >
                    {p}
                  </button>
                  {i < n.partes.length - 1 && " "}
                </span>
              );
            })}
            <span className={s.cierre}>{n.cierre}</span>
          </p>
        </div>
        <div className={e.armi}>
          <Armi pose={pose} />
        </div>
      </div>

      <h2 ref={titulo} tabIndex={-1} className={e.pregunta}>
        {pregunta}
      </h2>

      {paso !== "buscar" && (
        <div className={`${rp.opciones} ${e.opciones}`} role="group" aria-label="Correcciones posibles">
          {orden.map((j) => {
            const elegida = elegidas.includes(j);
            const estado = j === n.correcta && paso === "hecho" ? "ok" : elegida ? "no" : undefined;
            return (
              <button key={j} type="button" className={`${rp.opcion} ${e.opcion}`} data-estado={estado} disabled={paso === "hecho" || elegida} onClick={() => elegir(j)}>
                <span>{n.opciones[j]}</span>
                <Marca estado={estado} />
              </button>
            );
          })}
        </div>
      )}

      <Aviso tono={avisoTono(paso, toques, elegidas, encontro, cambioBien)}>{avisoTexto(n, paso, toques, elegidas, encontro, cambioBien)}</Aviso>

      {paso === "hecho" && (
        <div className={rp.acciones}>
          <Avanzar onClick={siguiente}>
            {ultima ? "Ver resultado" : "Siguiente nota"}
            <ArrowRight size={20} strokeWidth={2.8} aria-hidden="true" />
          </Avanzar>
        </div>
      )}
    </div>
  );
}

function avisoTono(paso: Paso, toques: number[], elegidas: number[], encontro: boolean, cambioBien: boolean) {
  if (paso === "buscar") return toques.length ? "neutro" : null;
  if (paso === "cambiar") return elegidas.length ? "neutro" : encontro ? "ok" : "no";
  return cambioBien ? "ok" : "no";
}

function avisoTexto(
  n: ContenidoCorrector["notas"][number],
  paso: Paso,
  toques: number[],
  elegidas: number[],
  encontro: boolean,
  cambioBien: boolean,
): string {
  if (paso === "buscar") return toques.length ? "Esa parte está bien. Lee la nota completa y busca otra." : "";
  if (paso === "cambiar") {
    if (elegidas.length) return `Así la nota sigue sin ser cierta. Pista: ${n.pista}`;
    return encontro ? "¡La encontraste! Ahora elige qué va en su lugar." : `La parte equivocada es «${n.partes[n.error]}». Ahora elige qué va en su lugar.`;
  }
  return (cambioBien ? "¡Muy bien corregida! " : `Lo correcto es «${n.opciones[n.correcta]}». `) + n.explicacion;
}
