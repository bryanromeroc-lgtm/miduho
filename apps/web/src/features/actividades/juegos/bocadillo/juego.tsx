"use client";

import { ArrowRight } from "lucide-react";
import { useMemo, useState, type CSSProperties } from "react";
import { barajar } from "../../tipos/contrato";
import { Avanzar, Aviso, Marca, useFocoAlCambiar, type PropsJuego } from "../../reproductor/comun";
import rp from "../../reproductor/reproductor.module.css";
import { Frac } from "../comun/fraccion";
import { Armi, Controles, Guirnalda, type EstadoRonda, type Pose } from "../comun/piezas";
import { useSonido } from "../comun/sonido";
import { useVoz } from "../comun/voz";
import e from "../comun/escena.module.css";
import { solucion, type ContenidoBocadillo, type RespuestaBocadillo, type RondaBocadillo } from "./tipo";
import s from "./bocadillo.module.css";

/*
  EL TALLER DEL BOCADILLO — juego 7 de Matemáticas de 5.° (común denominador).
  Dos barras de bocadillo partidas distinto. Paso 1: elegir en cuántas
  partes iguales cortar las dos. Paso 2: pintar en cada barra recortada la
  misma cantidad que en la original (tocar una parte pinta hasta ella).
  Cada paso: cuenta el primer intento, pista y un segundo intento.
*/

type Paso = "cortar" | "pintar" | "hecho";

const ESCENA = { "--fondo": "url(/images/juegos/bocadillo/taller.webp)", "--fondo-pos": "center 50%", "--fondo-color": "#f0dcc4" } as CSSProperties;

