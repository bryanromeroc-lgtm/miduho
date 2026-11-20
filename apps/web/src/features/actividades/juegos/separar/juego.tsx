"use client";

import { useContext, useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import type { PropsJuego } from "../../reproductor/comun";
import { Avanzar, Aviso, Progreso, useFocoAlCambiar } from "../../reproductor/comun";
import { ContextoActividad, Escuchar, useLecturaAutomatica, useLeerEnVozAlta, useVozActividad } from "../comun/escuchar";
import { useEfectosGrabados } from "../comun/efectos-grabados";
import { cortesCorrectos, evaluarCortes, huecosPermitidos, type ContenidoSeparar } from "./tipo";
import s from "./separar.module.css";

function Lectura({ texto, audio }: { texto: string; audio?: string }) {
  const { instruccion, audioInstruccion } = useContext(ContextoActividad);
  const { grado, decir, puede } = useVozActividad();
  const { activo } = useLeerEnVozAlta();
  const inicio = useRef(false);
  useEffect(() => {
    if (grado !== 1 || !activo || inicio.current || !puede(audio)) return;
    inicio.current = true;
    if (instruccion && puede(audioInstruccion)) decir(instruccion, audioInstruccion, () => decir(texto, audio));
    else decir(texto, audio);
  }, [grado, activo, puede, decir, instruccion, audioInstruccion, texto, audio]);
  return null;
}

function LecturaPosterior({ id, texto, audio }: { id: string; texto: string; audio?: string }) {
  useLecturaAutomatica(id, texto, audio);
  return null;
}

export function JuegoSeparar({ contenido, alTerminar, focoInicial }: PropsJuego<ContenidoSeparar>) {
  const [indice, setIndice] = useState(0);
  const [cortes, setCortes] = useState<number[]>([]);
  const [respuestas, setRespuestas] = useState<Record<string, number[]>>({});
  const [revelado, setRevelado] = useState(false);
  const [pose, setPose] = useState<"reposo" | "senala" | "duda">("reposo");
  const [fase, setFase] = useState<"reposo" | "anticipacion" | "accion" | "impacto" | "recuperacion">("reposo");
  const [imagenFallida, setImagenFallida] = useState(false);
  const elemento = contenido.elementos[indice];
  const letras = Array.from(elemento.texto);
  const huecos = huecosPermitidos(elemento.texto);
  const correctos = cortesCorrectos(elemento.silabas);
  const acierto = revelado && evaluarCortes(elemento.silabas, cortes);
  const ultima = indice === contenido.elementos.length - 1;
  const titulo = useFocoAlCambiar<HTMLHeadingElement>(indice);
  const botones = useRef(new Map<number, HTMLButtonElement>());
  const temporizadores = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => temporizadores.current.forEach(clearTimeout), []);
  useEffect(() => { if (focoInicial) titulo.current?.focus(); }, [focoInicial, titulo]);
  useEffect(() => {
    let vigente = true;
    const imagen = new Image();
    imagen.onload = () => { if (vigente) setImagenFallida(false); };
    imagen.onerror = () => { if (vigente) setImagenFallida(true); };
    imagen.src = elemento.imagen;
    return () => { vigente = false; };
  }, [elemento.imagen]);
  const sonidos = useMemo(() => ({
    acierto: contenido.efectos?.acierto ? [contenido.efectos.acierto] : [],
    fallo: contenido.efectos?.fallo ? [contenido.efectos.fallo] : [],
    finRonda: contenido.efectos?.finRonda ? [contenido.efectos.finRonda] : [],
    fin: contenido.efectos?.fin ? [contenido.efectos.fin] : [],
  }), [contenido.efectos]);
  const efectos = useEfectosGrabados(sonidos);
  const { decir } = useVozActividad();
  function alternar(i: number) { if (!revelado) setCortes((actual) => actual.includes(i) ? actual.filter((c) => c !== i) : [...actual, i].sort((a, b) => a - b)); }
  function flecha(evento: KeyboardEvent<HTMLButtonElement>, i: number) {
    if (evento.key !== "ArrowLeft" && evento.key !== "ArrowRight") return;
    evento.preventDefault();
    const posicion = huecos.indexOf(i);
    const destino = huecos[(posicion + (evento.key === "ArrowRight" ? 1 : -1) + huecos.length) % huecos.length];
    botones.current.get(destino)?.focus();
  }
  function comprobar() {
    if (revelado) return;
    efectos.preparar();
    setRevelado(true);
    setRespuestas((r) => ({ ...r, [elemento.id]: cortes }));
    setFase("anticipacion");
    temporizadores.current.push(setTimeout(() => setFase("accion"), 110));
    temporizadores.current.push(setTimeout(() => {
      setFase("impacto");
      setPose(evaluarCortes(elemento.silabas, cortes) ? "senala" : "duda");
      efectos.tocar(evaluarCortes(elemento.silabas, cortes) ? "acierto" : "fallo");
      decir(elemento.silabas.join(". ") + ".", elemento.audioSilabas ?? elemento.audio);
    }, 270));
    temporizadores.current.push(setTimeout(() => setFase("recuperacion"), 530));
    temporizadores.current.push(setTimeout(() => setFase("reposo"), 850));
  }
  function avanzar() {
    temporizadores.current.forEach(clearTimeout);
    temporizadores.current = [];
    efectos.preparar();
    efectos.tocar(ultima ? "fin" : "finRonda");
    if (ultima) alTerminar(respuestas);
    else { setIndice(indice + 1); setCortes([]); setRevelado(false); setFase("reposo"); setPose("reposo"); setImagenFallida(false); }
  }
  return <div className={s.juego} data-fase={fase} data-resultado={revelado ? (acierto ? "acierto" : "fallo") : undefined}>
    {indice === 0 ? <Lectura key={elemento.id} texto={elemento.texto} audio={elemento.audio} /> : <LecturaPosterior key={elemento.id} id={elemento.id} texto={elemento.texto} audio={elemento.audio} />}
    <Progreso actual={indice + 1} total={contenido.elementos.length} nombre="Palabra" />
    <div className={s.escena}>
      {/* eslint-disable-next-line @next/next/no-img-element -- ilustración curricular */}
      {!imagenFallida && <img className={s.ilustracion} src={elemento.imagen} alt={elemento.alt} onError={() => setImagenFallida(true)} />}
      {imagenFallida && <p className={s.pendiente}>Imagen pendiente: {elemento.alt}</p>}
      {contenido.escena?.personaje && <div className={s.personaje} aria-hidden="true">
        {(["reposo", "senala", "duda"] as const).map((nombrePose) => <span key={nombrePose} className={s.pose} data-visible={nombrePose === pose ? "" : undefined}>
          {/* eslint-disable-next-line @next/next/no-img-element -- personaje decorativo */}
          <img src={contenido.escena!.personaje![nombrePose]} alt="" />
        </span>)}
      </div>}
    </div>
    <div className={s.palabraCabeza}><h2 ref={titulo} tabIndex={-1}>Separa: {elemento.texto}</h2><Escuchar texto={elemento.texto} audio={elemento.audio} etiqueta="Escuchar la palabra" /></div>
    <p className={s.ayuda}>Toca entre las letras para cortar.<span className={s.ayudaTeclado}> Usa las flechas izquierda y derecha para cambiar de espacio.</span></p>
    <div className={s.palabra} data-larga={letras.length >= 8 ? "" : undefined} role="group" aria-label={`Cortes de ${elemento.texto}`}>
      {letras.map((letra, indiceLetra) => {
        const i = indiceLetra + 1;
        const elegido = cortes.includes(i);
        const esperado = correctos.includes(i);
        const estado = revelado ? esperado && elegido ? "correcto" : esperado ? "faltaba" : elegido ? "sobraba" : "" : "";
        return <span className={s.par} key={i}><span className={s.letra}>{letra}</span>{huecos.includes(i) && <button type="button" className={s.corte} data-estado={estado || undefined} aria-label={`Cortar entre «${letras.slice(0, i).join("")}» y «${letras.slice(i).join("")}»${revelado && estado ? `: ${estado}` : ""}`} aria-pressed={elegido} disabled={revelado} ref={(n) => { if (n) botones.current.set(i, n); else botones.current.delete(i); }} onClick={() => alternar(i)} onKeyDown={(e) => flecha(e, i)}><span aria-hidden="true">{revelado && estado === "sobraba" ? "×" : elegido || revelado && esperado ? "│" : "·"}</span></button>}</span>;
      })}
    </div>
    {revelado && <p className={s.leyenda}>│ Correcto · + Faltaba · × Sobraba</p>}
    <Aviso tono={revelado ? (acierto ? "ok" : "no") : null}>{revelado && `${acierto ? "¡Correcto!" : "Mira la separación correcta."} ${elemento.explicacion ?? `${elemento.texto}: ${elemento.silabas.join(" - ")}.`}`}</Aviso>
    <div className={s.acciones}>{revelado ? <Avanzar onClick={avanzar}>{ultima ? "Ver resultado" : "Siguiente"}</Avanzar> : <button type="button" className={s.comprobar} onClick={comprobar}>Comprobar</button>}</div>
  </div>;
}
