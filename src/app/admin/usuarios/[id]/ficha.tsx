"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { KeyRound, Mail, Power, Save, ShieldCheck, Users } from "lucide-react";
import {
  AYUDA_COMBINACION,
  COMBINACIONES,
  ETIQUETA_COMBINACION,
  ETIQUETA_ESTADO,
  esCambioDeCombinacionPermitido,
  type Combinacion,
  type EstadoCuenta,
} from "@/lib/usuarios";
import type { GrupoOpcion } from "@/server/modules/usuarios/servicio";
import { Confirmar, CredencialUnica, llamarApi } from "../comunes";

export type Ficha = {
  id: string;
  nombres: string;
  apellidos: string;
  correo: string;
  estado: EstadoCuenta;
  combinacion: Combinacion | null;
  debeCambiarContrasena: boolean;
  ultimoAcceso: string | null;
  creadoEn: string;
  grupoActual: GrupoOpcion | null;
  historialGrupos: { id: string; etiqueta: string; anio: number; inicioEn: string; finEn: string | null }[];
  asignacionesActivas: number;
  gruposDirigidos: number;
  anioActivo: number | null;
};

type Aviso = { tipo: "ok" | "error"; texto: string } | null;
type Pendiente =
  | { tipo: "estado"; estado: "ACTIVO" | "INACTIVO" }
  | { tipo: "roles"; combinacion: Combinacion }
  | { tipo: "grupo"; grupoId: string; etiqueta: string }
  | { tipo: "restablecer" }
  | null;

const fecha = (iso: string) =>
  new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeZone: "America/Bogota" }).format(new Date(iso));

function AvisoSeccion({ aviso }: { aviso: Aviso }) {
  if (!aviso) return null;
  return (
    <p role={aviso.tipo === "error" ? "alert" : "status"} className="admin-aviso" data-tipo={aviso.tipo}>
      {aviso.texto}
    </p>
  );
}

