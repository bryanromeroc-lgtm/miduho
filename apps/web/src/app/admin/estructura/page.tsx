import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { BookOpen, CalendarRange, ChartPie, ChevronLeft, ChevronRight, GraduationCap, Search, Shapes, UsersRound, type LucideIcon } from "lucide-react";
import { Cabecera, Marco } from "@/components/friso/marco";
import { FormularioEstructura, type Listado, type Opcion } from "./formulario";
import { enlace, enlaceSeccion, hayFiltros, leerConsulta, leerVer, nombreParametro, parametros, rango, RELACIONES, type Clave, type Filtros } from "@/features/estructura-academica/consulta";
import { pasosEstructura, TEXTO_ESTADO } from "@/features/estructura-academica/pasos";
import { exigirRolPagina } from "@/server/pagina";
import { servicioAcademico } from "@/server/modules/academico";
import { conteosEstructura } from "@/server/modules/academico/resumen";

export const metadata: Metadata = { title: "Estructura académica · Administración MIDUHO" };

type Busqueda = Record<string, string | string[] | undefined>;

const plano = <T,>(valor: T): T => JSON.parse(JSON.stringify(valor)) as T;

/** Textos por listado: nombre en plural, ayuda de la búsqueda y estado vacío. */
const TEXTOS: Record<Clave, { plural: string; buscar: string; ayuda: string; vacio: string; filtrado: string; todos: string }> = {
  anios: { plural: "años lectivos", buscar: "Año", ayuda: "Escribe el año con cuatro cifras (ej. 2026).", vacio: "Todavía no hay años lectivos. Crea el primero con el formulario.", filtrado: "Ningún año lectivo coincide con la búsqueda.", todos: "Ver todos los años lectivos" },
  periodos: { plural: "períodos", buscar: "Nombre del período", ayuda: "Busca por el nombre del período.", vacio: "Todavía no hay períodos configurados.", filtrado: "Ningún período coincide con la búsqueda o los filtros.", todos: "Ver todos los períodos" },
  areas: { plural: "áreas", buscar: "Nombre del área", ayuda: "Busca por el nombre del área.", vacio: "Todavía no hay áreas registradas.", filtrado: "Ninguna área coincide con la búsqueda.", todos: "Ver todas las áreas" },
  grados: { plural: "grados", buscar: "Nombre del grado", ayuda: "Busca por el nombre del grado (ej. 3°).", vacio: "Todavía no hay grados registrados.", filtrado: "Ningún grado coincide con la búsqueda.", todos: "Ver todos los grados" },
  grupos: { plural: "grupos", buscar: "Grupo", ayuda: "Busca por grado (ej. 1°). Cada grado tiene un solo grupo.", vacio: "Todavía no hay grupos registrados.", filtrado: "Ningún grupo coincide con la búsqueda o los filtros.", todos: "Ver todos los grupos" },
  asignaturas: { plural: "asignaturas", buscar: "Asignatura o área", ayuda: "Busca por el nombre de la asignatura o de su área.", vacio: "Todavía no hay asignaturas registradas.", filtrado: "Ninguna asignatura coincide con la búsqueda o los filtros.", todos: "Ver todas las asignaturas" },
};
const ETIQUETA_RELACION = { anioLectivoId: "Año lectivo", gradoId: "Grado", areaId: "Área" } as const;
const ICONO_PASO: Record<Clave, LucideIcon> = { anios: CalendarRange, periodos: ChartPie, areas: Shapes, grados: GraduationCap, grupos: UsersRound, asignaturas: BookOpen };

/**
 * Panel ADMIN de estructura académica: una ruta de seis tarjetas (una por
 * entidad, en orden de configuración) y debajo solo la sección elegida
 * (`?ver=`), con búsqueda, filtros y paginación SSR en la URL (§7, §11).
 */
