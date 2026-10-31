import Link from "next/link";
import { BookOpenCheck, CalendarClock, CircleCheckBig, CircleDashed, CirclePlay, Hourglass, Sparkles, type LucideIcon } from "lucide-react";
import type { CSSProperties, ElementType, ReactNode } from "react";
import { DEFINICION_ESTADO, type Estado, type MarcaEstado } from "@/lib/estados";
import { cn } from "@/lib/utils";

/** Placa con el nombre: texto real blanco con contorno, sobre la cinta de la materia. */
export function Placa({
  as: Etiqueta = "p",
  giro = 0,
  className,
  children,
}: {
  as?: ElementType;
  giro?: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Etiqueta
      className={cn("placa tipo-placa texto-sticker", className)}
      style={{ "--giro": `${giro}deg` } as CSSProperties}
    >
      {children}
    </Etiqueta>
  );
}

/** Barra de avance «hechas/total». La barra es decorativa; la cifra y su etiqueta, no. */
export function BarraAvance({ hechas, total, className }: { hechas: number; total: number; className?: string }) {
  const proporcion = total > 0 ? Math.min(1, Math.max(0, hechas / total)) : 0;
  return (
    <div className={cn("barra-avance", className)}>
      <span className="barra-avance-pista" aria-hidden="true">
        <span
          className="barra-avance-relleno"
          data-vacia={proporcion === 0 ? "" : undefined}
          style={{ "--avance": `${Math.round(proporcion * 100)}%` } as CSSProperties}
        />
      </span>
      <span className="barra-avance-cifra">
        <span aria-hidden="true">
          {hechas}/{total}
        </span>
        <span className="sr-only">
          {hechas} de {total} actividades hechas
        </span>
      </span>
    </div>
  );
}

export function textoEstrellas(n: number): string {
  return `${n} de 3 estrellas`;
}

/** De 0 a 3 estrellas, con su forma textual para tecnologías de apoyo. */
export function Estrellas({ cantidad, tamano = 17, className }: { cantidad: number; tamano?: number; className?: string }) {
  const n = Math.max(0, Math.min(3, Math.round(cantidad)));
  return (
    <span role="img" aria-label={textoEstrellas(n)} className={cn("estrellas", className)}>
      {[0, 1, 2].map((i) => (
        <svg key={i} aria-hidden="true" width={tamano} height={tamano} viewBox="0 0 24 24">
          <path
            className="estrella"
            data-llena={i < n ? "" : undefined}
            d="M12 2.8l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 16.8l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"
          />
        </svg>
      ))}
    </span>
  );
}

/** Botón redondo de jugar: un toque para entrar a la clase. */
export function BotonJugar({ href, asignatura, className }: { href: string; asignatura: string; className?: string }) {
  return (
    <Link href={href} aria-label={`Entrar a ${asignatura}`} className={cn("boton-jugar", className)}>
      <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24">
        <path d="M8 5.5v13l11-6.5z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    </Link>
  );
}

const MARCAS: Record<MarcaEstado, LucideIcon> = {
  CirclePlay,
  CalendarClock,
  BookOpenCheck,
  CircleCheckBig,
  CircleDashed,
  Hourglass,
  Sparkles,
};

/** Chip de estado del vocabulario cerrado: marca y texto, además del color. */
export function ChipEstado({ estado, className }: { estado: Estado; className?: string }) {
  const { texto, marca, tono } = DEFINICION_ESTADO[estado];
  const Marca = MARCAS[marca];
  return (
    <span className={cn("chip-estado", className)} data-tono={tono} data-estado={estado}>
      <Marca aria-hidden="true" size={15} strokeWidth={2.6} />
      {texto}
    </span>
  );
}

/** Panel blanco del estilo sticker. */
export function PanelSticker({
  as: Etiqueta = "div",
  className,
  children,
  ...resto
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
} & Record<string, unknown>) {
  return (
    <Etiqueta className={cn("sticker-panel", className)} {...resto}>
      {children}
    </Etiqueta>
  );
}
