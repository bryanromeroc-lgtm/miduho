import type { CSSProperties } from "react";
import { ArrowRight, Lock } from "lucide-react";
import Link from "next/link";
import { accionDe, CHIP_ESTADO, resumenTarjeta, textoCierre, type ActividadResumen } from "@/lib/materias";
import { nombreTipo } from "@/features/actividades/tipos/registro";
import { MarcoTarjeta, Pieza } from "../tematica/piezas";
import type { Kit } from "../tematica/tipos";
import { IlustracionTipo } from "./ilustracion-tipo";
import s from "./vista.module.css";

/** Tres estrellas planas: llenas en el acento, vacías en el plano de la banda. */
function EstrellasPlanas({ cantidad }: { cantidad: number }) {
  return (
    <span className={s.estrellas} aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <svg key={i} viewBox="0 0 24 24" data-llena={i < cantidad ? "" : undefined}>
          <path d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17l-5.9 3.3 1.3-6.5L2.5 9.3l6.6-.8z" />
        </svg>
      ))}
    </span>
  );
}

/** Intentos como fichas: llenas las que quedan, huecas las usadas, y «Quedan N» / «No quedan» en dos palabras. */
function Intentos({ usados, maximo, tipo }: { usados: number; maximo: number | null; tipo: string }) {
  // Práctica libre: sin fichas que contar, la línea dice qué juego es.
  if (maximo === null) return <span className={s.intentos} aria-hidden="true">{nombreTipo(tipo)} · Práctica libre</span>;
  const quedan = Math.max(0, maximo - usados);
  return (
    <span className={s.intentos} aria-hidden="true">
      <span className={s.fichas}>
        {Array.from({ length: maximo }, (_, i) => (
          <span key={i} className={s.ficha} data-queda={i < quedan ? "" : undefined} />
        ))}
      </span>
      {quedan === 0 ? "No quedan" : `Quedan ${quedan}`}
    </span>
  );
}

/*
  Tarjeta de actividad plana (D7). Toda la tarjeta es un enlace con un solo
  foco y nombre accesible completo; el «botón» es parte visual del enlace.
  Sin destino (por abrir, cerrada sin intento) queda como enlace deshabilitado
  fuera del orden de tabulación. Variante plana de la tarjeta sticker de
  features/actividades/presentacion, que no se modifica.
*/
export function TarjetaPlana({ actividad: a, kit, indice }: { actividad: ActividadResumen; kit: Kit; indice: number }) {
  const accion = accionDe(a);
  const cierre = textoCierre(a);
  const resumen = resumenTarjeta(a);
  const nombre = [a.titulo, nombreTipo(a.tipo), CHIP_ESTADO[a.estado], cierre?.replace(/\.$/, ""), resumen, accion.texto].filter(Boolean).join(". ") + ".";
  const tipoBoton = !accion.habilitada ? "bloqueada" : accion.principal ? "principal" : "secundaria";
  const contenido = (
    <>
      <Pieza kit={kit} id={kit.utileria.clip} className={s.clip} />
      <span className={s.banda}>
        <MarcoTarjeta kit={kit} color="var(--m-apoyo)" className={s.marco} />
        <IlustracionTipo tipo={a.tipo} kit={kit} indice={indice} className={s.ilustracion} />
      </span>
      <span className={s.cuerpo}>
        <span className={s.fila}>
          <span className={s.chip} data-estado={a.estado}>
            {CHIP_ESTADO[a.estado]}
          </span>
          {a.estrellas !== null ? <EstrellasPlanas cantidad={a.estrellas} /> : cierre && <span className={s.cierre}>{cierre}</span>}
        </span>
        <span className={s.titulo}>{a.titulo}</span>
        <Intentos usados={a.intentosUsados} maximo={a.intentosMax} tipo={a.tipo} />
        <span className={s.boton} data-tipo={tipoBoton}>
          {!accion.habilitada && <Lock size={18} strokeWidth={2.6} aria-hidden="true" />}
          {accion.texto}
          {accion.habilitada && <ArrowRight size={20} strokeWidth={2.8} aria-hidden="true" className={s.flecha} />}
        </span>
      </span>
    </>
  );
  return (
    <li className={s.celda} style={{ "--i": indice } as CSSProperties}>
      {accion.habilitada ? (
        <Link href={a.href} className={s.tarjeta} aria-label={nombre}>
          {contenido}
        </Link>
      ) : (
        <a role="link" aria-disabled="true" className={s.tarjeta} aria-label={nombre}>
          {contenido}
        </a>
      )}
    </li>
  );
}
