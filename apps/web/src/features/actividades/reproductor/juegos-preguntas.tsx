"use client";

import { Check, Circle, Diamond, Square, Timer, Triangle, X } from "lucide-react";
import { useContext, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { barajar } from "../tipos/contrato";
import type { Frase, Pregunta } from "../tipos/preguntas";
import type { EscenaJuego } from "../juegos/comun/escena";
import { ContextoActividad, Escuchar, useLecturaAutomatica, useLeerEnVozAlta, useVozActividad } from "../juegos/comun/escuchar";
import { useEfectosGrabados } from "../juegos/comun/efectos-grabados";
import { useMusicaJuego } from "../juegos/comun/musica";
import { ordenPartida } from "./ordenes-preguntas";
import { DialogoQuiz } from "./dialogo";
import { opcionesVisualesGrandes } from "./reglas";
import type { Dialogo } from "../tipos/preguntas";
import { Avanzar, Aviso, Marca, Progreso, useFocoAlCambiar, type PropsJuego } from "./comun";
import s from "./reproductor.module.css";
import inicio from "./inicio.module.css";

const SIMBOLOS = [Triangle, Diamond, Circle, Square] as const;
type EfectosQuiz = Partial<Record<"acierto" | "fallo" | "finRonda" | "fin", string>>;
type ContenidoQuiz = { preguntas: Pregunta[]; escena?: EscenaJuego; efectos?: EfectosQuiz; barajarOpciones?: boolean; barajarPreguntas?: boolean; musica?: string };

function LecturaInicio({ pregunta }: { pregunta: Pregunta }) {
  const { instruccion, audioInstruccion } = useContext(ContextoActividad);
  const { grado, decir, puede } = useVozActividad();
  const { activo } = useLeerEnVozAlta();
  const iniciada = useRef(false);
  const vigente = useRef(true);
  useEffect(() => () => { vigente.current = false; }, []);
  useEffect(() => {
    vigente.current = true;
    if (grado !== 1 || !activo || iniciada.current || !puede(pregunta.audio)) return;
    iniciada.current = true;
    const leerPregunta = () => { if (vigente.current) decir(pregunta.enunciado, pregunta.audio); };
    if (instruccion && puede(audioInstruccion)) decir(instruccion, audioInstruccion, leerPregunta);
    else leerPregunta();
  }, [grado, activo, decir, puede, instruccion, audioInstruccion, pregunta]);
  return null;
}
function LecturaPregunta({ pregunta }: { pregunta: Pregunta }) {
  useLecturaAutomatica(pregunta.id, pregunta.enunciado, pregunta.audio);
  return null;
}

function Situacion({ pregunta, personaje, reaccion, momento }: { pregunta: Pregunta; personaje?: EscenaJuego["personaje"]; reaccion: "acierto" | "fallo" | null; momento: "reposo" | "anticipacion" | "accion" | "impacto" | "recuperacion" }) {
  const [fallida, setFallida] = useState(false);
  const imagen = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const actual = imagen.current;
    if (actual?.complete) setFallida(actual.naturalWidth === 0);
  }, [pregunta.imagen]);
  const mostrarReaccion = momento === "impacto" || momento === "recuperacion" || (momento === "reposo" && !!reaccion);
  const poseVisible = mostrarReaccion && reaccion === "acierto" ? "senala" : mostrarReaccion && reaccion === "fallo" ? "duda" : "reposo";
  return <div className={s.quizEscena}>
    {/* eslint-disable-next-line @next/next/no-img-element -- ilustración curricular WebP con alt informativo */}
    {pregunta.imagen && <img ref={imagen} className={s.quizSituacion} src={pregunta.imagen} alt={pregunta.alt ?? ""} hidden={fallida} onLoad={() => setFallida(false)} onError={() => setFallida(true)} />}
    {fallida && <p className={s.quizImagenPendiente} aria-hidden="true">{pregunta.alt}</p>}
    {personaje && <div className={s.quizPersonaje} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element -- pose optimizada del currículo */}
      <img src={personaje.reposo} alt="" data-pose="reposo" data-visible={poseVisible === "reposo" ? "" : undefined} />
      {/* eslint-disable-next-line @next/next/no-img-element -- pose optimizada del currículo */}
      <img src={personaje.senala} alt="" data-pose="senala" data-visible={poseVisible === "senala" ? "" : undefined} />
      {/* eslint-disable-next-line @next/next/no-img-element -- pose optimizada del currículo */}
      <img src={personaje.duda} alt="" data-pose="duda" data-visible={poseVisible === "duda" ? "" : undefined} />
    </div>}
  </div>;
}

