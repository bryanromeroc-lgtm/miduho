"use client";

import { ArrowRight } from "lucide-react";
import { useMemo, useRef, useState, type CSSProperties } from "react";
import { Avanzar, Aviso, useFocoAlCambiar, type PropsJuego } from "../../reproductor/comun";
import rp from "../../reproductor/reproductor.module.css";
import { Armi, Controles, Guirnalda, type EstadoRonda, type Pose } from "../comun/piezas";
import { useSonido } from "../comun/sonido";
import { Teclado } from "../comun/teclado";
import { useVoz } from "../comun/voz";
import e from "../comun/escena.module.css";
import { escribirExpresion, pasos as calcularPasos, type Token } from "./expresion";
import type { ContenidoOperaciones, RespuestaOperaciones } from "./tipo";
import s from "./operaciones.module.css";

/*
  LA SUBIDA AL CERRO — juego 12 de Matemáticas de 5.° (operaciones
  combinadas). Por cada paso: tocar la operación que va primero y escribir
  su resultado; la expresión se reduce y Armi sube un escalón. En cada
  acción cuenta el primer intento; al fallar, pista y otra oportunidad;
  al segundo fallo, Armi lo resuelve y se sigue.
*/

type Fase = "elegir" | "calcular" | "fin";

const ESCENA = { "--fondo": "url(/images/juegos/operaciones/cerro.webp)", "--fondo-pos": "center 40%", "--fondo-color": "#d6ebf5" } as CSSProperties;
const REGLA = "Primero lo que está entre paréntesis; después multiplicaciones y divisiones, de izquierda a derecha; al final sumas y restas, de izquierda a derecha.";

