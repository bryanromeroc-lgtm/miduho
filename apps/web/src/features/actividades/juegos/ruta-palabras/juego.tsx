"use client";

import { useBajarMusicaConVoz } from "../comun/voz";
import Image from "next/image";
import { Ear, Music2, Pause, Play, Type, Volume2, VolumeX, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { PropsJuego } from "../../reproductor/comun";
import { useFocoAlCambiar } from "../../reproductor/comun";
import { Chispas } from "../comun/efectos";
import { Guirnalda } from "../comun/piezas";
import { useRondas } from "../comun/rondas";
import { useEfectosRuta, useVozPalabra } from "./audio";
import { CARRILES, pistaDe, rondasDe } from "./generador";
import type { ContenidoRuta } from "./tipo";
import s from "./ruta-palabras.module.css";

/*
  LA RUTA DE LAS PALABRAS · Armi en bicicleta.
  Tres carriles; en cada uno llega un cartel con una palabra. Una voz dice una
  de ellas y se elige el cartel que la tiene escrita: con el dedo o el ratón
  sobre el cartel, con las teclas 1, 2 y 3, o con ↑/↓ para mover a Armi y
  Enter para elegir.

  Dos ritmos (configurables): «tranquilo» (los carteles llegan y esperan; sin
  reloj) y «carrera» (como la referencia: los carteles se acercan y, al llegar,
  Armi toca el de su carril; con botón de pausa).

  Cada elección es una escena de duración fija (data-escena en la escena):
  acierto 1700 ms (Armi se agacha → se lanza → impacto con pausa, estrella,
  «¡PLAF!» y temblor de cámara → vuelve); fallo 900 ms, versión suave (Armi
  duda, el cartel se apaga, sin temblor). Los tiempos de aquí y los del CSS
  van juntos.
*/

const ACIERTO_MS = 1700;
const IMPACTO_ACIERTO_MS = 816; // 48 % de 1700
const FALLO_MS = 900;
const IMPACTO_FALLO_MS = 405; // 45 % de 900
const REVELAR_MS = 1700;
const SALIR_MS = 450;
const CAMBIO_CARRIL_MS = 220;
const IMPULSO_MS = 2600;
const CHISPAS: [number, number][] = [[-150, 0.6], [-100, 0.7], [-50, 0.62], [-5, 0.7], [40, 0.6], [95, 0.65]];

/** Cuánto tarda el cartel en llegar y cuándo habla la voz, según el ritmo. */
const VIAJE = { tranquilo: { dura: 2000, voz: 700 }, carrera: { dura: 6000, voz: 1500 } } as const;
/** Desde qué avance del cartel se puede elegir (así ya se alcanza a leer). */
const AVANCE_MINIMO = 0.3;

type Escena = { carril: number; tipo: "acierto" | "fallo"; cierra: boolean; demora: number; n: number };

export function JuegoRutaPalabras({ contenido, alTerminar }: PropsJuego<ContenidoRuta>) {
  const rondas = useMemo(() => rondasDe(contenido), [contenido]);
  const [registro, setRegistro] = useState<Record<string, string[]>>({});
  const r = useRondas({
    rondas,
    correcta: (x) => x.palabra.clave,
    alTerminar: () => alTerminar(registro),
    efectosPropios: true,
  });
  const efectos = useEfectosRuta();
  const voz = useVozPalabra();
  const tranquilo = contenido.ritmo === "tranquilo";
  const [fase, setFase] = useState<"inicio" | "jugar">("inicio");
  const [carril, setCarril] = useState(1);
  const [escena, setEscena] = useState<Escena | null>(null);
  const [marcados, setMarcados] = useState<Record<number, "acierto" | "fallo">>({});
  const [saliendo, setSaliendo] = useState(false);
  const [pausado, setPausado] = useState(false);
  const [escrita, setEscrita] = useState(false);
  const [musicaActiva, setMusicaActiva] = useState(true);
  const [impulso, setImpulso] = useState(false);
  const [rachaMsg, setRachaMsg] = useState(false);
  const musicaRef = useRef<HTMLAudioElement>(null);
  useBajarMusicaConVoz(musicaRef);
  const raiz = useRef<HTMLDivElement>(null);
  const contador = useRef(0);
  const racha = useRef(0);
  const pendiente = useRef<number>(0);
  /** Avance de los carteles (0 a 1). `t` en ms; Infinity = ya llegaron. */
  const viaje = useRef({ t: 0, p: 0, voz: false });
  const titulo = useFocoAlCambiar<HTMLHeadingElement>(r.indice);
  const { ronda } = r;
  const ocupado = escena !== null || saliendo;
  const puntos = Object.entries(registro).reduce((t, [id, elegidas]) => {
    const rr = rondas.find((x) => x.id === id);
    return t + (rr ? (elegidas[0] === rr.palabra.clave ? 2 : elegidas[1] === rr.palabra.clave ? 1 : 0) : 0);
  }, 0);

  // Última versión de lo que necesita el bucle de avance (sin reiniciarlo en cada render).
  const vivo = useRef({ pausado, ocupado, cerrada: r.cerrada, intentos: r.intentos.length, carril, ronda, elegir });
  useEffect(() => {
    vivo.current = { pausado, ocupado, cerrada: r.cerrada, intentos: r.intentos.length, carril, ronda, elegir };
  });

  function fijarAvance(p: number) {
    viaje.current.p = p;
    raiz.current?.style.setProperty("--p", String(p));
  }

  // Avance de los carteles: bucle pausable que solo escribe una variable CSS.
  useEffect(() => {
    if (fase !== "jugar") return;
    const { dura, voz: vozEn } = VIAJE[contenido.ritmo];
    viaje.current = { t: 0, p: 0, voz: false };
    fijarAvance(0);
    let ultimo = performance.now();
    let cuadro = 0;
    function paso(ahora: number) {
      const dt = Math.min(64, ahora - ultimo);
      ultimo = ahora;
      const v = vivo.current;
      const estado = viaje.current;
      if (!v.pausado && !v.ocupado) {
        estado.t += dt;
        if (!estado.voz && estado.t >= vozEn) {
          estado.voz = true;
          voz.hablar(v.ronda.palabra.clave);
        }
        const lineal = Math.min(1, estado.t / dura);
        const p = contenido.ritmo === "tranquilo" ? 1 - (1 - lineal) ** 3 : lineal;
        if (p !== estado.p) fijarAvance(p);
        // «Carrera»: al llegar, Armi toca el cartel de su carril (solo en el primer intento).
        if (lineal >= 1 && contenido.ritmo === "carrera" && v.intentos === 0 && !v.cerrada) v.elegir(v.carril);
      }
      cuadro = requestAnimationFrame(paso);
    }
    cuadro = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(cuadro);
    // fijarAvance y voz.hablar son estables en la práctica; el bucle depende de la ronda y del ritmo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fase, ronda.id, contenido.ritmo]);

  useEffect(() => {
    const audio = musicaRef.current;
    if (!audio) return;
    if (fase === "jugar" && musicaActiva) {
      audio.volume = 0.25;
      void audio.play().catch(() => { /* el navegador puede pedir otro gesto */ });
    } else audio.pause();
  }, [fase, musicaActiva]);

  useEffect(() => {
    const alOcultar = () => {
      if (document.hidden) {
        musicaRef.current?.pause();
        voz.callar();
        setPausado(true);
      } else if (fase === "jugar" && musicaActiva) void musicaRef.current?.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", alOcultar);
    return () => document.removeEventListener("visibilitychange", alOcultar);
  }, [fase, musicaActiva, voz]);

  // Fin de cada escena: liberar para otra elección, o revelar, salir y pasar de ronda.
  useEffect(() => {
    if (!escena) return;
    const duracion = escena.demora + (escena.tipo === "acierto" ? ACIERTO_MS : FALLO_MS);
    if (!escena.cierra) {
      const t = window.setTimeout(() => {
        setEscena(null);
        voz.hablar(vivo.current.ronda.palabra.clave); // la voz repite para el segundo intento
      }, duracion);
      return () => window.clearTimeout(t);
    }
    const espera = duracion + (escena.tipo === "fallo" ? REVELAR_MS : 0);
    const t1 = window.setTimeout(() => setSaliendo(true), espera);
    const t2 = window.setTimeout(() => {
      setSaliendo(false);
      setEscena(null);
      setMarcados({});
      setRachaMsg(false);
      if (!r.ultima) efectos.tocar("aparecer", 80);
      r.siguiente();
    }, espera + SALIR_MS);
    return () => { window.clearTimeout(t1); window.clearTimeout(t2); };
    // r.siguiente y efectos cambian en cada render; la escena solo depende de la elección.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [escena]);

  useEffect(() => () => window.clearTimeout(pendiente.current), []);

  useEffect(() => {
    if (!impulso) return;
    const t = window.setTimeout(() => setImpulso(false), IMPULSO_MS);
    return () => window.clearTimeout(t);
  }, [impulso]);

  function elegir(lado: number) {
    const v = vivo.current;
    if (fase !== "jugar" || v.ocupado || v.pausado || v.cerrada || marcados[lado] || viaje.current.p < AVANCE_MINIMO) return;
    const cartel = ronda.carteles[lado];
    const bien = lado === ronda.carril;
    const elegidas = [...(registro[ronda.id] ?? []), cartel.clave].slice(0, 2);
    const cierra = bien || elegidas.length >= 2;
    const demora = lado === v.carril ? 0 : CAMBIO_CARRIL_MS;
    viaje.current.t = Number.POSITIVE_INFINITY;
    fijarAvance(1);
    voz.callar();
    setCarril(lado);
    setRegistro((x) => ({ ...x, [ronda.id]: elegidas }));
    setMarcados((m) => ({ ...m, [lado]: bien ? "acierto" : "fallo" }));
    setEscena({ carril: lado, tipo: bien ? "acierto" : "fallo", cierra, demora, n: ++contador.current });
    // En el acierto, el marcador, el aviso y el confeti llegan con el impacto (no al tocar).
    if (bien) {
      window.clearTimeout(pendiente.current);
      pendiente.current = window.setTimeout(() => r.responder(cartel.clave), demora + IMPACTO_ACIERTO_MS - 40);
    } else r.responder(cartel.clave);
    if (bien) {
      efectos.tocar("golpe", demora + IMPACTO_ACIERTO_MS);
      efectos.tocar("acierto", demora + IMPACTO_ACIERTO_MS + 60);
      if (elegidas.length === 1) {
        racha.current += 1;
        if (racha.current >= 3) {
          racha.current = 0;
          setImpulso(true);
          setRachaMsg(true);
        }
      } else racha.current = 0;
    } else {
      racha.current = 0;
      efectos.tocar("golpecito", demora + IMPACTO_FALLO_MS);
      efectos.tocar("error", demora + IMPACTO_FALLO_MS + 60);
    }
  }

  useEffect(() => {
    if (fase !== "jugar") return;
    function manejar(evento: KeyboardEvent) {
      if (evento.repeat || evento.altKey || evento.ctrlKey || evento.metaKey) return;
      const destino = evento.target as HTMLElement | null;
      const enBoton = Boolean(destino?.closest("button, a, input, select, textarea"));
      if (evento.key === "ArrowUp" || evento.key === "ArrowDown") {
        evento.preventDefault();
        if (vivo.current.ocupado) return;
        setCarril((c) => Math.min(CARRILES - 1, Math.max(0, c + (evento.key === "ArrowUp" ? -1 : 1))));
      } else if ((evento.key === "Enter" || evento.key === " ") && !enBoton) {
        evento.preventDefault();
        elegir(vivo.current.carril);
      } else if (["1", "2", "3"].includes(evento.key)) elegir(Number(evento.key) - 1);
    }
    window.addEventListener("keydown", manejar);
    return () => window.removeEventListener("keydown", manejar);
  });

  function comenzar() {
    efectos.preparar();
    setFase("jugar");
    setPausado(false);
    window.setTimeout(() => efectos.tocar("aparecer"), 120);
  }

  const ultimaElegida = r.intentos.at(-1);
  const texto = ronda.palabra.texto;
  let aviso = "";
  if (pausado && fase === "jugar") aviso = "Juego en pausa. Pulsa «Seguir» cuando estés lista o listo.";
  else if (ultimaElegida !== undefined) {
    const elegido = ronda.carteles.find((c) => c.clave === ultimaElegida);
    if (r.acerto) aviso = `${r.intentos.length === 1 ? "¡Muy bien!" : "¡Corregido!"} Era «${texto}».${rachaMsg ? " ¡Tres seguidas! Armi se impulsa." : ""}`;
    else if (r.cerrada) aviso = `La palabra era «${texto}». Vamos con la siguiente.`;
    else if (elegido) aviso = `Ese cartel dice «${elegido.texto}». ${pistaDe(ronda.palabra, elegido)} Escucha otra vez y elige de nuevo.`;
  }
  const tono = !aviso || pausado ? undefined : r.acerto ? "ok" : r.cerrada ? "solucion" : "no";
  const carrilEscena = escena?.carril ?? carril;

  return (
    <div className={s.juego}>
      <audio ref={musicaRef} src="/audio/juegos/ruta-palabras/musica-ruta.mp3" loop preload="none" aria-hidden="true" />
      <div
        ref={raiz}
        className={s.escena}
        data-escena={escena ? escena.tipo : undefined}
        data-fase={fase}
        data-ritmo={contenido.ritmo}
        data-pausado={pausado ? "" : undefined}
        data-impulso={impulso ? "" : undefined}
        style={{ "--carril": carril, "--lado": carrilEscena, "--demora": `${escena?.demora ?? 0}ms` } as CSSProperties}
      >
        <span className={s.fondo} aria-hidden="true" />

        {fase === "jugar" && (
          <div className={s.cabecera}>
            <div className={s.panel}>
              <div className={s.izquierda}>
                <Guirnalda estados={r.estados} actual={r.indice} />
                {/* Destino del foco al cambiar de ronda; el «Ronda n de N» visible lo pone la guirnalda. */}
                <h2 ref={titulo} tabIndex={-1} className={s.solo}>
                  Ronda {r.indice + 1} de {rondas.length}. Escucha la palabra y elige su cartel.
                </h2>
              </div>
              <div className={s.centro}>
                <button type="button" className={s.escuchar} onClick={() => voz.hablar(ronda.palabra.clave)}>
                  <Ear aria-hidden="true" /> Escuchar la palabra
                </button>
                {escrita && <p className={s.ayuda}>Busca: <strong>{texto}</strong></p>}
              </div>
              <div className={s.botones}>
                <span className={s.dato}>Puntos <strong>{puntos}</strong> de {rondas.length * 2}</span>
                {!tranquilo && (
                  <button type="button" className={s.icono} aria-label={pausado ? "Seguir jugando" : "Pausar el juego"} aria-pressed={pausado} onClick={() => setPausado((p) => !p)}>
                    {pausado ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
                  </button>
                )}
                <button type="button" className={s.icono} aria-label="Mostrar la palabra escrita, ayuda para quien no puede oír" aria-pressed={escrita} onClick={() => setEscrita((e) => !e)}>
                  <Type aria-hidden="true" />
                </button>
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

        {/* La cámara filma el camino (carriles, Armi, carteles e impacto); la cabecera no se mueve. */}
        <div className={s.camara}>
          <div className={s.carretera} aria-hidden="true">
            {Array.from({ length: CARRILES - 1 }, (_, k) => <span key={k} className={s.raya} style={{ "--k": k + 1 } as CSSProperties} />)}
          </div>

          {fase === "jugar" && (
            <div className={s.carriles} data-saliendo={saliendo ? "" : undefined} role="group" aria-label="Tres carriles con un cartel cada uno. Elige el cartel de la palabra que oyes">
              {ronda.carteles.map((c, lado) => (
                <Cartel
                  key={`${ronda.id}-${lado}`}
                  lado={lado}
                  texto={c.texto}
                  marca={marcados[lado]}
                  revelado={!marcados[lado] && r.cerrada && !r.acerto && lado === ronda.carril}
                  deshabilitado={ocupado || pausado || r.cerrada || Boolean(marcados[lado])}
                  escena={escena?.carril === lado ? escena : null}
                  alElegir={() => elegir(lado)}
                />
              ))}
            </div>
          )}

          {/* Armi: solo decoración, el resultado está escrito en el aviso. */}
          {fase === "jugar" && (
            <div className={s.armiCarril} aria-hidden="true">
              <div className={s.armi} data-pose={escena ? escena.tipo : undefined}>
                <Image src="/images/juegos/ruta-palabras/armi.webp" alt="" width={508} height={640} sizes="(max-width: 650px) 40vw, 360px" className={s.poseNormal} draggable={false} priority />
                <Image src="/images/juegos/ruta-palabras/armi-impulso.webp" alt="" width={508} height={640} sizes="(max-width: 650px) 40vw, 360px" className={s.poseImpulso} draggable={false} />
                <Image src="/images/juegos/ruta-palabras/armi-mareado.webp" alt="" width={508} height={640} sizes="(max-width: 650px) 40vw, 360px" className={s.poseMareado} draggable={false} />
                <span className={s.sombra} />
              </div>
              {impulso && <span className={s.velocidad} />}
            </div>
          )}
        </div>

        <Chispas reaccion={r.reaccion} />

        {fase === "inicio" && (
          <div className={s.inicio}>
            <h2>La ruta de las palabras</h2>
            <p>
              Armi pedalea por un camino de tres carriles. Escucha la palabra que dice la voz y elige el cartel que la tiene escrita: toca el cartel, pulsa 1, 2 o 3, o mueve a Armi con ↑ y ↓ y pulsa Enter.
              {tranquilo ? " Los carteles esperan: piensa con calma." : " Los carteles se acercan: si no eliges, Armi toca el de su carril. Puedes pausar el juego."}
            </p>
            <p>Para jugar necesitas sonido. Si no puedes oír, activa «Mostrar la palabra escrita» (el botón con la letra T).</p>
            <button type="button" className={s.primario} onClick={comenzar}>Jugar</button>
          </div>
        )}
      </div>
    </div>
  );
}

function Cartel({
  lado, texto, marca, revelado, deshabilitado, escena, alElegir,
}: {
  lado: number;
  texto: string;
  marca?: "acierto" | "fallo";
  revelado: boolean;
  deshabilitado: boolean;
  escena: Escena | null;
  alElegir: () => void;
}) {
  const estado = marca ?? (revelado ? "revelado" : undefined);
  return (
    <div className={s.carril} style={{ "--i": lado, "--n": texto.length } as CSSProperties} data-estado={estado} data-escena={escena?.tipo}>
      <button
        type="button"
        className={s.cartel}
        data-estado={estado}
        disabled={deshabilitado}
        aria-label={`${texto}${marca === "fallo" ? ", no es" : marca === "acierto" ? ", correcto" : revelado ? ", es la respuesta" : ""}`}
        aria-keyshortcuts={String(lado + 1)}
        onClick={alElegir}
      >
        <Image src="/images/juegos/ruta-palabras/cartel.webp" alt="" width={499} height={480} sizes="280px" className={s.madera} draggable={false} />
        <span className={s.palabra}>
          {texto}
          {marca === "fallo" && <X className={s.tache} strokeWidth={3.2} />}
        </span>
        <kbd className={s.tecla} aria-hidden="true">{lado + 1}</kbd>
      </button>
      {escena && (
        <span key={escena.n} className={s.impacto} data-tipo={escena.tipo} aria-hidden="true">
          <span className={s.estrella} />
          <span className={s.anillo} />
          {CHISPAS.map(([angulo, distancia]) => (
            <i key={angulo} style={{ "--a": `${angulo}deg`, "--d": distancia } as CSSProperties} />
          ))}
          <b className={s.onomatopeya}>¡PLAF!</b>
        </span>
      )}
    </div>
  );
}
