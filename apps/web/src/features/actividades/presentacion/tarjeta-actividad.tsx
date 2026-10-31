import { useId } from "react";
import { BotonSticker, Estrellas } from "@/components/sticker";
import { INTENTOS_MAXIMOS, intentosDisponibles, resumenActividad, textoDisponibles } from "@/lib/desempeno";
import type { Escena } from "@/lib/escenas";
import type { Estrellas as N } from "@/lib/materias";
import s from "./presentacion.module.css";

/** Tarjeta de una actividad con sus intentos. Datos por props; sin servidor. */
export function TarjetaActividad({
  nombre,
  area,
  familia,
  mejor,
  usados,
  maximo = INTENTOS_MAXIMOS,
  href,
  etiqueta,
}: {
  nombre: string;
  area: string;
  familia: Escena;
  mejor: N | null;
  usados: number;
  maximo?: number;
  href: string;
  /** Rótulo extra, p. ej. «Ejemplo» en la vista de muestra. */
  etiqueta?: string;
}) {
  const razon = useId();
  const quedan = intentosDisponibles(usados, maximo);
  return (
    <article className={`sticker-panel sobre-papel ${s.tarjeta}`} data-familia={familia}>
      <header className={s.tarjetaCabecera}>
        <h3 className={s.tarjetaNombre}>{nombre}</h3>
        {etiqueta && <span className={s.ejemplo}>{etiqueta}</span>}
      </header>
      <p className={s.tarjetaArea}>{area}</p>
      <p className="sr-only">{resumenActividad(mejor, usados, maximo)}</p>
      <div className={s.tarjetaDatos} aria-hidden="true">
        {mejor === null ? <span className={s.sinIntentos}>Sin intentos todavía</span> : <Estrellas cantidad={mejor} tamano={22} />}
        <span className={s.intentos}>
          {Array.from({ length: maximo }, (_, i) => (
            <span key={i} className={s.ficha} data-usada={i < usados ? "" : undefined} />
          ))}
          {textoDisponibles(usados, maximo)}
        </span>
      </div>
      {quedan > 0 ? (
        <BotonSticker href={href} tono="sol" className={s.empezar}>
          {usados === 0 ? "Empezar" : "Intentar de nuevo"}
        </BotonSticker>
      ) : (
        <>
          <BotonSticker tono="sol" disabled aria-describedby={razon} className={s.empezar}>
            Empezar
          </BotonSticker>
          <p id={razon} className={s.razon}>
            Ya usaste tus {maximo} intentos. Se conserva tu mejor resultado.
          </p>
        </>
      )}
    </article>
  );
}
