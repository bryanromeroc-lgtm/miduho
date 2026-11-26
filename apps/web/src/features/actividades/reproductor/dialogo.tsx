"use client";

import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ContextoActividad, Escuchar, useLecturaAutomatica, useVozActividad } from "../juegos/comun/escuchar";
import { useMusicaJuego } from "../juegos/comun/musica";
import { useEfectosGrabados } from "../juegos/comun/efectos-grabados";
import type { Dialogo, Pregunta } from "../tipos/preguntas";
import type { EscenaJuego } from "../juegos/comun/escena";
import { ordenesPreguntas } from "./ordenes-preguntas";
import { Aviso, Progreso, type PropsJuego } from "./comun";
import s from "./dialogo.module.css";
import inicioEstilos from "./inicio.module.css";

type Contenido = { preguntas: Pregunta[]; dialogo: Dialogo; escena?: EscenaJuego; efectos?: Partial<Record<"acierto" | "fallo" | "finRonda" | "fin", string>>; barajarOpciones?: boolean; musica?: string; audioTitulo?: string; tituloAudioTexto?: string; efectoToque?: string; efectoJugar?: string };

function LecturaConsigna({ texto, audio }: { texto: string; audio?: string | null }) {
  useLecturaAutomatica("dialogo-consigna", texto, audio);
  return null;
}

function Imagen({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [fallo, setFallo] = useState(false);
  const [cargada, setCargada] = useState(false);
  const imagen = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const actual = imagen.current;
    if (actual?.complete) {
      setFallo(actual.naturalWidth === 0);
      setCargada(actual.naturalWidth > 0);
    }
  }, [src]);
  return <span className={className}>
    {/* eslint-disable-next-line @next/next/no-img-element -- recurso WebP del currículo con reserva de aspecto */}
    {!fallo && <img ref={imagen} src={src} alt={alt} style={{ visibility: cargada ? "visible" : "hidden" }} onLoad={() => setCargada(true)} onError={() => setFallo(true)} />}
  </span>;
}

function EscenaDialogo({ contenido, pose, hablanteActivo, perroActivo, acompananteDe }: {
  contenido: Contenido;
  pose: "reposo" | "senala" | "duda";
  hablanteActivo?: string;
  perroActivo: boolean;
  acompananteDe?: string;
}) {
  return <div className={s.escena}>
    {contenido.escena?.fondo && <Imagen src={contenido.escena.fondo} alt="" className={s.fondo} />}
    <div className={s.camara}>
      {contenido.dialogo.hablantes.map((h) => <div key={h.id} className={s.hablante} data-lado={h.lado} data-activo={h.id === hablanteActivo ? "" : undefined}>
        <Imagen src={h.imagen} alt={h.alt} className={s.figura} />
        {h.acompanante && <Imagen src={h.acompanante.imagen} alt={h.acompanante.alt} className={`${s.acompanante} ${perroActivo && h.id === acompananteDe ? s.ladra : ""}`} />}
      </div>)}
      {contenido.escena?.personaje && <div className={s.guia} aria-label={contenido.escena.personaje.nombre}>
        <Imagen src={contenido.escena.personaje[pose]} alt="" className={s.guiaImagen} />
      </div>}
    </div>
  </div>;
}

