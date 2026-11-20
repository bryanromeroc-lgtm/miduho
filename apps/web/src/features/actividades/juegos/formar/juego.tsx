"use client";
/* eslint-disable @next/next/no-img-element -- imágenes proporcionadas por la actividad y personaje decorativo */

import { useContext, useEffect, useMemo, useRef, useState } from "react";
import type { PropsJuego } from "../../reproductor/comun";
import { Avanzar, Aviso, Progreso, useFocoAlCambiar } from "../../reproductor/comun";
import { ContextoActividad, Escuchar, useLecturaAutomatica } from "../comun/escuchar";
import { useBajarMusicaConVoz } from "../comun/voz";
import { useEfectosGrabados } from "../comun/efectos-grabados";
import { fichasBarajadas, type ContenidoFormar } from "./tipo";
import s from "./formar.module.css";

type Fase = "inicio" | "jugar" | "error" | "acierto" | "avance";
type ClaveEfecto = "inicio" | "soltar" | "acierto" | "error" | "avanzar" | "fin";
const clavesEfectos: ClaveEfecto[] = ["inicio", "soltar", "acierto", "error", "avanzar", "fin"];

function rutasEfectos(efectos: ContenidoFormar["efectos"]): Record<ClaveEfecto, string[]> {
  return Object.fromEntries(
    clavesEfectos.map((clave) => [clave, efectos?.[clave] ? [efectos[clave]] : []]),
  ) as Record<ClaveEfecto, string[]>;
}

