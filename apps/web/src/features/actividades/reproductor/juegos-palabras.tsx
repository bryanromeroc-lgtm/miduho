"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import {
  armarSopa,
  celdasDeLinea,
  jugarPalabra,
  leerLinea,
  letraBase,
  type Celda,
  type ContenidoSopa,
  type PalabraSecreta as Secreta,
} from "../tipos/palabras";
import { Avanzar, Aviso, Progreso, useFocoAlCambiar, type PropsJuego } from "./comun";
import s from "./reproductor.module.css";

/*
  Sopa de letras: se toca la primera letra y luego la última de la palabra.
  Las flechas del teclado recorren la cuadrícula (un solo punto de tabulación).
  Se puede terminar en cualquier momento; lo no encontrado vale 0.
*/
export function SopaLetras({ contenido, alTerminar }: PropsJuego<ContenidoSopa>) {
  const sopa = useMemo(() => armarSopa(contenido), [contenido]);
  const [inicio, setInicio] = useState<Celda | null>(null);
  const [halladas, setHalladas] = useState<Record<string, { desde: Celda; hasta: Celda }>>({});
  const [activa, setActiva] = useState<Celda>([0, 0]);
  const [aviso, setAviso] = useState<{ tono: "ok" | "no" | "neutro"; texto: string } | null>(null);
  const celdas = useRef(new Map<string, HTMLButtonElement>());
  const total = contenido.palabras.length;
  const cuantas = Object.keys(halladas).length;

  const marcadas = useMemo(() => {
    const m = new Set<string>();
    for (const { desde, hasta } of Object.values(halladas)) for (const [f, c] of celdasDeLinea(desde, hasta)) m.add(`${f},${c}`);
    return m;
  }, [halladas]);

  function tocar(celda: Celda) {
    setActiva(celda);
    if (!inicio) {
      setInicio(celda);
      setAviso({ tono: "neutro", texto: `Empiezas en la letra ${sopa.letras[celda[0]][celda[1]]}. Ahora toca la última letra.` });
      return;
    }
    setInicio(null);
    if (inicio[0] === celda[0] && inicio[1] === celda[1]) {
      setAviso(null);
      return;
    }
    const linea = leerLinea(sopa.letras, inicio, celda);
    const palabra =
      linea && contenido.palabras.find((p) => !halladas[p.id] && (p.palabra === linea || p.palabra === [...linea].reverse().join("")));
    if (palabra) {
      setHalladas((h) => ({ ...h, [palabra.id]: { desde: inicio, hasta: celda } }));
      setAviso({ tono: "ok", texto: `¡Encontraste ${palabra.palabra}!` });
    } else {
      setAviso({
        tono: "no",
        texto: linea ? `«${linea}» no es una de las palabras. Intenta otra vez.` : "Las letras deben quedar en línea recta.",
      });
    }
  }

  function teclas(e: KeyboardEvent) {
    const paso: Record<string, Celda> = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
    const d = paso[e.key];
    if (!d) return;
    e.preventDefault();
    const nueva: Celda = [
      Math.min(contenido.filas - 1, Math.max(0, activa[0] + d[0])),
      Math.min(contenido.columnas - 1, Math.max(0, activa[1] + d[1])),
    ];
    setActiva(nueva);
    celdas.current.get(`${nueva[0]},${nueva[1]}`)?.focus();
  }

  return (
    <div className={s.juego}>
      <Progreso actual={cuantas} total={total} nombre="Palabras encontradas:" />
      <div className={s.sopa}>
        <div
          className={s.cuadricula}
          role="group"
          aria-label={`Sopa de letras de ${contenido.filas} filas y ${contenido.columnas} columnas`}
          style={{ gridTemplateColumns: `repeat(${contenido.columnas}, minmax(0, 1fr))` }}
          onKeyDown={teclas}
        >
          {sopa.letras.map((fila, f) =>
            fila.map((letra, c) => {
              const llave = `${f},${c}`;
              const esInicio = inicio?.[0] === f && inicio[1] === c;
              return (
                <button
                  key={llave}
                  ref={(b) => void (b ? celdas.current.set(llave, b) : celdas.current.delete(llave))}
                  type="button"
                  className={s.letra}
                  tabIndex={activa[0] === f && activa[1] === c ? 0 : -1}
                  data-hallada={marcadas.has(llave) ? "" : undefined}
                  aria-pressed={esInicio}
                  aria-label={`${letra}, fila ${f + 1}, columna ${c + 1}${marcadas.has(llave) ? ", parte de una palabra encontrada" : ""}`}
                  onClick={() => tocar([f, c])}
                >
                  {letra}
                </button>
              );
            }),
          )}
        </div>
        <ul className={s.palabras} aria-label="Palabras para buscar">
          {contenido.palabras.map((p) => (
            <li key={p.id} data-hallada={halladas[p.id] ? "" : undefined}>
              <span className={s.palabraNombre}>
                {p.palabra}
                {halladas[p.id] && <span className={s.solo}>, encontrada</span>}
              </span>
              {p.pista && <span className={s.pista}>{p.pista}</span>}
            </li>
          ))}
        </ul>
      </div>
      <Aviso tono={aviso?.tono ?? null}>{aviso?.texto}</Aviso>
      <div className={s.acciones}>
        {cuantas === total ? (
          <Avanzar onClick={() => alTerminar(halladas)}>Ver resultado</Avanzar>
        ) : (
          <button type="button" className={s.secundario} onClick={() => alTerminar(halladas)}>
            Terminar aquí
          </button>
        )}
      </div>
    </div>
  );
}