export function JuegoBocadillo({ contenido, semilla, alTerminar }: PropsJuego<ContenidoBocadillo>) {
  const [indice, setIndice] = useState(0);
  const [paso, setPaso] = useState<Paso>("cortar");
  const [cortesElegidos, setCortesElegidos] = useState<number[]>([]);
  const [pintadas, setPintadas] = useState({ a: 0, b: 0 });
  const [comprobaciones, setComprobaciones] = useState<{ a: number; b: number }[]>([]);
  const [respuestas, setRespuestas] = useState<Record<string, RespuestaBocadillo>>({});
  const [estados, setEstados] = useState<EstadoRonda[]>(() => contenido.rondas.map(() => "pendiente"));
  const voz = useVoz();
  const sonido = useSonido();
  const titulo = useFocoAlCambiar<HTMLHeadingElement>(`${indice}:${paso}`);

  const r = contenido.rondas[indice];
  const sol = solucion(r);
  const ultima = indice === contenido.rondas.length - 1;
  const cortes = useMemo(() => barajar(r.cortes, `${semilla}:${r.id}`), [r, semilla]);
  const ultimaComp = comprobaciones.at(-1);
  const pintoBien = ultimaComp?.a === sol.a && ultimaComp?.b === sol.b;
  const cortoBien = cortesElegidos.at(-1) === sol.corte;
  const fallo = paso === "cortar" ? cortesElegidos.length > 0 : paso === "pintar" ? comprobaciones.length > 0 : !pintoBien;
  const pose: Pose = paso === "hecho" ? (pintoBien ? "celebra" : "piensa") : fallo ? "piensa" : "senala";

  function elegirCorte(c: number) {
    if (paso !== "cortar" || cortesElegidos.includes(c)) return;
    voz.callar();
    const nuevos = [...cortesElegidos, c];
    setCortesElegidos(nuevos);
    if (nuevos.length === 1) setRespuestas((x) => ({ ...x, [r.id]: { corte: c, a: null, b: null } }));
    const bien = c === sol.corte;
    sonido.tocar(bien ? "acierto" : "error");
    if (bien || nuevos.length >= 2) setPaso("pintar");
  }

  function pintar(cual: "a" | "b", k: number) {
    if (paso !== "pintar") return;
    sonido.tocar("toque");
    setPintadas((p) => ({ ...p, [cual]: p[cual] === k + 1 ? k : k + 1 }));
  }

  function comprobar() {
    if (paso !== "pintar") return;
    voz.callar();
    const nuevas = [...comprobaciones, { ...pintadas }];
    setComprobaciones(nuevas);
    if (nuevas.length === 1) setRespuestas((x) => ({ ...x, [r.id]: { corte: x[r.id]?.corte ?? null, ...pintadas } }));
    const bien = pintadas.a === sol.a && pintadas.b === sol.b;
    sonido.tocar(bien ? "acierto" : "error");
    if (bien || nuevas.length >= 2) {
      setPaso("hecho");
      if (!bien) setPintadas({ a: sol.a, b: sol.b });
      const perfecto = cortesElegidos[0] === sol.corte && nuevas.length === 1 && bien;
      setEstados((es) => es.map((v, k) => (k === indice ? (perfecto ? "bien" : "corregida") : v)));
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
    setPaso("cortar");
    setCortesElegidos([]);
    setComprobaciones([]);
    setPintadas({ a: 0, b: 0 });
  }

  const pregunta =
    paso === "cortar"
      ? "¿En cuántas partes iguales cortamos las dos barras?"
      : paso === "pintar"
        ? "Pinta en cada barra nueva la misma cantidad de bocadillo que en la de arriba."
        : "¡Barras con el mismo denominador!";

  return (
    <div className={e.juego}>
      <div className={e.barra}>
        <Guirnalda estados={estados} actual={indice} />
        <Controles voz={voz} sonido={sonido} texto={`Las barras tienen ${r.a[0]}/${r.a[1]} y ${r.b[0]}/${r.b[1]}. ${pregunta}`} />
      </div>

      <div className={e.escena} style={ESCENA}>
        <div className={e.fondo} aria-hidden="true" />
        <div className={s.mesa} key={r.id}>
          {(["a", "b"] as const).map((cual) => (
            <BarraDoble
              key={cual}
              cual={cual}
              fraccion={r[cual]}
              corte={paso === "cortar" ? null : sol.corte}
              pintadas={pintadas[cual]}
              activa={paso === "pintar"}
              estado={paso === "hecho" ? "ok" : undefined}
              pintar={(k) => pintar(cual, k)}
            />
          ))}
        </div>
        <div className={e.armi}>
          <Armi pose={pose} />
        </div>
      </div>

      <h2 ref={titulo} tabIndex={-1} className={e.pregunta}>
        {pregunta}
      </h2>

      {paso === "cortar" && (
        <div className={`${rp.opciones} ${e.opciones}`} role="group" aria-label="Cortes posibles">
          {cortes.map((c) => {
            const elegido = cortesElegidos.includes(c);
            return (
              <button key={c} type="button" className={`${rp.opcion} ${e.opcion} ${s.corte}`} data-estado={elegido ? "no" : undefined} disabled={elegido} onClick={() => elegirCorte(c)}>
                <span>{c} partes</span>
                <Marca estado={elegido ? "no" : undefined} />
              </button>
            );
          })}
        </div>
      )}

      {paso === "pintar" && (
        <div className={rp.acciones}>
          <button type="button" className={rp.principal} onClick={comprobar}>
            Comprobar
          </button>
        </div>
      )}

      <Aviso tono={avisoTono(paso, cortesElegidos.length, comprobaciones.length, cortoBien, pintoBien)}>
        {avisoTexto(r, sol, paso, cortesElegidos.length, comprobaciones.length, cortoBien, pintoBien)}
      </Aviso>

      {paso === "hecho" && (
        <div className={rp.acciones}>
          <Avanzar onClick={siguiente}>
            {ultima ? "Ver resultado" : "Siguientes barras"}
            <ArrowRight size={20} strokeWidth={2.8} aria-hidden="true" />
          </Avanzar>
        </div>
      )}
    </div>
  );
}

function avisoTono(paso: Paso, cortes: number, comps: number, cortoBien: boolean, pintoBien: boolean) {
  if (paso === "cortar") return cortes ? "neutro" : null;
  if (paso === "pintar") return comps ? "neutro" : cortoBien ? "ok" : "no";
  return pintoBien ? "ok" : "no";
}

function avisoTexto(r: RondaBocadillo, sol: { corte: number; a: number; b: number }, paso: Paso, cortes: number, comps: number, cortoBien: boolean, pintoBien: boolean) {
  const [da, db] = [r.a[1], r.b[1]];
  if (paso === "cortar") return cortes ? `Con ese corte no quedan iguales. Busca un número que esté en la tabla del ${da} y también en la del ${db}.` : "";
  if (paso === "pintar") {
    if (comps) return `Todavía no. Cada parte de la barra de ${da} se volvió ${sol.corte / da} partes, y cada parte de la de ${db}, ${sol.corte / db}. Mira que lo pintado mida lo mismo que arriba.`;
    return cortoBien ? `¡Eso es! ${sol.corte} está en la tabla del ${da} y en la del ${db}. Ahora pinta.` : `Se cortan en ${sol.corte} partes: ${sol.corte} está en la tabla del ${da} y en la del ${db}. Ahora pinta.`;
  }
  const texto = `${r.a[0]}/${da} = ${sol.a}/${sol.corte} y ${r.b[0]}/${db} = ${sol.b}/${sol.corte}.`;
  return pintoBien ? `¡Perfecto! ${texto}` : `Así quedan: ${texto}`;
}

/** Una barra original y, debajo, la misma barra cortada en el denominador común (sus partes se tocan para pintar). */
function BarraDoble({
  cual,
  fraccion: [n, d],
  corte,
  pintadas,
  activa,
  estado,
  pintar,
}: {
  cual: "a" | "b";
  fraccion: [number, number];
  corte: number | null;
  pintadas: number;
  activa: boolean;
  estado?: "ok";
  pintar: (k: number) => void;
}) {
  return (
    <div className={s.par}>
      <div className={s.fila}>
        <Frac n={n} d={d} className={s.etiqueta} />
        <div className={s.barra} role="img" aria-label={`Barra ${cual === "a" ? "uno" : "dos"}: ${n} de ${d} partes pintadas`}>
          {Array.from({ length: d }, (_, k) => (
            <span key={k} className={s.parte} data-llena={k < n ? "" : undefined} />
          ))}
        </div>
      </div>
      {corte && (
        <div className={s.fila}>
          <Frac n={activa || estado ? pintadas : "?"} d={corte} className={s.etiqueta} />
          <div className={s.barra} data-nueva="" data-estado={estado} role="group" aria-label={`Barra ${cual === "a" ? "uno" : "dos"} cortada en ${corte} partes`}>
            {Array.from({ length: corte }, (_, k) => (
              <button
                key={k}
                type="button"
                className={s.parte}
                data-llena={k < pintadas ? "" : undefined}
                disabled={!activa}
                aria-pressed={k < pintadas}
                aria-label={`Parte ${k + 1} de ${corte}`}
                onClick={() => pintar(k)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
