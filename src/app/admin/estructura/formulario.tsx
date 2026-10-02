"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { Confirmar } from "@/app/admin/usuarios/comunes";

export type Clave = "anios" | "periodos" | "areas" | "grados" | "grupos" | "asignaturas";
export type Opcion = { id: string; etiqueta: string };
/** Partes del listado que arma el servidor: filtros (GET), contador, estado vacío y paginación. */
export type Listado = { filtros: ReactNode; resumen: ReactNode; vacio: ReactNode | null; pie: ReactNode };
type Registro = Record<string, unknown> & { id: string };
type Props = {
  anios: Registro[]; periodos: Registro[]; areas: Registro[]; grados: Registro[]; grupos: Registro[]; asignaturas: Registro[];
  /** Catálogos completos para los formularios de alta (no dependen de la página ni de los filtros). */
  catalogo: { anios: Opcion[]; grados: Opcion[]; areas: Opcion[]; docentes: Opcion[] };
  listados: Record<Clave, Listado>;
};

const fecha = (v: unknown) => typeof v === "string" ? v.slice(0, 10) : new Date(v as Date).toISOString().slice(0, 10);
const texto = (v: unknown) => String(v ?? "");
const etiquetas: Record<string, string> = { AREA: "Área", DIMENSION: "Dimensión", ENFOQUE: "Enfoque" };