export default async function PaginaEstructura({ searchParams }: { searchParams: Promise<Busqueda> }) {
  await exigirRolPagina(["ADMIN"], "/admin/estructura");
  const [sp, catalogo, conteos] = await Promise.all([searchParams, servicioAcademico.opciones(), conteosEstructura()]);
  const ver = leerVer(sp);
  const { filtros, errores } = leerConsulta(sp, {
    anios: new Set(catalogo.anios.map((a) => a.id)),
    grados: new Set(catalogo.grados.map((g) => g.id)),
    areas: new Set(catalogo.areas.map((a) => a.id)),
  });

  const [anios, periodos, areas, grados, grupos, asignaturas] = await Promise.all([
    servicioAcademico.aniosLectivos.listar(filtros.anios),
    servicioAcademico.periodos.listar(filtros.periodos),
    servicioAcademico.areas.listar(filtros.areas),
    servicioAcademico.grados.listar(filtros.grados),
    servicioAcademico.grupos.listar(filtros.grupos),
    servicioAcademico.asignaturas.listar(filtros.asignaturas),
  ]);

  const opciones = {
    anios: catalogo.anios.map((a) => ({ id: a.id, etiqueta: a.estado === "CERRADO" ? `${a.anio} (cerrado)` : String(a.anio) })),
    // Altas de períodos y grupos: un año cerrado es de solo lectura (RN-52), no se ofrece.
    aniosEditables: catalogo.anios.filter((a) => a.estado !== "CERRADO").map((a) => ({ id: a.id, etiqueta: String(a.anio) })),
    grados: catalogo.grados.map((g) => ({ id: g.id, etiqueta: g.nombre })),
    areas: catalogo.areas.map((a) => ({ id: a.id, etiqueta: a.nombre })),
    docentes: catalogo.docentes.map((d) => ({ id: d.id, etiqueta: `${d.nombres} ${d.apellidos}` })),
  };
  const opcionesRelacion = { anioLectivoId: opciones.anios, gradoId: opciones.grados, areaId: opciones.areas };

  const totales: Record<Clave, { total: number; filas: number }> = {
    anios: { total: anios.total, filas: anios.data.length },
    periodos: { total: periodos.total, filas: periodos.data.length },
    areas: { total: areas.total, filas: areas.data.length },
    grados: { total: grados.total, filas: grados.data.length },
    grupos: { total: grupos.total, filas: grupos.data.length },
    asignaturas: { total: asignaturas.total, filas: asignaturas.data.length },
  };

  const listado = (clave: Clave): Listado => {
    const f = filtros[clave] as Filtros[Clave] & Record<string, unknown>;
    const { total } = totales[clave];
    const r = rango(total, f);
    const t = TEXTOS[clave];
    const filtrado = hayFiltros(filtros, clave);
    const resumen: ReactNode = <span role="status">
      {total === 0 ? "Sin resultados" : r.fuera ? `Página ${f.page} sin resultados · ${total} en total` : `${r.desde}–${r.hasta} de ${total}`}
    </span>;
    const filtrosForm: ReactNode = <>
      <form method="get" action={`/admin/estructura#estructura-${clave}`} className="admin-filtros" role="search" aria-label={`Buscar y filtrar ${t.plural}`}>
        <input type="hidden" name="ver" value={clave} />
        {parametros(filtros, clave).map(([n, v]) => <input key={n} type="hidden" name={n} value={v} />)}
        <div className="admin-campo admin-campo-ancho">
          <label htmlFor={`f-${clave}-q`}>Buscar {t.plural}</label>
          <input id={`f-${clave}-q`} name={nombreParametro(clave, "q")} type="search" defaultValue={f.q === undefined ? "" : String(f.q)} placeholder={t.buscar} maxLength={120} inputMode={clave === "anios" ? "numeric" : undefined} aria-describedby={`f-${clave}-ayuda`} />
          <small id={`f-${clave}-ayuda`} className="admin-ayuda">{t.ayuda}</small>
        </div>
        {RELACIONES[clave].map((rel) => <div className="admin-campo" key={rel}>
          <label htmlFor={`f-${clave}-${rel}`}>{ETIQUETA_RELACION[rel]}</label>
          <select id={`f-${clave}-${rel}`} name={nombreParametro(clave, rel)} defaultValue={typeof f[rel] === "string" ? (f[rel] as string) : ""}>
            <option value="">Todos</option>
            {opcionesRelacion[rel].map((o: Opcion) => <option key={o.id} value={o.id}>{o.etiqueta}</option>)}
          </select>
        </div>)}
        <div className="admin-filtros-acciones">
          <button type="submit" className="boton-pastilla" data-variante="primario"><Search size={18} aria-hidden="true" /> Aplicar<span className="sr-only"> a {t.plural}</span></button>
          {filtrado ? <Link href={enlace(filtros, clave, 1, true)} className="boton-pastilla" data-variante="secundario">Limpiar<span className="sr-only"> filtros de {t.plural}</span></Link> : null}
        </div>
      </form>
      {errores[clave] ? <p role="alert" className="admin-aviso" data-tipo="error">{errores[clave]}</p> : null}
    </>;
    const vacio: ReactNode = <div className="admin-vacio">
      {r.fuera ? <><p>Esta página no tiene {t.plural}.</p><Link href={enlace(filtros, clave, 1)} className="acceso-enlace">Ir a la primera página de {t.plural}</Link></>
        : filtrado ? <><p>{t.filtrado}</p><Link href={enlace(filtros, clave, 1, true)} className="acceso-enlace">{t.todos}</Link></>
          : <p>{t.vacio}</p>}
    </div>;
    const pie: ReactNode = r.paginas > 1 ? <Paginacion><nav className="admin-paginacion" aria-label={`Paginación de ${t.plural}`}>
      {f.page > 1 ? <Link key="ant" href={enlace(filtros, clave, Math.min(f.page - 1, r.paginas))} className="boton-pastilla" data-variante="secundario" rel="prev"><ChevronLeft size={18} aria-hidden="true" /> Anterior<span className="sr-only">: {t.plural}</span></Link> : <span key="ant" />}
      <span key="pag">Página {Math.min(f.page, r.paginas)} de {r.paginas}</span>
      {f.page < r.paginas ? <Link key="sig" href={enlace(filtros, clave, f.page + 1)} className="boton-pastilla" data-variante="secundario" rel="next">Siguiente<span className="sr-only">: {t.plural}</span> <ChevronRight size={18} aria-hidden="true" /></Link> : <span key="sig" />}
    </nav></Paginacion> : null;
    return { filtros: filtrosForm, resumen, vacio, pie };
  };

  const registros = { anios: anios.data, periodos: periodos.data, areas: areas.data, grados: grados.data, grupos: grupos.data, asignaturas: asignaturas.data }[ver];
  const pasos = pasosEstructura(conteos);

  return <Marco><Cabecera kicker="Administración" titulo="Estructura académica" nota="Configura el colegio paso a paso. Elige una tarjeta para ver y editar sus registros." />
    <nav className="config-ruta" aria-label="Ruta de configuración">
      <ol>{pasos.map((p, i) => {
        const Icono = ICONO_PASO[p.clave]; const actual = p.clave === ver;
        return <li key={p.clave}>
          <Link href={enlaceSeccion(filtros, p.clave)} scroll={false} className="config-paso" data-estado={p.estado} aria-current={actual ? "page" : undefined}>
            <span className="config-paso-cabeza">
              <span className="config-paso-icono" aria-hidden="true"><Icono size={22} strokeWidth={2.2} /></span>
              <span className="config-paso-orden">Paso {i + 1}</span>
              <span className="config-paso-estado" data-estado={p.estado}>{TEXTO_ESTADO[p.estado]}</span>
            </span>
            <strong className="config-paso-titulo">{p.titulo}</strong>
            <span className="config-paso-cifra">{p.cifra}</span>
            <span className="config-paso-detalle">{p.detalle}</span>
          </Link>
        </li>;
      })}</ol>
    </nav>
    <FormularioEstructura ver={ver} registros={plano(registros)} catalogo={opciones} listado={listado(ver)} />
  </Marco>;
}

/** Envoltura de servidor: entrega la paginación al componente cliente como un único hijo resuelto. */
function Paginacion({ children }: { children: ReactNode }) { return <>{children}</>; }
