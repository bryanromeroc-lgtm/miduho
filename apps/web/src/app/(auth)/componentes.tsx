import Image from "next/image";
import type { ComponentProps } from "react";


/**
 * Piezas compartidas por las pantallas de acceso y Cuenta (Inc. 1R §10).
 * Mundo nuevo: la noche, el escudo real, el wordmark y un panel sticker.
 */

export function Campo({
  id,
  etiqueta,
  error,
  ayuda,
  ...props
}: ComponentProps<"input"> & { id: string; etiqueta: string; error?: string; ayuda?: string }) {
  const descripcion = [ayuda ? `${id}-ayuda` : null, error ? `${id}-error` : null]
    .filter(Boolean)
    .join(" ");
  return (
    <div className="acceso-campo">
      <label htmlFor={id}>{etiqueta}</label>
      <input
        id={id}
        name={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={descripcion || undefined}
        {...props}
      />
      {ayuda ? (
        <p id={`${id}-ayuda`} className="acceso-ayuda">
          {ayuda}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="acceso-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function Aviso({ tipo, children }: { tipo: "error" | "ok"; children: React.ReactNode }) {
  return (
    <div role={tipo === "error" ? "alert" : "status"} className="acceso-aviso" data-tipo={tipo}>
      {children}
    </div>
  );
}

export function BotonEnviar({ pendiente, children }: { pendiente: boolean; children: React.ReactNode }) {
  return (
    <button type="submit" disabled={pendiente} aria-disabled={pendiente} className="acceso-boton">
      {pendiente ? "Un momento…" : children}
    </button>
  );
}

/**
 * Pantalla de acceso independiente (login, recuperación, nueva contraseña y
 * cambio obligatorio). Es la única <main> de su página: no se monta dentro
 * del Marco autenticado.
 */
export function Tarjeta({
  titulo,
  bajada,
  children,
}: {
  titulo: string;
  bajada?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="acceso sobre-noche" id="contenido">
      <div className="acceso-columna">
        <p className="acceso-marca">
          <span className="acceso-marca-escudo">
            <Image src="/images/escudo-colegio.jpg" alt="Escudo del Colegio Mi Dulce Hogar" width={92} height={92} priority />
          </span>
          <span className="wordmark" role="img" aria-label="MIDUHO">
            {["M", "I", "D", "U", "H", "O"].map((l, i) => (
              <span key={i} aria-hidden="true">
                {l}
              </span>
            ))}
          </span>
          <small>Colegio Mi Dulce Hogar</small>
        </p>
        <section className="acceso-tarjeta" aria-labelledby="acceso-titulo">
          <h1 id="acceso-titulo">{titulo}</h1>
          {bajada ? <p className="acceso-bajada">{bajada}</p> : null}
          {children}
        </section>
        <p className="acceso-nota">Datos ficticios de demostración · Madrid, Cundinamarca</p>
      </div>
    </main>
  );
}

/** Tarjeta dentro del shell autenticado (Cuenta): sección, nunca <main>. */
export function Panel({
  titulo,
  id,
  children,
}: {
  titulo: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <section className="cuenta-panel" aria-labelledby={id}>
      <h2 id={id}>{titulo}</h2>
      {children}
    </section>
  );
}