export function FormularioEstructura({ anios, periodos, areas, grados, grupos, asignaturas, catalogo, listados }: Props) {
  const [aviso, setAviso] = useState<string | null>(null);
  const [borrar, setBorrar] = useState<{ ruta: string; etiqueta: string } | null>(null);
  const [ocupado, setOcupado] = useState(false);

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = e.currentTarget;
    const datos: Record<string, unknown> = Object.fromEntries(new FormData(f));
    const tipo = f.dataset.tipo!;
    for (const campo of ["anio", "orden", "ponderacion", "intensidadHoraria", "intensidad"]) {
      if (campo in datos && datos[campo] !== "") datos[campo] = Number(datos[campo]);
    }
    for (const campo of ["directorId", "intensidadHoraria", "orden"]) if (datos[campo] === "") datos[campo] = null;
    if (tipo === "asignaturas") {
      const gradosSeleccionados = new FormData(f).getAll("gradoId").map((gradoId) => ({ gradoId, intensidad: null }));
      datos.grados = gradosSeleccionados;
      delete datos.gradoId;
    }
    const id = texto(datos.id); delete datos.id;
    const metodo = id ? "PATCH" : "POST";
    const ruta = id ? `/api/${tipo}/${id}` : `/api/${tipo}`;
    setOcupado(true); setAviso(null);
    const r = await fetch(ruta, { method: metodo, headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos) });
    const json = await r.json().catch(() => null);
    setOcupado(false);
    if (!r.ok) { setAviso(json?.error?.message ?? "No fue posible guardar los cambios."); return; }
    f.reset(); window.location.reload();
  }

  async function confirmarBorrado() {
    if (!borrar) return;
    setOcupado(true); setAviso(null);
    const r = await fetch(borrar.ruta, { method: "DELETE" });
    const json = await r.json().catch(() => null);
    setOcupado(false);
    if (!r.ok) { setAviso(json?.error?.message ?? "No fue posible eliminar el registro."); setBorrar(null); return; }
    window.location.reload();
  }

  async function editar(ruta: string, etiqueta: string, cambios: Record<string, unknown>) {
    const [campo, actual] = Object.entries(cambios)[0] ?? [];
    if (!campo) return;
    const valor = window.prompt(`Nuevo valor para ${etiqueta}:`, texto(actual));
    if (valor === null) return;
    setOcupado(true); setAviso(null);
    const r = await fetch(ruta, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ [campo]: valor }) });
    const json = await r.json().catch(() => null);
    setOcupado(false);
    if (!r.ok) { setAviso(json?.error?.message ?? "No fue posible actualizar el registro."); return; }
    window.location.reload();
  }

  const accion = (ruta: string, etiqueta: string, cambios?: Record<string, unknown>) => <span className="admin-acciones-fila">{cambios ? <button type="button" className="admin-enlace-fila" onClick={() => editar(ruta, etiqueta, cambios)}>Editar<span className="sr-only"> {etiqueta}</span></button> : null}<button type="button" className="admin-enlace-fila" onClick={() => setBorrar({ ruta, etiqueta })}>Eliminar<span className="sr-only"> {etiqueta}</span></button></span>;
  const opciones = (items: Opcion[]) => items.map((o) => <option key={o.id} value={o.id}>{o.etiqueta}</option>);

  return <div className="admin-columna">
    {aviso ? <p role="alert" className="admin-aviso" data-tipo="error">{aviso}</p> : null}

    <Seccion clave="anios" titulo="Años lectivos" nota="Solo puede haber un año activo. Cerrar exige períodos configurados y una ponderación anual exacta de 100 %." listado={listados.anios} filas={anios.length}
      formulario={<form data-tipo="anios-lectivos" onSubmit={enviar} className="admin-formulario admin-rejilla" aria-label="Crear año lectivo">
        <Campo etiqueta="Año"><input name="anio" type="number" min="2000" max="2100" required /></Campo>
        <Campo etiqueta="Estado"><select name="estado" defaultValue="ACTIVO"><option value="ACTIVO">Activo</option><option value="CERRADO">Cerrado</option></select></Campo>
        <Campo etiqueta="Fecha de inicio"><input name="fechaInicio" type="date" required /></Campo><Campo etiqueta="Fecha de fin"><input name="fechaFin" type="date" required /></Campo>
        <Guardar ocupado={ocupado} texto="Crear año" />
      </form>}>
      <Tabla titulo="Años lectivos" encabezados={["Año", "Vigencia", "Estado", "Acciones"]}>{anios.map((a) => <tr key={a.id}><th scope="row">{texto(a.anio)}</th><td data-etiqueta="Vigencia">{fecha(a.fechaInicio)} a {fecha(a.fechaFin)}</td><td data-etiqueta="Estado">{texto(a.estado)}</td><td>{accion(`/api/anios-lectivos/${a.id}`, `el año ${a.anio}`, { fechaInicio: fecha(a.fechaInicio) })}</td></tr>)}</Tabla>
    </Seccion>

    <Seccion clave="periodos" titulo="Períodos" nota="Los períodos deben estar dentro del año y no pueden cruzarse." listado={listados.periodos} filas={periodos.length}
      formulario={<form data-tipo="periodos" onSubmit={enviar} className="admin-formulario admin-rejilla" aria-label="Crear período">
        <Campo etiqueta="Año"><select name="anioLectivoId" required><option value="">Selecciona</option>{opciones(catalogo.anios)}</select></Campo><Campo etiqueta="Nombre"><input name="nombre" maxLength={60} required /></Campo>
        <Campo etiqueta="Orden"><input name="orden" type="number" min="1" required /></Campo><Campo etiqueta="Ponderación (%)"><input name="ponderacion" type="number" min="0.01" max="100" step="0.01" required /></Campo>
        <Campo etiqueta="Fecha de inicio"><input name="fechaInicio" type="date" required /></Campo><Campo etiqueta="Fecha de fin"><input name="fechaFin" type="date" required /></Campo><Guardar ocupado={ocupado} texto="Crear período" />
      </form>}>
      <Tabla titulo="Períodos" encabezados={["Período", "Año", "Fechas", "%", "Acciones"]}>{periodos.map((p) => <tr key={p.id}><th scope="row">{texto(p.nombre)}</th><td data-etiqueta="Año">{texto((p.anioLectivo as Record<string, unknown> | undefined)?.anio ?? p.anioLectivoId)}</td><td data-etiqueta="Fechas">{fecha(p.fechaInicio)} a {fecha(p.fechaFin)}</td><td data-etiqueta="Ponderación">{texto(p.ponderacion)} %</td><td>{accion(`/api/periodos/${p.id}`, `el período ${p.nombre}`, { nombre: p.nombre })}</td></tr>)}</Tabla>
    </Seccion>

    <Seccion clave="areas" titulo="Áreas" nota="Las áreas agrupan asignaturas; no se eliminan si ya tienen relaciones." listado={listados.areas} filas={areas.length}
      formulario={<form data-tipo="areas" onSubmit={enviar} className="admin-formulario admin-rejilla" aria-label="Crear área"><Campo etiqueta="Nombre"><input name="nombre" maxLength={120} required /></Campo><Campo etiqueta="Tipo"><select name="tipo">{Object.entries(etiquetas).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Campo><Campo etiqueta="Idioma"><input name="idioma" defaultValue="es" maxLength={12} required /></Campo><Campo etiqueta="Orden (opcional)"><input name="orden" type="number" min="0" /></Campo><Guardar ocupado={ocupado} texto="Crear área" /></form>}>
      <Tabla titulo="Áreas" encabezados={["Área", "Tipo", "Idioma", "Acciones"]}>{areas.map((a) => <tr key={a.id}><th scope="row">{texto(a.nombre)}</th><td data-etiqueta="Tipo">{etiquetas[texto(a.tipo)] ?? texto(a.tipo)}</td><td data-etiqueta="Idioma">{texto(a.idioma)}</td><td>{accion(`/api/areas/${a.id}`, `el área ${a.nombre}`, { nombre: a.nombre })}</td></tr>)}</Tabla>
    </Seccion>

    <Seccion clave="grados" titulo="Grados" nota="Cada grado tiene un nivel educativo y orden curricular." listado={listados.grados} filas={grados.length}
      formulario={<form data-tipo="grados" onSubmit={enviar} className="admin-formulario admin-rejilla" aria-label="Crear grado"><Campo etiqueta="Nombre"><input name="nombre" maxLength={30} required /></Campo><Campo etiqueta="Nivel"><select name="nivel"><option value="PREESCOLAR">Preescolar</option><option value="PRIMARIA">Primaria</option><option value="BACHILLERATO">Bachillerato</option></select></Campo><Campo etiqueta="Orden"><input name="orden" type="number" min="0" required /></Campo><Guardar ocupado={ocupado} texto="Crear grado" /></form>}>
      <Tabla titulo="Grados" encabezados={["Grado", "Nivel", "Orden", "Acciones"]}>{grados.map((g) => <tr key={g.id}><th scope="row">{texto(g.nombre)}</th><td data-etiqueta="Nivel">{texto(g.nivel)}</td><td data-etiqueta="Orden">{texto(g.orden)}</td><td>{accion(`/api/grados/${g.id}`, `el grado ${g.nombre}`, { nombre: g.nombre })}</td></tr>)}</Tabla>
    </Seccion>

    <Seccion clave="grupos" titulo="Grupos" nota="El director debe ser un docente activo. Los grupos de años cerrados son inmutables." listado={listados.grupos} filas={grupos.length}
      formulario={<form data-tipo="grupos" onSubmit={enviar} className="admin-formulario admin-rejilla" aria-label="Crear grupo"><Campo etiqueta="Año"><select name="anioLectivoId" required><option value="">Selecciona</option>{opciones(catalogo.anios)}</select></Campo><Campo etiqueta="Grado"><select name="gradoId" required><option value="">Selecciona</option>{opciones(catalogo.grados)}</select></Campo><Campo etiqueta="Identificador"><input name="identificador" placeholder="01" maxLength={4} required /></Campo><Campo etiqueta="Director de grupo"><select name="directorId"><option value="">Sin asignar</option>{opciones(catalogo.docentes)}</select></Campo><Guardar ocupado={ocupado} texto="Crear grupo" /></form>}>
      <Tabla titulo="Grupos" encabezados={["Grupo", "Año", "Director", "Acciones"]}>{grupos.map((g) => { const grado = g.grado as Record<string, unknown> | undefined; const director = g.director as Record<string, unknown> | null; return <tr key={g.id}><th scope="row">{texto(grado?.nombre)}-{texto(g.identificador)}</th><td data-etiqueta="Año">{texto((g.anioLectivo as Record<string, unknown> | undefined)?.anio)}</td><td data-etiqueta="Director">{director ? `${texto(director.nombres)} ${texto(director.apellidos)}` : "Sin asignar"}</td><td>{accion(`/api/grupos/${g.id}`, `el grupo ${grado?.nombre}-${g.identificador}`)}</td></tr>})}</Tabla>
    </Seccion>

    <Seccion clave="asignaturas" titulo="Asignaturas" nota="Habilita la asignatura para los grados donde se dicta. No se elimina si ya tiene relaciones." listado={listados.asignaturas} filas={asignaturas.length}
      formulario={<form data-tipo="asignaturas" onSubmit={enviar} className="admin-formulario admin-rejilla" aria-label="Crear asignatura"><Campo etiqueta="Nombre"><input name="nombre" maxLength={80} required /></Campo><Campo etiqueta="Área"><select name="areaId" required><option value="">Selecciona</option>{opciones(catalogo.areas)}</select></Campo><Campo etiqueta="Intensidad horaria (opcional)"><input name="intensidadHoraria" type="number" min="1" max="40" /></Campo><fieldset className="admin-opciones admin-campo-ancho"><legend>Grados habilitados</legend>{catalogo.grados.map((g) => <label className="admin-opcion" key={g.id}><input type="checkbox" name="gradoId" value={g.id} /><span><strong>{g.etiqueta}</strong><small>Habilitar esta asignatura para el grado.</small></span></label>)}</fieldset><Guardar ocupado={ocupado} texto="Crear asignatura" /></form>}>
      <Tabla titulo="Asignaturas" encabezados={["Asignatura", "Área", "Grados", "Acciones"]}>{asignaturas.map((a) => { const area = a.area as Record<string, unknown> | undefined; const habilitados = (a.grados as Array<Record<string, unknown>> | undefined) ?? []; return <tr key={a.id}><th scope="row">{texto(a.nombre)}</th><td data-etiqueta="Área">{texto(area?.nombre)}</td><td data-etiqueta="Grados">{habilitados.map((h) => texto((h.grado as Record<string, unknown>)?.nombre)).join(", ") || "Sin habilitar"}</td><td>{accion(`/api/asignaturas/${a.id}`, `la asignatura ${a.nombre}`, { nombre: a.nombre })}</td></tr>})}</Tabla>
    </Seccion>

    <Confirmar abierto={!!borrar} titulo="Eliminar registro" textoConfirmar="Eliminar definitivamente" peligro pendiente={ocupado} onConfirmar={confirmarBorrado} onCancelar={() => setBorrar(null)}><p>¿Confirmas el borrado físico de {borrar?.etiqueta}? Solo se permite si nunca tuvo relaciones ni historial.</p></Confirmar>
  </div>;
}

