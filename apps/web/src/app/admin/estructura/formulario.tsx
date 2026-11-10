"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Lock, Pencil, Trash2 } from "lucide-react";
import { AltaPlegable, Confirmar, llamarApi } from "@/app/admin/usuarios/comunes";
import { accionesAnio, anioCerrado, campoIntensidad, CUERPO_CIERRE, cuerpoFormulario, errorCuerpo, type Modo, type TipoApi } from "@/features/estructura-academica/edicion";

export type Clave = "anios" | "periodos" | "areas" | "grados" | "grupos" | "asignaturas";
export type Opcion = { id: string; etiqueta: string };
/** Partes del listado que arma el servidor: filtros (GET), contador, estado vacío y paginación. */
export type Listado = { filtros: ReactNode; resumen: ReactNode; vacio: ReactNode | null; pie: ReactNode };
type Registro = Record<string, unknown> & { id: string };
type Catalogo = { anios: Opcion[]; aniosEditables: Opcion[]; grados: Opcion[]; areas: Opcion[]; docentes: Opcion[] };
type Props = {
  /** Sección visible: el panel muestra una sola a la vez. */
  ver: Clave;
  registros: Registro[];
  /** Catálogos completos para los formularios de alta y edición (no dependen de la página ni de los filtros). */
  catalogo: Catalogo;
  listado: Listado;
};
type Edicion = { tipo: TipoApi; registro: Registro; titulo: string };
type Dato = { etiqueta: string; valor: ReactNode };
/** Lo que pinta una tarjeta de registro: título, estado opcional, datos y acciones. */
type Ficha = { id: string; titulo: string; insignia?: ReactNode; datos: Dato[]; etiqueta: string; acciones: { editar?: () => void; cerrar?: () => void; ruta?: string } };

const fecha = (v: unknown) => (v ? (typeof v === "string" ? v.slice(0, 10) : new Date(v as Date).toISOString().slice(0, 10)) : "");
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
/** Rango legible ("1 feb 2026 – 30 nov 2026"); la fecha se guarda como día civil. */
const vigencia = (inicio: unknown, fin: unknown) => {
  const f = (v: unknown) => { const [a, m, d] = fecha(v).split("-").map(Number); return a ? `${d} ${MESES[m - 1]} ${a}` : "Sin fecha"; };
  return `${f(inicio)} – ${f(fin)}`;
};
const texto = (v: unknown) => String(v ?? "");
const objeto = (v: unknown) => (v ?? undefined) as Record<string, unknown> | undefined;
const TIPOS_AREA: Record<string, string> = { AREA: "Área", DIMENSION: "Dimensión", ENFOQUE: "Enfoque" };
const NIVELES: Record<string, string> = { PREESCOLAR: "Preescolar", PRIMARIA: "Primaria", BACHILLERATO: "Bachillerato" };
const ESTADOS_ANIO: Record<string, string> = { ACTIVO: "Activo", CERRADO: "Cerrado" };
const nombreGrupo = (g: Registro) => texto(objeto(g.grado)?.nombre);

/** Textos de cada sección: título, regla de negocio y botón de alta. */
const SECCIONES: Record<Clave, { titulo: string; nota: string; nuevo: string; formulario: string }> = {
  anios: { titulo: "Años lectivos", nuevo: "Nuevo año lectivo", formulario: "Crear año lectivo", nota: "Solo puede haber un año activo. Todo año se crea activo; ciérralo desde su tarjeta cuando sus períodos sumen exactamente 100 %. Un año cerrado es de solo lectura." },
  periodos: { titulo: "Períodos", nuevo: "Nuevo período", formulario: "Crear período", nota: "Los períodos deben estar dentro del año, no pueden cruzarse y su ponderación anual no puede superar 100 %." },
  areas: { titulo: "Áreas", nuevo: "Nueva área", formulario: "Crear área", nota: "Las áreas agrupan asignaturas; no se eliminan si ya tienen relaciones." },
  grados: { titulo: "Grados", nuevo: "Nuevo grado", formulario: "Crear grado", nota: "Cada grado tiene un nivel educativo y orden curricular." },
  grupos: { titulo: "Grupos", nuevo: "Nuevo grupo", formulario: "Crear grupo", nota: "El director debe ser un docente activo. El año y el grado de un grupo no cambian después de crearlo. Los grupos de años cerrados son inmutables." },
  asignaturas: { titulo: "Asignaturas", nuevo: "Nueva asignatura", formulario: "Crear asignatura", nota: "Habilita la asignatura para los grados donde se dicta, con su intensidad semanal opcional. No se elimina si ya tiene relaciones." },
};
/** Segmento de API de cada sección. */
const TIPO_DE: Record<Clave, TipoApi> = { anios: "anios-lectivos", periodos: "periodos", areas: "areas", grados: "grados", grupos: "grupos", asignaturas: "asignaturas" };

