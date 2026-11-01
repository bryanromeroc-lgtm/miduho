"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { barajar } from "../tipos/contrato";
import { Avanzar, Aviso, Marca, Progreso, useFocoAlCambiar, type PropsJuego } from "./comun";
import s from "./reproductor.module.css";

type Par = { id: string; izquierda: string; derecha: string };

/*
  Emparejar: se toca una tarjeta de cada columna, en cualquier orden. Cuenta
  el primer intento de cada par; un error se avisa y se puede seguir
  probando hasta unirlos todos.
*/
export function Emparejar({ contenido, semilla, alTerminar }: PropsJuego<{ pares: Par[] }>) {
  const izquierda = useMemo(() => barajar(contenido.pares, `${semilla}:i`), [contenido, semilla]);
  const derecha = useMemo(() => barajar(contenido.pares, `${semilla}:d`), [contenido, semilla]);
  const [sel, setSel] = useState<{ lado: "i" | "d"; id: string } | null>(null);
  const [unidos, setUnidos] = useState<Set<string>>(new Set());
  const [primeros, setPrimeros] = useState<Record<string, string>>({});
  const [aviso, setAviso] = useState<{ tono: "ok" | "no"; texto: string } | null>(null);
  const [fallo, setFallo] = useState<string | null>(null);
  const completo = unidos.size === contenido.pares.length;

  function tocar(lado: "i" | "d", id: string) {
    if (unidos.has(id)) return;
    if (!sel || sel.lado === lado) {
      setSel(sel?.lado === lado && sel.id === id ? null : { lado, id });
      return;
    }
    const izq = lado === "i" ? id : sel.id;
    const der = lado === "d" ? id : sel.id;
    const par = contenido.pares.find((p) => p.id === izq)!;
    setPrimeros((p) => (izq in p ? p : { ...p, [izq]: der }));
    setSel(null);
    if (izq === der) {
      setUnidos((u) => new Set(u).add(izq));
      setAviso({ tono: "ok", texto: `¡Pareja correcta! ${par.izquierda} va con ${par.derecha}.` });
    } else {
      setFallo(lado === "d" ? der : izq);
      setAviso({ tono: "no", texto: "Esas dos no van juntas. Intenta con otra." });
    }
  }

  useEffect(() => {
    if (!fallo) return;
    const t = setTimeout(() => setFallo(null), 700);
    return () => clearTimeout(t);
  }, [fallo]);

  const columna = (lado: "i" | "d", lista: Par[]) => (
    <ul className={s.columna} aria-label={lado === "i" ? "Columna izquierda" : "Columna derecha"}>
      {lista.map((p) => {
        const unido = unidos.has(p.id);
        const texto = lado === "i" ? p.izquierda : p.derecha;
        return (
          <li key={p.id}>
            <button
              type="button"
              className={s.carta}
              data-estado={unido ? "ok" : fallo === p.id ? "no" : undefined}
              aria-pressed={sel?.lado === lado && sel.id === p.id}
              aria-disabled={unido || undefined}
              onClick={() => tocar(lado, p.id)}
            >
              <span>{texto}</span>
              {unido && <Marca estado="ok" />}
              {unido && <span className={s.solo}>, ya unida</span>}
            </button>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className={s.juego}>
      <Progreso actual={unidos.size} total={contenido.pares.length} nombre="Parejas unidas:" />
      <div className={s.columnas}>
        {columna("i", izquierda)}
        {columna("d", derecha)}
      </div>
      <Aviso tono={aviso?.tono ?? null}>{aviso?.texto}</Aviso>
      {completo && (
        <div className={s.acciones}>
          <Avanzar onClick={() => alTerminar(primeros)}>Ver resultado</Avanzar>
        </div>
      )}
    </div>
  );
}

type Elemento = { id: string; texto: string };

/** Ordenar con botones de subir y bajar (sin arrastrar); el foco acompaña al elemento que se mueve. */
export function Ordenar({ contenido, semilla, alTerminar }: PropsJuego<{ elementos: Elemento[] }>) {
  const inicial = useMemo(() => {
    const ids = contenido.elementos.map((e) => e.id);
    for (let k = 0; k < 5; k++) {
      const b = barajar(ids, `${semilla}:${k}`);
      if (b.some((id, i) => id !== ids[i])) return b;
    }
    return [...ids].reverse();
  }, [contenido, semilla]);
  const [orden, setOrden] = useState(inicial);
  const [revisado, setRevisado] = useState(false);
  const foco = useRef<{ id: string; dir: "sube" | "baja" } | null>(null);
  const botones = useRef(new Map<string, HTMLButtonElement>());
  const texto = (id: string) => contenido.elementos.find((e) => e.id === id)!.texto;
  const bien = orden.filter((id, i) => contenido.elementos[i].id === id).length;

  useEffect(() => {
    const f = foco.current;
    if (!f) return;
    const i = orden.indexOf(f.id);
    // En los extremos el botón usado desaparece: el foco pasa al otro.
    const dir =
      (f.dir === "sube" && i === 0) || (f.dir === "baja" && i === orden.length - 1) ? (f.dir === "sube" ? "baja" : "sube") : f.dir;
    botones.current.get(`${f.id}:${dir}`)?.focus();
    foco.current = null;
  }, [orden]);

  function mover(i: number, paso: -1 | 1) {
    const j = i + paso;
    const nuevo = [...orden];
    [nuevo[i], nuevo[j]] = [nuevo[j], nuevo[i]];
    foco.current = { id: orden[i], dir: paso < 0 ? "sube" : "baja" };
    setOrden(nuevo);
  }

  return (
    <div className={s.juego}>
      <ol className={s.lista}>
        {orden.map((id, i) => {
          const estado = revisado ? (contenido.elementos[i].id === id ? "ok" : "no") : undefined;
          return (
            <li key={id} className={s.fila} data-estado={estado}>
              <span className={s.numero} aria-hidden="true">
                {i + 1}
              </span>
              <span className={s.filaTexto}>
                {texto(id)}
                {estado && <span className={s.solo}>{estado === "ok" ? ", en su lugar" : ", fuera de lugar"}</span>}
              </span>
              <Marca estado={estado} />
              {!revisado && (
                <span className={s.flechas}>
                  {i > 0 && (
                    <button
                      ref={(b) => void (b ? botones.current.set(`${id}:sube`, b) : botones.current.delete(`${id}:sube`))}
                      type="button"
                      className={s.flechaBoton}
                      aria-label={`Subir «${texto(id)}»`}
                      onClick={() => mover(i, -1)}
                    >
                      <ArrowUp size={22} strokeWidth={2.8} aria-hidden="true" />
                    </button>
                  )}
                  {i < orden.length - 1 && (
                    <button
                      ref={(b) => void (b ? botones.current.set(`${id}:baja`, b) : botones.current.delete(`${id}:baja`))}
                      type="button"
                      className={s.flechaBoton}
                      aria-label={`Bajar «${texto(id)}»`}
                      onClick={() => mover(i, 1)}
                    >
                      <ArrowDown size={22} strokeWidth={2.8} aria-hidden="true" />
                    </button>
                  )}
                </span>
              )}
            </li>
          );
        })}
      </ol>
      <Aviso tono={revisado ? (bien === orden.length ? "ok" : "no") : null}>
        {revisado &&
          (bien === orden.length
            ? "¡Todo en su lugar!"
            : `${bien} de ${orden.length} quedaron en su lugar. En el resultado verás el orden correcto.`)}
      </Aviso>
      <div className={s.acciones}>
        {revisado ? (
          <Avanzar onClick={() => alTerminar({ orden })}>Ver resultado</Avanzar>
        ) : (
          <button type="button" className={s.principal} onClick={() => setRevisado(true)}>
            Comprobar el orden
          </button>
        )}
      </div>
    </div>
  );
}

type Clasificacion = { categorias: { id: string; nombre: string }[]; elementos: { id: string; texto: string; categoria: string }[] };

/** Clasificar: un elemento a la vez y una cesta por categoría; lo ubicado se queda a la vista en su cesta correcta. */
export function Clasificar({ contenido, semilla, alTerminar }: PropsJuego<Clasificacion>) {
  const elementos = useMemo(() => barajar(contenido.elementos, semilla), [contenido, semilla]);
  const [indice, setIndice] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const e = elementos[indice];
  const elegida = respuestas[e.id];
  const respondida = elegida !== undefined;
  const ultima = indice === elementos.length - 1;
  const titulo = useFocoAlCambiar<HTMLParagraphElement>(indice);
  const nombre = (id: string) => contenido.categorias.find((k) => k.id === id)!.nombre;

  return (
    <div className={s.juego}>
      <Progreso actual={indice + 1} total={elementos.length} nombre="Elemento" />
      <p ref={titulo} tabIndex={-1} className={s.pieza}>
        {e.texto}
      </p>
      <div className={s.cestas} data-tres={contenido.categorias.length === 3 ? "" : undefined}>
        {contenido.categorias.map((k) => {
          const estado = respondida ? (k.id === e.categoria ? "ok" : k.id === elegida ? "no" : undefined) : undefined;
          const dentro = elementos.slice(0, respondida ? indice + 1 : indice).filter((x) => x.categoria === k.id);
          return (
            <div key={k.id} className={s.cesta} data-estado={estado}>
              <button
                type="button"
                className={s.cestaBoton}
                disabled={respondida}
                onClick={() => setRespuestas((r) => ({ ...r, [e.id]: k.id }))}
              >
                {k.nombre}
                <Marca estado={estado} />
              </button>
              <ul className={s.cestaLista} aria-label={`En ${k.nombre}`}>
                {dentro.map((x) => (
                  <li key={x.id} data-estado={respuestas[x.id] === x.categoria ? "ok" : "no"}>
                    {x.texto}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      <Aviso tono={respondida ? (elegida === e.categoria ? "ok" : "no") : null}>
        {respondida && (elegida === e.categoria ? `¡Correcto! Va en ${nombre(e.categoria)}.` : `Va en ${nombre(e.categoria)}.`)}
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

type Carta = { clave: string; pareja: string; texto: string };

/*
  Memoria: dos cartas a la vez. Si se corresponden, quedan boca arriba; si
  no, se voltean de nuevo después de un momento. Completar el tablero da la
  nota completa: los volteos no restan.
*/
export function Memoria({ contenido, semilla, alTerminar }: PropsJuego<{ parejas: { id: string; a: string; b: string }[] }>) {
  const cartas = useMemo<Carta[]>(
    () =>
      barajar(
        contenido.parejas.flatMap((p) => [
          { clave: `${p.id}:a`, pareja: p.id, texto: p.a },
          { clave: `${p.id}:b`, pareja: p.id, texto: p.b },
        ]),
        semilla,
      ),
    [contenido, semilla],
  );
  const [abiertas, setAbiertas] = useState<string[]>([]);
  const [halladas, setHalladas] = useState<Set<string>>(new Set());
  const [volteos, setVolteos] = useState(0);
  const [aviso, setAviso] = useState<{ tono: "ok" | "no"; texto: string } | null>(null);
  const completo = halladas.size === contenido.parejas.length;
  const cierre = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(cierre.current), []);

  function voltear(c: Carta) {
    if (abiertas.length === 2 || abiertas.includes(c.clave) || halladas.has(c.pareja)) return;
    setVolteos((v) => v + 1);
    if (abiertas.length === 0) {
      setAbiertas([c.clave]);
      return;
    }
    const otra = cartas.find((x) => x.clave === abiertas[0])!;
    if (otra.pareja === c.pareja) {
      setHalladas((h) => new Set(h).add(c.pareja));
      setAbiertas([]);
      setAviso({ tono: "ok", texto: `¡Pareja! ${otra.texto} y ${c.texto}.` });
      return;
    }
    setAbiertas([otra.clave, c.clave]);
    setAviso({ tono: "no", texto: `${otra.texto} y ${c.texto} no son pareja.` });
    cierre.current = setTimeout(() => setAbiertas([]), 1300);
  }

  return (
    <div className={s.juego}>
      <Progreso actual={halladas.size} total={contenido.parejas.length} nombre="Parejas encontradas:" />
      <ul className={s.tablero} data-cuantas={cartas.length}>
        {cartas.map((c, i) => {
          const visible = abiertas.includes(c.clave) || halladas.has(c.pareja);
          return (
            <li key={c.clave}>
              <button
                type="button"
                className={s.memoria}
                data-visible={visible ? "" : undefined}
                data-estado={halladas.has(c.pareja) ? "ok" : abiertas.length === 2 && visible ? "no" : undefined}
                aria-label={visible ? `Carta ${i + 1}: ${c.texto}` : `Carta ${i + 1}, boca abajo`}
                onClick={() => voltear(c)}
              >
                <span aria-hidden="true">{visible ? c.texto : "?"}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <Aviso tono={aviso?.tono ?? null}>{aviso?.texto}</Aviso>
      {completo && (
        <div className={s.acciones}>
          <Avanzar onClick={() => alTerminar({ tablero: { completo: true, volteos } })}>Ver resultado</Avanzar>
        </div>
      )}
    </div>
  );
}