function Seccion({ clave, titulo, nota, formulario, listado, filas, children }: { clave: Clave; titulo: string; nota: string; formulario: ReactNode; listado: Listado; filas: number; children: ReactNode }) {
  return <section id={`estructura-${clave}`} className="admin-estructura" aria-labelledby={`estructura-${clave}-titulo`}>
    <div className="section-heading"><h2 id={`estructura-${clave}-titulo`}>{titulo}</h2>{listado.resumen}</div>
    <p className="admin-nota">{nota}</p>
    {formulario}
    {listado.filtros}
    {filas > 0 ? children : listado.vacio}
    {listado.pie}
  </section>;
}
function Campo({ etiqueta, children }: { etiqueta: string; children: ReactNode }) { return <label className="admin-campo">{etiqueta}{children}</label>; }
function Guardar({ ocupado, texto }: { ocupado: boolean; texto: string }) { return <div className="admin-filtros-acciones"><button className="boton-pastilla" data-variante="primario" disabled={ocupado}>{ocupado ? "Guardando…" : texto}</button></div>; }
function Tabla({ titulo, encabezados, children }: { titulo: string; encabezados: string[]; children: ReactNode }) { return <div className="admin-tabla-marco"><table className="admin-tabla"><caption className="sr-only">{titulo}</caption><thead><tr>{encabezados.map((h) => <th key={h} scope="col">{h}</th>)}</tr></thead><tbody>{children}</tbody></table></div>; }
