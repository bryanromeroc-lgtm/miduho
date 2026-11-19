"use client";

import { ArrowRight, Check, X } from "lucide-react";
import type { CSSProperties } from "react";
import { formatearNumero } from "@/lib/numeros";
import { Avanzar, Aviso, useFocoAlCambiar, type PropsJuego } from "../../reproductor/comun";
import rp from "../../reproductor/reproductor.module.css";
import { useCasillas } from "../comun/casillas";
import { Armi, Controles, Guirnalda, type Pose } from "../comun/piezas";
import { Teclado } from "../comun/teclado";
import e from "../comun/escena.module.css";
import { CAMPOS_PORCENTAJE, pesos, resolverPorcentaje, type ContenidoPorcentaje, type Producto } from "./tipo";
import s from "./porcentaje.module.css";

/*
  LA TIENDA DEL BARRIO — juego 9 de Matemáticas de 5.° (aumentos
  porcentuales). Cada etiqueta trae un precio en pesos y cuánto sube. Los
  100 cuadritos son el precio completo (cada uno es el 1 %); los del
  aumento se ven aparte. Se escriben el aumento y el precio nuevo.
*/

const ESCENA = { "--fondo": "url(/images/juegos/porcentaje/tienda.webp)", "--fondo-pos": "center 45%", "--fondo-color": "#f3e2c6" } as CSSProperties;
const NOMBRES = { aumento: "Aumento", nuevo: "Precio nuevo" } as const;

export function JuegoPorcentaje({ contenido, alTerminar }: PropsJuego<ContenidoPorcentaje>) {
  const j = useCasillas({ rondas: contenido.productos, campos: CAMPOS_PORCENTAJE, solucion: resolverPorcentaje, alTerminar });
  const { indice, ronda: p, sol, ultimo, acerto, cerrada, ultima, listo, estados, voz, sonido } = j;
  const titulo = useFocoAlCambiar<HTMLHeadingElement>(indice);
  const pose: Pose = !ultimo ? "senala" : acerto ? "celebra" : "piensa";
  const pregunta = `¿Cuánto sube y cuánto cuesta ahora?`;

  return (
    <div className={e.juego}>
      <div className={e.barra}>
        <Guirnalda estados={estados} actual={indice} />
        <Controles voz={voz} sonido={sonido} texto={`${p.nombre}: costaba ${p.precio} pesos y sube el ${p.porcentaje} por ciento. ${pregunta}`} />
      </div>

      <div className={e.escena} style={ESCENA}>
        <div className={e.fondo} aria-hidden="true" />
        <div className={s.panel} key={p.id}>
          <div className={s.etiqueta}>
            <p className={s.producto}>{p.nombre}</p>
            <p className={s.precio}>{pesos(p.precio)}</p>
            <p className={s.sube}>sube el {p.porcentaje} %</p>
          </div>
          <Cuadritos porcentaje={p.porcentaje} />
          <div className={s.casillas}>
            {CAMPOS_PORCENTAJE.map((c) => (
              <label key={c} className={s.casilla} data-estado={j.estado(c)}>
                <span className={s.rotulo}>{NOMBRES[c]}</span>
                <span className={s.moneda}>
                  <span aria-hidden="true">$</span>
                  <input className={s.entrada} {...j.casilla(c)} aria-label={`${NOMBRES[c]} en pesos`} />
                  {j.estado(c) === "ok" && <Check size={20} strokeWidth={3.2} aria-hidden="true" />}
                  {j.estado(c) === "no" && <X size={20} strokeWidth={3.2} aria-hidden="true" />}
                </span>
              </label>
            ))}
          </div>
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
          <Teclado {...j.teclado} />
          <button type="button" className={rp.principal} disabled={!listo} onClick={j.comprobar}>
            Comprobar
          </button>
        </div>
      )}

      <Aviso tono={!ultimo ? null : acerto ? "ok" : cerrada ? "no" : "neutro"}>{mensaje(p, sol, j.intentos.length, acerto, cerrada, j.bien("aumento"))}</Aviso>

      {ultimo && !acerto && !cerrada && <Pista producto={p} />}

      {cerrada && (
        <div className={rp.acciones}>
          <Avanzar onClick={j.siguiente}>
            {ultima ? "Ver resultado" : "Siguiente etiqueta"}
            <ArrowRight size={20} strokeWidth={2.8} aria-hidden="true" />
          </Avanzar>
        </div>
      )}
    </div>
  );
}

function mensaje(p: Producto, sol: { aumento: number; nuevo: number }, n: number, acerto: boolean, cerrada: boolean, aumentoBien: boolean) {
  if (!n) return "";
  if (acerto) return `${n === 1 ? "¡Cuentas claras! " : "¡Ahora sí! "}${pesos(p.precio)} + ${pesos(sol.aumento)} = ${pesos(sol.nuevo)}.`;
  if (!cerrada) return aumentoBien ? "El aumento está bien. El precio nuevo es el precio de antes más el aumento." : "Todavía no. Mira la pista de Armi: empieza por el 1 %.";
  return `El aumento es ${pesos(sol.aumento)} y el precio nuevo, ${pesos(sol.nuevo)}.`;
}

/** 100 cuadritos (el precio completo) y aparte los del aumento: cada uno es el 1 %. */
function Cuadritos({ porcentaje }: { porcentaje: number }) {
  return (
    <div className={s.cuadritos} role="img" aria-label={`100 cuadritos son el precio completo; ${porcentaje} cuadritos más son el aumento`}>
      <span className={s.cien}>
        {Array.from({ length: 100 }, (_, k) => (
          <i key={k} />
        ))}
      </span>
      <span className={s.mas} aria-hidden="true">
        +
      </span>
      <span className={s.extra}>
        {Array.from({ length: porcentaje }, (_, k) => (
          <i key={k} />
        ))}
      </span>
    </div>
  );
}

function Pista({ producto: p }: { producto: Producto }) {
  const uno = p.precio / 100;
  const textoUno = Number.isInteger(uno) ? pesos(uno) : `$${formatearNumero(Math.trunc(uno))},${String(Math.round((uno % 1) * 100)).padStart(2, "0")}`;
  return (
    <section className={e.pista} aria-label="Pista de Armi">
      <p className={e.pistaTitulo}>Pista de Armi: cada cuadrito es el 1 % del precio.</p>
      <dl className={e.periodos}>
        <div className={e.periodo}>
          <dt>1 %</dt>
          <dd>
            {pesos(p.precio)} ÷ 100 = {textoUno}
          </dd>
        </div>
        <div className={e.periodo}>
          <dt>{p.porcentaje} %</dt>
          <dd>
            {p.porcentaje} cuadritos de {textoUno}
          </dd>
        </div>
      </dl>
      <p className={e.pistaNota}>Precio nuevo = precio de antes + aumento.</p>
    </section>
  );
}
