"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Avanzar, useFocoAlCambiar, type PropsJuego } from "../../reproductor/comun";
import { colocar, vacias } from "../casillas/logica";
import { Escuchar, useLecturaAutomatica } from "../comun/escuchar";
import { useEfectosGrabados } from "../comun/efectos-grabados";
import { useRondas } from "../comun/rondas";
import { generador } from "../../tipos/contrato";
import { Pantalla } from "./pantalla";
import type { ContenidoAventura, EscenaAventura } from "./tipo";
import s from "./narrada.module.css";

type Fase = "inicio" | "escena" | "secuencia" | "final";
const secuenciaId = "secuencia";

function mezclar<T>(lista: readonly T[], azar: () => number): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/** Baraja la secuencia sin dejarla ya ordenada: si sale en orden, rota una posición. */
function mezclarDesordenado<T extends { posicion: number }>(lista: readonly T[], azar: () => number): T[] {
  const copia = mezclar(lista, azar);
  const ordenada = copia.length > 1 && copia.every((item, i) => item.posicion === i);
  return ordenada ? [...copia.slice(1), copia[0]] : copia;
}

function Lectura({ clave, texto, audio }: { clave: string; texto: string; audio?: string; }) {
  useLecturaAutomatica(clave, texto, audio);
  return <Escuchar texto={texto} audio={audio} />;
}

