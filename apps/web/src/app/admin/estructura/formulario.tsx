"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Confirmar, llamarApi } from "@/app/admin/usuarios/comunes";
import { accionesAnio, anioCerrado, campoIntensidad, CUERPO_CIERRE, cuerpoFormulario, errorCuerpo, type Modo, type TipoApi } from "./edicion";

export type Clave = "anios" | "periodos" | "areas" | "grados" | "grupos" | "asignaturas";
export type Opcion = { id: string; etiqueta: string };
/** Partes del listado que arma el servidor: filtros (GET), contador, estado vacío y paginación. */
export type Listado = { filtros: ReactNode; resumen: ReactNode; vacio: ReactNode | null; pie: ReactNode };
type Registro = Record<string, unknown> & { id: string };
type Catalogo = { anios: Opcion[]; aniosEditables: Opcion[]; grados: Opcion[]; areas: Opcion[]; docentes: Opcion[] };
type Props = {
  anios: Registro[]; periodos: Registro[]; areas: Registro[]; grados: Registro[]; grupos: Registro[]; asignaturas: Registro[];
  /** Catálogos completos para los formularios de alta y edición (no dependen de la página ni de los filtros). */
  catalogo: Catalogo;
  listados: Record<Clave, Listado>;
};
type Edicion = { tipo: TipoApi; registro: Registro; titulo: string };

const fecha = (v: unknown) => (v ? (typeof v === "string" ? v.slice(0, 10) : new Date(v as Date).toISOString().slice(0, 10)) : "");
const texto = (v: unknown) => String(v ?? "");
const objeto = (v: unknown) => (v ?? undefined) as Record<string, unknown> | undefined;
const TIPOS_AREA: Record<string, string> = { AREA: "Área", DIMENSION: "Dimensión", ENFOQUE: "Enfoque" };
const NIVELES: Record<string, string> = { PREESCOLAR: "Preescolar", PRIMARIA: "Primaria", BACHILLERATO: "Bachillerato" };
const ESTADOS_ANIO: Record<string, string> = { ACTIVO: "Activo", CERRADO: "Cerrado" };
const nombreGrupo = (g: Registro) => `${texto(objeto(g.grado)?.nombre)}-${texto(g.identificador)}`;

