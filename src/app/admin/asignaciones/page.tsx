import type { Metadata } from "next";
import Link from "next/link";
import { Cabecera, Marco } from "@/components/friso/marco";
import { db } from "@/server/db";
import { exigirRolPagina } from "@/server/pagina";
import { esquemasAcademico, servicioAcademico } from "@/server/modules/academico";
import { FormularioAsignaciones } from "./formulario";

export const metadata: Metadata = { title: "Asignaciones · Administración MIDUHO" };
type Busqueda = Record<string, string | string[] | undefined>;
const valor = (v: string | string[] | undefined) => typeof v === "string" ? v : "";

export default async function PaginaAsignaciones({ searchParams }: { searchParams: Promise<Busqueda> }) {
  await exigirRolPagina(["ADMIN"], "/admin/asignaciones");
  const sp = await searchParams;
  const entrada = esquemasAcademico.filtroAsignacionesDocente.safeParse({ q: valor(sp.q), docenteId: valor(sp.docenteId), grupoId: valor(sp.grupoId), anioLectivoId: valor(sp.anioLectivoId), estado: valor(sp.estado), page: valor(sp.page) || "1", pageSize: "20" });
  const filtros = entrada.success ? entrada.data : esquemasAcademico.filtroAsignacionesDocente.parse({});
  const [resultado, catalogo, grupos, asignaturas] = await Promise.all([
    servicioAcademico.asignacionesDocente.listar(filtros), servicioAcademico.opciones(),
    db.grupo.findMany({ include: { grado: true, anioLectivo: true }, orderBy: [{ anioLectivo: { anio: "desc" } }, { grado: { orden: "asc" } }, { identificador: "asc" }] }),
    db.asignatura.findMany({ include: { area: true }, orderBy: { nombre: "asc" } }),
  ]);
  const query = (page: number) => { const p = new URLSearchParams(); for (const k of ["q", "docenteId", "grupoId", "anioLectivoId", "estado"]) { const v = valor(sp[k]); if (v) p.set(k, v); } p.set("page", String(page)); return `?${p}`; };
  const paginas = Math.max(1, Math.ceil(resultado.total / filtros.pageSize));
  const plano = JSON.parse(JSON.stringify(resultado.data));
  const docentes = catalogo.docentes.map((d) => ({ id: d.id, etiqueta: `${d.nombres} ${d.apellidos}` }));
  const opcionesGrupo = grupos.map((g) => ({ id: g.id, anioLectivoId: g.anioLectivoId, etiqueta: `${g.grado.nombre}-${g.identificador} · ${g.anioLectivo.anio}${g.anioLectivo.estado === "CERRADO" ? " (cerrado)" : ""}` }));
  const opcionesAnio = catalogo.anios.filter((a) => a.estado !== "CERRADO").map((a) => ({ id: a.id, etiqueta: String(a.anio) }));

  return <Marco><Cabecera kicker="Administración" titulo="Asignaciones docentes" nota="Administra la carga docente y sus bloques horarios. Los datos de prueba de MIDUHO son ficticios." />
    <form method="get" className="admin-filtros asignaciones-filtros" role="search" aria-label="Buscar y filtrar asignaciones">
      <label className="admin-campo admin-campo-ancho">Buscar<input name="q" type="search" defaultValue={valor(sp.q)} placeholder="Docente, asignatura o grupo" maxLength={120} /></label>
      <label className="admin-campo">Docente<select name="docenteId" defaultValue={valor(sp.docenteId)}><option value="">Todos</option>{docentes.map((o) => <option key={o.id} value={o.id}>{o.etiqueta}</option>)}</select></label>
      <label className="admin-campo">Grupo<select name="grupoId" defaultValue={valor(sp.grupoId)}><option value="">Todos</option>{opcionesGrupo.map((o) => <option key={o.id} value={o.id}>{o.etiqueta}</option>)}</select></label>
      <label className="admin-campo">Año<select name="anioLectivoId" defaultValue={valor(sp.anioLectivoId)}><option value="">Todos</option>{catalogo.anios.map((a) => <option key={a.id} value={a.id}>{a.anio}</option>)}</select></label>
      <label className="admin-campo">Estado<select name="estado" defaultValue={valor(sp.estado)}><option value="">Todos</option><option value="ACTIVA">Activas</option><option value="INACTIVA">Inactivas</option></select></label>
      <div className="admin-filtros-acciones"><button className="boton-pastilla" data-variante="primario">Aplicar</button><Link href="/admin/asignaciones" className="boton-pastilla" data-variante="secundario">Limpiar</Link></div>
      {!entrada.success ? <p role="alert" className="admin-aviso admin-campo-ancho" data-tipo="error">Los filtros no son válidos; se muestra el listado completo.</p> : null}
    </form>
    <FormularioAsignaciones asignaciones={plano} docentes={docentes} grupos={opcionesGrupo} asignaturas={asignaturas.map((a) => ({ id: a.id, etiqueta: `${a.nombre} · ${a.area.nombre}` }))} anios={opcionesAnio} />
    {paginas > 1 ? <nav className="admin-paginacion" aria-label="Paginación de asignaciones">{filtros.page > 1 ? <Link className="boton-pastilla" data-variante="secundario" href={query(filtros.page - 1)}>Anterior</Link> : <span />}<span>Página {Math.min(filtros.page, paginas)} de {paginas} · {resultado.total} resultados</span>{filtros.page < paginas ? <Link className="boton-pastilla" data-variante="secundario" href={query(filtros.page + 1)}>Siguiente</Link> : <span />}</nav> : null}
  </Marco>;
}
