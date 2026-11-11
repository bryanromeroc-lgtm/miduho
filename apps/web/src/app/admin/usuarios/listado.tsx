import Link from "next/link";
import { ChevronLeft, ChevronRight, Search, Upload, UserPlus, UsersRound } from "lucide-react";
import { Cabecera, Migas } from "@/components/friso/marco";
import { ETIQUETA_COMBINACION, ETIQUETA_ESTADO, ESTADOS } from "@/lib/usuarios";
import { esquemasUsuarios as E, servicioUsuarios } from "@/server/modules/usuarios";

export type TipoCuentas = "estudiantes" | "docentes";
type Busqueda = Record<string, string | string[] | undefined>;

const primero = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

const TEXTOS = {
  estudiantes: {
    titulo: "Estudiantes",
    rol: "ESTUDIANTE",
    nota: "Cuentas, grupos y contraseñas de los estudiantes. Desactivar conserva el historial: ninguna cuenta se elimina.",
    nueva: "Nuevo estudiante",
    singular: "estudiante",
    plural: "estudiantes",
  },
  docentes: {
    titulo: "Docentes",
    rol: "DOCENTE",
    nota: "Cuentas de las docentes y los docentes. Su carga por asignatura y grupo se define en Coordinación › Asignaciones.",
    nueva: "Nuevo docente",
    singular: "docente",
    plural: "docentes",
  },
} as const;

/**
 * Listado ADMIN de un tipo de cuenta (estudiantes o docentes): búsqueda,
 * filtros, paginación y estados vacíos. El rol queda fijo por la sección;
 * las cuentas de administración pura no aparecen aquí (las gestiona el equipo
 * de desarrollo).
 */