export function DialogoQuiz({ contenido, semilla, alTerminar, focoInicial }: PropsJuego<Contenido>) {
  const [inicio, setInicio] = useState(true);
  const [tituloAbierto, setTituloAbierto] = useState(!contenido.audioTitulo);
  const [indice, setIndice] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, number>>({});
  const [revelada, setRevelada] = useState(false);
  const [momento, setMomento] = useState<"reposo" | "anticipacion" | "accion" | "impacto" | "recuperacion">("reposo");
  const { musica, musicaActiva, setMusicaActiva } = useMusicaJuego(contenido.musica, !inicio);
  const [perroActivo, setPerroActivo] = useState(false);
  const temporizadores = useRef<ReturnType<typeof setTimeout>[]>([]);
  const primeraOpcion = useRef<HTMLButtonElement>(null);
  const botonAvanzar = useRef<HTMLButtonElement>(null);
  const titulo = useRef<HTMLHeadingElement>(null);
  const tituloIntentado = useRef(false);
  const avanzado = useRef(-1);
  const { instruccion, audioInstruccion } = useContext(ContextoActividad);
  const { decir } = useVozActividad();
  useEffect(() => {
    if (!contenido.audioTitulo || tituloIntentado.current) return;
    tituloIntentado.current = true;
    decir(contenido.tituloAudioTexto ?? "Título", contenido.audioTitulo, () => setTituloAbierto(true));
  }, [contenido.audioTitulo, contenido.tituloAudioTexto, decir]);
  useEffect(() => {
    if (!contenido.audioTitulo || tituloAbierto) return;
    // Si el navegador bloquea la reproducción automática, deja avanzar y ofrece «Escuchar el título».
    const espera = setTimeout(() => setTituloAbierto(true), 3000);
    return () => clearTimeout(espera);
  }, [contenido.audioTitulo, tituloAbierto]);
  const ordenes = useMemo(() => ordenesPreguntas(contenido.preguntas, semilla, contenido.barajarOpciones), [contenido.preguntas, semilla, contenido.barajarOpciones]);
  const p = contenido.preguntas[indice];
  const elegida = respuestas[p.id];
  const respondida = elegida !== undefined;
  const acierto = elegida === p.correcta;
  const habla = contenido.dialogo.hablantes.find((h) => h.id === p.hablante)!;
  const responde = contenido.dialogo.hablantes.find((h) => h.id !== p.hablante)!;
  const rutas = useMemo(() => ({
    acierto: contenido.efectos?.acierto ? [contenido.efectos.acierto] : [],
    fallo: contenido.efectos?.fallo ? [contenido.efectos.fallo] : [],
    finRonda: contenido.efectos?.finRonda ? [contenido.efectos.finRonda] : [],
    fin: contenido.efectos?.fin ? [contenido.efectos.fin] : [],
    toque: contenido.efectoToque ? [contenido.efectoToque] : [],
    jugar: contenido.efectoJugar ? [contenido.efectoJugar] : [],
    responder: p.alResponder ? [p.alResponder.efecto] : [],
  }), [contenido.efectos, contenido.efectoToque, contenido.efectoJugar, p.alResponder]);
  const efectos = useEfectosGrabados(rutas);
  const programar = useCallback((fn: () => void, ms: number) => { temporizadores.current.push(setTimeout(fn, ms)); }, []);
  useEffect(() => () => { temporizadores.current.forEach(clearTimeout); }, []);
  useEffect(() => { if (!inicio) primeraOpcion.current?.focus(); else if (focoInicial) titulo.current?.focus(); }, [indice, inicio, focoInicial]);
  // Al responder, las opciones se desactivan: el foco pasa a «Siguiente», como en el quiz común (`Avanzar`).
  useEffect(() => { if (revelada) botonAvanzar.current?.focus(); }, [revelada]);

  function empezar() {
    efectos.preparar(); efectos.tocar("jugar");
    setInicio(false);
    programar(() => decir(p.enunciado, p.audio), 400);
  }
  function siguiente(actualizadas: Record<string, number>) {
    if (avanzado.current === indice) return;
    avanzado.current = indice;
    if (indice === contenido.preguntas.length - 1) {
      efectos.tocar("fin");
      musica.current?.pause();
      programar(() => alTerminar(actualizadas), 800);
    } else {
      efectos.tocar("finRonda");
      setIndice((n) => n + 1);
      setRevelada(false);
      setMomento("reposo");
      setPerroActivo(false);
      // La respuesta correcta ya se oyó: el siguiente globo conserva su texto sin repetirla.
    }
  }
  function responder(i: number) {
    if (respondida) return;
    efectos.preparar(); efectos.tocar("toque");
    const actualizadas = { ...respuestas, [p.id]: i };
    setRespuestas(actualizadas);
    setMomento("anticipacion");
    programar(() => setMomento("accion"), 110);
    programar(() => { setMomento("impacto"); efectos.tocar(i === p.correcta ? "acierto" : "fallo"); }, 270);
    programar(() => { setMomento("recuperacion"); setRevelada(true); }, 530);
    programar(() => {
      decir(p.opciones[p.correcta], p.audioOpciones?.[p.correcta], () => {
        const efecto = p.alResponder;
        if (efecto) {
          if (efecto.animar === "acompanante") setPerroActivo(true);
          for (let n = 0; n < (efecto.veces ?? 1); n++) programar(() => efectos.tocar("responder"), n * 300);
        }
      });
    }, 650);
  }
  const impacto = respondida && (momento === "impacto" || momento === "recuperacion" || momento === "reposo");
  const pose = impacto ? (acierto ? "senala" : "duda") : "reposo";
  return <div className={s.juego} data-momento={momento} data-resultado={impacto ? (acierto ? "ok" : "no") : undefined}>
    {contenido.musica && <audio ref={musica} src={contenido.musica} loop preload="none" />}
    {inicio ? <div className={`${s.inicio} ${inicioEstilos.inicio}`}>
      {contenido.escena?.fondo
        ? <EscenaDialogo contenido={contenido} pose="reposo" perroActivo={false} />
        : contenido.preguntas[0].imagen && <Imagen src={contenido.preguntas[0].imagen} alt="" className={inicioEstilos.portada} />}
      <div className={inicioEstilos.inicioTexto}>
      {tituloAbierto && instruccion && <LecturaConsigna texto={instruccion} audio={audioInstruccion} />}
      <h2 ref={titulo} tabIndex={-1}>Escuchemos la conversación</h2>
      <p>{instruccion}</p>
      {contenido.audioTitulo && <Escuchar texto={contenido.tituloAudioTexto ?? "Título"} audio={contenido.audioTitulo} etiqueta="Escuchar el título" />}
      <button type="button" className={inicioEstilos.jugar} onClick={empezar}>Jugar</button>
      </div>
    </div> : <>
      <div className={s.cabecera}><Progreso actual={indice + 1} total={contenido.preguntas.length} nombre="Turno" />
        {contenido.musica && <button type="button" className={s.musica} aria-pressed={musicaActiva} onClick={() => setMusicaActiva((v) => !v)}>Música: {musicaActiva ? "sí" : "no"}</button>}
      </div>
      <div className={s.escenario}>
        <EscenaDialogo contenido={contenido} pose={pose} hablanteActivo={revelada ? responde.id : habla.id} perroActivo={perroActivo} acompananteDe={responde.id} />
        <div className={s.globos}>
        <div className={s.globo} data-lado={habla.lado}>
          <h2 tabIndex={-1} ref={titulo}>{habla.nombre}</h2>
          <p>{p.enunciado}</p>
          {!respondida && <Escuchar texto={p.enunciado} audio={p.audio} etiqueta="Escuchar de nuevo" />}
        </div>
        {revelada && <div className={s.globo} data-lado={responde.lado} data-revelado="">
          <h2>{responde.nombre}</h2><p>{p.opciones[p.correcta]}</p>
          <Escuchar texto={p.opciones[p.correcta]} audio={p.audioOpciones?.[p.correcta]} etiqueta="Escuchar de nuevo" />
        </div>}
        </div>
      </div>
      <div className={s.pregunta}>
        <h3>¿Qué responde {responde.nombre}?</h3>
        <div className={s.opciones}>{ordenes[indice].map((i, pos) => <div key={`${p.id}:${i}`} className={s.opcionFila}>
          <button ref={pos === 0 ? primeraOpcion : undefined} type="button" className={s.opcion} data-estado={respondida ? (i === p.correcta ? "ok" : i === elegida ? "no" : undefined) : undefined} disabled={respondida} onClick={() => responder(i)}>{p.opciones[i]}</button>
          {!respondida && <Escuchar texto={p.opciones[i]} audio={p.audioOpciones?.[i]} etiqueta="Escuchar opción" />}
        </div>)}</div>
      </div>
      <Aviso tono={respondida ? (acierto ? "ok" : "no") : null}>{respondida ? `${acierto ? "¡Muy bien!" : `La respuesta es «${p.opciones[p.correcta]}».`} ${p.explicacion ?? ""}` : ""}</Aviso>
      {revelada && <button ref={botonAvanzar} type="button" className={s.avanzar} onClick={() => siguiente(respuestas)}>{indice === contenido.preguntas.length - 1 ? "Ver resultado" : "Siguiente"}</button>}
    </>}
  </div>;
}