export function FormularioEstructura({ ver, registros, catalogo, listado }: Props) {
  const [aviso, setAviso] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [edicion, setEdicion] = useState<Edicion | null>(null);
  const [errorEdicion, setErrorEdicion] = useState<string | null>(null);
  const [borrar, setBorrar] = useState<{ ruta: string; etiqueta: string } | null>(null);
  const [cerrar, setCerrar] = useState<Registro | null>(null);
  const [errorDialogo, setErrorDialogo] = useState<string | null>(null);
  const tipo = TIPO_DE[ver];
  const seccion = SECCIONES[ver];

  /** Envía un formulario de alta o edición; los errores de esquema o dominio se muestran sin perder lo escrito. */
  async function guardar(modo: Modo, f: HTMLFormElement, registro?: Registro, tipoApi: TipoApi = tipo) {
    const mostrar = (mensaje: string | null) => (modo === "crear" ? setAviso(mensaje) : setErrorEdicion(mensaje));
    const cuerpo = cuerpoFormulario(tipoApi, new FormData(f), modo, registro);
    const invalido = errorCuerpo(tipoApi, modo, cuerpo);
    if (invalido) { mostrar(invalido); return; }
    setOcupado(true); mostrar(null);
    const r = await llamarApi(registro ? `/api/${tipoApi}/${registro.id}` : `/api/${tipoApi}`, registro ? "PATCH" : "POST", cuerpo);
    setOcupado(false);
    if (!r.ok) { mostrar(r.mensaje); return; }
    window.location.reload();
  }

  const abrirEdicion = (registro: Registro, titulo: string) => { setErrorEdicion(null); setEdicion({ tipo, registro, titulo }); };

  async function confirmar(ruta: string, metodo: "DELETE" | "PATCH", cuerpo?: unknown) {
    setOcupado(true); setErrorDialogo(null);
    const r = await llamarApi(ruta, metodo, cuerpo);
    setOcupado(false);
    if (!r.ok) { setErrorDialogo(r.mensaje); return; }
    window.location.reload();
  }
  const cancelarDialogo = () => { setBorrar(null); setCerrar(null); setErrorDialogo(null); };

  const fichas: Ficha[] = registros.map((r) => fichaDe(ver, r, abrirEdicion, setCerrar));

  return <section id={`estructura-${ver}`} className="config-seccion" aria-labelledby={`estructura-${ver}-titulo`}>
    <div className="config-seccion-cabeza">
      <div>
        <h2 id={`estructura-${ver}-titulo`}>{seccion.titulo}</h2>
        <p className="config-seccion-resumen">{listado.resumen}</p>
      </div>
    </div>
    <p className="config-seccion-nota">{seccion.nota}</p>

    <AltaPlegable key={ver} texto={seccion.nuevo} abiertoInicial={registros.length === 0}>
      <form onSubmit={(e) => { e.preventDefault(); void guardar("crear", e.currentTarget); }} className="admin-formulario admin-rejilla" aria-label={seccion.formulario}>
        <CamposAlta ver={ver} catalogo={catalogo} />
        {aviso ? <p role="alert" className="admin-aviso admin-campo-ancho" data-tipo="error">{aviso}</p> : null}
        <Guardar ocupado={ocupado} texto={seccion.formulario} />
      </form>
    </AltaPlegable>

    {listado.filtros}
    {fichas.length > 0 ? <ul className="config-fichas" aria-label={seccion.titulo}>
      {fichas.map((f) => <li key={f.id} className="config-ficha">
        <div className="config-ficha-cabeza"><h3>{f.titulo}</h3>{f.insignia}</div>
        {f.datos.length ? <dl className="config-ficha-datos">{f.datos.map((d) => <div key={d.etiqueta}><dt>{d.etiqueta}</dt><dd>{d.valor}</dd></div>)}</dl> : null}
        <Acciones etiqueta={f.etiqueta} a={f.acciones} onBorrar={(ruta) => { setErrorDialogo(null); setBorrar({ ruta, etiqueta: f.etiqueta }); }} onCerrar={() => setErrorDialogo(null)} />
      </li>)}
    </ul> : listado.vacio}
    {listado.pie}

    {edicion ? <Editor key={`${edicion.tipo}-${edicion.registro.id}`} edicion={edicion} error={errorEdicion} ocupado={ocupado}
      onGuardar={(f) => guardar("editar", f, edicion.registro, edicion.tipo)} onCancelar={() => { setEdicion(null); setErrorEdicion(null); }}>
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
  </section>;
}

/** Datos y acciones de la tarjeta de cada registro, según la sección. */
function fichaDe(ver: Clave, r: Registro, editar: (r: Registro, titulo: string) => void, cerrar: (r: Registro) => void): Ficha {
  switch (ver) {
    case "anios": {
      const permitido = accionesAnio(r.estado); const estado = texto(r.estado);
      return { id: r.id, titulo: texto(r.anio), etiqueta: `el año ${texto(r.anio)}`,
        insignia: <span className="admin-estado" data-estado={estado}>{ESTADOS_ANIO[estado] ?? estado}</span>,
        datos: [{ etiqueta: "Vigencia", valor: vigencia(r.fechaInicio, r.fechaFin) }],
        acciones: { editar: permitido.editar ? () => editar(r, `Editar año lectivo ${texto(r.anio)}`) : undefined, cerrar: permitido.cerrar ? () => cerrar(r) : undefined, ruta: permitido.eliminar ? `/api/anios-lectivos/${r.id}` : undefined } };
    }
    case "periodos": {
      const anio = objeto(r.anioLectivo);
      return { id: r.id, titulo: texto(r.nombre), etiqueta: `el período ${texto(r.nombre)} de ${texto(anio?.anio)}`,
        insignia: <span className="config-insignia">{texto(r.ponderacion)} %</span>,
        datos: [{ etiqueta: "Año", valor: texto(anio?.anio ?? r.anioLectivoId) }, { etiqueta: "Orden", valor: texto(r.orden) }, { etiqueta: "Fechas", valor: vigencia(r.fechaInicio, r.fechaFin) }],
        acciones: anioCerrado(anio) ? {} : { editar: () => editar(r, `Editar período ${texto(r.nombre)} (${texto(anio?.anio)})`), ruta: `/api/periodos/${r.id}` } };
    }
    case "areas":
      return { id: r.id, titulo: texto(r.nombre), etiqueta: `el área ${texto(r.nombre)}`,
        insignia: <span className="config-insignia">{TIPOS_AREA[texto(r.tipo)] ?? texto(r.tipo)}</span>,
        datos: [{ etiqueta: "Idioma", valor: texto(r.idioma) }, { etiqueta: "Orden", valor: r.orden === null || r.orden === undefined ? "Sin orden" : texto(r.orden) }],
        acciones: { editar: () => editar(r, `Editar área ${texto(r.nombre)}`), ruta: `/api/areas/${r.id}` } };
    case "grados":
      return { id: r.id, titulo: texto(r.nombre), etiqueta: `el grado ${texto(r.nombre)}`,
        insignia: <span className="config-insignia">{NIVELES[texto(r.nivel)] ?? texto(r.nivel)}</span>,
        datos: [{ etiqueta: "Orden", valor: texto(r.orden) }],
        acciones: { editar: () => editar(r, `Editar grado ${texto(r.nombre)}`), ruta: `/api/grados/${r.id}` } };
    case "grupos": {
      const director = objeto(r.director); const anio = objeto(r.anioLectivo);
      return { id: r.id, titulo: nombreGrupo(r), etiqueta: `el grupo ${nombreGrupo(r)} de ${texto(anio?.anio)}`,
        insignia: <span className="config-insignia">{texto(anio?.anio)}</span>,
        datos: [{ etiqueta: "Director", valor: director ? `${texto(director.nombres)} ${texto(director.apellidos)}` : <span className="config-falta">Sin asignar</span> }],
        acciones: anioCerrado(anio) ? {} : { editar: () => editar(r, `Editar grupo ${nombreGrupo(r)} (${texto(anio?.anio)})`), ruta: `/api/grupos/${r.id}` } };
    }
    case "asignaturas": {
      const habilitados = (r.grados as Array<Record<string, unknown>> | undefined) ?? [];
      return { id: r.id, titulo: texto(r.nombre), etiqueta: `la asignatura ${texto(r.nombre)}`,
        insignia: <span className="config-insignia">{texto(objeto(r.area)?.nombre)}</span>,
        datos: [
          { etiqueta: "Intensidad", valor: r.intensidadHoraria ? `${texto(r.intensidadHoraria)} h/semana` : "Sin definir" },
          { etiqueta: "Grados", valor: habilitados.length
            ? <span className="config-chips">{habilitados.map((h, i) => <span key={`${texto(h.gradoId)}-${i}`} className="config-chip">{texto(objeto(h.grado)?.nombre)}{h.intensidad ? ` · ${texto(h.intensidad)} h` : ""}</span>)}</span>
            : <span className="config-falta">Sin habilitar</span> },
        ],
        acciones: { editar: () => editar(r, `Editar asignatura ${texto(r.nombre)}`), ruta: `/api/asignaturas/${r.id}` } };
    }
  }
}

/** Acciones al pie de la tarjeta; sin ninguna, la tarjeta es de solo lectura (año cerrado). */
function Acciones({ etiqueta, a, onBorrar, onCerrar }: { etiqueta: string; a: Ficha["acciones"]; onBorrar: (ruta: string) => void; onCerrar: () => void }) {
  if (!a.editar && !a.cerrar && !a.ruta) return <p className="config-ficha-acciones config-solo-lectura"><Lock size={16} aria-hidden="true" /> Solo lectura (año cerrado)</p>;
  return <div className="config-ficha-acciones">
    {a.editar ? <button type="button" className="config-accion" onClick={a.editar}><Pencil size={16} aria-hidden="true" /> Editar<span className="sr-only"> {etiqueta}</span></button> : null}
    {a.cerrar ? <button type="button" className="config-accion" onClick={() => { onCerrar(); a.cerrar!(); }}><Lock size={16} aria-hidden="true" /> Cerrar año<span className="sr-only"> {etiqueta}</span></button> : null}
    {a.ruta ? <button type="button" className="config-accion" data-tono="peligro" onClick={() => onBorrar(a.ruta!)}><Trash2 size={16} aria-hidden="true" /> Eliminar<span className="sr-only"> {etiqueta}</span></button> : null}
  </div>;
}

function CamposAlta({ ver, catalogo }: { ver: Clave; catalogo: Catalogo }) {
  switch (ver) {
    case "anios": return <CamposAnio />;
    case "periodos": return <CamposPeriodo catalogo={catalogo} />;
    case "areas": return <CamposArea />;
    case "grados": return <CamposGrado />;
    case "grupos": return <CamposGrupo catalogo={catalogo} />;
    case "asignaturas": return <CamposAsignatura catalogo={catalogo} />;
  }
}

/**
 * Edición completa en un <dialog> modal nativo: atrapa el foco; Escape o
 * Cancelar cierran el diálogo (evento `close`) y el navegador devuelve el
 * foco al botón Editar de la tarjeta. Los errores
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
    {r ? null : <Fijo etiqueta="Estado inicial" valor="Activo" ayuda="Se cierra después, desde su tarjeta, cuando sus períodos sumen 100 %." />}
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

function Campo({ etiqueta, children }: { etiqueta: string; children: ReactNode }) { return <label className="admin-campo">{etiqueta}{children}</label>; }
function Guardar({ ocupado, texto }: { ocupado: boolean; texto: string }) { return <div className="admin-filtros-acciones"><button className="boton-pastilla" data-variante="primario" disabled={ocupado}>{ocupado ? "Guardando…" : texto}</button></div>; }
