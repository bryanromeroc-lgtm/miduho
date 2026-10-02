"use client";

import { useState, type FormEvent } from "react";
import { Confirmar, llamarApi } from "@/app/admin/usuarios/comunes";

type Opcion = { id: string; etiqueta: string };
type Bloque = { dia: string; horaInicio: string; horaFin: string };
type Asignacion = { id: string; estado: "ACTIVA" | "INACTIVA"; docente: { id: string; nombres: string; apellidos: string }; asignatura: { nombre: string }; grupo: { identificador: string; grado: { nombre: string } }; anioLectivo: { anio: number; estado: string }; bloques: Bloque[] };
type Props = { asignaciones: Asignacion[]; docentes: Opcion[]; grupos: (Opcion & { anioLectivoId: string })[]; asignaturas: Opcion[]; anios: Opcion[] };
const DIAS = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO", "DOMINGO"];
const bloqueVacio = (): Bloque => ({ dia: "LUNES", horaInicio: "07:00", horaFin: "08:00" });

export function FormularioAsignaciones({ asignaciones, docentes, grupos, asignaturas, anios }: Props) {
  const [bloques, setBloques] = useState<Bloque[]>([bloqueVacio()]);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState("");
  const [confirmacion, setConfirmacion] = useState<{ tipo: "DESACTIVAR" | "REACTIVAR" | "REASIGNAR"; asignacion: Asignacion; docenteId?: string; bloques?: Bloque[] } | null>(null);

  const cambiarBloque = (i: number, campo: keyof Bloque, valor: string) => setBloques((actuales) => actuales.map((b, j) => j === i ? { ...b, [campo]: valor } : b));
  async function crear(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setOcupado(true); setError("");
    const f = new FormData(e.currentTarget);
    const r = await llamarApi("/api/asignaciones-docente", "POST", { docenteId: f.get("docenteId"), asignaturaId: f.get("asignaturaId"), grupoId: f.get("grupoId"), anioLectivoId: f.get("anioLectivoId"), bloques });
    setOcupado(false); if (!r.ok) return setError(r.mensaje); window.location.reload();
  }
  async function ejecutar() {
    if (!confirmacion) return; setOcupado(true); setError("");
    const { asignacion: a, tipo } = confirmacion;
    const r = tipo === "DESACTIVAR" ? await llamarApi(`/api/asignaciones-docente/${a.id}`, "DELETE")
      : tipo === "REACTIVAR" ? await llamarApi(`/api/asignaciones-docente/${a.id}`, "PATCH", { accion: "REACTIVAR" })
        : await llamarApi(`/api/asignaciones-docente/${a.id}`, "PATCH", { accion: "REASIGNAR", docenteId: confirmacion.docenteId, bloques: confirmacion.bloques, confirmar: true });
    setOcupado(false); if (!r.ok) { setError(r.mensaje); setConfirmacion(null); return; } window.location.reload();
  }
  function pedirReasignacion(a: Asignacion) {
    const candidato = docentes.find((d) => d.id !== a.docente.id);
    if (!candidato) { setError("No hay otro docente activo disponible para reasignar."); return; }
    setConfirmacion({ tipo: "REASIGNAR", asignacion: a, docenteId: candidato.id, bloques: a.bloques });
  }

  return <div className="admin-columna">
    <section className="admin-seccion" aria-labelledby="crear-asignacion"><div className="admin-seccion-cabecera"><div><h2 id="crear-asignacion">Nueva asignación</h2><p>Relaciona docente, asignatura, grupo, año y uno o varios bloques.</p></div></div>
      <form className="admin-formulario admin-rejilla" onSubmit={crear}>
        <label className="admin-campo">Docente activo<select name="docenteId" required defaultValue=""><option value="">Selecciona</option>{docentes.map((o) => <option key={o.id} value={o.id}>{o.etiqueta}</option>)}</select></label>
        <label className="admin-campo">Asignatura<select name="asignaturaId" required defaultValue=""><option value="">Selecciona</option>{asignaturas.map((o) => <option key={o.id} value={o.id}>{o.etiqueta}</option>)}</select></label>
        <label className="admin-campo">Año lectivo<select name="anioLectivoId" required defaultValue=""><option value="">Selecciona</option>{anios.map((o) => <option key={o.id} value={o.id}>{o.etiqueta}</option>)}</select></label>
        <label className="admin-campo">Grupo<select name="grupoId" required defaultValue=""><option value="">Selecciona</option>{grupos.map((o) => <option key={o.id} value={o.id}>{o.etiqueta}</option>)}</select></label>
        <fieldset className="admin-opciones admin-campo-ancho"><legend>Bloques horarios</legend>{bloques.map((b, i) => <div className="asignacion-bloque" key={i}>
          <label>Día<select value={b.dia} onChange={(e) => cambiarBloque(i, "dia", e.target.value)}>{DIAS.map((d) => <option key={d}>{d}</option>)}</select></label>
          <label>Inicio<input type="time" value={b.horaInicio} onChange={(e) => cambiarBloque(i, "horaInicio", e.target.value)} required /></label>
          <label>Fin<input type="time" value={b.horaFin} onChange={(e) => cambiarBloque(i, "horaFin", e.target.value)} required /></label>
          {bloques.length > 1 ? <button type="button" className="admin-enlace-fila" onClick={() => setBloques((x) => x.filter((_, j) => j !== i))}>Quitar bloque</button> : null}
        </div>)}<button type="button" className="boton-pastilla" data-variante="secundario" onClick={() => setBloques((x) => [...x, bloqueVacio()])}>Agregar bloque</button></fieldset>
        {error ? <p role="alert" className="admin-aviso admin-campo-ancho" data-tipo="error">{error}</p> : null}
        <button className="boton-pastilla" data-variante="primario" disabled={ocupado}>{ocupado ? "Guardando…" : "Crear asignación"}</button>
      </form>
    </section>
    <section className="admin-seccion" aria-labelledby="listado-asignaciones"><div className="admin-seccion-cabecera"><div><h2 id="listado-asignaciones">Asignaciones e historial</h2><p>{asignaciones.length ? `${asignaciones.length} resultado(s) en esta página.` : "No hay asignaciones que coincidan."}</p></div></div>
      {asignaciones.length ? <div className="admin-tabla-contenedor"><table className="admin-tabla"><thead><tr><th>Docente</th><th>Asignatura y grupo</th><th>Horario</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{asignaciones.map((a) => <tr key={a.id}>
        <th scope="row">{a.docente.nombres} {a.docente.apellidos}</th><td data-etiqueta="Asignatura y grupo">{a.asignatura.nombre} · {a.grupo.grado.nombre}-{a.grupo.identificador} · {a.anioLectivo.anio}</td>
        <td data-etiqueta="Horario">{a.bloques.map((b) => `${b.dia.slice(0, 3)} ${b.horaInicio}–${b.horaFin}`).join(", ")}</td><td data-etiqueta="Estado"><span className="admin-estado" data-estado={a.estado}>{a.estado === "ACTIVA" ? "Activa" : "Inactiva"}</span></td>
        <td><span className="admin-acciones-fila">{a.anioLectivo.estado === "CERRADO" ? <span className="admin-nota">Solo lectura</span> : a.estado === "ACTIVA" ? <><button type="button" className="admin-enlace-fila" onClick={() => pedirReasignacion(a)}>Reasignar</button><button type="button" className="admin-enlace-fila" onClick={() => setConfirmacion({ tipo: "DESACTIVAR", asignacion: a })}>Desactivar</button></> : <button type="button" className="admin-enlace-fila" onClick={() => setConfirmacion({ tipo: "REACTIVAR", asignacion: a })}>Reactivar</button>}</span></td>
      </tr>)}</tbody></table></div> : <div className="admin-vacio"><p>No hay asignaciones registradas para estos filtros.</p></div>}
    </section>
    <Confirmar abierto={!!confirmacion} titulo={confirmacion?.tipo === "REASIGNAR" ? "Confirmar reasignación" : `${confirmacion?.tipo === "REACTIVAR" ? "Reactivar" : "Desactivar"} asignación`} textoConfirmar="Confirmar" pendiente={ocupado} peligro={confirmacion?.tipo !== "REACTIVAR"} onCancelar={() => setConfirmacion(null)} onConfirmar={ejecutar}>
      <p>{confirmacion?.tipo === "REASIGNAR" ? "La asignación actual quedará inactiva y se creará una nueva, conservando el historial." : "El cambio se aplicará solo si el año está abierto y no genera conflictos de horario."}</p>
      {confirmacion?.tipo === "REASIGNAR" ? <label className="admin-campo">Nuevo docente<select value={confirmacion.docenteId} onChange={(e) => setConfirmacion({ ...confirmacion, docenteId: e.target.value })}>{docentes.filter((d) => d.id !== confirmacion.asignacion.docente.id).map((d) => <option key={d.id} value={d.id}>{d.etiqueta}</option>)}</select></label> : null}
    </Confirmar>
  </div>;
}