export async function ListadoCuentas({ tipo, sp }: { tipo: TipoCuentas; sp: Busqueda }) {
  const t = TEXTOS[tipo];
  const base = `/admin/usuarios/${tipo}`;
  const esEstudiantes = tipo === "estudiantes";
  const entrada = {
    q: primero(sp.q),
    rol: t.rol,
    estado: primero(sp.estado),
    grupoId: esEstudiantes ? primero(sp.grupoId) : "",
    page: primero(sp.page) || "1",
  };
  const parse = E.filtroUsuarios.safeParse(entrada);
  const filtro = parse.success ? parse.data : E.filtroUsuarios.parse({ rol: t.rol });
  const errorFiltro = parse.success ? null : `Algún filtro no es válido; se muestran todos los ${t.plural}.`;

  const [{ data, total, anioActivo }, grupos] = await Promise.all([
    servicioUsuarios.listar(filtro),
    esEstudiantes ? servicioUsuarios.gruposDisponibles() : Promise.resolve([]),
  ]);
  const paginas = Math.max(1, Math.ceil(total / filtro.pageSize));
  const hayFiltros = !!(filtro.q || filtro.estado || filtro.grupoId);
  const enlacePagina = (p: number) => {
    const params = new URLSearchParams();
    if (filtro.q) params.set("q", filtro.q);
    if (filtro.estado) params.set("estado", filtro.estado);
    if (filtro.grupoId) params.set("grupoId", filtro.grupoId);
    params.set("page", String(p));
    return `${base}?${params}`;
  };
  const desde = total === 0 ? 0 : (filtro.page - 1) * filtro.pageSize + 1;
  const hasta = Math.min(total, filtro.page * filtro.pageSize);
  const nueva = `/admin/usuarios/nuevo?tipo=${tipo}`;

  return (
    <>
      <Migas
        pasos={[
          { etiqueta: "Administración", href: "/admin/administracion" },
          { etiqueta: "Usuarios", href: "/admin/usuarios" },
          { etiqueta: t.titulo },
        ]}
      />
      <Cabecera
        kicker={anioActivo ? `Año lectivo ${anioActivo.anio}` : "Sin año lectivo activo"}
        titulo={t.titulo}
        nota={t.nota}
      />

      <div className="admin-barra admin-barra-separada">
        <div>
          <Link href={nueva} className="boton-pastilla" data-variante="primario">
            <UserPlus size={18} aria-hidden="true" /> {t.nueva}
          </Link>
          <Link href={`/admin/usuarios/importar?tipo=${tipo}`} className="boton-pastilla" data-variante="secundario">
            <Upload size={18} aria-hidden="true" /> Importar CSV
          </Link>
        </div>
        {esEstudiantes ? (
          <Link href="/admin/usuarios/estudiantes/grupos" className="boton-pastilla" data-variante="secundario">
            <UsersRound size={18} aria-hidden="true" /> Asignar y trasladar grupos
          </Link>
        ) : null}
      </div>

      <form method="get" action={base} className="admin-filtros" role="search" aria-label={`Buscar y filtrar ${t.plural}`}>
        <div className="admin-campo admin-campo-ancho">
          <label htmlFor="f-q">Buscar</label>
          <input id="f-q" name="q" type="search" defaultValue={filtro.q ?? ""} placeholder="Nombre, apellido o correo" maxLength={120} />
        </div>
        <div className="admin-campo">
          <label htmlFor="f-estado">Estado</label>
          <select id="f-estado" name="estado" defaultValue={filtro.estado ?? ""}>
            <option value="">Todos</option>
            {ESTADOS.map((e) => (
              <option key={e} value={e}>
                {ETIQUETA_ESTADO[e]}
              </option>
            ))}
          </select>
        </div>
        {esEstudiantes ? (
          <div className="admin-campo">
            <label htmlFor="f-grupo">Grupo</label>
            <select id="f-grupo" name="grupoId" defaultValue={filtro.grupoId ?? ""}>
              <option value="">Todos</option>
              {grupos.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.etiqueta} · {g.anio}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        <div className="admin-filtros-acciones">
          <button type="submit" className="boton-pastilla" data-variante="primario">
            <Search size={18} aria-hidden="true" /> Aplicar
          </button>
          {hayFiltros ? (
            <Link href={base} className="boton-pastilla" data-variante="secundario">
              Limpiar
            </Link>
          ) : null}
        </div>
      </form>

      {errorFiltro ? (
        <p role="alert" className="admin-aviso" data-tipo="error">
          {errorFiltro}
        </p>
      ) : null}

      <section aria-labelledby="usuarios-resultados" className="admin-resultados">
        <div className="section-heading">
          <h2 id="usuarios-resultados">Cuentas de {t.plural}</h2>
          <span role="status">{total === 0 ? "Sin resultados" : `${desde}–${hasta} de ${total}`}</span>
        </div>

        {data.length === 0 ? (
          <div className="admin-vacio">
            {hayFiltros ? (
              <>
                <p>Ninguna cuenta de {t.singular} coincide con la búsqueda o los filtros.</p>
                <Link href={base} className="acceso-enlace">
                  Ver todos los {t.plural}
                </Link>
              </>
            ) : (
              <>
                <p>Todavía no hay cuentas de {t.plural}.</p>
                <Link href={nueva} className="acceso-enlace">
                  Crear la primera cuenta
                </Link>
              </>
            )}
          </div>
        ) : (
          <div className="admin-tabla-marco">
            <table className="admin-tabla">
              <caption className="sr-only">Cuentas de {t.plural}, ordenadas por apellidos</caption>
              <thead>
                <tr>
                  <th scope="col">Nombre</th>
                  <th scope="col">Correo</th>
                  {esEstudiantes ? null : <th scope="col">Rol</th>}
                  <th scope="col">Estado</th>
                  {esEstudiantes ? <th scope="col">Grupo</th> : null}
                  <th scope="col">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((u) => (
                  <tr key={u.id}>
                    <th scope="row" data-etiqueta="Nombre">
                      {u.apellidos}, {u.nombres}
                    </th>
                    <td data-etiqueta="Correo" className="admin-correo">
                      {u.correo}
                    </td>
                    {esEstudiantes ? null : (
                      <td data-etiqueta="Rol">{u.combinacion ? ETIQUETA_COMBINACION[u.combinacion] : "Sin rol válido"}</td>
                    )}
                    <td data-etiqueta="Estado">
                      <span className="admin-estado" data-estado={u.estado}>
                        {ETIQUETA_ESTADO[u.estado]}
                      </span>
                    </td>
                    {esEstudiantes ? <td data-etiqueta="Grupo">{u.grupo?.etiqueta ?? "Sin grupo"}</td> : null}
                    <td>
                      <Link href={`/admin/usuarios/${u.id}`} className="admin-enlace-fila">
                        Editar<span className="sr-only"> la cuenta de {u.nombres} {u.apellidos}</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {paginas > 1 ? (
          <nav className="admin-paginacion" aria-label={`Paginación de ${t.plural}`}>
            {filtro.page > 1 ? (
              <Link href={enlacePagina(filtro.page - 1)} className="boton-pastilla" data-variante="secundario" rel="prev">
                <ChevronLeft size={18} aria-hidden="true" /> Anterior
              </Link>
            ) : (
              <span />
            )}
            <span>
              Página {Math.min(filtro.page, paginas)} de {paginas}
            </span>
            {filtro.page < paginas ? (
              <Link href={enlacePagina(filtro.page + 1)} className="boton-pastilla" data-variante="secundario" rel="next">
                Siguiente <ChevronRight size={18} aria-hidden="true" />
              </Link>
            ) : (
              <span />
            )}
          </nav>
        ) : null}
      </section>
    </>
  );
}