/*
  Quiz y concurso: una pregunta a la vez. Al tocar una opción se ve de una
  vez si acertó, cuál era la correcta y por qué; la primera respuesta es la
  que cuenta. El concurso añade un reloj que anima pero nunca corta.
*/
function Preguntas({ contenido, semilla, alTerminar, segundos, focoInicial }: PropsJuego<ContenidoQuiz> & { segundos?: number }) {
  const [indice, setIndice] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, number>>({});
  const partida = useMemo(() => ordenPartida(contenido.preguntas, semilla, contenido.barajarOpciones, contenido.barajarPreguntas), [contenido.preguntas, contenido.barajarOpciones, contenido.barajarPreguntas, semilla]);
  const p = contenido.preguntas[partida.indices[indice]];
  const elegida = respuestas[p.id];
  const respondida = elegida !== undefined;
  const orden = partida.opciones[partida.indices[indice]];
  const ultima = indice === contenido.preguntas.length - 1;
  const titulo = useFocoAlCambiar<HTMLHeadingElement>(indice);
  useEffect(() => { if (focoInicial) titulo.current?.focus(); }, [focoInicial, titulo]);

  const acierto = respondida && elegida === p.correcta;
  const ilustrado = !!(p.imagen || p.imagenesOpciones || contenido.escena);
  const opcionesGrandes = !!p.imagen && opcionesVisualesGrandes(p);
  const personaje = contenido.escena?.personaje;
  const { musica, musicaActiva, setMusicaActiva } = useMusicaJuego(contenido.musica, true);
  const [audioListo, setAudioListo] = useState(!contenido.musica);
  useEffect(() => {
    if (!contenido.musica) return;
    const cuadro = requestAnimationFrame(() => setAudioListo(true));
    return () => cancelAnimationFrame(cuadro);
  }, [contenido.musica]);
  const sonidos = useMemo(() => ({
    acierto: contenido.efectos?.acierto ? [contenido.efectos.acierto] : [],
    fallo: contenido.efectos?.fallo ? [contenido.efectos.fallo] : [],
    finRonda: contenido.efectos?.finRonda ? [contenido.efectos.finRonda] : [],
    fin: contenido.efectos?.fin ? [contenido.efectos.fin] : [],
  }), [contenido.efectos]);
  const efectos = useEfectosGrabados(sonidos);
  const temporizadores = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => temporizadores.current.forEach(clearTimeout), []);
  const [momento, setMomento] = useState<"reposo" | "anticipacion" | "accion" | "impacto" | "recuperacion">("reposo");
  const [reaccion, setReaccion] = useState<"acierto" | "fallo" | null>(null);
  function responder(i: number) {
    if (respondida) return;
    if (contenido.efectos) efectos.preparar();
    setRespuestas((r) => ({ ...r, [p.id]: i }));
    if (contenido.escena) {
      setReaccion(i === p.correcta ? "acierto" : "fallo");
      setMomento("anticipacion");
      temporizadores.current.push(setTimeout(() => setMomento("accion"), 110));
      temporizadores.current.push(setTimeout(() => {
        setMomento("impacto");
        if (contenido.efectos) efectos.tocar(i === p.correcta ? "acierto" : "fallo");
      }, 270));
      temporizadores.current.push(setTimeout(() => setMomento("recuperacion"), 530));
      temporizadores.current.push(setTimeout(() => setMomento("reposo"), 850));
    } else if (contenido.efectos) efectos.tocar(i === p.correcta ? "acierto" : "fallo");
  }
  function avanzar() {
    temporizadores.current.forEach(clearTimeout);
    temporizadores.current = [];
    if (contenido.efectos) {
      efectos.preparar();
      efectos.tocar(ultima ? "fin" : "finRonda");
    }
    if (ultima) { musica.current?.pause(); alTerminar(respuestas); }
    else { setIndice(indice + 1); setReaccion(null); setMomento("reposo"); }
  }

  return (
    <div className={`${s.juego} ${s.quiz} ${ilustrado ? s.quizIlustrado : ""} ${p.imagen ? s.quizConEscena : ""} ${!p.imagen && personaje ? s.quizSoloGuia : ""} ${opcionesGrandes ? s.quizOpcionesGrandes : ""}`} data-respondida={respondida ? "" : undefined} data-momento={momento} data-reaccion={reaccion ?? undefined}>
      {contenido.musica && <audio ref={musica} src={contenido.musica} loop preload="none" />}
      {audioListo && contenido.escena && indice === 0 && <LecturaInicio pregunta={p} />}
      {audioListo && (!contenido.escena || indice > 0) && <LecturaPregunta pregunta={p} />}
      <div className={`${s.juegoCabeza} ${s.quizCabecera}`}>
        <Progreso actual={indice + 1} total={contenido.preguntas.length} />
        {contenido.musica && <button type="button" className={s.quizMusica} aria-pressed={musicaActiva} onClick={() => setMusicaActiva((v) => !v)}>Música: {musicaActiva ? "sí" : "no"}</button>}
        {segundos && <Reloj key={p.id} segundos={segundos} detenido={respondida} />}
      </div>
      {(p.imagen || personaje) && <Situacion key={`escena-${p.id}`} pregunta={p} personaje={personaje} reaccion={reaccion} momento={momento} />}
      <div key={`panel-${p.id}`} className={s.quizPreguntaPanel}>
        <h2 ref={titulo} tabIndex={-1} className={`${s.enunciado} ${s.quizEnunciado}`}>
          {p.enunciado}
        </h2>
        <div className={s.quizEscuchar}><Escuchar texto={p.enunciado} audio={p.audio} etiqueta="Escuchar la pregunta" /></div>
      </div>
      <div className={`${s.opciones} ${s.quizOpciones}`} data-dos={p.opciones.length === 2 ? "" : undefined} data-cuatro={p.opciones.length === 4 ? "" : undefined}>
        {orden.map((i, posicion) => {
          const estado = respondida ? (i === p.correcta ? "ok" : i === elegida ? "no" : undefined) : undefined;
          const Simbolo = SIMBOLOS[posicion];
          return (
            <div key={`${p.id}:${i}`} className={`${s.opcionFila} ${s.quizFila}`}>
            <button
              type="button"
              className={`${s.opcion} ${s.quizOpcion}`}
              data-posicion={posicion}
              data-estado={estado}
              aria-pressed={respondida ? i === elegida : undefined}
              disabled={respondida}
              onClick={() => responder(i)}
            >
              {p.imagenesOpciones?.[i] ? <span className={s.quizCara} aria-hidden="true">
                {/* eslint-disable-next-line @next/next/no-img-element -- cara decorativa, texto contiguo */}
                <img src={p.imagenesOpciones[i]!} alt="" />
              </span> : <span className={s.quizLetra} aria-hidden="true"><Simbolo size={34} strokeWidth={2.8} fill="currentColor" /></span>}
              <span className={s.quizTexto}>{p.opciones[i]}</span>
              <Marca estado={estado} />
            </button>
            {p.audioOpciones?.[i] && <Escuchar texto={p.opciones[i]} audio={p.audioOpciones[i]} soloIcono />}
            </div>
          );
        })}
      </div>
      {respondida && <div className={s.quizDestello} data-tono={acierto ? "ok" : "no"} aria-hidden="true">
        <div className={s.quizDestelloCentro}>
          {acierto ? <Check size={56} strokeWidth={3.5} /> : <X size={56} strokeWidth={3.5} />}
          <span>{acierto ? "¡Eso es!" : "Aprendamos"}</span>
        </div>
        {Array.from({ length: 8 }, (_, n) => <span key={n} className={s.quizParticula}
          style={{ "--angulo": `${n * 45}deg` } as CSSProperties} />)}
      </div>}
      <div className={s.quizRespuesta} ref={(elemento) => {
        if (!elemento || !respondida || !ilustrado) return;
        const destino = elemento.nextElementSibling ?? elemento;
        if (destino.getBoundingClientRect().bottom > window.innerHeight) destino.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "end" });
      }}>
        <Aviso tono={respondida ? (elegida === p.correcta ? "ok" : "no") : null}>
          {respondida &&
            (elegida === p.correcta ? "¡Correcto!" : `La respuesta es «${p.opciones[p.correcta]}».`) +
              (p.explicacion ? ` ${p.explicacion}` : "")}
        </Aviso>
      </div>
      {respondida && (
        <div className={s.acciones}>
          <Avanzar onClick={avanzar}>
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
        <span style={{ transform: `scaleX(${quedan / segundos})` }} />
      </span>
      {/* El conteo no se anuncia cada segundo; solo el fin del tiempo. */}
      <span aria-hidden={quedan > 0}>{quedan > 0 ? `${quedan} s` : "¡Tiempo! Igual puedes responder"}</span>
    </span>
  );
}

function QuizConInicio(props: PropsJuego<ContenidoQuiz>) {
  const [empezado, setEmpezado] = useState(false);
  const { titulo, imagen, instruccion } = useContext(ContextoActividad);
  if (empezado) return <Preguntas {...props} focoInicial />;
  return <div className={inicio.inicio}>
    {imagen && <div className={inicio.portada}>
      {/* eslint-disable-next-line @next/next/no-img-element -- portada curricular WebP decorativa */}
      <img src={imagen} alt="" />
    </div>}
    <div className={inicio.inicioTexto}>
      {titulo && <h2>{titulo}</h2>}
      {instruccion && <p>{instruccion}</p>}
      <button type="button" className={inicio.jugar} onClick={() => setEmpezado(true)}>Jugar</button>
    </div>
  </div>;
}

export function Quiz(props: PropsJuego<ContenidoQuiz & { presentacion?: "dialogo"; dialogo?: Dialogo }>) {
  if (props.contenido.presentacion === "dialogo" && props.contenido.dialogo) return <DialogoQuiz {...props} contenido={{ ...props.contenido, dialogo: props.contenido.dialogo }} />;
  if (props.contenido.musica) return <QuizConInicio {...props} />;
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