const ABECEDARIO = [..."ABCDEFGHIJKLMNÑOPQRSTUVWXYZ"];

/*
  Palabra secreta: con una pista, se proponen letras con el teclado de la
  pantalla o el del computador. Las tildes no importan al proponer; la
  palabra se muestra con su ortografía completa.
*/
export function PalabraSecreta({ contenido, alTerminar }: PropsJuego<{ fallos: number; palabras: Secreta[] }>) {
  const [indice, setIndice] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, string[]>>({});
  const p = contenido.palabras[indice];
  const letras = useMemo(() => respuestas[p.id] ?? [], [respuestas, p.id]);
  const estado = jugarPalabra(p.palabra, letras, contenido.fallos);
  const terminada = estado.adivinada || estado.agotada;
  const objetivo = new Set([...p.palabra].map(letraBase));
  const ultima = indice === contenido.palabras.length - 1;
  const titulo = useFocoAlCambiar<HTMLParagraphElement>(indice);
  const zona = useRef<HTMLDivElement>(null);

  function proponer(l: string) {
    if (terminada || letras.includes(l)) return;
    setRespuestas((r) => ({ ...r, [p.id]: [...letras, l] }));
  }

  // Teclado físico: una letra propone; funciona mientras el foco esté dentro del juego.
  useEffect(() => {
    const el = zona.current;
    if (!el) return;
    const alTeclear = (e: globalThis.KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const l = letraBase(e.key);
      if (l.length === 1 && ABECEDARIO.includes(l)) proponer(l);
    };
    el.addEventListener("keydown", alTeclear);
    return () => el.removeEventListener("keydown", alTeclear);
  });

  return (
    <div className={s.juego} ref={zona}>
      <div className={s.juegoCabeza}>
        <Progreso actual={indice + 1} total={contenido.palabras.length} nombre="Palabra" />
        <span className={s.fallos}>
          <span className={s.solo}>{`Fallos: ${estado.fallos} de ${contenido.fallos}.`}</span>
          {Array.from({ length: contenido.fallos }, (_, i) => (
            <span key={i} className={s.fallo} data-usado={i < estado.fallos ? "" : undefined} aria-hidden="true" />
          ))}
          <span aria-hidden="true">
            {contenido.fallos - estado.fallos} {contenido.fallos - estado.fallos === 1 ? "fallo" : "fallos"} más
          </span>
        </span>
      </div>
      <p ref={titulo} tabIndex={-1} className={s.enunciado}>
        {p.pista}
      </p>
      <p className={s.secreta}>
        <span className={s.solo}>
          {terminada
            ? `La palabra es ${p.palabra}.`
            : `Palabra de ${p.palabra.length} letras: ${[...p.palabra].map((l) => (letras.includes(letraBase(l)) ? l : "espacio")).join(", ")}.`}
        </span>
        {[...p.palabra].map((l, i) => {
          const vista = terminada || letras.includes(letraBase(l));
          return (
            <span
              key={i}
              aria-hidden="true"
              className={s.casilla}
              data-vista={vista ? "" : undefined}
              data-estado={estado.agotada && !letras.includes(letraBase(l)) ? "no" : undefined}
            >
              {vista ? l.toLocaleUpperCase("es") : ""}
            </span>
          );
        })}
      </p>
      <div className={s.teclado} role="group" aria-label="Letras">
        {ABECEDARIO.map((l) => {
          const usada = letras.includes(l);
          return (
            <button
              key={l}
              type="button"
              className={s.tecla}
              data-estado={usada ? (objetivo.has(l) ? "ok" : "no") : undefined}
              aria-disabled={usada || terminada || undefined}
              aria-label={usada ? `${l}, ${objetivo.has(l) ? "está" : "no está"}` : l}
              onClick={() => proponer(l)}
            >
              {l}
            </button>
          );
        })}
      </div>
      <Aviso tono={estado.adivinada ? "ok" : estado.agotada ? "no" : null}>
        {estado.adivinada && "¡Adivinaste la palabra!"}
        {estado.agotada && `Se acabaron los fallos. La palabra era ${p.palabra.toLocaleUpperCase("es")}.`}
      </Aviso>
      {terminada && (
        <div className={s.acciones}>
          <Avanzar onClick={() => (ultima ? alTerminar(respuestas) : setIndice(indice + 1))}>
            {ultima ? "Ver resultado" : "Siguiente palabra"}
          </Avanzar>
        </div>
      )}
    </div>
  );
}
