"use client";

import Image from "next/image";
import { Maximize2, Minimize2, Music2, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { PropsJuego } from "../../reproductor/comun";
import { useFocoAlCambiar } from "../../reproductor/comun";
import { useSonido } from "../comun/sonido";
import { retosDe, type ContenidoRobots } from "./tipo";
import s from "./robots.module.css";

const SEGUNDOS = 15;
const ROBOTS = ["Turquesa", "Violeta", "Cobre", "Azul"] as const;
/** Chispas del impacto: ángulo de salida y distancia (fracción del tamaño del robot). */
const CHISPAS: [number, number][] = [[-165, 0.5], [-122, 0.62], [-78, 0.55], [-34, 0.66], [12, 0.52], [58, 0.6], [104, 0.48], [148, 0.58]];

export function JuegoRobots({ contenido, alTerminar }: PropsJuego<ContenidoRobots>) {
  const retos = useMemo(() => retosDe(contenido), [contenido]);
  const [fase, setFase] = useState<"elegir" | "jugar">("elegir");
  const [robot, setRobot] = useState(0);
  const [indice, setIndice] = useState(0);
  const [tiempo, setTiempo] = useState(SEGUNDOS);
  const [vidas, setVidas] = useState(3);
  const [puntos, setPuntos] = useState(0);
  const [pausa, setPausa] = useState(false);
  const [respuesta, setRespuesta] = useState<number | null | undefined>();
  const [respuestas, setRespuestas] = useState<Record<string, number | null>>({});
  const [musicaActiva, setMusicaActiva] = useState(true);
  const [expandido, setExpandido] = useState(false);
  const juegoRef = useRef<HTMLDivElement>(null);
  const musicaRef = useRef<HTMLAudioElement>(null);
  const { activo: sonidoActivo, alternar: alternarSonido, tocar } = useSonido();
  const titulo = useFocoAlCambiar<HTMLHeadingElement>(indice);
  const reto = retos[indice];
  const correcta = respuesta === reto.divisor;
  const duelo = respuesta === undefined ? undefined : correcta ? "acierto" : "fallo";

  useEffect(() => {
    const audio = musicaRef.current;
    if (!audio) return;
    if (fase === "jugar" && !pausa && musicaActiva) {
      void audio.play().catch(() => { /* El navegador puede exigir otro gesto. */ });
    } else {
      audio.pause();
    }
  }, [fase, pausa, musicaActiva]);

  useEffect(() => {
    if (!expandido) return;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = anterior; };
  }, [expandido]);

  useEffect(() => {
    const alCambiarPantalla = () => {
      if (!document.fullscreenElement) setExpandido(false);
    };
    const alOcultar = () => { if (document.hidden) setPausa(true); };
    document.addEventListener("fullscreenchange", alCambiarPantalla);
    document.addEventListener("visibilitychange", alOcultar);
    return () => {
      document.removeEventListener("fullscreenchange", alCambiarPantalla);
      document.removeEventListener("visibilitychange", alOcultar);
    };
  }, []);

  async function alternarPantalla() {
    if (expandido) {
      setExpandido(false);
      if (document.fullscreenElement === juegoRef.current) await document.exitFullscreen().catch(() => {});
    } else {
      setExpandido(true);
      await juegoRef.current?.requestFullscreen?.().catch(() => { /* La vista fija cubre la pantalla como alternativa. */ });
    }
  }

  function comenzar() {
    tocar("toque");
    setFase("jugar");
    setExpandido(true);
    const audio = musicaRef.current;
    if (audio && musicaActiva) {
      audio.volume = 0.28;
      void audio.play().catch(() => {});
    }
    void juegoRef.current?.requestFullscreen?.().catch(() => {});
  }

  const responder = useCallback((valor: number | null) => {
    if (fase !== "jugar" || pausa || respuesta !== undefined) return;
    setRespuesta(valor);
    setRespuestas((previas) => ({ ...previas, [reto.id]: valor }));
    if (valor === reto.divisor) {
      setPuntos((actual) => actual + Math.max(1, tiempo));
      tocar("acierto");
    } else {
      setVidas((actual) => actual - 1);
      tocar("error");
    }
  }, [fase, pausa, respuesta, reto, tiempo, tocar]);

  useEffect(() => {
    if (fase !== "jugar" || pausa || respuesta !== undefined) return;
    const reloj = window.setTimeout(() => {
      if (tiempo <= 1) {
        setTiempo(0);
        responder(null);
      } else {
        if (tiempo <= 6) tocar("reloj");
        setTiempo(tiempo - 1);
      }
    }, 1000);
    return () => window.clearTimeout(reloj);
  }, [fase, pausa, respuesta, tiempo, responder, tocar]);

  useEffect(() => {
    if (respuesta === undefined) return;
    // Coincide con el choque de la animación (48 % de 2650 ms).
    const impacto = window.setTimeout(() => tocar("impacto"), 1280);
    const siguiente = window.setTimeout(() => {
      if (vidas === 0 || indice === retos.length - 1) {
        tocar("fin");
        alTerminar(respuestas);
      } else {
        setIndice((actual) => actual + 1);
        setTiempo(SEGUNDOS);
        setRespuesta(undefined);
      }
    }, 2650);
    return () => { window.clearTimeout(impacto); window.clearTimeout(siguiente); };
  }, [respuesta, vidas, indice, retos.length, respuestas, alTerminar, tocar]);

  useEffect(() => {
    if (fase !== "jugar" || pausa || respuesta !== undefined) return;
    function manejar(evento: KeyboardEvent) {
      if (evento.repeat || evento.altKey || evento.ctrlKey || evento.metaKey) return;
      const opcion = Number(evento.key) - 1;
      if (opcion >= 0 && opcion < 4) responder(reto.opciones[opcion]);
    }
    window.addEventListener("keydown", manejar);
    return () => window.removeEventListener("keydown", manejar);
  }, [fase, pausa, respuesta, responder, reto]);

  return (
    <div ref={juegoRef} className={s.juego} data-expandido={expandido ? "" : undefined}>
      <audio ref={musicaRef} src="/audio/juegos/robots/musica-duelo.mp3" loop preload="none" aria-hidden="true" />
      <div className={s.escena} data-duelo={duelo} data-pausa={pausa ? "" : undefined}>
        {fase === "elegir" ? (
          <div className={s.inicio}>
            <h2>Elige tu robot</h2>
            <p>Busca el número que falta en cada división. Tienes 15 segundos por ronda y tres oportunidades.</p>
            <div className={s.selector} role="group" aria-label="Elige tu robot">
              {ROBOTS.map((nombre, i) => (
                <button key={nombre} type="button" className={s.robotOpcion} data-elegido={robot === i ? "" : undefined} aria-pressed={robot === i} onClick={() => { setRobot(i); tocar("toque"); }}>
                  <Image src="/images/juegos/robots/robot.webp" alt="" width={90} height={84} className={s.robotMini} data-color={i} />
                  <span>{nombre}</span>
                </button>
              ))}
            </div>
            <button type="button" className={s.primario} onClick={comenzar}>Jugar en pantalla completa</button>
          </div>
        ) : (
          <>
            <div className={s.panelSuperior}>
              <span className={s.dato}>Ronda <strong>{indice + 1} de {retos.length}</strong></span>
              <span className={s.dato} data-puntaje="">Puntaje <strong>{puntos}</strong>{correcta && <span className={s.monedas} aria-hidden="true"><i /><i /><i /></span>}</span>
              <span className={s.dato} aria-label={`${vidas} oportunidades restantes`}>Oportunidades <strong>{"●".repeat(vidas)}{"○".repeat(3 - vidas)}</strong></span>
              <button type="button" className={s.icono} disabled={duelo !== undefined} aria-label={pausa ? "Reanudar juego" : "Pausar juego"} onClick={() => setPausa((actual) => !actual)}>{pausa ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}</button>
              <button type="button" className={s.icono} aria-label={sonidoActivo ? "Desactivar efectos" : "Activar efectos"} aria-pressed={sonidoActivo} onClick={alternarSonido}>{sonidoActivo ? <Volume2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}</button>
              <button type="button" className={s.icono} aria-label={musicaActiva ? "Desactivar música" : "Activar música"} aria-pressed={musicaActiva} onClick={() => setMusicaActiva((actual) => !actual)}><Music2 aria-hidden="true" />{!musicaActiva && <span className={s.tachado} aria-hidden="true" />}</button>
              <button type="button" className={s.icono} aria-label={expandido ? "Salir de pantalla completa" : "Abrir pantalla completa"} aria-pressed={expandido} onClick={() => void alternarPantalla()}>{expandido ? <Minimize2 aria-hidden="true" /> : <Maximize2 aria-hidden="true" />}</button>
            </div>
            {/* Escena de acción, solo decorativa: el resultado ya está escrito en el tablero y en el mensaje. */}
            <div className={s.arena} aria-hidden="true">
              <div className={s.camara}>
                <span className={s.fondo} />
                <span className={s.lineas} />
                <div className={s.combatiente} data-lado="jugador">
                  <span className={s.aura} />
                  {/* Dos estados: en guardia (normal) y en ataque; el CSS cambia de uno a otro durante el golpe. */}
                  <span className={s.poseNormal}>
                    <Image src="/images/juegos/robots/robot.webp" alt="" width={300} height={280} sizes="(max-width: 650px) 40vw, 460px" className={s.robotEnArena} data-color={robot} />
                  </span>
                  <Image src="/images/juegos/robots/robot-ataque.webp" alt="" width={300} height={280} sizes="(max-width: 650px) 40vw, 460px" className={`${s.robotEnArena} ${s.poseAtaque}`} data-color={robot} />
                </div>
                <div className={s.combatiente} data-lado="rival">
                  <span className={s.aura} />
                  <span className={s.poseNormal}>
                    <Image src="/images/juegos/robots/rival.webp" alt="" width={300} height={280} sizes="(max-width: 650px) 40vw, 460px" className={s.robotEnArena} data-rival={indice % 4} />
                  </span>
                  <Image src="/images/juegos/robots/rival-ataque.webp" alt="" width={300} height={280} sizes="(max-width: 650px) 40vw, 460px" className={`${s.robotEnArena} ${s.poseAtaque}`} data-rival={indice % 4} />
                </div>
                <span className={s.impacto}>
                  <span className={s.estrella} />
                  <span className={s.anillo} />
                  {CHISPAS.map(([angulo, distancia]) => (
                    <i key={angulo} style={{ "--a": `${angulo}deg`, "--d": distancia } as CSSProperties} />
                  ))}
                  <b className={s.onomatopeya}>¡PUM!</b>
                </span>
              </div>
            </div>
            <div className={s.tablero} data-estado={respuesta === undefined ? undefined : correcta ? "bien" : "mal"}>
              <div className={s.reloj} role="timer" aria-label={`${tiempo} segundos restantes`}>{tiempo} s</div>
              <h2 ref={titulo} tabIndex={-1} className={s.operacion}>{reto.dividendo} ÷ ? = {reto.cociente}</h2>
              <p className={s.consiga}>¿Cuál es el divisor?</p>
              <div className={s.opciones}>
                {reto.opciones.map((opcion, i) => (
                  <button key={opcion} type="button" disabled={pausa || respuesta !== undefined} className={s.opcion} data-estado={respuesta === undefined ? undefined : opcion === reto.divisor ? "bien" : opcion === respuesta ? "mal" : undefined} onClick={() => responder(opcion)}>
                    <span className={s.tecla} aria-hidden="true">{i + 1}</span>{opcion}
                  </button>
                ))}
              </div>
            </div>
            <p className={s.mensaje} role="status" aria-live="polite">{respuesta === undefined ? "" : correcta ? "¡Correcto! Tu robot avanza y supera al rival." : respuesta === null ? `Se acabó el tiempo. El divisor era ${reto.divisor}; el rival avanza.` : `El divisor era ${reto.divisor}. El rival avanza; sigue intentando.`}</p>
            {pausa && <div className={s.pausa}><p>Juego en pausa</p><button type="button" className={s.primario} onClick={() => setPausa(false)}>Continuar</button></div>}
          </>
        )}
      </div>
      <p className={s.ayuda}>Pista: comprueba tu elección multiplicando el divisor por el resultado.</p>
    </div>
  );
}
