"use client";

import Image from "next/image";
import { Music2, Volume2, VolumeX, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { PropsJuego } from "../../reproductor/comun";
import { useFocoAlCambiar } from "../../reproductor/comun";
import { Chispas } from "../comun/efectos";
import { Guirnalda } from "../comun/piezas";
import { useRondas } from "../comun/rondas";
import { useEfectosGolpea } from "./audio";
import { rondasDe, textoOperacion, type OpcionGolpea, type RondaGolpea } from "./generador";
import type { ContenidoGolpea } from "./tipo";
import s from "./golpea.module.css";

/*
  GOLPEA EL RESULTADO · el taller de los topos.
  Diez escotillas en tres filas (3-4-3); en cada ronda asoman 7 u 8 topos
  robot con un número. Se golpea el del resultado con el ratón, el dedo,
  Tab + Enter o la tecla de su escotilla (1–9 y 0). Sin reloj.

  Cada golpe es una escena de duración fija (data-golpe en la escena):
  acierto 1700 ms (el mazo se alza → cae → impacto con pausa, estrella,
  «¡TOC!» y temblor de cámara → el topo celebra y el mazo se retira);
  fallo 900 ms, versión suave (golpecito, el topo se marea, sin temblor).
  Los tiempos de aquí y los del CSS van juntos.
*/

const ACIERTO_MS = 1700;
const IMPACTO_ACIERTO_MS = 714; // 42 % de 1700
const FALLO_MS = 900;
const IMPACTO_FALLO_MS = 405; // 45 % de 900
const REVELAR_MS = 1600;
const BAJAR_MS = 450;

/** Centro de cada escotilla (x %, y % del borde inferior), en orden de lectura. */
const ESCOTILLAS: [number, number][] = [
  [27, 37], [50, 37], [73, 37],
  [13, 64], [38, 64], [62, 64], [87, 64],
  [27, 91], [50, 91], [73, 91],
];
const TECLAS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
const CHISPAS: [number, number][] = [[-160, 0.55], [-115, 0.65], [-70, 0.6], [-25, 0.68], [20, 0.55], [65, 0.6]];

type Golpe = { hueco: number; tipo: "acierto" | "fallo"; cierra: boolean; n: number };

function pista(ronda: RondaGolpea, valor: number) {
  const diferencia = Math.abs(valor - ronda.resultado);
  if (diferencia === 10 || diferencia === 20) return "Revisa las decenas.";
  if (diferencia <= 2) return "Revisa las unidades y cuenta con calma.";
  return "Calcula otra vez paso a paso.";
}

export function JuegoGolpea({ contenido, alTerminar }: PropsJuego<ContenidoGolpea>) {
  const rondas = useMemo(() => rondasDe(contenido), [contenido]);
  const [registro, setRegistro] = useState<Record<string, number[]>>({});
  const r = useRondas({
    rondas,
    correcta: (x) => x.resultado,
    alTerminar: () => alTerminar(registro),
    efectosPropios: true,
  });
  const efectos = useEfectosGolpea();
  const [fase, setFase] = useState<"inicio" | "jugar">("inicio");
  const [golpe, setGolpe] = useState<Golpe | null>(null);
  const [marcados, setMarcados] = useState<Record<number, "acierto" | "fallo">>({});
  const [bajando, setBajando] = useState(false);
  const [musicaActiva, setMusicaActiva] = useState(true);
  const musicaRef = useRef<HTMLAudioElement>(null);
  const contador = useRef(0);
  const titulo = useFocoAlCambiar<HTMLHeadingElement>(r.indice);
  const { ronda } = r;
  const ocupado = golpe !== null || bajando;
  const puntos = Object.entries(registro).reduce((t, [id, golpes]) => {
    const rr = rondas.find((x) => x.id === id);
    return t + (rr ? (golpes[0] === rr.resultado ? 2 : golpes[1] === rr.resultado ? 1 : 0) : 0);
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

  // Fin de cada escena: liberar para otro golpe, o mostrar la solución, bajar y pasar de ronda.
  useEffect(() => {
    if (!golpe) return;
    const duracion = golpe.tipo === "acierto" ? ACIERTO_MS : FALLO_MS;
    if (!golpe.cierra) {
      const t = window.setTimeout(() => setGolpe(null), duracion);
      return () => window.clearTimeout(t);
    }
    const espera = duracion + (golpe.tipo === "fallo" ? REVELAR_MS : 0);
    const t1 = window.setTimeout(() => setBajando(true), espera);
    const t2 = window.setTimeout(() => {
      setBajando(false);
      setGolpe(null);
      setMarcados({});
      if (!r.ultima) efectos.tocar("aparecer", 80);
      r.siguiente();
    }, espera + BAJAR_MS);
    return () => { window.clearTimeout(t1); window.clearTimeout(t2); };
    // r.siguiente y efectos cambian en cada render; la escena solo depende del golpe.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [golpe]);

  function golpear(opcion: OpcionGolpea) {
    if (fase !== "jugar" || ocupado || r.cerrada || marcados[opcion.hueco]) return;
    const bien = opcion.valor === ronda.resultado;
    const golpes = [...(registro[ronda.id] ?? []), opcion.valor].slice(0, 2);
    setRegistro((x) => ({ ...x, [ronda.id]: golpes }));
    const cierra = bien || golpes.length >= 2;
    setMarcados((m) => ({ ...m, [opcion.hueco]: bien ? "acierto" : "fallo" }));
    setGolpe({ hueco: opcion.hueco, tipo: bien ? "acierto" : "fallo", cierra, n: ++contador.current });
    r.responder(opcion.valor);
    if (bien) {
      efectos.tocar("golpe", IMPACTO_ACIERTO_MS);
      efectos.tocar("acierto", IMPACTO_ACIERTO_MS + 60);
    } else {
      efectos.tocar("golpecito", IMPACTO_FALLO_MS);
      efectos.tocar("error", IMPACTO_FALLO_MS + 60);
    }
  }

  useEffect(() => {
    if (fase !== "jugar") return;
    function manejar(evento: KeyboardEvent) {
      if (evento.repeat || evento.altKey || evento.ctrlKey || evento.metaKey) return;
      const hueco = TECLAS.indexOf(evento.key);
      const opcion = ronda.opciones.find((o) => o.hueco === hueco);
      if (opcion) golpear(opcion);
    }
    window.addEventListener("keydown", manejar);
    return () => window.removeEventListener("keydown", manejar);
  });

  function comenzar() {
    efectos.preparar();
    setFase("jugar");
    window.setTimeout(() => efectos.tocar("aparecer"), 120);
  }

  const operacion = textoOperacion(ronda);
  const ultimoValor = r.intentos.at(-1);
  let aviso = "";
  if (ultimoValor !== undefined) {
    const intentos = r.intentos.length;
    if (r.acerto) aviso = intentos === 1 ? `¡Muy bien! ${operacion} = ${ronda.resultado}.` : `¡Corregido! ${operacion} = ${ronda.resultado}.`;
    else if (r.cerrada) aviso = `La respuesta era ${ronda.resultado}: ${operacion} = ${ronda.resultado}. Vamos con la siguiente.`;
    else aviso = `Ese topo tenía ${ultimoValor}. ${pista(ronda, ultimoValor)} ¿Cuánto es ${operacion}?`;
  }
  const tono = !aviso ? undefined : r.acerto ? "ok" : r.cerrada ? "solucion" : "no";
  const golpeado = golpe ? ESCOTILLAS[golpe.hueco] : null;

  return (
    <div className={s.juego}>
      <audio ref={musicaRef} src="/audio/juegos/golpea/musica-taller.mp3" loop preload="none" aria-hidden="true" />
      <div
        className={s.escena}
        data-golpe={golpe ? golpe.tipo : undefined}
        data-fase={fase}
        style={golpeado ? ({ "--gx": `${golpeado[0]}%`, "--gy": `${golpeado[1]}%` } as CSSProperties) : undefined}
      >
        <span className={s.fondo} aria-hidden="true" />

        {fase === "jugar" && (
          <div className={s.cabecera}>
            <div className={s.panel}>
              <Guirnalda estados={r.estados} actual={r.indice} />
              <h2 ref={titulo} tabIndex={-1} className={s.operacion}>
                <span className={s.solo}>Ronda {r.indice + 1}: </span>
                {operacion} = <span className={s.incognita} data-resuelta={r.cerrada ? "" : undefined}>{r.cerrada ? ronda.resultado : "?"}</span>
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

        {/* La cámara filma el taller (escotillas, topos, mazo e impacto); la cabecera no se mueve. */}
        <div className={s.camara}>
          {fase === "jugar" && (
            <div key={ronda.id} className={s.taller} data-bajando={bajando ? "" : undefined} role="group" aria-label={`Topos con números. Golpea el que tiene el resultado de ${operacion}`}>
              {ESCOTILLAS.map(([x, y], hueco) => {
                const opcion = ronda.opciones.find((o) => o.hueco === hueco);
                const marca = marcados[hueco];
                const revelado = !marca && r.cerrada && !r.acerto && opcion?.valor === ronda.resultado;
                return (
                  <div key={hueco} className={s.escotilla} style={{ "--x": `${x}%`, "--y": `${y}%`, zIndex: y > 80 ? 3 : y > 60 ? 2 : 1, "--retardo": `${(hueco * 37) % 160}ms` } as CSSProperties}>
                    <span className={s.hoyo} aria-hidden="true" />
                    {opcion && (
                      <div className={s.ventana}>
                        <button
                          type="button"
                          className={s.topo}
                          data-estado={marca ?? (revelado ? "revelado" : undefined)}
                          disabled={ocupado || r.cerrada || Boolean(marca)}
                          aria-label={`${opcion.valor}${marca === "fallo" ? ", no es" : marca === "acierto" ? ", correcto" : revelado ? ", es la respuesta" : ""}`}
                          aria-keyshortcuts={TECLAS[hueco]}
                          onClick={() => golpear(opcion)}
                        >
                          <span className={s.poses} aria-hidden="true">
                            <Image src="/images/juegos/golpea/topo.webp" alt="" width={536} height={640} sizes="240px" className={s.poseNormal} draggable={false} />
                            <Image src="/images/juegos/golpea/topo-contento.webp" alt="" width={536} height={640} sizes="240px" className={s.poseContento} draggable={false} />
                            <Image src="/images/juegos/golpea/topo-mareado.webp" alt="" width={536} height={640} sizes="240px" className={s.poseMareado} draggable={false} />
                            <span className={s.cartel}>
                              {opcion.valor}
                              {marca === "fallo" && <X className={s.tache} strokeWidth={3.2} />}
                            </span>
                          </span>
                        </button>
                      </div>
                    )}
                    <span className={s.labio} aria-hidden="true" />
                    <kbd className={s.tecla} aria-hidden="true">{TECLAS[hueco]}</kbd>
                  </div>
                );
              })}
            </div>
          )}
          {/* El mazo y el impacto: solo decoración, el resultado está escrito en el aviso. */}
          {golpe && (
            <div key={golpe.n} className={s.golpe} data-tipo={golpe.tipo} aria-hidden="true">
              <Image src="/images/juegos/golpea/mazo.webp" alt="" width={600} height={400} sizes="300px" className={s.mazo} draggable={false} />
              <span className={s.impacto}>
                <span className={s.estrella} />
                <span className={s.anillo} />
                {CHISPAS.map(([angulo, distancia]) => (
                  <i key={angulo} style={{ "--a": `${angulo}deg`, "--d": distancia } as CSSProperties} />
                ))}
                <b className={s.onomatopeya}>¡TOC!</b>
              </span>
            </div>
          )}
        </div>

        <Chispas reaccion={r.reaccion} />

        {fase === "inicio" && (
          <div className={s.inicio}>
            <h2>¡Golpea el resultado!</h2>
            <p>Resuelve la operación y dale un golpecito al topo que tiene el resultado en su cartel. Usa el ratón, el dedo o la tecla de cada escotilla (1 a 9 y 0). No hay reloj: piensa con calma.</p>
            <button type="button" className={s.primario} onClick={comenzar}>Jugar</button>
          </div>
        )}
      </div>
    </div>
  );
}
