import Link from "next/link";
import { AREAS, type Area } from "@/lib/datos";
import { cn } from "@/lib/utils";

/*
  PIEZAS DEL FRISO — los elementos compartidos por las pantallas que no
  son el friso del día. Todas obedecen la misma gramática: plancha de
  color que posee su región, estante blanco adentro, pastilla para las
  acciones, y el área siempre nombrada en texto además del color.
*/

/* Botón pastilla. Primario en tinta; de área cuando vive sobre blanco. */
export function Boton({
  href,
  children,
  tono = "tinta",
  area,
  className,
}: {
  href: string;
  children: React.ReactNode;
  tono?: "tinta" | "area" | "claro";
  area?: Area;
  className?: string;
}) {
  const fondo =
    tono === "area" && area
      ? AREAS[area].plancha
      : tono === "claro"
        ? "#fff"
        : "var(--color-tinta)";

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-bold transition-opacity hover:opacity-90",
        tono === "claro" ? "text-tinta shadow-[inset_0_0_0_2px_rgba(0,0,0,0.14)]" : "text-white",
        className
      )}
      style={{ background: fondo }}
    >
      {children}
    </Link>
  );
}

/* Rótulo de área: el color nunca viaja solo, siempre con su nombre. */
export function RotuloArea({ area }: { area: Area }) {
  const a = AREAS[area];
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em]"
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
    activa: { texto: "Disponible", fondo: "var(--color-tinta)", tinta: "#fff" },
    programada: { texto: "Programada", fondo: a.pale, tinta: a.tinta },
    "sin-programar": { texto: "Sin programar", fondo: "transparent", tinta: "var(--color-gris)" },
  }[estado];

  return (
    <span
      className={cn(
        "inline-block rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em]",
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
    <section className="rounded-[15px] bg-papel p-5">
      <h2 className="font-heading text-[13px] font-bold uppercase tracking-[0.12em] text-gris">
        {titulo}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}
