"use client";

import { ArrowRight } from "lucide-react";
import { useId, useRef, useState, type CSSProperties } from "react";
import { Avanzar, Aviso, useFocoAlCambiar, type PropsJuego } from "../../reproductor/comun";
import rp from "../../reproductor/reproductor.module.css";
import { Frac } from "../comun/fraccion";
import { Armi, Controles, Guirnalda, type EstadoRonda, type Pose } from "../comun/piezas";
import { useSonido } from "../comun/sonido";
import { Teclado } from "../comun/teclado";
import { useVoz } from "../comun/voz";
import e from "../comun/escena.module.css";
import { esEquivalente, resultado, SABORES, type ContenidoJarras, type RespuestaJarras, type RondaJarras } from "./tipo";
import s from "./jarras.module.css";

/*
  LA JUGUERÍA DE LA PLAZA — juego 8 de Matemáticas de 5.° (suma y resta de
  fracciones con el mismo denominador). Dos jarras graduadas; se escribe el
  resultado como fracción y la jarra de la respuesta se llena. Cuenta el
  primer intento; si suma también los denominadores, Armi lo nota y lo dice.
*/

type Campo = "n" | "d";

const ESCENA = { "--fondo": "url(/images/juegos/jarras/jugueria.webp)", "--fondo-pos": "center 45%", "--fondo-color": "#fbe3cf" } as CSSProperties;

