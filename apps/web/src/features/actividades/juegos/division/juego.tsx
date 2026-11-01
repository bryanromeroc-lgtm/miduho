"use client";

import { ArrowRight, Check, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState, type CSSProperties } from "react";
import { formatearNumero } from "@/lib/numeros";
import { Avanzar, Aviso, useFocoAlCambiar, type PropsJuego } from "../../reproductor/comun";
import rp from "../../reproductor/reproductor.module.css";
import { Armi, Controles, Guirnalda, type EstadoRonda, type Pose } from "../comun/piezas";
import { useSonido } from "../comun/sonido";
import { Teclado } from "../comun/teclado";
import { useVoz } from "../comun/voz";
import e from "../comun/escena.module.css";
import h from "../corrector/corrector.module.css";
import { resolver, type ContenidoDivision, type RespuestaDivision } from "./tipo";
import s from "./division.module.css";

/*
  EL CAFÉ DE LA FINCA — juego 5 de Matemáticas de 5.° (división con divisor
  de tres cifras). Armi empaca café: el cociente son las bolsas llenas y el
  residuo lo que sobra. Se escribe con el teclado en pantalla o el físico.
  Cuenta el primer intento; tras un fallo la pista muestra múltiplos del
  divisor y la comprobación, y hay un segundo intento.
*/

type Campo = "cociente" | "residuo";

const ESCENA = { "--fondo": "url(/images/juegos/division/finca.webp)", "--fondo-pos": "center 40%", "--fondo-color": "#cfe7c4" } as CSSProperties;

