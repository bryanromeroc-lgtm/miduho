"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { Clock, Lock, Power, Repeat, RotateCcw, UserRound } from "lucide-react";
import { AltaPlegable, Confirmar, llamarApi } from "@/app/admin/usuarios/comunes";

type Opcion = { id: string; etiqueta: string };
type Bloque = { dia: string; horaInicio: string; horaFin: string };
type Asignacion = { id: string; estado: "ACTIVA" | "INACTIVA"; docente: { id: string; nombres: string; apellidos: string }; asignatura: { nombre: string }; grupo: { identificador: string; grado: { nombre: string } }; anioLectivo: { anio: number; estado: string }; bloques: Bloque[] };
type Props = {
  asignaciones: Asignacion[]; docentes: Opcion[]; grupos: (Opcion & { anioLectivoId: string })[]; asignaturas: Opcion[]; anios: Opcion[];
  /** Total con los filtros aplicados (todas las páginas). */
  total: number;
  /** Formulario GET de búsqueda y filtros, armado en el servidor. */
  filtros: ReactNode;
  /** Paginación (enlaces SSR), dentro del panel. */
  pie?: ReactNode;
};
const DIAS: Record<string, string> = { LUNES: "Lunes", MARTES: "Martes", MIERCOLES: "Miércoles", JUEVES: "Jueves", VIERNES: "Viernes", SABADO: "Sábado", DOMINGO: "Domingo" };
const bloqueVacio = (): Bloque => ({ dia: "LUNES", horaInicio: "07:00", horaFin: "08:00" });

