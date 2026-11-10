"use client";

import Image from "next/image";
import { Music2, Volume2, VolumeX, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import type { PropsJuego } from "../../reproductor/comun";
import { useFocoAlCambiar } from "../../reproductor/comun";
import { Chispas } from "../comun/efectos";
import { Guirnalda } from "../comun/piezas";
import { useRondas } from "../comun/rondas";
import { useEfectosMapa } from "./audio";
import { DEPARTAMENTOS, RECUADRO_INSULAR, VIEWBOX } from "./colombia";
import { ISLAS, REGIONES, departamento, descripcion, pistaMapa, rondasDe, vecinoEnDireccion, zona, type Flecha } from "./generador";
import type { ContenidoMapa } from "./tipo";
import s from "./mapa.module.css";

/*
  UBICA EN EL MAPA · Armi explora Colombia.
  El juego nombra un departamento; el estudiante lo toca en el mapa (ratón,
  dedo, o Tab para entrar al mapa + flechas para moverse + Enter). Sin reloj.

  Cada toque es una escena de duración fija (data-lanza en la escena):
  acierto 1800 ms (lectura → Armi carga → lanza; la chincheta vuela en arco
  → se clava al 50 % con pausa, anillo, chispas, «¡TAC!» y temblor de
  cámara → el departamento se pinta y Armi vuelve a la guardia);
  fallo 700 ms, versión suave (el departamento tocado se marca y dice su
  nombre, Armi duda; sin temblor). Los tiempos de aquí y los del CSS van juntos.
*/

const ACIERTO_MS = 1800;
const LANZAR_MS = 540; // 30 % de 1800
const IMPACTO_MS = 900; // 50 % de 1800
const FALLO_MS = 700;
const PAUSA_MS = 500;
const REVELAR_MS = 2600;

const CHISPAS: [number, number][] = [[-150, 0.9], [-110, 1], [-70, 0.95], [-30, 1.05], [10, 0.9], [50, 1], [95, 0.85], [140, 0.95]];

type Resuelto = "bien" | "corregida" | "revelada";
type Punto = { x: number; y: number };
type Lanza = { tipo: "acierto" | "fallo"; id: string; cierra: boolean; n: number; desde: Punto; hasta: Punto };

/** Orden de lectura (arriba → abajo, izquierda → derecha) para numerar sin dar nombres. */
const ORDEN = [...DEPARTAMENTOS].sort((a, b) => a.centro[1] - b.centro[1] || a.centro[0] - b.centro[0]).map((d) => d.id);
const FLECHAS: Record<string, Flecha> = { ArrowUp: "arriba", ArrowDown: "abajo", ArrowLeft: "izquierda", ArrowRight: "derecha" };
const pct = (id: string) => {
  const [x, y] = departamento(id).centro;
  return { left: `${(x / VIEWBOX.ancho) * 100}%`, top: `${(y / VIEWBOX.alto) * 100}%` };
};

export function JuegoMapa({ contenido, alTerminar }: PropsJuego<ContenidoMapa>) {
  const rondas = useMemo(() => rondasDe(contenido), [contenido]);
  const [registro, setRegistro] = useState<Record<string, string[]>>({});
  const r = useRondas({
    rondas,
    correcta: (x) => x.departamento,
    alTerminar: () => alTerminar(registro),
    efectosPropios: true,
  });
  const efectos = useEfectosMapa();
  const [fase, setFase] = useState<"inicio" | "jugar">("inicio");
  const [lanza, setLanza] = useState<Lanza | null>(null);
  const [resueltos, setResueltos] = useState<Record<string, Resuelto>>({});
  const [fallados, setFallados] = useState<string[]>([]);
  const [resaltado, setResaltado] = useState<string | null>(null);
  /** Foco de teclado (solo :focus-visible), aparte del resaltado del ratón. */
  const [enfocado, setEnfocado] = useState<string | null>(null);
  const [enfocable, setEnfocable] = useState("CO-CUN");
  /** El confeti común sale en el impacto de la chincheta, no en el clic. */
  const [celebra, setCelebra] = useState(false);
  const [musicaActiva, setMusicaActiva] = useState(true);
  const musicaRef = useRef<HTMLAudioElement>(null);
  const camaraRef = useRef<HTMLDivElement>(null);
  const tierraRef = useRef<HTMLDivElement>(null);
  const armiRef = useRef<HTMLDivElement>(null);
  const botones = useRef<Record<string, SVGGElement | null>>({});
  const contador = useRef(0);
  const titulo = useFocoAlCambiar<HTMLHeadingElement>(r.indice);
  const { ronda } = r;
  const objetivo = departamento(ronda.departamento);
  const ocupado = lanza !== null;
  const puntos = Object.entries(registro).reduce((t, [id, toques]) => {
    const rr = rondas.find((x) => x.id === id);
    return t + (rr ? (toques[0] === rr.departamento ? 2 : toques[1] === rr.departamento ? 1 : 0) : 0);
  }, 0);

  useEffect(() => {
    const audio = musicaRef.current;
    if (!audio) return;
    if (fase === "jugar" && musicaActiva) {
      audio.volume = 0.28;
      void audio.play().catch(() => { /* el navegador puede pedir otro gesto */ });
    } else audio.pause();
  }, [fase, musicaActiva]);

  useEffect(() => {
    const alOcultar = () => { if (document.hidden) musicaRef.current?.pause(); else if (fase === "jugar" && musicaActiva) void musicaRef.current?.play().catch(() => {}); };
    document.addEventListener("visibilitychange", alOcultar);
    return () => document.removeEventListener("visibilitychange", alOcultar);
  }, [fase, musicaActiva]);

  // Fin de cada escena: liberar para otro toque, o (acierto / segundo fallo) pasar de ronda.
  useEffect(() => {
    if (!lanza) return;
    if (!lanza.cierra) {
      const t = window.setTimeout(() => setLanza(null), FALLO_MS);
      return () => window.clearTimeout(t);
    }
    const espera = lanza.tipo === "acierto" ? ACIERTO_MS + PAUSA_MS : REVELAR_MS;
    const impacto = lanza.tipo === "acierto" ? window.setTimeout(() => setCelebra(true), IMPACTO_MS) : undefined;
    const t = window.setTimeout(() => {
      setLanza(null);
      setCelebra(false);
      setFallados([]);
      if (!r.ultima) efectos.tocar("aparecer", 80);
      r.siguiente();
    }, espera);
    return () => { window.clearTimeout(t); window.clearTimeout(impacto); };
    // r.siguiente y efectos cambian en cada render; la escena solo depende del toque.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lanza]);

  /** Puntos de la escena en píxeles de la cámara: la mano de Armi y el centro del departamento. */
  function trayecto(id: string): { desde: Punto; hasta: Punto } {
    const cam = camaraRef.current?.getBoundingClientRect();
    const tierra = tierraRef.current?.getBoundingClientRect();
    const armi = armiRef.current?.getBoundingClientRect();
    if (!cam || !tierra) return { desde: { x: 0, y: 0 }, hasta: { x: 0, y: 0 } };
    const [cx, cy] = departamento(id).centro;
    const hasta = { x: tierra.left - cam.left + (cx / VIEWBOX.ancho) * tierra.width, y: tierra.top - cam.top + (cy / VIEWBOX.alto) * tierra.height };
    const desde = armi ? { x: armi.left - cam.left + armi.width * 0.84, y: armi.top - cam.top + armi.height * 0.42 } : { x: hasta.x - 200, y: hasta.y };
    return { desde, hasta };
  }

  function tocar(id: string) {
    if (fase !== "jugar" || ocupado || r.cerrada || resueltos[id] || fallados.includes(id)) return;
    const bien = id === ronda.departamento;
    const toques = [...(registro[ronda.id] ?? []), id].slice(0, 2);
    setRegistro((x) => ({ ...x, [ronda.id]: toques }));
    const cierra = bien || toques.length >= 2;
    if (bien) setResueltos((m) => ({ ...m, [id]: toques.length === 1 ? "bien" : "corregida" }));
    else {
      setFallados((f) => [...f, id]);
      if (cierra) setResueltos((m) => ({ ...m, [ronda.departamento]: "revelada" }));
    }
    setResaltado(null);
    setLanza({ tipo: bien ? "acierto" : "fallo", id, cierra, n: ++contador.current, ...trayecto(id) });
    r.responder(id);
    if (bien) {
      efectos.tocar("lanzar", LANZAR_MS);
      efectos.tocar("clavar", IMPACTO_MS);
      efectos.tocar("acierto", IMPACTO_MS + 80);
    } else {
      efectos.tocar("toque");
      efectos.tocar("error", 90);
    }
  }

  function teclas(evento: KeyboardEvent<SVGGElement>, id: string) {
    if (evento.key === "Enter" || evento.key === " ") {
      evento.preventDefault();
      tocar(id);
      return;
    }
    const flecha = FLECHAS[evento.key];
    if (!flecha) return;
    evento.preventDefault();
    const siguiente = vecinoEnDireccion(id, flecha);
    if (siguiente) {
      setEnfocable(siguiente);
      botones.current[siguiente]?.focus();
    }
  }

  function comenzar() {
    efectos.preparar();
    setFase("jugar");
    window.setTimeout(() => efectos.tocar("aparecer"), 120);
  }

  const ultimo = r.intentos.at(-1);
  let aviso = "";
  if (ultimo !== undefined) {
    const region = `está en la región ${REGIONES[objetivo.region]}`;
    if (r.acerto) aviso = r.intentos.length === 1 ? `¡Muy bien! ${objetivo.nombre} ${region}.` : `¡Corregido! ${objetivo.nombre} ${region}.`;
    else if (r.cerrada) aviso = `Era ${objetivo.nombre}. ${descripcion(objetivo.id)} Vamos con el siguiente.`;
    else aviso = `Tocaste ${departamento(ultimo).nombre}. ${pistaMapa(objetivo.id, ultimo)}`;
  }
  const tono = !aviso ? undefined : r.acerto ? "ok" : r.cerrada ? "solucion" : "no";

  function nombreAccesible(id: string) {
    const d = departamento(id);
    if (resueltos[id]) return `${d.nombre}, ubicado`;
    if (fallados.includes(id)) return `${d.nombre}, no es`;
    return `Departamento ${ORDEN.indexOf(id) + 1} de ${ORDEN.length}, en ${zona(id)}`;
  }

  const senalado = enfocado ?? resaltado;
  const etiquetas = new Set<string>([...fallados, ...(senalado && resueltos[senalado] ? [senalado] : [])]);
  if (r.cerrada) etiquetas.add(ronda.departamento);
  const estiloLanza = lanza
    ? ({
        "--gx": `${lanza.hasta.x}px`,
        "--gy": `${lanza.hasta.y}px`,
        "--vuelo": `path("M ${lanza.desde.x} ${lanza.desde.y} Q ${(lanza.desde.x + lanza.hasta.x) / 2} ${Math.min(lanza.desde.y, lanza.hasta.y) - 140} ${lanza.hasta.x} ${lanza.hasta.y}")`,
      } as CSSProperties)
    : undefined;

  return (
    <div className={s.juego}>
      <audio ref={musicaRef} src="/audio/juegos/mapa/musica-exploracion.mp3" loop preload="none" aria-hidden="true" />
      <div className={s.escena} data-lanza={lanza ? lanza.tipo : undefined} data-fase={fase} style={estiloLanza}>
        <span className={s.fondo} aria-hidden="true" />

        {fase === "jugar" && (
          <div className={s.cabecera}>
            <div className={s.panel}>
              <Guirnalda estados={r.estados} actual={r.indice} />
              <h2 key={ronda.id} ref={titulo} tabIndex={-1} className={s.consigna}>
                <span className={s.solo}>Ronda {r.indice + 1}: </span>
                <span className={s.verbo}>¿Dónde está</span> <span className={s.lugar}>{objetivo.nombre}</span><span className={s.verbo}>?</span>
              </h2>
              <div className={s.botones}>
                <span className={s.dato}>Puntos <strong>{puntos}</strong> de {rondas.length * 2}</span>
                <button type="button" className={s.icono} aria-label={efectos.activo ? "Desactivar efectos" : "Activar efectos"} aria-pressed={efectos.activo} onClick={efectos.alternar}>
                  {efectos.activo ? <Volume2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}
                </button>
                <button type="button" className={s.icono} aria-label={musicaActiva ? "Desactivar música" : "Activar música"} aria-pressed={musicaActiva} onClick={() => setMusicaActiva((m) => !m)}>
                  <Music2 aria-hidden="true" />
                  {!musicaActiva && <span className={s.tachado} aria-hidden="true" />}
                </button>
              </div>
            </div>
            <p className={s.aviso} role="status" data-tono={tono}>{aviso}</p>
          </div>
        )}

        {/* La cámara filma la mesa: Armi, el mapa, la chincheta y el impacto. La cabecera no se mueve. */}
        <div ref={camaraRef} className={s.camara}>
          <div ref={armiRef} className={s.armi} aria-hidden="true">
            <span className={s.sombra} />
            <span className={s.cuerpo}>
              <span className={s.poseNormal}>
                <Image src="/images/juegos/mapa/armi.webp" alt="" width={486} height={640} sizes="(max-width: 720px) 34vw, 400px" priority draggable={false} />
              </span>
              <Image src="/images/juegos/mapa/armi-lanza.webp" alt="" width={486} height={640} sizes="(max-width: 720px) 34vw, 400px" className={s.poseLanza} draggable={false} />
            </span>
          </div>

          <div ref={tierraRef} className={s.tierra} data-fronteras={contenido.fronteras ? "" : undefined}>
            <svg viewBox={`0 0 ${VIEWBOX.ancho} ${VIEWBOX.alto}`} className={s.svg} role="group" aria-label={`Mapa de Colombia por departamentos. Busca ${objetivo.nombre}.`} aria-describedby="ayuda-mapa">
              <defs>
                <pattern id="rayas-revelada" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                  <rect width="10" height="10" fill="#b9dff0" />
                  <rect width="4" height="10" fill="#7fbfdc" />
                </pattern>
              </defs>
              <rect className={s.recuadro} x={RECUADRO_INSULAR.x} y={RECUADRO_INSULAR.y} width={RECUADRO_INSULAR.ancho} height={RECUADRO_INSULAR.alto} rx="10" aria-hidden="true" />
              {DEPARTAMENTOS.map((d) => {
                const estado = resueltos[d.id] ?? (fallados.includes(d.id) ? "fallo" : undefined);
                const pequeno = d.id === ISLAS || ["CO-DC", "CO-QUI", "CO-ATL", "CO-RIS", "CO-CAL"].includes(d.id);
                return (
                  <g
                    key={d.id}
                    ref={(el) => { botones.current[d.id] = el; }}
                    className={s.depto}
                    data-estado={estado}
                    role="button"
                    tabIndex={fase === "jugar" && d.id === enfocable ? 0 : -1}
                    aria-label={nombreAccesible(d.id)}
                    aria-disabled={ocupado || r.cerrada || Boolean(estado) || undefined}
                    onClick={() => tocar(d.id)}
                    onKeyDown={(e) => teclas(e, d.id)}
                    onFocus={(e) => { setEnfocable(d.id); if (e.currentTarget.matches(":focus-visible")) setEnfocado(d.id); }}
                    onBlur={() => setEnfocado((x) => (x === d.id ? null : x))}
                    onMouseEnter={() => setResaltado(d.id)}
                    onMouseLeave={() => setResaltado((x) => (x === d.id ? null : x))}
                  >
                    <path d={d.d} fillRule="evenodd" />
                    {d.id === ISLAS ? (
                      <rect className={s.area} x={RECUADRO_INSULAR.x} y={RECUADRO_INSULAR.y} width={RECUADRO_INSULAR.ancho} height={RECUADRO_INSULAR.alto} rx="10" />
                    ) : pequeno ? (
                      <circle className={s.area} cx={d.centro[0]} cy={d.centro[1]} r="16" />
                    ) : null}
                  </g>
                );
              })}
              {/* Contorno encima de todo: el departamento señalado no queda tapado por sus vecinos. */}
              {resaltado && resaltado !== enfocado && <path className={s.contorno} d={departamento(resaltado).d} fillRule="evenodd" aria-hidden="true" />}
              {enfocado && (
                <g aria-hidden="true">
                  <path className={s.focoHalo} d={departamento(enfocado).d} fillRule="evenodd" />
                  <path className={s.foco} d={departamento(enfocado).d} fillRule="evenodd" />
                </g>
              )}
              {r.cerrada && !r.acerto && <path className={s.revelado} d={objetivo.d} fillRule="evenodd" aria-hidden="true" />}
              {lanza?.tipo === "fallo" && <circle key={lanza.n} className={s.onda} cx={departamento(lanza.id).centro[0]} cy={departamento(lanza.id).centro[1]} r="30" aria-hidden="true" />}
            </svg>
            <p id="ayuda-mapa" className={s.solo}>Usa las flechas para pasar al departamento vecino y Enter para elegirlo.</p>

            {/* Chinchetas clavadas y nombres: HTML encima del mapa, en la misma proporción. */}
            <div className={s.capa} aria-hidden="true">
              {Object.entries(resueltos).map(([id, estado]) =>
                estado === "revelada" ? null : (
                  <Image key={id} src="/images/juegos/mapa/chincheta.webp" alt="" width={189} height={280} sizes="48px" className={s.clavada} data-nueva={lanza?.id === id ? "" : undefined} style={pct(id)} draggable={false} />
                ),
              )}
              {[...etiquetas].map((id) => (
                <span key={id} className={s.etiqueta} data-estado={resueltos[id] ?? (fallados.includes(id) ? "fallo" : undefined)} data-nueva={lanza?.id === id ? "" : undefined} style={pct(id)}>
                  {fallados.includes(id) && <X className={s.equis} strokeWidth={3.2} />}
                  {departamento(id).nombre}
                </span>
              ))}
            </div>
          </div>

          {/* La chincheta en vuelo y el impacto: solo decoración, el resultado está escrito en el aviso. */}
          {lanza?.tipo === "acierto" && (
            <div key={lanza.n} className={s.vuelo} aria-hidden="true">
              <Image src="/images/juegos/mapa/chincheta.webp" alt="" width={189} height={280} sizes="80px" className={s.chincheta} draggable={false} />
              <span className={s.impacto}>
                <span className={s.anillo} />
                {CHISPAS.map(([angulo, distancia]) => (
                  <i key={angulo} style={{ "--a": `${angulo}deg`, "--d": distancia } as CSSProperties} />
                ))}
                <b className={s.onomatopeya}>¡TAC!</b>
              </span>
            </div>
          )}
        </div>

        <Chispas reaccion={celebra ? r.reaccion : null} />

        {fase === "inicio" && (
          <div className={s.inicio}>
            <h2>¡Ubica en el mapa!</h2>
            <p>Armi va a explorar Colombia. En cada ronda te dice un departamento: tócalo en el mapa y Armi le clava su chincheta. También puedes usar el teclado: Tab para entrar al mapa, flechas para moverte y Enter para elegir. No hay reloj: mira con calma.</p>
            <button type="button" className={s.primario} onClick={comenzar}>Jugar</button>
          </div>
        )}
      </div>
    </div>
  );
}
