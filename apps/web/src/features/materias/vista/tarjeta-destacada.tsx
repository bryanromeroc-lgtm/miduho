import type { CSSProperties } from "react";
import { ArrowRight, Lock } from "lucide-react";
import Link from "next/link";
import { accionDe, CHIP_ESTADO, textoCierre, type ActividadResumen } from "@/lib/materias";
import { nombreTipo } from "@/features/actividades/tipos/registro";
import { Armi } from "@/features/actividades/juegos/comun/piezas";
import d from "./destacada.module.css";
import s from "./vista.module.css";

/** Tipos de actividad que se muestran como sticker destacado (ocupan dos casillas de la cuadrícula). */
export const TIPOS_DESTACADOS = new Set(["aventura"]);

/** Carreta de Armi con su pila de huevos: tres de ellos se mecen. Decorativa. */
function CarretaHuevos({ className }: { className?: string }) {
  const huevo = (x: number, y: number, k?: number) => (
    <g key={`${x}-${y}`} className={k !== undefined ? d.huevoMece : undefined} style={k !== undefined ? ({ "--k": k } as CSSProperties) : undefined}>
      <ellipse cx={x} cy={y} rx="11" ry="14" fill="#f0b46c" stroke="#1b2440" strokeWidth="3" />
      <path d={`M${x - 5} ${y - 5} Q${x - 4} ${y - 10} ${x} ${y - 11}`} fill="none" stroke="#fff6e0" strokeWidth="2.8" strokeLinecap="round" />
    </g>
  );
  return (
    <svg className={className} viewBox="0 0 240 170" aria-hidden="true" focusable="false">
      <ellipse cx="120" cy="160" rx="100" ry="8" fill="rgb(27 36 64 / 0.18)" />
      <path d="M200 70 L236 48" stroke="#1b2440" strokeWidth="6" strokeLinecap="round" />
      {/* pila de huevos */}
      {[0, 1, 2, 3, 4].map((i) => huevo(52 + i * 28, 62, i === 1 ? 0 : undefined))}
      {[0, 1, 2, 3].map((i) => huevo(66 + i * 28, 44, i === 2 ? 1 : undefined))}
      {[0, 1, 2].map((i) => huevo(80 + i * 28, 27, i === 1 ? 2 : undefined))}
      {/* cajón */}
      <path d="M26 66 H214 L198 132 H42 Z" fill="#b97a44" stroke="#1b2440" strokeWidth="4" strokeLinejoin="round" />
      <path d="M34 90 H206 M38 110 H202" stroke="#7a4a26" strokeWidth="4" />
      {/* ruedas */}
      <circle cx="78" cy="138" r="20" fill="#fff3d6" stroke="#1b2440" strokeWidth="4" />
      <circle cx="78" cy="138" r="5" fill="#1b2440" />
      <circle cx="166" cy="138" r="20" fill="#fff3d6" stroke="#1b2440" strokeWidth="4" />
      <circle cx="166" cy="138" r="5" fill="#1b2440" />
      {/* huevos sueltos en el piso */}
      {huevo(14, 146)}
    </svg>
  );
}

function Estrellas({ cantidad }: { cantidad: number }) {
  return (
    <span className={d.estrellas} aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <svg key={i} viewBox="0 0 24 24" data-llena={i < cantidad ? "" : undefined}>
          <path d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17l-5.9 3.3 1.3-6.5L2.5 9.3l6.6-.8z" />
        </svg>
      ))}
    </span>
  );
}

/*
  Tarjeta destacada tipo sticker para las aventuras: Armi y su carreta de
  huevos sobre el gallinero, con una placa de madera que invita a jugar.
  Toda la tarjeta es un enlace (mismo contrato que TarjetaPlana: un solo
  foco, nombre accesible completo; sin destino queda deshabilitada). Es una
  excepción deliberada al estilo plano de la vista: pidió más relieve para
  que la historia se vea como lo más llamativo de la materia. Su CSS vive
  aparte (destacada.module.css) y no lo cubre la guardia del estilo flat.
*/
export function TarjetaDestacada({ actividad: a, indice }: { actividad: ActividadResumen; indice: number }) {
  const accion = accionDe(a);
  const cierre = textoCierre(a);
  const nombre = [a.titulo, nombreTipo(a.tipo), CHIP_ESTADO[a.estado], cierre?.replace(/\.$/, ""), accion.texto].filter(Boolean).join(". ") + ".";
  const contenido = (
    <>
      <span className={d.escena} aria-hidden="true" />
      <span className={d.armi} aria-hidden="true">
        <Armi pose="senala" />
      </span>
      <CarretaHuevos className={d.carreta} />
      <span className={d.placa}>
        <span className={d.fila}>
          <span className={d.chip}>{nombreTipo(a.tipo)}</span>
          {a.estrellas !== null ? <Estrellas cantidad={a.estrellas} /> : <span className={d.estado}>{CHIP_ESTADO[a.estado]}</span>}
        </span>
        <span className={d.titulo}>{a.titulo}</span>
        <span className={d.gancho}>Ayuda a Armi a resolver cada problema del camino.</span>
        <span className={d.boton} data-bloqueada={!accion.habilitada ? "" : undefined}>
          {!accion.habilitada && <Lock size={18} strokeWidth={2.6} aria-hidden="true" />}
          {accion.texto}
          {accion.habilitada && <ArrowRight size={20} strokeWidth={2.8} aria-hidden="true" />}
        </span>
      </span>
    </>
  );
  return (
    <li className={`${s.celda} ${s.celdaDestacada}`} style={{ "--i": indice } as CSSProperties}>
      {accion.habilitada ? (
        <Link href={a.href} className={d.sticker} aria-label={nombre}>
          {contenido}
        </Link>
      ) : (
        <a role="link" aria-disabled="true" className={d.sticker} aria-label={nombre}>
          {contenido}
        </a>
      )}
    </li>
  );
}