export function JuegoAventuraNarrada({ contenido, semilla, alTerminar }: PropsJuego<ContenidoAventura>) {
  const [fase, setFase] = useState<Fase>("inicio");
  const [respuestas, setRespuestas] = useState<Record<string, unknown>>({});
  const [casillas, setCasillas] = useState<(string | null)[]>(() => vacias(3));
  const [elegida, setElegida] = useState<string | null>(null);
  const [intentosSecuencia, setIntentosSecuencia] = useState<string[][]>([]);
  const [aviso, setAviso] = useState("");
  const azar = useMemo(() => generador(semilla), [semilla]);
  const tarjetas = useMemo(() => mezclarDesordenado(contenido.secuencia?.items ?? [], azar), [contenido.secuencia, azar]);
  const efectos = useEfectosGrabados(useMemo(() => Object.fromEntries(
    (["acierto", "error", "avanzar", "secuencia", "fin"] as const).map((evento) => [evento, contenido.efectos?.[evento] ? [contenido.efectos[evento]] : []]),
  ) as Record<"acierto" | "error" | "avanzar" | "secuencia" | "fin", string[]>, [contenido.efectos]));
  const r = useRondas<EscenaAventura, number>({
    rondas: contenido.escenas,
    correcta: (e) => e.correcta,
    efectosPropios: Boolean(contenido.efectos),
    alTerminar: (resp) => {
      setRespuestas(resp);
      setFase(contenido.secuencia ? "secuencia" : "final");
      if (!contenido.secuencia) efectos.tocar("fin");
    },
  });
  const e = r.ronda;
  const sec = contenido.secuencia;
  const orden = sec ? [...sec.items].sort((a, b) => a.posicion - b.posicion) : [];
  const acertoSecuencia = intentosSecuencia.length > 0 && orden.every((item, i) => intentosSecuencia.at(-1)?.[i] === item.id);
  const cerradaSecuencia = acertoSecuencia || intentosSecuencia.length >= 2;
  const preguntaRef = useFocoAlCambiar<HTMLHeadingElement>(`${fase}-${r.indice}`);
  const imagen = fase === "secuencia" ? undefined : fase === "inicio" ? contenido.escenas[0].imagen : fase === "final" ? contenido.escenas.at(-1)?.imagen : e.imagen;
  const lugar = fase === "inicio" ? contenido.escenas[0].lugar : fase === "final" ? contenido.escenas.at(-1)?.lugar : e.lugar;
  const fondo = imagen ? `linear-gradient(180deg, #d8eee0, #a9d3c3)` : `url(/images/juegos/aventura/${lugar}.webp), #d8eee0`;
  const pose = fase === "escena" && r.intentos.length ? (r.acerto ? "senala" : "duda") : fase === "secuencia" && intentosSecuencia.length ? (acertoSecuencia ? "senala" : "duda") : "reposo";
  const personaje = contenido.escena?.personaje;

  function responder(i: number) {
    if (r.cerrada || r.intentos.includes(i)) return;
    efectos.preparar();
    window.setTimeout(() => efectos.tocar(i === e.correcta ? "acierto" : "error"), 260);
    r.responder(i);
  }
  function siguiente() {
    efectos.tocar("avanzar");
    r.siguiente();
  }
  function poner(i: number, id = elegida) {
    if (!id || cerradaSecuencia) return;
    setCasillas((c) => colocar(c, id, i));
    setElegida(null);
    setAviso(`${sec?.casillas[i]}: dibujo colocado.`);
  }
  function enviarSecuencia() {
    if (!sec || casillas.some((v) => !v) || cerradaSecuencia) return;
    const respuesta = casillas as string[];
    const bien = orden.every((item, i) => respuesta[i] === item.id);
    const nuevos = [...intentosSecuencia, respuesta];
    setIntentosSecuencia(nuevos);
    if (nuevos.length === 1) setRespuestas((prev) => ({ ...prev, [secuenciaId]: respuesta }));
    window.setTimeout(() => efectos.tocar(bien ? "secuencia" : "error"), 260);
    const solucion = orden.map((item, i) => `${sec.casillas[i]}: ${item.alt}`).join("; ");
    setAviso(bien ? `¡Muy bien! ${sec.explicacion}`
      : nuevos.length === 1 ? `Casi. ${sec.pista}`
      : `El orden es ${solucion}. ${sec.explicacion}`);
    if (!bien && nuevos.length >= 2) setCasillas(orden.map((item) => item.id));
  }

  const parte = fase === "inicio" ? 0 : fase === "escena" ? r.indice + 1
    : contenido.escenas.length + (fase === "secuencia" ? 1 : Number(Boolean(sec)));
  return <Pantalla escena={lugar ?? "relato"} fondo={fondo} barra={
    <div className={s.barra}>
      <span>Parte {parte} de {contenido.escenas.length + Number(Boolean(sec))}</span>
      <button type="button" onClick={efectos.alternar}>Sonidos: {efectos.activo ? "sí" : "no"}</button>
    </div>
  }>
    <main className={s.juego}>
      <div className={s.contenido}>
        {fase === "inicio" && <section className={s.tarjeta}>
          <h2 ref={preguntaRef} tabIndex={-1}>Comienza la historia</h2>
          <p>{contenido.inicio}</p>
          <Lectura clave="inicio" texto={contenido.inicio} audio={contenido.audioInicio} />
          <Avanzar onClick={() => { efectos.preparar(); setFase("escena"); }}>
            Empezar <ArrowRight aria-hidden="true" />
          </Avanzar>
        </section>}
        {fase === "escena" && <section className={s.tarjeta} aria-label={`Escena ${r.indice + 1}`}>
          <p className={s.narracion}>{e.narracion}</p>
          <h2 ref={preguntaRef} tabIndex={-1}>{e.pregunta}</h2>
          <Lectura clave={e.id} texto={`${e.narracion} ${e.pregunta}`} audio={e.audio} />
          <div className={s.opciones} role="group" aria-label="Respuestas">
            {e.opciones.map((opcion, i) => <div className={s.fila} key={i}>
              <button type="button" disabled={r.cerrada || r.intentos.includes(i)}
                data-estado={r.cerrada && i === e.correcta ? "ok" : r.intentos.includes(i) && i !== e.correcta ? "no" : undefined}
                onClick={() => responder(i)}>
                {opcion}
              </button>
              <Escuchar texto={opcion} etiqueta="Escuchar opción" soloIcono />
            </div>)}
          </div>
          {r.intentos.length > 0 && <p className={s.aviso} role="status">
            {r.acerto ? `${r.intentos.length === 1 ? "¡Muy bien!" : "¡Ahora sí!"} ${e.explicacion}`
              : r.cerrada ? `La respuesta era ${e.opciones[e.correcta]}. ${e.explicacion}`
              : `Casi. ${e.pista}`}
          </p>}
          {r.cerrada && <Avanzar onClick={siguiente}>
            {r.ultima ? (sec ? "Ordenar la trama" : "Terminar") : "Seguir el cuento"}
            <ArrowRight aria-hidden="true" />
          </Avanzar>}
        </section>}
        {fase === "secuencia" && sec && <section className={s.tarjeta}>
          <h2 ref={preguntaRef} tabIndex={-1}>{sec.consigna}</h2><Lectura clave="secuencia" texto={sec.consigna} audio={sec.audio} />
          <div className={s.secuencia}>
            <div className={s.pila} aria-label="Dibujos para ordenar">
              {tarjetas.filter((item) => !casillas.includes(item.id)).map((item) =>
                <button key={item.id} type="button" className={s.dibujo}
                  aria-pressed={elegida === item.id} onClick={() => setElegida(item.id)}
                  draggable onDragStart={(ev) => ev.dataTransfer.setData("text/plain", item.id)}>
                  <ImagenTarjeta src={item.imagen} alt={item.alt} />{item.alt}
                </button>)}
            </div>
            <div className={s.casillas}>
              {sec.casillas.map((rotulo, i) => {
                const item = sec.items.find((x) => x.id === casillas[i]);
                return <button key={rotulo} type="button" data-casilla={i}
                  className={s.casilla} aria-label={`${rotulo}: ${item?.alt ?? "vacía"}`}
                  onClick={() => {
                    if (elegida) poner(i);
                    else if (item && !cerradaSecuencia) {
                      setElegida(item.id);
                      setAviso(`Elegiste el dibujo de ${rotulo}. Toca otra casilla para moverlo.`);
                    }
                  }}
                  onDragOver={(ev) => ev.preventDefault()}
                  onDrop={(ev) => { ev.preventDefault(); poner(i, ev.dataTransfer.getData("text/plain")); }}>
                  <strong>{rotulo}</strong>
                  {item && <ImagenTarjeta src={item.imagen} alt="" />}
                </button>;
              })}
            </div>
          </div>
          <p className={s.ayuda}>Elige un dibujo y después una casilla. También puedes arrastrarlo.</p>
          {aviso && <p className={s.aviso} role="status">{aviso}</p>}
          {!cerradaSecuencia && <Avanzar onClick={enviarSecuencia}>Comprobar orden</Avanzar>}
          {cerradaSecuencia && <Avanzar onClick={() => { efectos.tocar("fin"); setFase("final"); }}>
            Terminar <ArrowRight aria-hidden="true" />
          </Avanzar>}
        </section>}
        {fase === "final" && <section className={s.tarjeta}>
          <h2 ref={preguntaRef} tabIndex={-1}>Fin del cuento</h2>
          <p>{contenido.final}</p>
          <Escuchar texto={contenido.final} audio={contenido.audioFinal} />
          <Avanzar onClick={() => alTerminar(respuestas)}>
            Ver mi resultado <ArrowRight aria-hidden="true" />
          </Avanzar>
        </section>}
      </div>
      {imagen && <Ilustracion key={imagen} imagen={imagen} alt={fase === "escena" ? e.alt ?? "" : ""} />}
      {personaje && <div className={s.personaje} data-pose={pose} aria-label={personaje.nombre}>
        <Image src={personaje[pose]} alt="" fill sizes="(max-width: 700px) 22vw, 30vh"
          style={{ objectFit: "contain" }} />
      </div>}
    </main>
  </Pantalla>;
}

function Ilustracion({ imagen, alt }: { imagen: string; alt: string; }) {
  const [disponible, setDisponible] = useState(true);
  return <div className={s.ilustracion}>
    {disponible && <Image src={imagen} alt={alt} fill sizes="(max-width: 700px) 100vw, 60vw"
      style={{ objectFit: "contain" }} onError={() => setDisponible(false)} />}
  </div>;
}

function ImagenTarjeta({ src, alt }: { src: string; alt: string }) {
  const [disponible, setDisponible] = useState(true);
  return disponible ? <Image src={src} alt={alt} width={240} height={135} onError={() => setDisponible(false)} /> : null;
}
