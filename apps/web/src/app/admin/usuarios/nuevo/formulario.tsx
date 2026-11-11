"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AYUDA_COMBINACION, COMBINACIONES_ALTA, ETIQUETA_COMBINACION, type CombinacionAlta } from "@/lib/usuarios";
import type { GrupoOpcion } from "@/server/modules/usuarios/servicio";
import { CredencialUnica, llamarApi } from "../comunes";

type Creado = { id: string; correo: string; combinacion: CombinacionAlta; contrasena: string; temporal: boolean };

const LISTADO: Record<CombinacionAlta, { href: string; texto: string }> = {
  ESTUDIANTE: { href: "/admin/usuarios/estudiantes", texto: "Volver a estudiantes" },
  DOCENTE: { href: "/admin/usuarios/docentes", texto: "Volver a docentes" },
};

/**
 * Alta individual: estudiante o docente. El tipo decide la credencial inicial
 * y si aplica grupo. Las cuentas con rol ADMIN no se crean desde aquí.
 */
export function FormularioNuevoUsuario({ grupos, inicial }: { grupos: GrupoOpcion[]; inicial: CombinacionAlta }) {
  const router = useRouter();
  const [combinacion, setCombinacion] = useState<CombinacionAlta>(inicial);
  const [pendiente, setPendiente] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creado, setCreado] = useState<Creado | null>(null);

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setPendiente(true);
    setError(null);
    const r = await llamarApi<Creado>("/api/usuarios", "POST", {
      nombres: String(fd.get("nombres") ?? ""),
      apellidos: String(fd.get("apellidos") ?? ""),
      correo: String(fd.get("correo") ?? ""),
      combinacion,
      grupoId: combinacion === "ESTUDIANTE" ? String(fd.get("grupoId") ?? "") : undefined,
    });
    setPendiente(false);
    if (!r.ok) {
      setError(r.mensaje);
      return;
    }
    form.reset();
    setCreado(r.datos);
    router.refresh();
  }

  if (creado) {
    return (
      <div className="admin-columna">
        <p role="status" className="admin-aviso" data-tipo="ok">
          Se creó la cuenta de {creado.correo}.
        </p>
        {creado.contrasena ? (
          <CredencialUnica
            correo={creado.correo}
            contrasena={creado.contrasena}
            temporal={creado.temporal}
            onCerrar={() => setCreado({ ...creado, contrasena: "" })}
          />
        ) : null}
        <div className="cuenta-acciones">
          <Link href={`/admin/usuarios/${creado.id}`} className="boton-pastilla" data-variante="primario">
            Ver la cuenta
          </Link>
          <button type="button" className="boton-pastilla" data-variante="secundario" onClick={() => setCreado(null)}>
            Crear otra cuenta
          </button>
          <Link href={LISTADO[creado.combinacion].href} className="acceso-enlace">
            {LISTADO[creado.combinacion].texto}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} noValidate className="admin-formulario cuenta-panel" aria-describedby={error ? "nuevo-error" : undefined}>
      {error ? (
        <p id="nuevo-error" role="alert" className="admin-aviso" data-tipo="error">
          {error}
        </p>
      ) : null}

      <fieldset className="admin-opciones">
        <legend>Tipo de cuenta</legend>
        {COMBINACIONES_ALTA.map((c) => (
          <label key={c} className="admin-opcion">
            <input
              type="radio"
              name="combinacion"
              value={c}
              checked={combinacion === c}
              onChange={() => setCombinacion(c)}
              aria-describedby={`ayuda-${c}`}
            />
            <span>
              <strong>{ETIQUETA_COMBINACION[c]}</strong>
              <small id={`ayuda-${c}`}>{AYUDA_COMBINACION[c]}</small>
            </span>
          </label>
        ))}
      </fieldset>

      <div className="admin-rejilla">
        <div className="admin-campo">
          <label htmlFor="nombres">Nombres</label>
          <input id="nombres" name="nombres" required maxLength={120} autoComplete="off" />
        </div>
        <div className="admin-campo">
          <label htmlFor="apellidos">Apellidos</label>
          <input id="apellidos" name="apellidos" required maxLength={120} autoComplete="off" />
        </div>
        <div className="admin-campo admin-campo-ancho">
          <label htmlFor="correo">Correo</label>
          <input id="correo" name="correo" type="email" required maxLength={200} autoComplete="off" inputMode="email" />
        </div>
        {combinacion === "ESTUDIANTE" ? (
          <div className="admin-campo admin-campo-ancho">
            <label htmlFor="grupoId">Grupo (opcional)</label>
            <select id="grupoId" name="grupoId" defaultValue="" aria-describedby="grupo-ayuda">
              <option value="">Sin grupo por ahora</option>
              {grupos.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.etiqueta} · {g.anio}
                </option>
              ))}
            </select>
            <p id="grupo-ayuda" className="acceso-ayuda">
              {grupos.length
                ? "Puedes asociarlo ahora o después desde su ficha."
                : "No hay grupos en un año lectivo activo. Créalos en Coordinación › Estructura."}
            </p>
          </div>
        ) : null}
      </div>

      <div className="cuenta-acciones">
        <button type="submit" className="boton-pastilla" data-variante="primario" disabled={pendiente} aria-disabled={pendiente}>
          {pendiente ? "Creando…" : "Crear cuenta"}
        </button>
        <Link href={LISTADO[combinacion].href} className="boton-pastilla" data-variante="secundario">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