/** Ficha editable de una cuenta: identidad, rol, estado, grupo y credenciales. */
export function FichaUsuario({ ficha, grupos, esPropia }: { ficha: Ficha; grupos: GrupoOpcion[]; esPropia: boolean }) {
  const router = useRouter();
  const [avisos, setAvisos] = useState<Record<string, Aviso>>({});
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [confirmar, setConfirmar] = useState<Pendiente>(null);
  const [combinacion, setCombinacion] = useState<Combinacion | "">(ficha.combinacion ?? "");
  const [grupoId, setGrupoId] = useState("");
  const [credencial, setCredencial] = useState<{ correo: string; contrasena: string } | null>(null);

  const esEstudiante = ficha.combinacion === "ESTUDIANTE";
  const avisar = (seccion: string, aviso: Aviso) => setAvisos((a) => ({ ...a, [seccion]: aviso }));

  async function ejecutar(seccion: string, url: string, metodo: string, cuerpo: unknown, exito: string) {
    setOcupado(seccion);
    avisar(seccion, null);
    const r = await llamarApi(url, metodo, cuerpo);
    setOcupado(null);
    setConfirmar(null);
    if (!r.ok) {
      avisar(seccion, { tipo: "error", texto: r.mensaje });
      return false;
    }
    avisar(seccion, { tipo: "ok", texto: exito });
    router.refresh();
    return true;
  }

  async function guardarIdentidad(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const cambios: Record<string, string> = {};
    for (const campo of ["nombres", "apellidos", "correo"] as const) {
      const v = String(fd.get(campo) ?? "").trim();
      if (v !== ficha[campo]) cambios[campo] = v;
    }
    if (Object.keys(cambios).length === 0) {
      avisar("identidad", { tipo: "error", texto: "No hay cambios para guardar." });
      return;
    }
    await ejecutar("identidad", `/api/usuarios/${ficha.id}`, "PATCH", cambios, "Datos guardados.");
  }

  async function restablecer() {
    setOcupado("credencial");
    avisar("credencial", null);
    try {
      const r = await fetch("/api/usuarios/estudiantes/restablecer-contrasenas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estudianteIds: [ficha.id] }),
        cache: "no-store",
      });
      if (!r.ok) {
        const j = await r.json().catch(() => null);
        avisar("credencial", { tipo: "error", texto: j?.error?.message ?? "No se pudo restablecer la contraseña." });
        return;
      }
      const csv = (await r.text()).replace(/^\uFEFF/, "");
      const fila = csv.split(/\r?\n/)[1] ?? "";
      const coma = fila.lastIndexOf(",");
      setCredencial({ correo: fila.slice(0, coma), contrasena: fila.slice(coma + 1) });
      avisar("credencial", { tipo: "ok", texto: "Contraseña restablecida. La anterior dejó de funcionar y sus sesiones se cerraron." });
    } catch {
      avisar("credencial", { tipo: "error", texto: "No hay conexión con el servidor. Intenta de nuevo." });
    } finally {
      setOcupado(null);
      setConfirmar(null);
    }
  }

  async function reenviarInvitacion() {
    await ejecutar("credencial", `/api/usuarios/${ficha.id}/invitacion`, "POST", undefined, "Invitación reenviada. El enlace anterior dejó de servir.");
  }

  function pedirGrupo() {
    const g = grupos.find((x) => x.id === grupoId);
    if (!g) {
      avisar("grupo", { tipo: "error", texto: "Elige un grupo." });
      return;
    }
    const mismoAnio = ficha.grupoActual && ficha.grupoActual.anioLectivoId === g.anioLectivoId;
    if (mismoAnio) {
      setConfirmar({ tipo: "grupo", grupoId: g.id, etiqueta: g.etiqueta });
      return;
    }
    void ejecutar("grupo", `/api/usuarios/${ficha.id}/grupo`, "PUT", { grupoId: g.id }, `Asociado al grupo ${g.etiqueta}.`);
  }

  const opcionesCombinacion = COMBINACIONES.filter((c) => esCambioDeCombinacionPermitido(ficha.combinacion, c));
  const desactivar = ficha.estado !== "INACTIVO";

  return (
    <div className="admin-columna">
      <dl className="admin-resumen">
        <div>
          <dt>Estado</dt>
          <dd>
            <span className="admin-estado" data-estado={ficha.estado}>
              {ETIQUETA_ESTADO[ficha.estado]}
            </span>
          </dd>
        </div>
        <div>
          <dt>Rol</dt>
          <dd>{ficha.combinacion ? ETIQUETA_COMBINACION[ficha.combinacion] : "Sin rol válido"}</dd>
        </div>
        {esEstudiante ? (
          <div>
            <dt>Grupo {ficha.anioActivo ?? ""}</dt>
            <dd>{ficha.grupoActual?.etiqueta ?? "Sin grupo"}</dd>
          </div>
        ) : null}
        <div>
          <dt>Último ingreso</dt>
          <dd>{ficha.ultimoAcceso ? fecha(ficha.ultimoAcceso) : "Nunca"}</dd>
        </div>
        <div>
          <dt>Creada</dt>
          <dd>{fecha(ficha.creadoEn)}</dd>
        </div>
      </dl>

      <div className="cuenta-rejilla">
        {/* ── Identidad ── */}
        <section className="cuenta-panel" aria-labelledby="sec-identidad">
          <h2 id="sec-identidad">Identidad y correo</h2>
          <form onSubmit={guardarIdentidad} noValidate className="admin-formulario">
            <AvisoSeccion aviso={avisos.identidad ?? null} />
            <div className="admin-campo">
              <label htmlFor="nombres">Nombres</label>
              <input id="nombres" name="nombres" defaultValue={ficha.nombres} required maxLength={120} autoComplete="off" />
            </div>
            <div className="admin-campo">
              <label htmlFor="apellidos">Apellidos</label>
              <input id="apellidos" name="apellidos" defaultValue={ficha.apellidos} required maxLength={120} autoComplete="off" />
            </div>
            <div className="admin-campo">
              <label htmlFor="correo">Correo de ingreso</label>
              <input id="correo" name="correo" type="email" defaultValue={ficha.correo} required maxLength={200} autoComplete="off" />
            </div>
            <div className="cuenta-acciones">
              <button type="submit" className="boton-pastilla" data-variante="primario" disabled={ocupado === "identidad"}>
                <Save size={18} aria-hidden="true" /> {ocupado === "identidad" ? "Guardando…" : "Guardar datos"}
              </button>
            </div>
          </form>
        </section>

        {/* ── Rol ── */}
        <section className="cuenta-panel" aria-labelledby="sec-rol">
          <h2 id="sec-rol">Rol</h2>
          <AvisoSeccion aviso={avisos.roles ?? null} />
          {esEstudiante ? (
            <p className="cuenta-texto">Una cuenta de estudiante no se convierte en cuenta del personal. Si hace falta, crea una cuenta nueva.</p>
          ) : ficha.estado === "PENDIENTE_ACTIVACION" ? (
            <p className="cuenta-texto">La cuenta espera que se acepte la invitación. Podrás cambiar su rol cuando esté activa.</p>
          ) : (
            <form
              className="admin-formulario"
              onSubmit={(e) => {
                e.preventDefault();
                if (!combinacion || combinacion === ficha.combinacion) {
                  avisar("roles", { tipo: "error", texto: "Elige una combinación distinta de la actual." });
                  return;
                }
                setConfirmar({ tipo: "roles", combinacion });
              }}
            >
              <fieldset className="admin-opciones">
                <legend className="sr-only">Combinación de roles</legend>
                {opcionesCombinacion.map((c) => (
                  <label key={c} className="admin-opcion">
                    <input
                      type="radio"
                      name="combinacion-rol"
                      value={c}
                      checked={combinacion === c}
                      onChange={() => setCombinacion(c)}
                      aria-describedby={`rol-ayuda-${c}`}
                    />
                    <span>
                      <strong>{ETIQUETA_COMBINACION[c]}</strong>
                      <small id={`rol-ayuda-${c}`}>{AYUDA_COMBINACION[c]}</small>
                    </span>
                  </label>
                ))}
              </fieldset>
              {ficha.asignacionesActivas > 0 || ficha.gruposDirigidos > 0 ? (
                <p className="acceso-ayuda">
                  Tiene {ficha.asignacionesActivas} asignación(es) activa(s)
                  {ficha.gruposDirigidos ? ` y dirige ${ficha.gruposDirigidos} grupo(s)` : ""}: no se le puede retirar el rol Docente sin reasignar esa carga.
                </p>
              ) : null}
              <div className="cuenta-acciones">
                <button type="submit" className="boton-pastilla" data-variante="primario" disabled={ocupado === "roles"}>
                  <ShieldCheck size={18} aria-hidden="true" /> Cambiar rol
                </button>
              </div>
            </form>
          )}
        </section>

        {/* ── Grupo (solo estudiante) ── */}
        {esEstudiante ? (
          <section className="cuenta-panel" aria-labelledby="sec-grupo">
            <h2 id="sec-grupo">Grupo</h2>
            <AvisoSeccion aviso={avisos.grupo ?? null} />
            <p className="cuenta-texto">
              {ficha.grupoActual
                ? `Grupo actual: ${ficha.grupoActual.etiqueta} (${ficha.grupoActual.anio}). Elegir otro grupo del mismo año es un traslado y cierra la asociación actual.`
                : "Sin grupo en el año lectivo activo."}
            </p>
            {ficha.estado === "INACTIVO" ? (
              <p className="acceso-ayuda">Activa la cuenta para asociarla con un grupo.</p>
            ) : grupos.length === 0 ? (
              <p className="acceso-ayuda">No hay grupos en un año lectivo activo. Créalos en Estructura académica.</p>
            ) : (
              <div className="admin-formulario">
                <div className="admin-campo">
                  <label htmlFor="grupo-nuevo">{ficha.grupoActual ? "Trasladar al grupo" : "Asociar con el grupo"}</label>
                  <select id="grupo-nuevo" value={grupoId} onChange={(e) => setGrupoId(e.target.value)}>
                    <option value="">Elige un grupo</option>
                    {grupos
                      .filter((g) => g.id !== ficha.grupoActual?.id)
                      .map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.etiqueta} · {g.anio}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="cuenta-acciones">
                  <button type="button" className="boton-pastilla" data-variante="primario" onClick={pedirGrupo} disabled={ocupado === "grupo"}>
                    <Users size={18} aria-hidden="true" /> {ficha.grupoActual ? "Trasladar" : "Asociar"}
                  </button>
                </div>
              </div>
            )}
            {ficha.historialGrupos.length ? (
              <>
                <h3 className="admin-subtitulo">Historial</h3>
                <ul className="admin-historial">
                  {ficha.historialGrupos.map((h) => (
                    <li key={h.id}>
                      <strong>
                        {h.etiqueta} · {h.anio}
                      </strong>{" "}
                      <span>
                        desde {fecha(h.inicioEn)}
                        {h.finEn ? ` hasta ${fecha(h.finEn)}` : " · vigente"}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </section>
        ) : null}

        {/* ── Estado ── */}
        <section className="cuenta-panel" aria-labelledby="sec-estado">
          <h2 id="sec-estado">Estado de la cuenta</h2>
          <AvisoSeccion aviso={avisos.estado ?? null} />
          <p className="cuenta-texto">
            {desactivar
              ? "Desactivar impide ingresar y cierra de inmediato sus sesiones abiertas. El historial se conserva."
              : "La cuenta está inactiva. Al activarla podrá volver a ingresar con su contraseña vigente."}
          </p>
          {esPropia && desactivar ? (
            <p className="acceso-ayuda">No puedes desactivar tu propia cuenta.</p>
          ) : (
            <div className="cuenta-acciones">
              <button
                type="button"
                className="boton-pastilla"
                data-variante={desactivar ? "peligro" : "primario"}
                disabled={ocupado === "estado"}
                onClick={() => setConfirmar({ tipo: "estado", estado: desactivar ? "INACTIVO" : "ACTIVO" })}
              >
                <Power size={18} aria-hidden="true" /> {desactivar ? "Desactivar cuenta" : "Activar cuenta"}
              </button>
            </div>
          )}
        </section>

        {/* ── Credenciales ── */}
        {esEstudiante || ficha.estado === "PENDIENTE_ACTIVACION" ? (
          <section className="cuenta-panel" aria-labelledby="sec-credencial">
            <h2 id="sec-credencial">Credenciales</h2>
            <AvisoSeccion aviso={avisos.credencial ?? null} />
            {esEstudiante ? (
              <>
                <p className="cuenta-texto">
                  La contraseña del estudiante no se puede consultar. Si la olvidó, genera una nueva: se mostrará una sola vez.
                </p>
                <div className="cuenta-acciones">
                  <button
                    type="button"
                    className="boton-pastilla"
                    data-variante="secundario"
                    disabled={ocupado === "credencial" || ficha.estado !== "ACTIVO"}
                    onClick={() => setConfirmar({ tipo: "restablecer" })}
                  >
                    <KeyRound size={18} aria-hidden="true" /> Restablecer contraseña
                  </button>
                </div>
                {ficha.estado !== "ACTIVO" ? <p className="acceso-ayuda">Solo se restablece la contraseña de una cuenta activa.</p> : null}
              </>
            ) : (
              <>
                <p className="cuenta-texto">La invitación vence a las 24 horas. Reenviarla genera un enlace nuevo y anula el anterior.</p>
                <div className="cuenta-acciones">
                  <button
                    type="button"
                    className="boton-pastilla"
                    data-variante="secundario"
                    disabled={ocupado === "credencial"}
                    onClick={reenviarInvitacion}
                  >
                    <Mail size={18} aria-hidden="true" /> Reenviar invitación
                  </button>
                </div>
              </>
            )}
          </section>
        ) : null}
      </div>

      {credencial ? (
        <CredencialUnica correo={credencial.correo} contrasena={credencial.contrasena} temporal={false} onCerrar={() => setCredencial(null)} />
      ) : null}

      <Confirmar
        abierto={confirmar?.tipo === "estado"}
        titulo={confirmar?.tipo === "estado" && confirmar.estado === "INACTIVO" ? "¿Desactivar la cuenta?" : "¿Activar la cuenta?"}
        textoConfirmar={confirmar?.tipo === "estado" && confirmar.estado === "INACTIVO" ? "Sí, desactivar" : "Sí, activar"}
        peligro={confirmar?.tipo === "estado" && confirmar.estado === "INACTIVO"}
        pendiente={ocupado === "estado"}
        onCancelar={() => setConfirmar(null)}
        onConfirmar={() =>
          confirmar?.tipo === "estado" &&
          ejecutar(
            "estado",
            `/api/usuarios/${ficha.id}/estado`,
            "PUT",
            { estado: confirmar.estado },
            confirmar.estado === "INACTIVO" ? "Cuenta desactivada y sesiones cerradas." : "Cuenta activada.",
          )
        }
      >
        <p>
          {confirmar?.tipo === "estado" && confirmar.estado === "INACTIVO"
            ? `${ficha.nombres} ${ficha.apellidos} no podrá ingresar y sus sesiones abiertas se cerrarán de inmediato. El historial se conserva.`
            : `${ficha.nombres} ${ficha.apellidos} podrá volver a ingresar.`}
        </p>
      </Confirmar>

      <Confirmar
        abierto={confirmar?.tipo === "roles"}
        titulo="¿Cambiar el rol?"
        textoConfirmar="Sí, cambiar rol"
        pendiente={ocupado === "roles"}
        onCancelar={() => setConfirmar(null)}
        onConfirmar={() =>
          confirmar?.tipo === "roles" &&
          ejecutar("roles", `/api/usuarios/${ficha.id}/roles`, "PUT", { combinacion: confirmar.combinacion }, "Rol actualizado. Sus sesiones abiertas se cerraron.")
        }
      >
        <p>
          {confirmar?.tipo === "roles"
            ? `Pasará de «${ficha.combinacion ? ETIQUETA_COMBINACION[ficha.combinacion] : "sin rol"}» a «${ETIQUETA_COMBINACION[confirmar.combinacion]}». Sus sesiones abiertas se cerrarán y deberá ingresar de nuevo.`
            : ""}
        </p>
      </Confirmar>

      <Confirmar
        abierto={confirmar?.tipo === "grupo"}
        titulo="¿Confirmar el traslado?"
        textoConfirmar="Sí, trasladar"
        pendiente={ocupado === "grupo"}
        onCancelar={() => setConfirmar(null)}
        onConfirmar={() =>
          confirmar?.tipo === "grupo" &&
          ejecutar(
            "grupo",
            `/api/usuarios/${ficha.id}/grupo`,
            "PUT",
            { grupoId: confirmar.grupoId, confirmarTraslado: true },
            `Trasladado al grupo ${confirmar.etiqueta}. La asociación anterior quedó en el historial.`,
          )
        }
      >
        <p>
          {confirmar?.tipo === "grupo"
            ? `Se cerrará la asociación con ${ficha.grupoActual?.etiqueta ?? "el grupo actual"} y quedará en el grupo ${confirmar.etiqueta}.`
            : ""}
        </p>
      </Confirmar>

      <Confirmar
        abierto={confirmar?.tipo === "restablecer"}
        titulo="¿Restablecer la contraseña?"
        textoConfirmar="Sí, generar nueva"
        pendiente={ocupado === "credencial"}
        onCancelar={() => setConfirmar(null)}
        onConfirmar={restablecer}
      >
        <p>La contraseña actual dejará de funcionar de inmediato. La nueva se mostrará una sola vez.</p>
      </Confirmar>
    </div>
  );
}