export function JuegoDivision({ contenido, alTerminar }: PropsJuego<ContenidoDivision>) {
  const [indice, setIndice] = useState(0);
  const [valores, setValores] = useState<Record<Campo, string>>({ cociente: "", residuo: "" });
  const [activo, setActivo] = useState<Campo>("cociente");
  const [intentos, setIntentos] = useState<RespuestaDivision[]>([]);
  const [respuestas, setRespuestas] = useState<Record<string, RespuestaDivision>>({});
  const [estados, setEstados] = useState<EstadoRonda[]>(() => contenido.divisiones.map(() => "pendiente"));
  const voz = useVoz();
  const sonido = useSonido();
  const titulo = useFocoAlCambiar<HTMLHeadingElement>(indice);
  const refs = { cociente: useRef<HTMLInputElement>(null), residuo: useRef<HTMLInputElement>(null) };

  const d = contenido.divisiones[indice];
  const sol = resolver(d);
  const ultimo = intentos.at(-1);
  const bienC = ultimo?.cociente === sol.cociente;
  const bienR = ultimo?.residuo === sol.residuo;
  const acerto = Boolean(ultimo) && bienC && bienR;
  const cerrada = acerto || intentos.length >= 2;
  const ultima = indice === contenido.divisiones.length - 1;
  const pose: Pose = !ultimo ? "lapiz" : acerto ? "celebra" : "piensa";
  const listo = valores.cociente !== "" && valores.residuo !== "";

  function escribir(campo: Campo, texto: string) {
    if (cerrada) return;
    setValores((v) => ({ ...v, [campo]: texto.replace(/\D/g, "").slice(0, 5) }));
  }

  function comprobar() {
    if (cerrada || !listo) return;
    voz.callar();
    const r = { cociente: Number(valores.cociente), residuo: Number(valores.residuo) };
    const nuevos = [...intentos, r];
    setIntentos(nuevos);
    if (nuevos.length === 1) setRespuestas((x) => ({ ...x, [d.id]: r }));
    const bien = r.cociente === sol.cociente && r.residuo === sol.residuo;
    sonido.tocar(bien ? "acierto" : "error");
    if (bien || nuevos.length >= 2) {
      const perfecto = nuevos.length === 1 && bien;
      setEstados((es) => es.map((v, k) => (k === indice ? (perfecto ? "bien" : "corregida") : v)));
      if (!bien) setValores({ cociente: String(sol.cociente), residuo: String(sol.residuo) });
    } else {
      // Se borra solo lo que estaba mal, y el foco va a la primera casilla por corregir.
      const corregir: Campo = r.cociente !== sol.cociente ? "cociente" : "residuo";
      setValores((v) => ({
        cociente: r.cociente === sol.cociente ? v.cociente : "",
        residuo: r.residuo === sol.residuo ? v.residuo : "",
      }));
      setActivo(corregir);
      requestAnimationFrame(() => refs[corregir].current?.focus());
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
    setValores({ cociente: "", residuo: "" });
    setActivo("cociente");
  }

  // Mientras se corrige una casilla que estaba mal, vuelve a verse neutra.
  const estadoCampo = (c: Campo) => {
    if (!ultimo) return undefined;
    if (cerrada || (c === "cociente" ? bienC : bienR)) return "ok";
    return valores[c] === "" ? "no" : undefined;
  };
  const pregunta = "¿Cuántas bolsas se llenan (cociente) y cuánto sobra (residuo)?";

  return (
    <div className={e.juego}>
      <div className={e.barra}>
        <Guirnalda estados={estados} actual={indice} />
        <Controles voz={voz} sonido={sonido} texto={`${d.contexto ?? ""} ${formatearNumero(d.dividendo)} dividido entre ${d.divisor}. ${pregunta}`} />
      </div>

      <div className={e.escena} style={ESCENA}>
        <div className={e.fondo} aria-hidden="true" />
        <div className={h.hoja} key={d.id}>
          <Image src="/images/juegos/corrector/chinche.webp" alt="" aria-hidden="true" width={190} height={221} className={h.chinche} />
          <div className={s.galera}>
            <span className={s.dividendo}>{formatearNumero(d.dividendo)}</span>
            <span className={s.divisor}>{d.divisor}</span>
            {(["residuo", "cociente"] as const).map((c) => (
              <label key={c} className={s.casilla} data-campo={c} data-activo={activo === c && !cerrada ? "" : undefined} data-estado={estadoCampo(c)}>
                <span className={s.rotulo}>{c === "cociente" ? "Cociente" : "Residuo"}</span>
                <input
                  ref={refs[c]}
                  className={s.entrada}
                  value={valores[c]}
                  inputMode="none"
                  autoComplete="off"
                  readOnly={cerrada}
                  aria-invalid={estadoCampo(c) === "no" || undefined}
                  onFocus={() => setActivo(c)}
                  onChange={(ev) => escribir(c, ev.target.value)}
                  onKeyDown={(ev) => ev.key === "Enter" && comprobar()}
                />
                {estadoCampo(c) === "ok" && <Check className={s.marca} size={20} strokeWidth={3.2} aria-hidden="true" />}
                {estadoCampo(c) === "no" && <X className={s.marca} size={20} strokeWidth={3.2} aria-hidden="true" />}
              </label>
            ))}
          </div>
        </div>
        <div className={e.armi}>
          <Armi pose={pose} />
        </div>
      </div>

      {d.contexto && <p className={s.contexto}>{d.contexto}</p>}
      <h2 ref={titulo} tabIndex={-1} className={e.pregunta}>
        {pregunta}
      </h2>

      {!cerrada && (
        <div className={s.mando}>
          <Teclado onDigito={(dig) => escribir(activo, valores[activo] + dig)} onBorrar={() => escribir(activo, valores[activo].slice(0, -1))} />
          <button type="button" className={rp.principal} disabled={!listo} onClick={comprobar}>
            Comprobar
          </button>
        </div>
      )}

      <Aviso tono={!ultimo ? null : acerto ? "ok" : cerrada ? "no" : "neutro"}>{mensaje(d.divisor, sol, intentos.length, acerto, cerrada, bienC, bienR)}</Aviso>

      {ultimo && !acerto && !cerrada && <Pista dividendo={d.dividendo} divisor={d.divisor} cociente={sol.cociente} />}

      {cerrada && (
        <div className={rp.acciones}>
          <Avanzar onClick={siguiente}>
            {ultima ? "Ver resultado" : "Siguiente división"}
            <ArrowRight size={20} strokeWidth={2.8} aria-hidden="true" />
          </Avanzar>
        </div>
      )}
    </div>
  );
}

function mensaje(divisor: number, sol: { cociente: number; residuo: number }, intentos: number, acerto: boolean, cerrada: boolean, bienC: boolean, bienR: boolean) {
  if (!intentos) return "";
  if (acerto) return intentos === 1 ? "¡Exacto! Café bien empacado." : "¡Ahora sí! Lo corregiste.";
  if (!cerrada) {
    if (bienC) return `El cociente está bien; revisa el residuo. Recuerda: siempre es menor que ${divisor}.`;
    if (bienR) return "El residuo está bien; revisa el cociente con la pista.";
    return "Todavía no. Mira la pista de Armi y vuelve a intentarlo.";
  }
  return `La respuesta es cociente ${formatearNumero(sol.cociente)} y residuo ${sol.residuo}.`;
}

/** Pista: tres múltiplos del divisor alrededor del cociente y la regla del residuo. */
function Pista({ dividendo, divisor, cociente }: { dividendo: number; divisor: number; cociente: number }) {
  const filas = [cociente - 1, cociente, cociente + 1].filter((q) => q >= 1);
  return (
    <section className={e.pista} aria-label="Pista de Armi">
      <p className={e.pistaTitulo}>Pista de Armi: busca el múltiplo de {divisor} más grande que no pase de {formatearNumero(dividendo)}.</p>
      <ul className={s.multiplos}>
        {filas.map((q) => (
          <li key={q}>
            {divisor} × {formatearNumero(q)} = {formatearNumero(divisor * q)}
          </li>
        ))}
      </ul>
      <p className={e.pistaNota}>Para comprobar: divisor × cociente + residuo = dividendo.</p>
    </section>
  );
}