export function JuegoJarras({ contenido, alTerminar }: PropsJuego<ContenidoJarras>) {
  const [indice, setIndice] = useState(0);
  const [valores, setValores] = useState<Record<Campo, string>>({ n: "", d: "" });
  const [activo, setActivo] = useState<Campo>("n");
  const [intentos, setIntentos] = useState<RespuestaJarras[]>([]);
  const [respuestas, setRespuestas] = useState<Record<string, RespuestaJarras>>({});
  const [estados, setEstados] = useState<EstadoRonda[]>(() => contenido.rondas.map(() => "pendiente"));
  const voz = useVoz();
  const sonido = useSonido();
  const titulo = useFocoAlCambiar<HTMLHeadingElement>(indice);
  const refs = { n: useRef<HTMLInputElement>(null), d: useRef<HTMLInputElement>(null) };

  const r = contenido.rondas[indice];
  const D = r.denominador;
  const res = resultado(r);
  const ultimo = intentos.at(-1);
  const acerto = Boolean(ultimo) && esEquivalente(r, ultimo!.n, ultimo!.d);
  const cerrada = acerto || intentos.length >= 2;
  const ultima = indice === contenido.rondas.length - 1;
  const pose: Pose = !ultimo ? "senala" : acerto ? "celebra" : "piensa";
  const listo = valores.n !== "" && valores.d !== "";
  const sabor = SABORES[r.sabor];
  const signo = r.operacion === "+" ? "+" : "−";

  function escribir(campo: Campo, texto: string) {
    if (cerrada) return;
    setValores((v) => ({ ...v, [campo]: texto.replace(/\D/g, "").slice(0, 2) }));
  }

  function comprobar() {
    if (cerrada || !listo) return;
    voz.callar();
    const resp = { n: Number(valores.n), d: Number(valores.d) };
    const nuevos = [...intentos, resp];
    setIntentos(nuevos);
    if (nuevos.length === 1) setRespuestas((x) => ({ ...x, [r.id]: resp }));
    const bien = esEquivalente(r, resp.n, resp.d);
    sonido.tocar(bien ? "acierto" : "error");
    if (bien || nuevos.length >= 2) {
      setEstados((es) => es.map((v, k) => (k === indice ? (nuevos.length === 1 && bien ? "bien" : "corregida") : v)));
      if (!bien) setValores({ n: String(res), d: String(D) });
    } else {
      setValores({ n: "", d: "" });
      setActivo("n");
      requestAnimationFrame(() => refs.n.current?.focus());
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
    setIntentos([]);
    setValores({ n: "", d: "" });
    setActivo("n");
  }

  const llenoRespuesta = cerrada ? res / D : 0;
  const pregunta = r.operacion === "+" ? `Si juntas las dos jarras de jugo de ${sabor.nombre}, ¿cuánto jugo hay?` : `Si a la primera jarra le sacas lo de la segunda, ¿cuánto jugo queda?`;

  return (
    <div className={e.juego}>
      <div className={e.barra}>
        <Guirnalda estados={estados} actual={indice} />
        <Controles voz={voz} sonido={sonido} texto={`${r.a}/${D} ${r.operacion === "+" ? "más" : "menos"} ${r.b}/${D}. ${pregunta}`} />
      </div>

      <div className={e.escena} style={ESCENA}>
        <div className={e.fondo} aria-hidden="true" />
        <div className={s.mostrador} key={r.id} style={{ "--jugo": sabor.color } as CSSProperties}>
          <Jarra lleno={r.a / D} marcas={D} etiqueta={`Jarra con ${r.a}/${D} de jugo`} />
          <span className={s.signo} aria-hidden="true">
            {signo}
          </span>
          <Jarra lleno={r.b / D} marcas={D} etiqueta={`Jarra con ${r.b}/${D} de jugo`} />
          <span className={s.signo} aria-hidden="true">
            =
          </span>
          <Jarra lleno={llenoRespuesta} marcas={D} etiqueta={cerrada ? `Jarra con ${res}/${D} de jugo` : "Jarra de la respuesta, vacía"} respuesta />
          <p className={s.operacion}>
            <Frac n={r.a} d={D} /> <span aria-hidden="true">{signo}</span>
            <span className={s.solo}>{r.operacion === "+" ? "más" : "menos"}</span> <Frac n={r.b} d={D} /> <span aria-hidden="true">=</span>
            <span className={s.solo}>igual a</span>
            <span className={s.casillas}>
              {(["n", "d"] as const).map((c) => (
                <input
                  key={c}
                  ref={refs[c]}
                  className={s.entrada}
                  data-campo={c}
                  data-activo={activo === c && !cerrada ? "" : undefined}
                  data-estado={cerrada ? (acerto ? "ok" : "no") : undefined}
                  value={valores[c]}
                  inputMode="none"
                  autoComplete="off"
                  readOnly={cerrada}
                  aria-label={c === "n" ? "Numerador del resultado" : "Denominador del resultado"}
                  onFocus={() => setActivo(c)}
                  onChange={(ev) => escribir(c, ev.target.value)}
                  onKeyDown={(ev) => ev.key === "Enter" && comprobar()}
                />
              ))}
            </span>
          </p>
        </div>
        <div className={e.armi}>
          <Armi pose={pose} />
        </div>
      </div>

      <h2 ref={titulo} tabIndex={-1} className={e.pregunta}>
        {pregunta}
      </h2>

      {!cerrada && (
        <div className={s.mando}>
          <Teclado onDigito={(dg) => escribir(activo, valores[activo] + dg)} onBorrar={() => escribir(activo, valores[activo].slice(0, -1))} />
          <button type="button" className={rp.principal} disabled={!listo} onClick={comprobar}>
            Comprobar
          </button>
        </div>
      )}

      <Aviso tono={!ultimo ? null : acerto ? "ok" : cerrada ? "no" : "neutro"}>{mensaje(r, ultimo, intentos.length, acerto, cerrada)}</Aviso>

      {cerrada && (
        <div className={rp.acciones}>
          <Avanzar onClick={siguiente}>
            {ultima ? "Ver resultado" : "Siguiente pedido"}
            <ArrowRight size={20} strokeWidth={2.8} aria-hidden="true" />
          </Avanzar>
        </div>
      )}
    </div>
  );
}

function mensaje(r: RondaJarras, ultimo: RespuestaJarras | undefined, n: number, acerto: boolean, cerrada: boolean) {
  if (!ultimo) return "";
  const D = r.denominador;
  if (acerto) {
    const exacto = ultimo.d === D ? "" : ` También se escribe ${resultado(r)}/${D}.`;
    return (n === 1 ? "¡Jugo servido! " : "¡Ahora sí! ") + `${r.a} ${r.operacion === "+" ? "+" : "−"} ${r.b} = ${resultado(r)} partes de ${D}.${exacto}`;
  }
  if (!cerrada) {
    const operoDenominadores = r.operacion === "+" ? ultimo.d === 2 * D : ultimo.d === 0;
    if (operoDenominadores) return `Ojo: ${r.operacion === "+" ? "sumaste" : "restaste"} también los denominadores. Las partes siguen siendo de ${D}: el denominador se queda igual y solo se ${r.operacion === "+" ? "suman" : "restan"} los numeradores.`;
    return `Todavía no. Las dos jarras están marcadas en ${D} partes: cuenta cuántas partes hay ${r.operacion === "+" ? "al juntarlas" : "al sacar las de la segunda"}.`;
  }
  return `El resultado es ${resultado(r)}/${D}: ${r.a} ${r.operacion === "+" ? "+" : "−"} ${r.b} = ${resultado(r)}, y el denominador se queda en ${D}.`;
}

/** Jarra de vidrio graduada (SVG): el jugo sube hasta `lleno` (0–1) y hay una marca por cada parte. */
function Jarra({ lleno, marcas, etiqueta, respuesta }: { lleno: number; marcas: number; etiqueta: string; respuesta?: boolean }) {
  const top = 24;
  const bottom = 150;
  const alto = bottom - top;
  const nivel = bottom - alto * lleno;
  const vaso = useId();
  return (
    <svg className={s.jarra} data-respuesta={respuesta ? "" : undefined} viewBox="0 0 110 160" role="img" aria-label={etiqueta}>
      <defs>
        <clipPath id={vaso}>
          <path d="M18 20 H84 V140 Q84 152 72 152 H30 Q18 152 18 140 Z" />
        </clipPath>
      </defs>
      <path d="M18 20 H84 V140 Q84 152 72 152 H30 Q18 152 18 140 Z" fill="rgb(255 255 255 / 0.75)" />
      <g clipPath={`url(#${vaso})`}>
        <rect className={s.jugo} x="10" y={nivel} width="90" height={bottom - nivel + 4} fill="var(--jugo)" />
      </g>
      {Array.from({ length: marcas - 1 }, (_, k) => {
        const y = bottom - (alto * (k + 1)) / marcas;
        return <path key={k} d={`M18 ${y} H32`} stroke="#1b2440" strokeWidth="2" />;
      })}
      <path d="M84 40 Q104 40 104 62 V92 Q104 112 84 112" fill="none" stroke="#1b2440" strokeWidth="5" />
      <path d="M18 20 H84 V140 Q84 152 72 152 H30 Q18 152 18 140 Z" fill="none" stroke="#1b2440" strokeWidth="4" strokeLinejoin="round" />
      <path d="M14 20 H88" stroke="#1b2440" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}
