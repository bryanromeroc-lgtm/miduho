import type { Metadata } from "next";
import Link from "next/link";
import { Cabecera, Marco } from "@/components/friso/marco";
import { etiquetaGrupo } from "@/lib/navegacion";
import { db } from "@/server/db";
import { esquemasUsuarios as E, servicioUsuarios } from "@/server/modules/usuarios";
import { exigirRolPagina } from "@/server/pagina";
import { FormularioAsociaciones } from "./formulario";

export const metadata: Metadata = { title: "Estudiantes y grupos · Administración MIDUHO" };
type Busqueda = Record<string, string | string[] | undefined>;
const valor = (v: string | string[] | undefined) => (typeof v === "string" ? v : "");
const CLAVES = ["q", "anioLectivoId", "grupoId", "situacion", "estado"] as const;

/** ADMIN: asignar y trasladar estudiantes entre grupos con historial (INC1R-09, §6 y §11). */
export default async function PaginaEstudiantesGrupos({ searchParams }: { searchParams: Promise<Busqueda> }) {
  await exigirRolPagina(["ADMIN"], "/admin/estudiantes");
  const sp = await searchParams;
  const entrada = E.filtroAsociaciones.safeParse({ ...Object.fromEntries(CLAVES.map((k) => [k, valor(sp[k])])), page: valor(sp.page) || "1" });
  const filtros = entrada.success ? entrada.data : E.filtroAsociaciones.parse({});
  const [resultado, anios, grupos] = await Promise.all([
    servicioUsuarios.listarAsociaciones(filtros).catch(() => servicioUsuarios.listarAsociaciones(E.filtroAsociaciones.parse({}))),
    db.anioLectivo.findMany({ select: { id: true, anio: true, estado: true }, orderBy: { anio: "desc" } }),
    db.grupo.findMany({ include: { grado: true, anioLectivo: true }, orderBy: [{ anioLectivo: { anio: "desc" } }, { grado: { orden: "asc" } }, { identificador: "asc" }] }),
  ]);
  const anio = resultado.anio;
  const gruposDelAnio = grupos.filter((g) => g.anioLectivoId === anio?.id).map((g) => ({ id: g.id, etiqueta: etiquetaGrupo(g.grado.nombre, g.identificador) }));
  const paginas = Math.max(1, Math.ceil(resultado.total / filtros.pageSize));
  const query = (page: number) => {
    const p = new URLSearchParams();
    for (const k of CLAVES) { const v = valor(sp[k]); if (v) p.set(k, v); }
    p.set("page", String(page));
    return `?${p}`;
  };
  const plano = JSON.parse(JSON.stringify(resultado.data));

  return <Marco><Cabecera kicker="Administración" titulo="Estudiantes y grupos" nota="Asigna o traslada estudiantes. Cada estudiante tiene un solo grupo activo por año y el historial se conserva. Los datos de prueba de MIDUHO son ficticios." />
    <form method="get" className="admin-filtros asignaciones-filtros" role="search" aria-label="Buscar y filtrar estudiantes">
      <label className="admin-campo admin-campo-ancho">Buscar<input name="q" type="search" defaultValue={valor(sp.q)} placeholder="Nombre o correo" maxLength={120} /></label>
      <label className="admin-campo">Año<select name="anioLectivoId" defaultValue={anio?.id ?? ""}>{anios.map((a) => <option key={a.id} value={a.id}>{a.anio}{a.estado === "CERRADO" ? " (cerrado)" : ""}</option>)}</select></label>
      <label className="admin-campo">Grupo<select name="grupoId" defaultValue={valor(sp.grupoId)}><option value="">Todos</option>{gruposDelAnio.map((g) => <option key={g.id} value={g.id}>{g.etiqueta}</option>)}</select></label>
      <label className="admin-campo">Situación<select name="situacion" defaultValue={valor(sp.situacion)}><option value="">Todas</option><option value="CON_GRUPO">Con grupo</option><option value="SIN_GRUPO">Sin grupo</option></select></label>
      <label className="admin-campo">Estado<select name="estado" defaultValue={valor(sp.estado)}><option value="">Todos</option><option value="ACTIVO">Activo</option><option value="INACTIVO">Inactivo</option></select></label>
      <div className="admin-filtros-acciones"><button className="boton-pastilla" data-variante="primario">Aplicar</button><Link href="/admin/estudiantes" className="boton-pastilla" data-variante="secundario">Limpiar</Link></div>
      {!entrada.success ? <p role="alert" className="admin-aviso admin-campo-ancho" data-tipo="error">Los filtros no son válidos; se muestra el listado del año activo.</p> : null}
    </form>
    {anio ? <FormularioAsociaciones estudiantes={plano} grupos={gruposDelAnio} anio={anio} />
      : <div className="admin-vacio"><p>No hay un año lectivo activo. Créalo en Estructura para asociar estudiantes.</p></div>}
    {paginas > 1 ? <nav className="admin-paginacion" aria-label="Paginación de estudiantes">{filtros.page > 1 ? <Link className="boton-pastilla" data-variante="secundario" href={query(filtros.page - 1)}>Anterior</Link> : <span />}<span>Página {Math.min(filtros.page, paginas)} de {paginas} · {resultado.total} resultados</span>{filtros.page < paginas ? <Link className="boton-pastilla" data-variante="secundario" href={query(filtros.page + 1)}>Siguiente</Link> : <span />}</nav> : null}
  </Marco>;
}
