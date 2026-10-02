import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Search, UserPlus } from "lucide-react";
import { Cabecera, Marco } from "@/components/friso/marco";
import { COMBINACIONES, ETIQUETA_COMBINACION, ETIQUETA_ESTADO, ESTADOS, type Combinacion } from "@/lib/usuarios";
import { esquemasUsuarios as E, servicioUsuarios } from "@/server/modules/usuarios";
import { exigirRolPagina } from "@/server/pagina";

export const metadata: Metadata = { title: "Usuarios · Administración MIDUHO" };

type Busqueda = Record<string, string | string[] | undefined>;

const primero = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

function etiquetaRoles(combinacion: Combinacion | null) {
  return combinacion ? ETIQUETA_COMBINACION[combinacion] : "Sin rol válido";
}

/** Listado ADMIN de cuentas: búsqueda, filtros, paginación y estados vacíos (§11). */
export default async function PaginaUsuarios({ searchParams }: { searchParams: Promise<Busqueda> }) {
  await exigirRolPagina(["ADMIN"], "/admin/usuarios");
  const sp = await searchParams;
  const entrada = {
    q: primero(sp.q),
    rol: primero(sp.rol),
    estado: primero(sp.estado),
    grupoId: primero(sp.grupoId),
    page: primero(sp.page) || "1",
  };
  const parse = E.filtroUsuarios.safeParse(entrada);
  const filtro = parse.success ? parse.data : E.filtroUsuarios.parse({});
  const errorFiltro = parse.success ? null : "Algún filtro no es válido; se muestran todas las cuentas.";

  const [{ data, total, anioActivo }, grupos] = await Promise.all([
    servicioUsuarios.listar(filtro),
    servicioUsuarios.gruposDisponibles(),
  ]);
  const paginas = Math.max(1, Math.ceil(total / filtro.pageSize));
  const hayFiltros = !!(filtro.q || filtro.rol || filtro.estado || filtro.grupoId);
  const enlacePagina = (p: number) => {
    const params = new URLSearchParams();
    if (filtro.q) params.set("q", filtro.q);
    if (filtro.rol) params.set("rol", filtro.rol);
    if (filtro.estado) params.set("estado", filtro.estado);
    if (filtro.grupoId) params.set("grupoId", filtro.grupoId);
    params.set("page", String(p));
    return `/admin/usuarios?${params}`;
  };
  const desde = total === 0 ? 0 : (filtro.page - 1) * filtro.pageSize + 1;
  const hasta = Math.min(total, filtro.page * filtro.pageSize);

  return (
    <Marco>
      <Cabecera
        kicker="Administración"
        titulo="Usuarios"
        nota="Cuentas de docentes, estudiantes y administración. Desactivar conserva el historial: ninguna cuenta se elimina."
      />

      <div className="admin-barra">
        <Link href="/admin/usuarios/nuevo" className="boton-pastilla" data-variante="primario">
          <UserPlus size={18} aria-hidden="true" /> Nueva cuenta
        </Link>
      </div>

      <form method="get" action="/admin/usuarios" className="admin-filtros" role="search" aria-label="Buscar y filtrar usuarios">
        <div className="admin-campo admin-campo-ancho">
          <label htmlFor="f-q">Buscar</label>
          <input id="f-q" name="q" type="search" defaultValue={filtro.q ?? ""} placeholder="Nombre, apellido o correo" maxLength={120} />
        </div>
        <div className="admin-campo">
          <label htmlFor="f-rol">Rol</label>
          <select id="f-rol" name="rol" defaultValue={filtro.rol ?? ""}>
            <option value="">Todos</option>
            <option value="ADMIN">Administración</option>
            <option value="DOCENTE">Docente</option>
            <option value="ESTUDIANTE">Estudiante</option>
          </select>
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
        <div className="admin-filtros-acciones">
          <button type="submit" className="boton-pastilla" data-variante="primario">
            <Search size={18} aria-hidden="true" /> Aplicar
          </button>
          {hayFiltros ? (
            <Link href="/admin/usuarios" className="boton-pastilla" data-variante="secundario">
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
          <h2 id="usuarios-resultados">Cuentas</h2>
          <span role="status">
            {total === 0 ? "Sin resultados" : `${desde}–${hasta} de ${total}`}
            {anioActivo ? ` · Grupo del año ${anioActivo.anio}` : " · Sin año lectivo activo"}
          </span>
        </div>

        {data.length === 0 ? (
          <div className="admin-vacio">
            {hayFiltros ? (
              <>
                <p>Ninguna cuenta coincide con la búsqueda o los filtros.</p>
                <Link href="/admin/usuarios" className="acceso-enlace">
                  Ver todas las cuentas
                </Link>
              </>
            ) : (
              <>
                <p>Todavía no hay cuentas registradas.</p>
                <Link href="/admin/usuarios/nuevo" className="acceso-enlace">
                  Crear la primera cuenta
                </Link>
              </>
            )}
          </div>
        ) : (
          <div className="admin-tabla-marco">
            <table className="admin-tabla">
              <caption className="sr-only">Cuentas, ordenadas por apellidos</caption>
              <thead>
                <tr>
                  <th scope="col">Nombre</th>
                  <th scope="col">Correo</th>
                  <th scope="col">Rol</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Grupo</th>
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
                    <td data-etiqueta="Rol">{etiquetaRoles(u.combinacion)}</td>
                    <td data-etiqueta="Estado">
                      <span className="admin-estado" data-estado={u.estado}>
                        {ETIQUETA_ESTADO[u.estado]}
                      </span>
                    </td>
                    <td data-etiqueta="Grupo">{u.combinacion === "ESTUDIANTE" ? (u.grupo?.etiqueta ?? "Sin grupo") : "—"}</td>
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
          <nav className="admin-paginacion" aria-label="Paginación de usuarios">
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

      <p className="admin-nota">
        Combinaciones válidas: {COMBINACIONES.map((c) => ETIQUETA_COMBINACION[c]).join(" · ")}.
      </p>
    </Marco>
  );
}