export function JuegoOperaciones({ contenido, alTerminar }: PropsJuego<ContenidoOperaciones>) {
  const [indice, setIndice] = useState(0);
  const [paso, setPaso] = useState(0);
  const [fase, setFase] = useState<Fase>("elegir");
  const [toques, setToques] = useState<number[]>([]);
  const [valores, setValores] = useState<number[]>([]);
  const [texto, setTexto] = useState("");
  const [registro, setRegistro] = useState<RespuestaOperaciones["pasos"]>([]);
  const [respuestas, setRespuestas] = useState<Record<string, RespuestaOperaciones>>({});
  const [estados, setEstados] = useState<EstadoRonda[]>(() => contenido.expresiones.map(() => "pendiente"));
  const [aviso, setAviso] = useState<{ tono: "ok" | "no" | "neutro"; texto: string } | null>(null);
  const entrada = useRef<HTMLInputElement>(null);
  const voz = useVoz();
  const sonido = useSonido();
  const titulo = useFocoAlCambiar<HTMLHeadingElement>(`${indice}:${paso}:${fase}`);

  const ex = contenido.expresiones[indice];
  const { pasos: lista, final } = useMemo(() => calcularPasos(ex.expresion), [ex]);
  const actual = lista[paso];
  const tokens: Token[] = fase === "fin" ? [{ t: "n", v: final }] : actual.tokens;
  const ultima = indice === contenido.expresiones.length - 1;
  const pose: Pose = fase === "fin" ? "celebra" : aviso?.tono === "neutro" || aviso?.tono === "no" ? "piensa" : "senala";

  function guardar(nuevo: RespuestaOperaciones["pasos"]) {
    setRegistro(nuevo);
    setRespuestas((x) => ({ ...x, [ex.id]: { pasos: nuevo } }));
  }

  function tocar(k: number) {
    if (fase !== "elegir" || toques.includes(k)) return;
    voz.callar();
    const nuevos = [...toques, k];
    setToques(nuevos);
    if (nuevos.length === 1) {
      const r = [...registro];
      r[paso] = { toque: k, valor: null };
      guardar(r);
    }
    if (k === actual.k) {
      sonido.tocar("acierto");
      setAviso({ tono: "ok", texto: `¡Esa va primero! Ahora calcula ${actual.a} ${actual.op} ${actual.b}.` });
      pasarACalcular();
    } else if (nuevos.length >= 2) {
      sonido.tocar("error");
      setAviso({ tono: "no", texto: `Primero va ${actual.a} ${actual.op} ${actual.b}. ${REGLA}` });
      pasarACalcular();
    } else {
      sonido.tocar("error");
      setAviso({ tono: "neutro", texto: `Esa todavía no. ${REGLA}` });
    }
  }

  function pasarACalcular() {
    setFase("calcular");
    setTexto("");
    requestAnimationFrame(() => entrada.current?.focus());
  }

  function comprobar() {
    if (fase !== "calcular" || texto === "") return;
    voz.callar();
    const v = Number(texto);
    const nuevos = [...valores, v];
    setValores(nuevos);
    if (nuevos.length === 1) {
      const r = [...registro];
      r[paso] = { toque: r[paso]?.toque ?? null, valor: v };
      guardar(r);
    }
    const bien = v === actual.valor;
    if (!bien && nuevos.length < 2) {
      sonido.tocar("error");
      setAviso({ tono: "neutro", texto: `Revisa la cuenta: ${actual.a} ${actual.op} ${actual.b}.` });
      setTexto("");
      return;
    }
    sonido.tocar(bien ? "acierto" : "error");
    setAviso(bien ? { tono: "ok", texto: `${actual.a} ${actual.op} ${actual.b} = ${actual.valor}. ¡Un escalón más!` } : { tono: "no", texto: `${actual.a} ${actual.op} ${actual.b} = ${actual.valor}. Sigamos.` });
    setToques([]);
    setValores([]);
    setTexto("");
    if (paso + 1 < lista.length) {
      setPaso(paso + 1);
      setFase("elegir");
    } else {
      setFase("fin");
      const r = registro.map((x, i) => (i === paso && nuevos.length === 1 ? { ...x, valor: v } : x));
      const perfecto = r.length === lista.length && r.every((x, i) => x.toque === lista[i].k && x.valor === lista[i].valor);
      setEstados((es) => es.map((x, i) => (i === indice ? (perfecto ? "bien" : "corregida") : x)));
    }
  }

  function siguiente() {
    voz.callar();
    if (ultima) {
      sonido.tocar("fin");
      alTerminar(respuestas);
      return;
    }
    setIndice((i) => i + 1);
    setPaso(0);
    setFase("elegir");
    setToques([]);
    setValores([]);
    setTexto("");
    setRegistro([]);
    setAviso(null);
  }

  const pregunta = fase === "elegir" ? "Toca la operación que va primero." : fase === "calcular" ? `¿Cuánto es ${actual.a} ${actual.op} ${actual.b}?` : `¡Llegaste a la cima! El resultado es ${final}.`;

  return (
    <div className={e.juego}>
      <div className={e.barra}>
        <Guirnalda estados={estados} actual={indice} />
        <Controles voz={voz} sonido={sonido} texto={`${escribirExpresion(tokens)}. ${pregunta}`} />
      </div>

      <div className={e.escena} style={ESCENA}>
        <div className={e.fondo} aria-hidden="true" />
        <div className={s.panel} key={ex.id}>
          <p className={s.expresion} role="group" aria-label={`Expresión: ${escribirExpresion(tokens)}`}>
            {tokens.map((k, i) => {
              if (k.t === "op") {
                const marcada = fase === "calcular" && i === actual.k;
                const fallida = fase === "elegir" && toques.includes(i);
                return (
                  <button
                    key={`${paso}-${i}`}
                    type="button"
                    className={s.operador}
                    data-estado={marcada ? "ok" : fallida ? "no" : undefined}
                    disabled={fase !== "elegir" || fallida}
                    aria-label={`Operación ${nombreOp(k.v)}`}
                    onClick={() => tocar(i)}
                  >
                    {k.v}
                  </button>
                );
              }
              const enGrupo = fase === "calcular" && (i === actual.k - 1 || i === actual.k + 1);
              return (
                <span key={`${paso}-${i}`} className={k.t === "n" ? s.numero : s.parentesis} data-grupo={enGrupo ? "" : undefined}>
                  {k.t === "n" ? k.v : k.t}
                </span>
              );
            })}
          </p>
          <ol className={s.escalones} aria-label={`Paso ${Math.min(paso + 1, lista.length)} de ${lista.length}`}>
            {lista.map((_, i) => (
              <li key={i} data-hecho={i < paso || fase === "fin" ? "" : undefined} data-actual={i === paso && fase !== "fin" ? "" : undefined} />
            ))}
          </ol>
          {fase === "calcular" && (
            <p className={s.cuenta}>
              <span>
                {actual.a} {actual.op} {actual.b} =
              </span>
              <input
                ref={entrada}
                className={s.entrada}
                value={texto}
                inputMode="none"
                autoComplete="off"
                aria-label={`Resultado de ${actual.a} ${nombreOp(actual.op)} ${actual.b}`}
                onChange={(ev) => setTexto(ev.target.value.replace(/\D/g, "").slice(0, 5))}
                onKeyDown={(ev) => ev.key === "Enter" && comprobar()}
              />
            </p>
          )}
        </div>
        <div className={e.armi}>
          <Armi pose={pose} />
        </div>
      </div>

      <h2 ref={titulo} tabIndex={-1} className={e.pregunta}>
        {pregunta}
      </h2>

      {fase === "calcular" && (
        <div className={s.mando}>
          <Teclado onDigito={(d) => setTexto((t) => (t + d).slice(0, 5))} onBorrar={() => setTexto((t) => t.slice(0, -1))} />
          <button type="button" className={rp.principal} disabled={texto === ""} onClick={comprobar}>
            Comprobar
          </button>
        </div>
      )}

      <Aviso tono={aviso?.tono ?? null}>{aviso?.texto}</Aviso>

      {fase === "fin" && (
        <div className={rp.acciones}>
          <Avanzar onClick={siguiente}>
            {ultima ? "Ver resultado" : "Siguiente subida"}
            <ArrowRight size={20} strokeWidth={2.8} aria-hidden="true" />
          </Avanzar>
        </div>
      )}
    </div>
  );
}

function nombreOp(op: string) {
  return op === "+" ? "suma" : op === "−" ? "resta" : op === "×" ? "multiplicación" : "división";
}