export function FormularioAsignaciones({ asignaciones, docentes, grupos, asignaturas, anios, total, filtros, pie }: Props) {
  const [bloques, setBloques] = useState<Bloque[]>([bloqueVacio()]);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState("");
  const [errorAccion, setErrorAccion] = useState("");
  const [confirmacion, setConfirmacion] = useState<{ tipo: "DESACTIVAR" | "REACTIVAR" | "REASIGNAR"; asignacion: Asignacion; docenteId?: string; bloques?: Bloque[] } | null>(null);

  const cambiarBloque = (i: number, campo: keyof Bloque, valor: string) => setBloques((actuales) => actuales.map((b, j) => j === i ? { ...b, [campo]: valor } : b));
  async function crear(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setOcupado(true); setError("");
    const f = new FormData(e.currentTarget);
    const r = await llamarApi("/api/asignaciones-docente", "POST", { docenteId: f.get("docenteId"), asignaturaId: f.get("asignaturaId"), grupoId: f.get("grupoId"), anioLectivoId: f.get("anioLectivoId"), bloques });
    setOcupado(false); if (!r.ok) return setError(r.mensaje); window.location.reload();
  }
  async function ejecutar() {
    if (!confirmacion) return; setOcupado(true); setErrorAccion("");
    const { asignacion: a, tipo } = confirmacion;
    const r = tipo === "DESACTIVAR" ? await llamarApi(`/api/asignaciones-docente/${a.id}`, "DELETE")
      : tipo === "REACTIVAR" ? await llamarApi(`/api/asignaciones-docente/${a.id}`, "PATCH", { accion: "REACTIVAR" })
        : await llamarApi(`/api/asignaciones-docente/${a.id}`, "PATCH", { accion: "REASIGNAR", docenteId: confirmacion.docenteId, bloques: confirmacion.bloques, confirmar: true });
    setOcupado(false); if (!r.ok) { setErrorAccion(r.mensaje); setConfirmacion(null); return; } window.location.reload();
  }
  function pedirReasignacion(a: Asignacion) {
    const candidato = docentes.find((d) => d.id !== a.docente.id);
    if (!candidato) { setErrorAccion("No hay otro docente activo disponible para reasignar."); return; }
    setErrorAccion(""); setConfirmacion({ tipo: "REASIGNAR", asignacion: a, docenteId: candidato.id, bloques: a.bloques });
  }

  return <section className="config-seccion" aria-labelledby="listado-asignaciones">
    <div className="config-seccion-cabeza">
      <div>
        <h2 id="listado-asignaciones">Asignaciones e historial</h2>
        <p className="config-seccion-resumen" role="status">{total === 0 ? "No hay asignaciones que coincidan." : total === 1 ? "1 asignación" : `${total} asignaciones`}</p>
      </div>
    </div>
    <p className="config-seccion-nota">Cada asignación relaciona docente, asignatura, grupo y año con uno o varios bloques de horario. Reasignar o desactivar conserva el historial.</p>

    <AltaPlegable texto="Nueva asignación" abiertoInicial={total === 0}>
      <form className="admin-formulario admin-rejilla" onSubmit={crear} aria-labelledby="crear-asignacion">
        <h3 id="crear-asignacion" className="admin-campo-ancho config-alta-titulo">Nueva asignación</h3>
        <label className="admin-campo">Docente activo<select name="docenteId" required defaultValue=""><option value="">Selecciona</option>{docentes.map((o) => <option key={o.id} value={o.id}>{o.etiqueta}</option>)}</select></label>
        <label className="admin-campo">Asignatura<select name="asignaturaId" required defaultValue=""><option value="">Selecciona</option>{asignaturas.map((o) => <option key={o.id} value={o.id}>{o.etiqueta}</option>)}</select></label>
        <label className="admin-campo">Año lectivo<select name="anioLectivoId" required defaultValue=""><option value="">Selecciona</option>{anios.map((o) => <option key={o.id} value={o.id}>{o.etiqueta}</option>)}</select></label>
        <label className="admin-campo">Grupo<select name="grupoId" required defaultValue=""><option value="">Selecciona</option>{grupos.map((o) => <option key={o.id} value={o.id}>{o.etiqueta}</option>)}</select></label>
        <fieldset className="admin-opciones admin-campo-ancho"><legend>Bloques horarios</legend>{bloques.map((b, i) => <div className="asignacion-bloque" key={i}>
          <label>Día<select value={b.dia} onChange={(e) => cambiarBloque(i, "dia", e.target.value)}>{Object.entries(DIAS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
          <label>Inicio<input type="time" value={b.horaInicio} onChange={(e) => cambiarBloque(i, "horaInicio", e.target.value)} required /></label>
          <label>Fin<input type="time" value={b.horaFin} onChange={(e) => cambiarBloque(i, "horaFin", e.target.value)} required /></label>
          {bloques.length > 1 ? <button type="button" className="admin-enlace-fila" onClick={() => setBloques((x) => x.filter((_, j) => j !== i))}>Quitar bloque<span className="sr-only"> {i + 1}</span></button> : null}
        </div>)}<button type="button" className="boton-pastilla" data-variante="secundario" onClick={() => setBloques((x) => [...x, bloqueVacio()])}>Agregar bloque</button></fieldset>
        {error ? <p role="alert" className="admin-aviso admin-campo-ancho" data-tipo="error">{error}</p> : null}
        <div className="admin-filtros-acciones"><button className="boton-pastilla" data-variante="primario" disabled={ocupado}>{ocupado ? "Guardando…" : "Crear asignación"}</button></div>
      </form>
    </AltaPlegable>

    {filtros}
    {errorAccion ? <p role="alert" className="admin-aviso" data-tipo="error">{errorAccion}</p> : null}

    {asignaciones.length ? <ul className="config-fichas" aria-label="Asignaciones">{asignaciones.map((a) => {
      const docente = `${a.docente.nombres} ${a.docente.apellidos}`;
      const etiqueta = `${a.asignatura.nombre} de ${a.grupo.grado.nombre} con ${docente}`;
      return <li key={a.id} className="config-ficha" data-estado={a.estado}>
        <div className="config-ficha-cabeza">
          <h3>{a.asignatura.nombre}</h3>
          <span className="admin-estado" data-estado={a.estado === "ACTIVA" ? "ACTIVO" : "INACTIVO"}>{a.estado === "ACTIVA" ? "Activa" : "Inactiva"}</span>
        </div>
        <p className="config-ficha-grupo">{a.grupo.grado.nombre} · {a.anioLectivo.anio}</p>
        <p className="config-ficha-docente"><UserRound size={18} aria-hidden="true" /> {docente}</p>
        <div className="config-ficha-horario">
          <span className="sr-only">Horario: </span>
          {a.bloques.length ? <ul className="config-chips">{a.bloques.map((b, i) => <li key={i} className="config-chip"><Clock size={14} aria-hidden="true" /> {DIAS[b.dia] ?? b.dia} {b.horaInicio}–{b.horaFin}</li>)}</ul>
            : <span className="config-falta">Sin bloques de horario</span>}
        </div>
        {a.anioLectivo.estado === "CERRADO" ? <p className="config-ficha-acciones config-solo-lectura"><Lock size={16} aria-hidden="true" /> Solo lectura (año cerrado)</p>
          : <div className="config-ficha-acciones">
            {a.estado === "ACTIVA" ? <>
              <button type="button" className="config-accion" onClick={() => pedirReasignacion(a)}><Repeat size={16} aria-hidden="true" /> Reasignar<span className="sr-only"> {etiqueta}</span></button>
              <button type="button" className="config-accion" data-tono="peligro" onClick={() => { setErrorAccion(""); setConfirmacion({ tipo: "DESACTIVAR", asignacion: a }); }}><Power size={16} aria-hidden="true" /> Desactivar<span className="sr-only"> {etiqueta}</span></button>
            </> : <button type="button" className="config-accion" onClick={() => { setErrorAccion(""); setConfirmacion({ tipo: "REACTIVAR", asignacion: a }); }}><RotateCcw size={16} aria-hidden="true" /> Reactivar<span className="sr-only"> {etiqueta}</span></button>}
          </div>}
      </li>;
    })}</ul> : <div className="admin-vacio"><p>No hay asignaciones registradas para estos filtros.</p></div>}
    {pie}

    <Confirmar abierto={!!confirmacion} titulo={confirmacion?.tipo === "REASIGNAR" ? "Confirmar reasignación" : `${confirmacion?.tipo === "REACTIVAR" ? "Reactivar" : "Desactivar"} asignación`} textoConfirmar="Confirmar" pendiente={ocupado} peligro={confirmacion?.tipo !== "REACTIVAR"} onCancelar={() => setConfirmacion(null)} onConfirmar={ejecutar}>
      <p>{confirmacion?.tipo === "REASIGNAR" ? "La asignación actual quedará inactiva y se creará una nueva, conservando el historial." : "El cambio se aplicará solo si el año está abierto y no genera conflictos de horario."}</p>
      {confirmacion?.tipo === "REASIGNAR" ? <label className="admin-campo">Nuevo docente<select value={confirmacion.docenteId} onChange={(e) => setConfirmacion({ ...confirmacion, docenteId: e.target.value })}>{docentes.filter((d) => d.id !== confirmacion.asignacion.docente.id).map((d) => <option key={d.id} value={d.id}>{d.etiqueta}</option>)}</select></label> : null}
    </Confirmar>
  </section>;
}