export function FormularioEstructura({ anios, periodos, areas, grados, grupos, asignaturas, catalogo, listados }: Props) {
  const [aviso, setAviso] = useState<{ tipo: TipoApi; mensaje: string } | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [edicion, setEdicion] = useState<Edicion | null>(null);
  const [errorEdicion, setErrorEdicion] = useState<string | null>(null);
  const [borrar, setBorrar] = useState<{ ruta: string; etiqueta: string } | null>(null);
  const [cerrar, setCerrar] = useState<Registro | null>(null);
  const [errorDialogo, setErrorDialogo] = useState<string | null>(null);

  /** Envía un formulario de alta o edición; los errores de esquema o dominio se muestran sin perder lo escrito. */
  async function guardar(tipo: TipoApi, modo: Modo, f: HTMLFormElement, registro?: Registro) {
    const mostrar = (mensaje: string | null) => (modo === "crear" ? setAviso(mensaje ? { tipo, mensaje } : null) : setErrorEdicion(mensaje));
    const cuerpo = cuerpoFormulario(tipo, new FormData(f), modo, registro);
    const invalido = errorCuerpo(tipo, modo, cuerpo);
    if (invalido) { mostrar(invalido); return; }
    setOcupado(true); mostrar(null);
    const r = await llamarApi(registro ? `/api/${tipo}/${registro.id}` : `/api/${tipo}`, registro ? "PATCH" : "POST", cuerpo);
    setOcupado(false);
    if (!r.ok) { mostrar(r.mensaje); return; }
    window.location.reload();
  }

  const crear = (tipo: TipoApi) => (e: FormEvent<HTMLFormElement>) => { e.preventDefault(); void guardar(tipo, "crear", e.currentTarget); };
  const abrirEdicion = (tipo: TipoApi, registro: Registro, titulo: string) => { setErrorEdicion(null); setEdicion({ tipo, registro, titulo }); };

  async function confirmar(ruta: string, metodo: "DELETE" | "PATCH", cuerpo?: unknown) {
    setOcupado(true); setErrorDialogo(null);
    const r = await llamarApi(ruta, metodo, cuerpo);
    setOcupado(false);
    if (!r.ok) { setErrorDialogo(r.mensaje); return; }
    window.location.reload();
  }
  const cancelarDialogo = () => { setBorrar(null); setCerrar(null); setErrorDialogo(null); };

  /** Acciones de fila; sin `editar` la fila es de solo lectura (año cerrado). */
  function acciones(etiqueta: string, a: { editar?: () => void; cerrar?: () => void; ruta?: string }) {
    if (!a.editar && !a.cerrar && !a.ruta) return <span className="admin-nota">Solo lectura (año cerrado)</span>;
    return <span className="admin-acciones-fila">
      {a.editar ? <button type="button" className="admin-enlace-fila" onClick={a.editar}>Editar<span className="sr-only"> {etiqueta}</span></button> : null}
      {a.cerrar ? <button type="button" className="admin-enlace-fila" onClick={() => { setErrorDialogo(null); a.cerrar!(); }}>Cerrar año<span className="sr-only"> {etiqueta}</span></button> : null}
      {a.ruta ? <button type="button" className="admin-enlace-fila" onClick={() => { setErrorDialogo(null); setBorrar({ ruta: a.ruta!, etiqueta }); }}>Eliminar<span className="sr-only"> {etiqueta}</span></button> : null}
    </span>;
  }

  return <div className="admin-columna">
    <Seccion error={aviso} clave="anios" titulo="Años lectivos" nota="Solo puede haber un año activo. Todo año se crea activo; ciérralo desde la tabla cuando sus períodos sumen exactamente 100 %. Un año cerrado es de solo lectura." listado={listados.anios} filas={anios.length}
      formulario={<form onSubmit={crear("anios-lectivos")} className="admin-formulario admin-rejilla" aria-label="Crear año lectivo">
        <CamposAnio /><Guardar ocupado={ocupado} texto="Crear año" />
      </form>}>
      <Tabla titulo="Años lectivos" encabezados={["Año", "Vigencia", "Estado", "Acciones"]}>{anios.map((a) => {
        const etiqueta = `el año ${texto(a.anio)}`; const permitido = accionesAnio(a.estado);
        return <tr key={a.id}><th scope="row">{texto(a.anio)}</th><td data-etiqueta="Vigencia">{fecha(a.fechaInicio)} a {fecha(a.fechaFin)}</td><td data-etiqueta="Estado"><span className="admin-estado" data-estado={texto(a.estado)}>{ESTADOS_ANIO[texto(a.estado)] ?? texto(a.estado)}</span></td>
          <td>{acciones(etiqueta, { editar: permitido.editar ? () => abrirEdicion("anios-lectivos", a, `Editar año lectivo ${texto(a.anio)}`) : undefined, cerrar: permitido.cerrar ? () => setCerrar(a) : undefined, ruta: permitido.eliminar ? `/api/anios-lectivos/${a.id}` : undefined })}</td></tr>;
      })}</Tabla>
    </Seccion>

    <Seccion error={aviso} clave="periodos" titulo="Períodos" nota="Los períodos deben estar dentro del año, no pueden cruzarse y su ponderación anual no puede superar 100 %." listado={listados.periodos} filas={periodos.length}
      formulario={<form onSubmit={crear("periodos")} className="admin-formulario admin-rejilla" aria-label="Crear período">
        <CamposPeriodo catalogo={catalogo} /><Guardar ocupado={ocupado} texto="Crear período" />
      </form>}>
      <Tabla titulo="Períodos" encabezados={["Período", "Año", "Orden", "Fechas", "Ponderación", "Acciones"]}>{periodos.map((p) => {
        const anio = objeto(p.anioLectivo); const etiqueta = `el período ${texto(p.nombre)} de ${texto(anio?.anio)}`; const cerrado = anioCerrado(anio);
        return <tr key={p.id}><th scope="row">{texto(p.nombre)}</th><td data-etiqueta="Año">{texto(anio?.anio ?? p.anioLectivoId)}</td><td data-etiqueta="Orden">{texto(p.orden)}</td><td data-etiqueta="Fechas">{fecha(p.fechaInicio)} a {fecha(p.fechaFin)}</td><td data-etiqueta="Ponderación">{texto(p.ponderacion)} %</td>
          <td>{acciones(etiqueta, cerrado ? {} : { editar: () => abrirEdicion("periodos", p, `Editar período ${texto(p.nombre)} (${texto(anio?.anio)})`), ruta: `/api/periodos/${p.id}` })}</td></tr>;
      })}</Tabla>
    </Seccion>

    <Seccion error={aviso} clave="areas" titulo="Áreas" nota="Las áreas agrupan asignaturas; no se eliminan si ya tienen relaciones." listado={listados.areas} filas={areas.length}
      formulario={<form onSubmit={crear("areas")} className="admin-formulario admin-rejilla" aria-label="Crear área"><CamposArea /><Guardar ocupado={ocupado} texto="Crear área" /></form>}>
      <Tabla titulo="Áreas" encabezados={["Área", "Tipo", "Idioma", "Orden", "Acciones"]}>{areas.map((a) => <tr key={a.id}><th scope="row">{texto(a.nombre)}</th><td data-etiqueta="Tipo">{TIPOS_AREA[texto(a.tipo)] ?? texto(a.tipo)}</td><td data-etiqueta="Idioma">{texto(a.idioma)}</td><td data-etiqueta="Orden">{a.orden === null || a.orden === undefined ? "Sin orden" : texto(a.orden)}</td>
        <td>{acciones(`el área ${texto(a.nombre)}`, { editar: () => abrirEdicion("areas", a, `Editar área ${texto(a.nombre)}`), ruta: `/api/areas/${a.id}` })}</td></tr>)}</Tabla>
    </Seccion>

    <Seccion error={aviso} clave="grados" titulo="Grados" nota="Cada grado tiene un nivel educativo y orden curricular." listado={listados.grados} filas={grados.length}
      formulario={<form onSubmit={crear("grados")} className="admin-formulario admin-rejilla" aria-label="Crear grado"><CamposGrado /><Guardar ocupado={ocupado} texto="Crear grado" /></form>}>
      <Tabla titulo="Grados" encabezados={["Grado", "Nivel", "Orden", "Acciones"]}>{grados.map((g) => <tr key={g.id}><th scope="row">{texto(g.nombre)}</th><td data-etiqueta="Nivel">{NIVELES[texto(g.nivel)] ?? texto(g.nivel)}</td><td data-etiqueta="Orden">{texto(g.orden)}</td>
        <td>{acciones(`el grado ${texto(g.nombre)}`, { editar: () => abrirEdicion("grados", g, `Editar grado ${texto(g.nombre)}`), ruta: `/api/grados/${g.id}` })}</td></tr>)}</Tabla>
    </Seccion>

    <Seccion error={aviso} clave="grupos" titulo="Grupos" nota="El director debe ser un docente activo. El año y el grado de un grupo no cambian después de crearlo. Los grupos de años cerrados son inmutables." listado={listados.grupos} filas={grupos.length}
      formulario={<form onSubmit={crear("grupos")} className="admin-formulario admin-rejilla" aria-label="Crear grupo"><CamposGrupo catalogo={catalogo} /><Guardar ocupado={ocupado} texto="Crear grupo" /></form>}>
      <Tabla titulo="Grupos" encabezados={["Grupo", "Año", "Director", "Acciones"]}>{grupos.map((g) => {
        const director = objeto(g.director); const anio = objeto(g.anioLectivo); const etiqueta = `el grupo ${nombreGrupo(g)} de ${texto(anio?.anio)}`;
        return <tr key={g.id}><th scope="row">{nombreGrupo(g)}</th><td data-etiqueta="Año">{texto(anio?.anio)}</td><td data-etiqueta="Director">{director ? `${texto(director.nombres)} ${texto(director.apellidos)}` : "Sin asignar"}</td>
          <td>{acciones(etiqueta, anioCerrado(anio) ? {} : { editar: () => abrirEdicion("grupos", g, `Editar grupo ${nombreGrupo(g)} (${texto(anio?.anio)})`), ruta: `/api/grupos/${g.id}` })}</td></tr>;
      })}</Tabla>
    </Seccion>

    <Seccion error={aviso} clave="asignaturas" titulo="Asignaturas" nota="Habilita la asignatura para los grados donde se dicta, con su intensidad semanal opcional. No se elimina si ya tiene relaciones." listado={listados.asignaturas} filas={asignaturas.length}
      formulario={<form onSubmit={crear("asignaturas")} className="admin-formulario admin-rejilla" aria-label="Crear asignatura"><CamposAsignatura catalogo={catalogo} /><Guardar ocupado={ocupado} texto="Crear asignatura" /></form>}>
      <Tabla titulo="Asignaturas" encabezados={["Asignatura", "Área", "Intensidad", "Grados", "Acciones"]}>{asignaturas.map((a) => {
        const habilitados = (a.grados as Array<Record<string, unknown>> | undefined) ?? [];
        return <tr key={a.id}><th scope="row">{texto(a.nombre)}</th><td data-etiqueta="Área">{texto(objeto(a.area)?.nombre)}</td><td data-etiqueta="Intensidad">{a.intensidadHoraria ? `${texto(a.intensidadHoraria)} h/semana` : "Sin definir"}</td>
          <td data-etiqueta="Grados">{habilitados.map((h) => `${texto(objeto(h.grado)?.nombre)}${h.intensidad ? ` (${texto(h.intensidad)} h)` : ""}`).join(", ") || "Sin habilitar"}</td>
          <td>{acciones(`la asignatura ${texto(a.nombre)}`, { editar: () => abrirEdicion("asignaturas", a, `Editar asignatura ${texto(a.nombre)}`), ruta: `/api/asignaturas/${a.id}` })}</td></tr>;
      })}</Tabla>
    </Seccion>

    {edicion ? <Editor key={`${edicion.tipo}-${edicion.registro.id}`} edicion={edicion} error={errorEdicion} ocupado={ocupado}
      onGuardar={(f) => guardar(edicion.tipo, "editar", f, edicion.registro)} onCancelar={() => { setEdicion(null); setErrorEdicion(null); }}>
      <CamposEdicion edicion={edicion} catalogo={catalogo} />
    </Editor> : null}

    <Confirmar abierto={!!cerrar} titulo={`Cerrar el año lectivo ${texto(cerrar?.anio)}`} textoConfirmar="Cerrar año definitivamente" peligro pendiente={ocupado}
      onConfirmar={() => cerrar && confirmar(`/api/anios-lectivos/${cerrar.id}`, "PATCH", CUERPO_CIERRE)} onCancelar={cancelarDialogo}>
      <p>Al cerrar el año, sus fechas, períodos y grupos quedan de solo lectura y no se puede reabrir. Solo se permite si el año tiene períodos y sus ponderaciones suman exactamente 100 %.</p>
      {errorDialogo && cerrar ? <p role="alert" className="admin-aviso" data-tipo="error">{errorDialogo}</p> : null}
    </Confirmar>

    <Confirmar abierto={!!borrar} titulo="Eliminar registro" textoConfirmar="Eliminar definitivamente" peligro pendiente={ocupado}
      onConfirmar={() => borrar && confirmar(borrar.ruta, "DELETE")} onCancelar={cancelarDialogo}>
      <p>¿Confirmas el borrado físico de {borrar?.etiqueta}? Solo se permite si nunca tuvo relaciones ni historial.</p>
      {errorDialogo && borrar ? <p role="alert" className="admin-aviso" data-tipo="error">{errorDialogo}</p> : null}
    </Confirmar>
  </div>;
}

