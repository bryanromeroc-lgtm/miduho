"use client";

import { ArrowRight, FlaskConical, Minus, Plus, Target } from "lucide-react";
import { useRef, useState, type CSSProperties } from "react";
import { Avanzar, Aviso, Marca, useFocoAlCambiar, type PropsJuego } from "../../reproductor/comun";
import rp from "../../reproductor/reproductor.module.css";
import { Chispas, useReaccion } from "../comun/efectos";
import { Frac } from "../comun/fraccion";
import { Armi, Controles, Guirnalda, type EstadoRonda, type Pose } from "../comun/piezas";
import { useSonido } from "../comun/sonido";
import { Teclado } from "../comun/teclado";
import { useVoz } from "../comun/voz";
import e from "../comun/escena.module.css";
import { Figura } from "./figura";
import {
  diagnosticar,
  enPalabras,
  esCorrecta,
  MAX_PARTES,
  MAX_UNIDADES,
  nombreForma,
  opcionCorrecta,
  unidadesDe,
  type ContenidoTaller,
  type Forma,
  type RespuestaTaller,
  type RondaTaller,
} from "./tipo";
import s from "./fracciones.module.css";

/*
  EL TALLER DE LAS FRACCIONES — la fracción como parte de un todo en tres
  formas. Primero el laboratorio: se corta la unidad y se pintan partes, y
  círculos, barras y recta cambian juntos. Luego los retos (construir, leer,
  comparar): cuenta el primer intento; si falla, Armi nombra el error típico
  y se puede corregir una vez; al segundo fallo se ve la solución.
*/

const FORMAS: Forma[] = ["circulo", "barra", "recta"];

const ESCENA = { "--fondo": "url(/images/juegos/fracciones/taller.webp)", "--fondo-pos": "center 40%", "--fondo-color": "#f6e7cf" } as CSSProperties;

export function JuegoFracciones({ contenido, alTerminar }: PropsJuego<ContenidoTaller>) {
  const [vista, setVista] = useState<"laboratorio" | "retos">("laboratorio");
  return (
    <div className={e.juego}>
      <div className={s.modos} role="group" aria-label="Parte de la actividad">
        <button type="button" className={s.modo} aria-pressed={vista === "laboratorio"} onClick={() => setVista("laboratorio")}>
          <FlaskConical size={20} strokeWidth={2.6} aria-hidden="true" />
          Laboratorio
        </button>
        <button type="button" className={s.modo} aria-pressed={vista === "retos"} onClick={() => setVista("retos")}>
          <Target size={20} strokeWidth={2.6} aria-hidden="true" />
          Retos
        </button>
      </div>
      {/* Las dos partes quedan montadas: ir al laboratorio a probar no borra el reto. */}
      <div hidden={vista !== "laboratorio"}>
        <Laboratorio onRetos={() => setVista("retos")} />
      </div>
      <div hidden={vista !== "retos"}>
        <Retos contenido={contenido} alTerminar={alTerminar} visible={vista === "retos"} />
      </div>
    </div>
  );
}

/* ---------- Contador (− valor +) ---------- */

