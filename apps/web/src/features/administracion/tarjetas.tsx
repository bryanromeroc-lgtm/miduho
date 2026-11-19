import Link from "next/link";
import { ArrowRight, ChevronRight, type LucideIcon } from "lucide-react";

/**
 * Tarjetas-puerta de Administración, Usuarios y Coordinación.
 *
 * Cada tarjeta es una puerta a una sección: el título es el enlace principal y
 * cubre toda la tarjeta (pseudo-elemento), y debajo van atajos a lo que hay
 * dentro con su cifra real, para llegar en un clic sin pasar por el índice.
 * Los atajos quedan por encima de la capa del enlace principal: no hay enlaces
 * anidados y cada uno es un destino propio para el teclado y el lector.
 */
export type Atajo = { href: string; etiqueta: string; dato?: string; alerta?: boolean };
export type Tarjeta = {
  id: string;
  href: string;
  titulo: string;
  descripcion: string;
  icono: LucideIcon;
  /** Línea de estado en la parte alta: la cifra que más importa de la sección. */
  cifra?: { valor: string; etiqueta: string };
  atajos: Atajo[];
  accion: string;
};

export function TarjetasAdministracion({ tarjetas, etiqueta }: { tarjetas: Tarjeta[]; etiqueta: string }) {
  return (
    <ul className="admin-puertas" aria-label={etiqueta}>
      {tarjetas.map((t) => {
        const Icono = t.icono;
        return (
          <li key={t.id} className="admin-puerta">
            <div className="admin-puerta-cabeza">
              <span className="admin-puerta-icono" aria-hidden="true">
                <Icono size={26} strokeWidth={2.1} />
              </span>
              {t.cifra ? (
                <p className="admin-puerta-cifra">
                  <strong>{t.cifra.valor}</strong> {t.cifra.etiqueta}
                </p>
              ) : null}
            </div>
            <h2 className="admin-puerta-titulo">
              <Link href={t.href} className="admin-puerta-enlace" aria-describedby={`puerta-${t.id}-desc`}>
                {t.titulo}
              </Link>
            </h2>
            <p id={`puerta-${t.id}-desc`} className="admin-puerta-desc">
              {t.descripcion}
            </p>
            {t.atajos.length ? (
              <ul className="admin-puerta-atajos" aria-label={`Atajos de ${t.titulo}`}>
                {t.atajos.map((a) => (
                  <li key={a.href}>
                    <Link href={a.href} className="admin-puerta-atajo">
                      <span>{a.etiqueta}</span>
                      {a.dato ? (
                        <small data-alerta={a.alerta ? "" : undefined}>{a.dato}</small>
                      ) : null}
                      <ChevronRight size={18} aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
            <span className="admin-puerta-accion" aria-hidden="true">
              {t.accion} <ArrowRight size={18} />
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export const plural = (n: number, uno: string, varios: string) => `${n.toLocaleString("es-CO")} ${n === 1 ? uno : varios}`;