/**
 * Edición completa en un <dialog> modal nativo: atrapa el foco; Escape o
 * Cancelar cierran el diálogo (evento `close`) y el navegador devuelve el
 * foco al botón Editar de la fila. Los errores
 * de validación o de reglas de dominio se anuncian dentro del diálogo sin
 * perder lo escrito.
 */
function Editor({ edicion, error, ocupado, onGuardar, onCancelar, children }: { edicion: Edicion; error: string | null; ocupado: boolean; onGuardar: (f: HTMLFormElement) => void; onCancelar: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const d = ref.current; if (d && !d.open) d.showModal(); }, []);
  const tituloId = `editar-${edicion.tipo}-titulo`;
  return <dialog ref={ref} className="admin-dialogo" data-ancho="amplio" aria-labelledby={tituloId} onClose={onCancelar}>
    <h2 id={tituloId}>{edicion.titulo}</h2>
    <form className="admin-formulario admin-rejilla" onSubmit={(e) => { e.preventDefault(); onGuardar(e.currentTarget); }}>
      {children}
      {error ? <p role="alert" className="admin-aviso admin-campo-ancho" data-tipo="error">{error}</p> : null}
      <div className="admin-dialogo-acciones admin-campo-ancho">
        <button type="button" className="boton-pastilla" data-variante="secundario" onClick={() => ref.current?.close()} disabled={ocupado}>Cancelar</button>
        <button className="boton-pastilla" data-variante="primario" disabled={ocupado}>{ocupado ? "Guardando…" : "Guardar cambios"}</button>
      </div>
    </form>
  </dialog>;
}