function Lectura({ clave, texto, audio }: { clave: string; texto: string; audio?: string }) {
  useLecturaAutomatica(clave, texto, audio);
  return null;
}
export function JuegoFormar({ contenido, semilla, alTerminar, focoInicial }: PropsJuego<ContenidoFormar>) {
  const [indice, setIndice] = useState(0);
  const [fase, setFase] = useState<Fase>("inicio");
  const [huecos, setHuecos] = useState<(number | null)[]>([]);
  const [primeras, setPrimeras] = useState<Record<string, string[]>>({});
  const [intentos, setIntentos] = useState(0);
  const [musicaActiva, setMusicaActiva] = useState(false);
  const [imagenFallida, setImagenFallida] = useState(false);
  const [parada, setParada] = useState(0);
  const ordenes = useMemo(() => fichasBarajadas(contenido.elementos, semilla), [contenido.elementos, semilla]);
  const e = contenido.elementos[indice];
  const orden = ordenes[indice];
  const escena = contenido.escena;
  const titulo = useFocoAlCambiar<HTMLHeadingElement>(indice);
  const musica = useRef<HTMLAudioElement>(null);
  const tiempo = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inicio = useRef(false);
  const { instruccion, audioInstruccion } = useContext(ContextoActividad);
  useBajarMusicaConVoz(musica);
  const rutas = useMemo(() => rutasEfectos(contenido.efectos), [contenido.efectos]);
  const efectos = useEfectosGrabados(rutas);
  useEffect(() => () => {
    if (tiempo.current) clearTimeout(tiempo.current);
    musica.current?.pause();
  }, []);
  useEffect(() => {
    if (focoInicial) titulo.current?.focus();
  }, [focoInicial, titulo]);
  useEffect(() => {
    if (fase === "jugar" && indice > 0 && escena) titulo.current?.focus();
  }, [indice, escena, fase, titulo]);
  useEffect(() => {
    if (!musica.current) return;
    musica.current.volume = 0.2;
    if (musicaActiva && fase !== "inicio") {
      void musica.current.play().catch(() => setMusicaActiva(false));
    } else {
      musica.current.pause();
    }
  }, [musicaActiva, fase]);
  const ocupado = fase !== "jugar";
  const usado = new Set(huecos.filter((x): x is number => x !== null));
  const avisoTono = fase === "error" ? "no" : fase === "acierto" ? "ok" : null;
  const avisoTexto = fase === "error"
    ? "Inténtalo de nuevo. Las fichas vuelven a su lugar."
    : fase === "acierto"
      ? `¡Muy bien! ${e.silabas.join("·")} → ${e.texto}. ${e.explicacion ?? ""}`
      : fase === "avance"
        ? "Vamos a la siguiente parada."
        : "";

  function sacar(i: number) {
    if (huecos[i] === null) return;
    const nuevos = [...huecos];
    nuevos[i] = null;
    setHuecos(nuevos);
  }

  function soltar(ev: React.DragEvent<HTMLButtonElement>, destino: number) {
    ev.preventDefault();
    const ficha = Number(ev.dataTransfer.getData("text/plain"));
    if (Number.isInteger(ficha)) colocar(ficha, destino);
  }
  function comenzar() {
    if (inicio.current) return;
    inicio.current = true;
    efectos.preparar(); efectos.tocar("inicio");
    setHuecos(Array(e.silabas.length).fill(null)); setFase("jugar");
  }
  function colocar(ficha: number, destino?: number) {
    if (ocupado || usado.has(ficha)) return;
    const lugar = destino ?? huecos.findIndex((x) => x === null);
    if (lugar < 0 || huecos[lugar] !== null) return;
    efectos.preparar(); efectos.tocar("soltar");
    const nuevos = [...huecos]; nuevos[lugar] = ficha;
    setHuecos(nuevos);
    if (nuevos.every((x) => x !== null)) {
      const respuesta = nuevos.map((x) => e.silabas[x!]);
      if (intentos === 0) setPrimeras((r) => ({ ...r, [e.id]: respuesta }));
      const bien = respuesta.every((v, i) => v === e.silabas[i]);
      if (bien) {
        setFase("acierto"); efectos.tocar("acierto");
        // La grabación de acierto dura unos cuatro segundos; la voz de la palabra se reproduce solo al tocar Escuchar.
      } else {
        setFase("error"); efectos.tocar("error"); setIntentos((n) => n + 1);
        tiempo.current = setTimeout(() => { setHuecos(Array(e.silabas.length).fill(null)); setFase("jugar"); }, 1000);
      }
    }
  }
  function avanzar() {
    efectos.preparar();
    if (indice === contenido.elementos.length - 1) {
      efectos.tocar("fin"); musica.current?.pause(); setMusicaActiva(false);
      if (contenido.efectos?.felicitacion) {
        const voz = new Audio(contenido.efectos.felicitacion);
        // La felicitación sigue al efecto de cierre; el resultado aparece al terminar la voz.
        let terminado = false;
        const cerrar = () => { if (terminado) return; terminado = true; alTerminar(primeras); };
        voz.onended = voz.onerror = cerrar;
        tiempo.current = setTimeout(() => {
          void voz.play().catch(cerrar);
          tiempo.current = setTimeout(cerrar, 12000);
        }, 2100);
        setFase("avance");
        return;
      }
      alTerminar(primeras); return;
    }
    efectos.tocar("avanzar"); setFase("avance"); setParada(indice + 1);
    const siguiente = indice + 1;
    tiempo.current = setTimeout(() => {
      setIndice(siguiente);
      setImagenFallida(false);
      setHuecos(Array(contenido.elementos[siguiente].silabas.length).fill(null));
      setIntentos(0); setFase("jugar");
    }, 650);
  }
  return (
    <div className={s.juego} data-fase={fase}>
      {contenido.efectos?.musica && (
        <audio ref={musica} src={contenido.efectos.musica} loop preload="none" />
      )}
      {fase === "inicio" ? (
        <div className={s.inicio}>
          <h2 ref={titulo} tabIndex={-1}>Forma las palabras</h2>
          <p>{instruccion ?? "Ordena las sílabas para formar cada palabra."}</p>
          <button className={s.principal} type="button" onClick={comenzar}>Empezar</button>
        </div>
      ) : (
        <>
          <div className={s.barra}>
            <Progreso
              actual={indice + 1}
              total={contenido.elementos.length}
              nombre={contenido.nombreItem ?? "Palabra"}
            />
            {contenido.efectos?.musica && (
              <button
                className={s.musica}
                type="button"
                aria-pressed={musicaActiva}
                onClick={() => setMusicaActiva((v) => !v)}
              >
                Música: {musicaActiva ? "sí" : "no"}
              </button>
            )}
          </div>
          {escena && (
            <div
              className={s.recorrido}
              style={escena.fondo ? { backgroundImage: `url(${escena.fondo})` } : undefined}
              aria-hidden="true"
            >
              <div className={s.paradas}>
                {contenido.elementos.map((_, i) => (
                  <span
                    key={i}
                    data-actual={i === parada ? "" : undefined}
                    data-pasada={i < parada ? "" : undefined}
                  />
                ))}
              </div>
              {escena.personaje && (
                <div
                  className={s.personaje}
                  style={{ left: `${8 + parada * 78 / Math.max(1, contenido.elementos.length - 1)}%` }}
                >
                  <img
                    src={escena.personaje[fase === "error" ? "duda" : fase === "acierto" ? "senala" : "reposo"]}
                    alt=""
                  />
                </div>
              )}
            </div>
          )}
          <div className={s.contenido}>
            <div className={s.ilustracion}>
              {!imagenFallida && (
                <img src={e.imagen} alt={e.alt} onError={() => setImagenFallida(true)} />
              )}
              {imagenFallida && <p>{e.alt}</p>}
              <Escuchar texto={e.texto} audio={e.audio} etiqueta="Escuchar" />
            </div>
            <div className={s.tarea}>
              <h2 ref={titulo} tabIndex={-1}>{contenido.consigna ?? "Forma la palabra"}</h2>
              {escena && (
                <Lectura
                  clave={e.id}
                  texto={indice === 0
                    ? instruccion ?? contenido.consigna ?? "Forma la palabra"
                    : contenido.consigna ?? "Forma la palabra"}
                  audio={indice === 0 ? audioInstruccion ?? undefined : undefined}
                />
              )}
              <p className={s.ayuda}>
                Toca una ficha para llenar el primer hueco libre. También puedes arrastrarla a un hueco.
                Para sacarla, toca el hueco ocupado.
              </p>
              <div className={s.huecos} role="group" aria-label="Huecos ordenados">
                {e.silabas.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={s.hueco}
                    disabled={ocupado}
                    aria-label={`Hueco ${i + 1}${huecos[i] === null
                      ? ", vacío"
                      : `, ${e.silabas[huecos[i]!]}; tocar para sacar`}`}
                    onClick={() => sacar(i)}
                    onDragOver={(ev) => ev.preventDefault()}
                    onDrop={(ev) => soltar(ev, i)}
                  >
                    {huecos[i] === null ? null : e.silabas[huecos[i]!]}
                  </button>
                ))}
              </div>
              <div className={s.fichas} role="group" aria-label="Fichas de sílabas">
                {orden.map((n) => (
                  <div key={n} className={s.fichaGrupo}>
                    <button
                      type="button"
                      className={s.ficha}
                      draggable={!ocupado && !usado.has(n)}
                      disabled={ocupado || usado.has(n)}
                      onDragStart={(ev) => ev.dataTransfer.setData("text/plain", String(n))}
                      onClick={() => colocar(n)}
                    >
                      {e.silabas[n]}
                    </button>
                    <Escuchar texto={e.silabas[n]} etiqueta={`Escuchar ${e.silabas[n]}`} soloIcono />
                  </div>
                ))}
              </div>
              <Aviso tono={avisoTono}>{avisoTexto}</Aviso>
              {fase === "acierto" && (
                <Avanzar onClick={avanzar}>
                  {indice === contenido.elementos.length - 1 ? "Ver resultado" : "Continuar"}
                </Avanzar>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
