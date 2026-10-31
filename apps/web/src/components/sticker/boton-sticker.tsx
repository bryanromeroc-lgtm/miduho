import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type TonoBoton = "papel" | "lima" | "cielo" | "sol" | "naranja" | "rosa";
export type TamanoBoton = "normal" | "grande" | "icono";

type Comun = { tono?: TonoBoton; tamano?: TamanoBoton; className?: string; children: ReactNode };
type ComoEnlace = Comun & Omit<ComponentProps<typeof Link>, "className" | "children">;
type ComoBoton = Comun & { href?: undefined } & Omit<ComponentProps<"button">, "className" | "children">;

/**
 * Botón del estilo sticker: contorno de tinta, bisel y sombra sólida que se
 * hunde al presionar. Con `href` es un enlace; sin él, un <button>.
 * La página activa se marca con aria-current y siempre se ve blanca.
 */
export function BotonSticker(props: ComoEnlace | ComoBoton) {
  const { tono = "papel", tamano = "normal", className, children, ...resto } = props;
  const datos = { "data-tono": tono, "data-tamano": tamano, className: cn("sticker-boton", className) };
  if (resto.href !== undefined) {
    return (
      <Link {...(resto as Omit<ComoEnlace, keyof Comun>)} {...datos}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" {...(resto as Omit<ComoBoton, keyof Comun>)} {...datos}>
      {children}
    </button>
  );
}