function CamposEdicion({ edicion: { tipo, registro: r }, catalogo }: { edicion: Edicion; catalogo: Catalogo }) {
  switch (tipo) {
    case "anios-lectivos": return <CamposAnio registro={r} />;
    case "periodos": return <CamposPeriodo registro={r} catalogo={catalogo} />;
    case "areas": return <CamposArea registro={r} />;
    case "grados": return <CamposGrado registro={r} />;
    case "grupos": return <CamposGrupo registro={r} catalogo={catalogo} />;
    case "asignaturas": return <CamposAsignatura registro={r} catalogo={catalogo} />;
  }
}

const opciones = (items: Opcion[]) => items.map((o) => <option key={o.id} value={o.id}>{o.etiqueta}</option>);
/** Dato que no se edita (relación fija): visible y legible, pero no enviado. */
function Fijo({ etiqueta, valor, ayuda }: { etiqueta: string; valor: string; ayuda: string }) {
  return <div className="admin-campo"><span className="admin-etiqueta">{etiqueta}</span><strong className="admin-fijo">{valor}</strong><small className="admin-ayuda">{ayuda}</small></div>;
}

function CamposAnio({ registro: r }: { registro?: Registro }) {
  return <>
    {r ? <Fijo etiqueta="Año" valor={texto(r.anio)} ayuda="El número del año no cambia. El estado cambia con «Cerrar año»." />
      : <Campo etiqueta="Año"><input name="anio" type="number" min="2000" max="2100" inputMode="numeric" required /></Campo>}
    {r ? null : <Fijo etiqueta="Estado inicial" valor="Activo" ayuda="Se cierra después, desde la tabla, cuando sus períodos sumen 100 %." />}
    <Campo etiqueta="Fecha de inicio"><input name="fechaInicio" type="date" required defaultValue={fecha(r?.fechaInicio)} /></Campo>
    <Campo etiqueta="Fecha de fin"><input name="fechaFin" type="date" required defaultValue={fecha(r?.fechaFin)} /></Campo>
  </>;
}

