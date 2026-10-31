import Link from "next/link";
import type { Area } from "@/data/demo";
import { AREAS } from "./areas";
import { cn } from "@/lib/utils";

/*
  PIEZAS DEL FRISO — los elementos compartidos por las pantallas que no
  son el friso del día. Todas obedecen la misma gramática: plancha de
  color que posee su región, estante blanco adentro, pastilla para las
  acciones, y el área siempre nombrada en texto además del color.
*/

/* Botón de acción con el traje sticker: primario en sol; secundario en papel. */
export function Boton({
  href,
  children,
  tono = "tinta",
  className,
}: {
  href: string;
  children: React.ReactNode;
  tono?: "tinta" | "area" | "claro";
  area?: Area;
  className?: string;
}) {
  return (
    <Link href={href} className={cn("sticker-boton", className)} data-tono={tono === "tinta" ? "sol" : "papel"} data-tamano="normal">
      {children}
    </Link>
  );
}

/* Rótulo de área: el color nunca viaja solo, siempre con su nombre. */
export function RotuloArea({ area }: { area: Area }) {
  const a = AREAS[area];
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[13px] font-bold uppercase tracking-[0.1em]"
      style={{ background: a.pale, color: a.tinta }}
    >
      <span
        aria-hidden
        className="h-2.5 w-2.5 rounded-full"
        style={{ background: a.plancha }}
      />
      {a.nombre}
    </span>
  );
}

/* Estado de una unidad. Nunca depende solo del color: siempre lleva texto. */
export function Estado({
  estado,
  area,
}: {
  estado: "dictada" | "activa" | "programada" | "sin-programar";
  area: Area;
}) {
  const a = AREAS[area];
  const mapa = {
    dictada: { texto: "Dictada", fondo: "var(--color-apagado)", tinta: "var(--color-gris)" },
    activa: { texto: "Disponible", fondo: "var(--color-tinta)", tinta: "var(--papel)" },
    programada: { texto: "Programada", fondo: a.pale, tinta: a.tinta },
    "sin-programar": { texto: "Sin programar", fondo: "transparent", tinta: "var(--color-gris)" },
  }[estado];

  return (
    <span
      className={cn(
        "inline-block rounded-full px-3 py-1 text-[13px] font-bold uppercase tracking-[0.08em]",
        estado === "sin-programar" && "shadow-[inset_0_0_0_1.5px_var(--color-linea)]"
      )}
      style={{ background: mapa.fondo, color: mapa.tinta }}
    >
      {mapa.texto}
    </span>
  );
}

/* Panel lateral: estante blanco con rótulo, para datos de apoyo. */
export function Panel({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="sticker-panel p-5">
      <h2 className="font-heading text-[13px] font-bold uppercase tracking-[0.12em] text-gris">
        {titulo}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}