function Contador({ etiqueta, valor, min, max, onCambiar, deshabilitado }: { etiqueta: string; valor: number; min: number; max: number; onCambiar: (v: number) => void; deshabilitado?: boolean }) {
  return (
    <div className={s.contador} role="group" aria-label={etiqueta}>
      <span className={s.contadorEtiqueta} aria-hidden="true">
        {etiqueta}
      </span>
      <div className={s.contadorFila}>
        <button type="button" className={s.paso} aria-label={`Quitar: ${etiqueta.toLowerCase()}`} disabled={deshabilitado || valor <= min} onClick={() => onCambiar(valor - 1)}>
          <Minus size={22} strokeWidth={3} aria-hidden="true" />
        </button>
        <output className={s.contadorValor} aria-live="polite" aria-label={`${etiqueta}: ${valor}`}>
          {valor}
        </output>
        <button type="button" className={s.paso} aria-label={`Agregar: ${etiqueta.toLowerCase()}`} disabled={deshabilitado || valor >= max} onClick={() => onCambiar(valor + 1)}>
          <Plus size={22} strokeWidth={3} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

/** «1 entero y 1/4», «2 enteros», «menos de 1 entero»: cuánto vale frente a la unidad. */
function frenteALaUnidad(n: number, d: number) {
  if (n === 0) return "No hay nada pintado.";
  const enteros = Math.floor(n / d);
  const resto = n % d;
  if (enteros === 0) return "Es menos de 1 entero.";
  const t = `${enteros} ${enteros === 1 ? "entero" : "enteros"}`;
  return resto === 0 ? `Es igual a ${t}.` : `Es ${t} y ${resto}/${d}.`;
}

/* ---------- Laboratorio ---------- */

function Laboratorio({ onRetos }: { onRetos: () => void }) {
  const [d, setD] = useState(4);
  const [n, setN] = useState(3);
  const sonido = useSonido();
  const maxN = d * MAX_UNIDADES;
  // Siempre hay una unidad vacía de más (hasta 3) para seguir pintando.
  const unidades = Math.min(MAX_UNIDADES, Math.floor(n / d) + 1);

  function cambiarN(v: number) {
    setN(Math.max(0, Math.min(maxN, v)));
    sonido.tocar("toque");
  }
  function cambiarD(v: number) {
    setD(v);
    setN((x) => Math.min(x, v * MAX_UNIDADES));
    sonido.tocar("toque");
  }

  return (
    <section className={s.taller} aria-labelledby="lab-titulo">
      <div className={s.tallerCabeza}>
        <h2 id="lab-titulo" className={s.titulo}>
          Laboratorio
        </h2>
        <p className={s.ayuda}>Corta la unidad en partes iguales y pinta las que quieras. Las tres formas cambian al tiempo.</p>
      </div>

      <div className={s.lectura} aria-live="polite">
        <Frac n={n} d={d} className={s.fracGrande} />
        <p className={s.palabras}>
          <strong>{enPalabras(n, d)}</strong>
          <span>{frenteALaUnidad(n, d)}</span>
        </p>
      </div>

      <div className={s.controles}>
        <Contador etiqueta="Partes de cada unidad" valor={d} min={1} max={MAX_PARTES} onCambiar={cambiarD} />
        <Contador etiqueta="Partes pintadas" valor={n} min={0} max={maxN} onCambiar={cambiarN} />
      </div>

      <ul className={s.formas}>
        {FORMAS.map((f) => (
          <li key={f} className={s.forma} data-forma={f}>
            <h3 className={s.formaNombre}>{f === "recta" ? "Recta numérica" : f === "circulo" ? "Círculos" : "Barras"}</h3>
            <Figura forma={f} n={n} d={d} unidades={unidades} onCambiar={cambiarN} />
          </li>
        ))}
      </ul>

      <div className={rp.acciones}>
        <button type="button" className={rp.principal} onClick={onRetos}>
          Empezar los retos
          <ArrowRight size={20} strokeWidth={2.8} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}

/* ---------- Retos ---------- */

type Campo = "n" | "d";

function Retos({ contenido, alTerminar, visible }: Omit<PropsJuego<ContenidoTaller>, "semilla"> & { visible: boolean }) {
  const [indice, setIndice] = useState(0);
  const [intentos, setIntentos] = useState<RespuestaTaller[]>([]);
  const [respuestas, setRespuestas] = useState<Record<string, RespuestaTaller>>({});
  const [estados, setEstados] = useState<EstadoRonda[]>(() => contenido.rondas.map(() => "pendiente"));
  // Construir: lo armado. Leer: lo escrito. Comparar: la opción elegida.
  const [armado, setArmado] = useState({ n: 0, d: 1 });
  const [valores, setValores] = useState<Record<Campo, string>>({ n: "", d: "" });
  const [activo, setActivo] = useState<Campo>("n");
  const voz = useVoz();
  const sonido = useSonido();
  const { reaccion, disparar } = useReaccion();
  const titulo = useFocoAlCambiar<HTMLHeadingElement>(visible ? indice : -1);
  const refs = { n: useRef<HTMLInputElement>(null), d: useRef<HTMLInputElement>(null) };

  const r = contenido.rondas[indice];
  const [tn, td] = r.fraccion;
  const ultimo = intentos.at(-1);
  const acerto = Boolean(ultimo) && esCorrecta(r, ultimo!);
  const cerrada = acerto || intentos.length >= 2;
  const ultima = indice === contenido.rondas.length - 1;
  const pose: Pose = !ultimo ? "senala" : acerto ? "celebra" : "piensa";
  const unidades = unidadesDe(tn, td);

  function responder(resp: RespuestaTaller) {
    if (cerrada) return;
    voz.callar();
    const nuevos = [...intentos, resp];
    setIntentos(nuevos);
    if (nuevos.length === 1) setRespuestas((x) => ({ ...x, [r.id]: resp }));
    const bien = esCorrecta(r, resp);
    sonido.tocar(bien ? "acierto" : "error");
    if (bien) disparar(nuevos.length === 1 ? "acierto" : "corregida");
    if (bien || nuevos.length >= 2) {
      setEstados((es) => es.map((v, k) => (k === indice ? (nuevos.length === 1 && bien ? "bien" : "corregida") : v)));
      if (!bien) {
        // Se muestra la solución en la misma figura o casillas.
        setArmado({ n: tn, d: td });
        setValores({ n: String(tn), d: String(td) });
      }
    } else if (r.reto === "leer") {
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
    setArmado({ n: 0, d: 1 });
    setValores({ n: "", d: "" });
    setActivo("n");
  }

  function escribir(campo: Campo, texto: string) {
    if (cerrada) return;
    setValores((v) => ({ ...v, [campo]: texto.replace(/\D/g, "").slice(0, 2) }));
  }

  function armar(cambio: Partial<typeof armado>) {
    if (cerrada) return;
    setArmado((a) => {
      const d = cambio.d ?? a.d;
      return { d, n: Math.max(0, Math.min(d * unidades, cambio.n ?? a.n)) };
    });
    sonido.tocar("toque");
  }

  const pregunta = enunciado(r);
  const listoLeer = valores.n !== "" && valores.d !== "";

  return (
    <div className={e.juego}>
      <div className={e.barra}>
        <Guirnalda estados={estados} actual={indice} />
        <Controles voz={voz} sonido={sonido} texto={pregunta} />
      </div>

      <div className={e.escena} style={ESCENA}>
        <Chispas reaccion={reaccion} />
        <div className={e.fondo} aria-hidden="true" />
        <div className={s.mesa} key={r.id}>
          <h2 ref={titulo} tabIndex={-1} className={s.enunciado}>
            {r.reto === "leer" ? pregunta : (
              <>
                {r.reto === "construir" ? "Arma" : "¿Qué figura vale lo mismo que"} <Frac n={tn} d={td} className={s.fracMeta} />
                {r.reto === "construir" ? ` con ${nombreForma(r.forma)}` : "?"}
              </>
            )}
          </h2>

          {r.reto === "construir" && (
            <div className={s.construir}>
              <Figura forma={r.forma} n={armado.n} d={armado.d} unidades={unidades} onCambiar={cerrada ? undefined : (v) => armar({ n: v })} />
              <div className={s.controles}>
                <Contador etiqueta="Partes de cada unidad" valor={armado.d} min={1} max={MAX_PARTES} onCambiar={(v) => armar({ d: v })} deshabilitado={cerrada} />
                <Contador etiqueta={r.forma === "recta" ? "Saltos desde el 0" : "Partes pintadas"} valor={armado.n} min={0} max={armado.d * unidades} onCambiar={(v) => armar({ n: v })} deshabilitado={cerrada} />
              </div>
              <p className={s.armado} aria-live="polite">
                Llevas <Frac n={armado.n} d={armado.d} />
              </p>
            </div>
          )}

          {r.reto === "leer" && (
            <div className={s.leer}>
              <Figura forma={r.forma} n={tn} d={td} unidades={unidades} />
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
                    aria-label={c === "n" ? "Numerador: partes pintadas" : "Denominador: partes de cada unidad"}
                    onFocus={() => setActivo(c)}
                    onChange={(ev) => escribir(c, ev.target.value)}
                    onKeyDown={(ev) => ev.key === "Enter" && listoLeer && responder({ n: Number(valores.n), d: Number(valores.d) })}
                  />
                ))}
              </span>
            </div>
          )}

          {r.reto === "comparar" && (
            <div className={s.opciones} role="group" aria-label="Figuras para elegir">
              {r.opciones.map((o, i) => {
                const elegida = intentos.some((x) => "opcion" in x && x.opcion === i);
                const estado = cerrada && i === opcionCorrecta(r) ? "ok" : elegida ? "no" : undefined;
                return (
                  <button key={i} type="button" className={`${rp.opcion} ${s.opcion}`} data-estado={estado} disabled={cerrada || elegida} onClick={() => responder({ opcion: i })}>
                    <Figura forma={o.forma} n={o.fraccion[0]} d={o.fraccion[1]} unidades={unidadesDe(...o.fraccion)} tamano="mini" />
                    {cerrada && (
                      <span className={s.opcionValor}>
                        <Frac n={o.fraccion[0]} d={o.fraccion[1]} />
                      </span>
                    )}
                    <Marca estado={estado} />
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <div className={e.armi}>
          <Armi pose={pose} />
        </div>
      </div>

      {!cerrada && r.reto === "construir" && (
        <div className={rp.acciones}>
          <button type="button" className={rp.principal} onClick={() => responder({ ...armado })}>
            Comprobar
          </button>
        </div>
      )}
      {!cerrada && r.reto === "leer" && (
        <div className={s.mando}>
          <Teclado onDigito={(dg) => escribir(activo, valores[activo] + dg)} onBorrar={() => escribir(activo, valores[activo].slice(0, -1))} />
          <button type="button" className={rp.principal} disabled={!listoLeer} onClick={() => responder({ n: Number(valores.n), d: Number(valores.d) })}>
            Comprobar
          </button>
        </div>
      )}

      <Aviso tono={!ultimo ? null : acerto ? "ok" : cerrada ? "no" : "neutro"}>{mensaje(r, ultimo, intentos.length, acerto, cerrada)}</Aviso>

      {cerrada && (
        <div className={rp.acciones}>
          <Avanzar onClick={siguiente} enfocar={visible}>
            {ultima ? "Ver resultado" : "Siguiente reto"}
            <ArrowRight size={20} strokeWidth={2.8} aria-hidden="true" />
          </Avanzar>
        </div>
      )}
    </div>
  );
}

function enunciado(r: RondaTaller) {
  const f = r.fraccion.join("/");
  if (r.reto === "construir") return `Arma ${f} con ${nombreForma(r.forma)}.`;
  if (r.reto === "comparar") return `¿Qué figura vale lo mismo que ${f}?`;
  return r.forma === "recta" ? "¿En qué fracción está el punto de la recta?" : `¿Qué fracción de ${r.forma === "circulo" ? "los círculos" : "las barras"} está pintada?`;
}

function mensaje(r: RondaTaller, ultimo: RespuestaTaller | undefined, intentos: number, acerto: boolean, cerrada: boolean) {
  if (!ultimo) return "";
  const [n, d] = r.fraccion;
  const f = `${n}/${d}`;
  const recta = r.reto !== "comparar" && r.forma === "recta";
  const explicacion = recta
    ? `cada unidad de la recta está cortada en ${d} saltos iguales y el punto está a ${n} saltos del 0`
    : `cada unidad está cortada en ${d} partes iguales y hay ${n} pintadas`;

  if (acerto) {
    const inicio = intentos === 1 ? "¡Muy bien! " : "¡Ahora sí! ";
    if (r.reto === "comparar") {
      const o = r.opciones[opcionCorrecta(r)].fraccion;
      return `${inicio}${o.join("/")} vale lo mismo que ${f}: las dos cubren la misma cantidad de la unidad.`;
    }
    const otra = "n" in ultimo && ultimo.d !== d ? ` También se escribe ${ultimo.n}/${ultimo.d}.` : "";
    return `${inicio}${f} (${enPalabras(n, d)}): ${explicacion}.${otra}`;
  }

  if (!cerrada) {
    const leer = r.reto === "leer";
    switch (diagnosticar(r, ultimo)) {
      case "sin-pintar":
        return "Ojo: el número de abajo cuenta todas las partes de la unidad, las pintadas y las que no.";
      case "invertida":
        return "Está al revés: arriba van las partes que se toman y abajo, en cuántas partes iguales se corta la unidad.";
      case "marcas":
        return "En la recta no se cuentan las rayitas: se cuentan los saltos. Entre el 0 y el 1, ¿cuántos saltos hay?";
      case "partes":
        return leer ? "El número de arriba está bien. Revisa en cuántas partes iguales está cortada cada unidad." : `Lo pintado está bien. El número de abajo, ${d}, dice en cuántas partes iguales se corta cada unidad.`;
      case "pintadas":
        return leer ? `Las partes están bien. Cuenta otra vez cuántas hay pintadas${n > d ? ", en todas las unidades" : ""}.` : `La unidad está bien cortada. Ahora el número de arriba, ${n}, dice cuántas ${recta ? "saltos dar desde el 0" : "partes pintar"}${n > d ? ": cuando llenes una unidad, sigue en la siguiente" : ""}.`;
      case "mismo-numerador":
        return "Tener el mismo número arriba no basta: mira cuánto de la unidad está pintado en cada figura.";
      default:
        return r.reto === "comparar" ? "Todavía no. Compara cuánto de la unidad cubre cada figura." : "Todavía no. Primero cuenta en cuántas partes iguales está cortada la unidad y luego cuántas se toman.";
    }
  }

  if (r.reto === "comparar") {
    const o = r.opciones[opcionCorrecta(r)];
    return `Era la de ${nombreForma(o.forma)} con ${o.fraccion.join("/")}: vale lo mismo que ${f}.`;
  }
  return `Era ${f} (${enPalabras(n, d)}): ${explicacion}.`;
}