function CamposPeriodo({ registro: r, catalogo }: { registro?: Registro; catalogo: Catalogo }) {
  return <>
    {r ? <Fijo etiqueta="Año lectivo" valor={texto(objeto(r.anioLectivo)?.anio)} ayuda="Un período no cambia de año." />
      : <Campo etiqueta="Año lectivo"><select name="anioLectivoId" required defaultValue=""><option value="">Selecciona</option>{opciones(catalogo.aniosEditables)}</select></Campo>}
    <Campo etiqueta="Nombre"><input name="nombre" maxLength={60} required defaultValue={texto(r?.nombre)} /></Campo>
    <Campo etiqueta="Orden"><input name="orden" type="number" min="1" required defaultValue={texto(r?.orden)} /></Campo>
    <Campo etiqueta="Ponderación (%)"><input name="ponderacion" type="number" min="0.01" max="100" step="0.01" required defaultValue={texto(r?.ponderacion)} /></Campo>
    <Campo etiqueta="Fecha de inicio"><input name="fechaInicio" type="date" required defaultValue={fecha(r?.fechaInicio)} /></Campo>
    <Campo etiqueta="Fecha de fin"><input name="fechaFin" type="date" required defaultValue={fecha(r?.fechaFin)} /></Campo>
  </>;
}

