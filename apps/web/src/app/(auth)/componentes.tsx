import Image from "next/image";
import type { ComponentProps } from "react";
import { Escudo } from "@/components/friso/escudo";

/**
 * Piezas compartidas por las pantallas de acceso y Cuenta (Inc. 1R §10).
 * Usan la identidad visual de la maqueta: paisaje escolar del portal, naranja
 * del colegio (#bc461c, 5.2:1 sobre blanco), tinta #20334b y botones pastilla.
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
    <main className="acceso" id="contenido">
      <div className="acceso-paisaje" aria-hidden="true">
        <Image className="acceso-sol" src="/images/portal/2600.svg" alt="" width={64} height={64} />
        <Image className="acceso-nube acceso-nube-a" src="/images/portal/2601.svg" alt="" width={70} height={70} />
        <Image className="acceso-nube acceso-nube-b" src="/images/portal/2601.svg" alt="" width={48} height={48} />
        <Image className="acceso-arbol acceso-arbol-a" src="/images/portal/1f333.svg" alt="" width={84} height={84} />
        <Image className="acceso-arbol acceso-arbol-b" src="/images/portal/1f332.svg" alt="" width={72} height={72} />
        <Image className="acceso-colegio" src="/images/portal/1f3eb.svg" alt="" width={92} height={92} />
      </div>
      <div className="acceso-columna">
        <p className="acceso-marca">
          <span className="acceso-marca-escudo">
            <Escudo size={34} />
          </span>
          <span>
            <strong>
              MIDUHO <span>Virtual</span>
            </strong>
            <small>Colegio Mi Dulce Hogar</small>
          </span>
        </p>
        <section className="acceso-tarjeta" aria-labelledby="acceso-titulo">
          <h1 id="acceso-titulo">{titulo}</h1>
          {bajada ? <p className="acceso-bajada">{bajada}</p> : null}
          {children}
        </section>
        <p className="acceso-nota">Maqueta con datos ficticios · Madrid, Cundinamarca</p>
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
