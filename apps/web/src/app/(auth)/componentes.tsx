import Image from "next/image";
import type { ComponentProps } from "react";

/**
 * Piezas compartidas por las pantallas de acceso y Cuenta (Inc. 1R §10).
 * Mundo de acceso: un día en el colegio. El paisaje de cielo y colinas a
 * pantalla completa, la bienvenida con el escudo real, el nombre del colegio
 * con el wordmark MIDUHO y el formulario centrado.
 */

export function Campo({
  id,
  etiqueta,
  error,
  ayuda,
  accesorio,
  ...props
}: ComponentProps<"input"> & {
  id: string;
  etiqueta: string;
  error?: string;
  ayuda?: string;
  /** Control junto al campo, dentro de su borde (el ojo de la contraseña). */
  accesorio?: React.ReactNode;
}) {
  const descripcion = [ayuda ? `${id}-ayuda` : null, error ? `${id}-error` : null].filter(Boolean).join(" ");
  const entrada = (
    <input id={id} name={id} aria-invalid={error ? true : undefined} aria-describedby={descripcion || undefined} {...props} />
  );
  return (
    <div className="acceso-campo">
      <label htmlFor={id}>{etiqueta}</label>
      {accesorio ? (
        <div className="acceso-entrada">
          {entrada}
          {accesorio}
        </div>
      ) : (
        entrada
      )}
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

export function BotonEnviar({
  pendiente,
  textoPendiente = "Un momento…",
  children,
}: {
  pendiente: boolean;
  textoPendiente?: string;
  children: React.ReactNode;
}) {
  return (
    <button type="submit" disabled={pendiente} aria-disabled={pendiente} className="acceso-boton">
      {pendiente ? (
        textoPendiente
      ) : (
        <>
          {children}
          <svg className="acceso-boton-flecha" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
            <path
              d="M5 12h13M13 6l6 6-6 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </>
      )}
    </button>
  );
}

/**
 * Pantalla de acceso independiente (login, recuperación, nueva contraseña y
 * cambio obligatorio). Es la única <main> de su página: no se monta dentro
 * del Marco autenticado.
 */
export function Tarjeta({ titulo, bajada, children }: { titulo: string; bajada?: string; children: React.ReactNode }) {
  return (
    <main className="acceso" id="contenido">
      <div className="acceso-marco">
        <div className="acceso-columna">
          <div className="acceso-marca">
            <p className="acceso-bienvenida">Te damos la bienvenida a</p>
            <Image
              className="acceso-escudo"
              src="/images/escudo-colegio.jpg"
              alt="Escudo del Colegio Mi Dulce Hogar"
              width={148}
              height={148}
              priority
            />
            <p className="acceso-colegio">Colegio Mi Dulce Hogar</p>
            <p className="acceso-plataforma">
              <span className="wordmark" role="img" aria-label="MIDUHO">
                {["M", "I", "D", "U", "H", "O"].map((l, i) => (
                  <span key={i} aria-hidden="true">
                    {l}
                  </span>
                ))}
              </span>
              <span>Plataforma educativa virtual</span>
            </p>
          </div>
          <section className="acceso-tarjeta" aria-labelledby="acceso-titulo">
            <h1 id="acceso-titulo">{titulo}</h1>
            {bajada ? <p className="acceso-bajada">{bajada}</p> : null}
            {children}
          </section>
          <p className="acceso-nota">Madrid, Cundinamarca</p>
        </div>
      </div>
    </main>
  );
}

/** Tarjeta dentro del shell autenticado (Cuenta): sección, nunca <main>. */
export function Panel({ titulo, id, children }: { titulo: string; id: string; children: React.ReactNode }) {
  return (
    <section className="cuenta-panel" aria-labelledby={id}>
      <h2 id={id}>{titulo}</h2>
      {children}
    </section>
  );
}