function CamposArea({ registro: r }: { registro?: Registro }) {
  return <>
    <Campo etiqueta="Nombre"><input name="nombre" maxLength={120} required defaultValue={texto(r?.nombre)} /></Campo>
    <Campo etiqueta="Tipo"><select name="tipo" defaultValue={texto(r?.tipo ?? "AREA")}>{Object.entries(TIPOS_AREA).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Campo>
    <Campo etiqueta="Idioma"><input name="idioma" maxLength={12} required defaultValue={texto(r?.idioma ?? "es")} /></Campo>
    <Campo etiqueta="Orden (opcional)"><input name="orden" type="number" min="0" defaultValue={texto(r?.orden)} /></Campo>
  </>;
}

function CamposGrado({ registro: r }: { registro?: Registro }) {
  return <>
    <Campo etiqueta="Nombre"><input name="nombre" maxLength={30} required defaultValue={texto(r?.nombre)} /></Campo>
    <Campo etiqueta="Nivel"><select name="nivel" defaultValue={texto(r?.nivel ?? "PRIMARIA")}>{Object.entries(NIVELES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Campo>
    <Campo etiqueta="Orden"><input name="orden" type="number" min="0" required defaultValue={texto(r?.orden)} /></Campo>
  </>;
}

function CamposGrupo({ registro: r, catalogo }: { registro?: Registro; catalogo: Catalogo }) {
  const director = objeto(r?.director);
  // Si el director actual ya no es docente activo se muestra igual, para no quitarlo sin querer.
  const ausente = director && !catalogo.docentes.some((d) => d.id === r?.directorId);
  return <>
    {r ? <><Fijo etiqueta="Año lectivo" valor={texto(objeto(r.anioLectivo)?.anio)} ayuda="El año de un grupo no cambia." /><Fijo etiqueta="Grado" valor={texto(objeto(r.grado)?.nombre)} ayuda="El grado de un grupo no cambia." /></>
      : <><Campo etiqueta="Año lectivo"><select name="anioLectivoId" required defaultValue=""><option value="">Selecciona</option>{opciones(catalogo.aniosEditables)}</select></Campo>
        <Campo etiqueta="Grado"><select name="gradoId" required defaultValue=""><option value="">Selecciona</option>{opciones(catalogo.grados)}</select></Campo></>}
    <Campo etiqueta="Identificador"><input name="identificador" placeholder="01" maxLength={4} required defaultValue={texto(r?.identificador)} /></Campo>
    <Campo etiqueta="Director de grupo"><select name="directorId" defaultValue={texto(r?.directorId)}>
      <option value="">Sin asignar</option>{opciones(catalogo.docentes)}
      {ausente ? <option value={texto(r?.directorId)}>{`${texto(director.nombres)} ${texto(director.apellidos)} (ya no es docente activo)`}</option> : null}
    </select></Campo>
  </>;
}

function CamposAsignatura({ registro: r, catalogo }: { registro?: Registro; catalogo: Catalogo }) {
  const actuales = new Map(((r?.grados as Array<Record<string, unknown>> | undefined) ?? []).map((h) => [texto(h.gradoId), h.intensidad]));
  return <>
    <Campo etiqueta="Nombre"><input name="nombre" maxLength={80} required defaultValue={texto(r?.nombre)} /></Campo>
    <Campo etiqueta="Área"><select name="areaId" required defaultValue={texto(r?.areaId)}><option value="">Selecciona</option>{opciones(catalogo.areas)}</select></Campo>
    <Campo etiqueta="Intensidad horaria semanal (opcional)"><input name="intensidadHoraria" type="number" min="1" max="40" defaultValue={texto(r?.intensidadHoraria)} /></Campo>
    <fieldset className="admin-opciones admin-campo-ancho">
      <legend>Grados habilitados</legend>
      {r ? <small className="admin-ayuda">Al guardar, los grados sin marcar quedan deshabilitados para esta asignatura.</small> : null}
      {catalogo.grados.length === 0 ? <small className="admin-ayuda">Crea primero los grados.</small> : null}
      {catalogo.grados.map((g) => <div className="admin-opcion-grado" key={g.id}>
        <label className="admin-opcion"><input type="checkbox" name="gradoId" value={g.id} defaultChecked={actuales.has(g.id)} /><span><strong>{g.etiqueta}</strong><small>Habilitar esta asignatura para el grado.</small></span></label>
        <label className="admin-campo">Horas por semana en {g.etiqueta} (opcional)<input name={campoIntensidad(g.id)} type="number" min="1" max="40" defaultValue={texto(actuales.get(g.id))} /></label>
      </div>)}
    </fieldset>
  </>;
}

/** Segmento de API de cada listado: el error de un alta se muestra en su propia sección. */
const TIPO_DE: Record<Clave, TipoApi> = { anios: "anios-lectivos", periodos: "periodos", areas: "areas", grados: "grados", grupos: "grupos", asignaturas: "asignaturas" };

function Seccion({ clave, titulo, nota, formulario, error, listado, filas, children }: { clave: Clave; titulo: string; nota: string; formulario: ReactNode; error: { tipo: TipoApi; mensaje: string } | null; listado: Listado; filas: number; children: ReactNode }) {
  return <section id={`estructura-${clave}`} className="admin-estructura" aria-labelledby={`estructura-${clave}-titulo`}>
    <div className="section-heading"><h2 id={`estructura-${clave}-titulo`}>{titulo}</h2>{listado.resumen}</div>
    <p className="admin-nota">{nota}</p>
    {formulario}
    {error?.tipo === TIPO_DE[clave] ? <p role="alert" className="admin-aviso" data-tipo="error">{error.mensaje}</p> : null}
    {listado.filtros}
    {filas > 0 ? children : listado.vacio}
    {listado.pie}
  </section>;
}
function Campo({ etiqueta, children }: { etiqueta: string; children: ReactNode }) { return <label className="admin-campo">{etiqueta}{children}</label>; }
function Guardar({ ocupado, texto }: { ocupado: boolean; texto: string }) { return <div className="admin-filtros-acciones"><button className="boton-pastilla" data-variante="primario" disabled={ocupado}>{ocupado ? "Guardando…" : texto}</button></div>; }
function Tabla({ titulo, encabezados, children }: { titulo: string; encabezados: string[]; children: ReactNode }) { return <div className="admin-tabla-marco"><table className="admin-tabla"><caption className="sr-only">{titulo}</caption><thead><tr>{encabezados.map((h) => <th key={h} scope="col">{h}</th>)}</tr></thead><tbody>{children}</tbody></table></div>; }
