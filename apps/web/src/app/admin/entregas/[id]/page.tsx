import Link from "next/link";
import { notFound } from "next/navigation";
import { Cabecera, Marco, Migas } from "@/components/friso/marco";
import { formatoCierre, formatoRetraso } from "@/lib/entregas";
import { obtenerTablero } from "@/server/modules/entregas/servicio";
import { exigirRolPagina } from "@/server/pagina";
import { AccionesSolicitud } from "@/features/entregas/acciones-solicitud";
import { ErrorDominio } from "@/server/errores";

export default async function PaginaTablero({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ estado?: string; orden?: string }> }) {
  await exigirRolPagina(["ADMIN"], "/admin/entregas");
  const { id } = await params;
  const filtros = await searchParams;
  const solicitud = await obtenerTablero(id).catch((error: unknown) => {
    if (error instanceof ErrorDominio && error.status === 404) return null;
    throw error;
  });
  if (!solicitud) notFound();
  const resumen = { entregadas: solicitud.entregas.filter((e) => e.calculado.estado === "Entregada").length, tardias: solicitud.entregas.filter((e) => e.calculado.estado === "Tardía").length, sinEntregar: solicitud.entregas.filter((e) => e.calculado.estado === "Sin entregar").length, pendientes: solicitud.entregas.filter((e) => e.calculado.estado === "Pendiente").length };
  const filas = solicitud.entregas.filter((e) => !filtros.estado || e.calculado.estado === filtros.estado).sort((a, b) => filtros.orden === "hora"
    ? (a.archivos[0]?.subidoEn.getTime() ?? Infinity) - (b.archivos[0]?.subidoEn.getTime() ?? Infinity)
    : `${a.docente.apellidos} ${a.docente.nombres}`.localeCompare(`${b.docente.apellidos} ${b.docente.nombres}`, "es-CO"));
  return <Marco>
    <Migas pasos={[{ etiqueta: "Administración", href: "/admin/administracion" }, { etiqueta: "Coordinación", href: "/admin/coordinacion" }, { etiqueta: "Entregas", href: "/admin/entregas" }, { etiqueta: solicitud.titulo }]} />
    <Cabecera kicker="Tablero de cumplimiento" titulo={solicitud.titulo} nota={`Cierre: ${formatoCierre(solicitud.cierraEn)} · Carpeta: ${solicitud.carpetaDriveNombre}`} />
    {solicitud.carpetaRequiereSeleccion ? <p role="status" className="cuenta-panel">La cuenta de Google cambió. <Link href={`/admin/entregas/${id}/editar`}>Elige de nuevo la carpeta de esta solicitud</Link> antes de recibir archivos.</p> : null}
    <p role="status" className="cuenta-panel">{resumen.entregadas} entregadas · {resumen.tardias} tardías · {resumen.sinEntregar} sin entregar · {resumen.pendientes} pendientes</p>
    <div className="admin-barra"><Link className="boton-pastilla" data-variante="secundario" href={`/admin/entregas/${id}/editar`}>Editar solicitud</Link><AccionesSolicitud id={id} archivada={solicitud.estado === "ARCHIVADA"} tieneArchivos={solicitud.entregas.some((e) => e.archivos.length > 0)} /></div>
    <nav aria-label="Filtrar entregas" className="admin-barra">{["Todas", "Pendiente", "Sin entregar", "Entregada", "Tardía"].map((estado) => <Link key={estado} href={`/admin/entregas/${id}${estado === "Todas" ? "" : `?estado=${encodeURIComponent(estado)}`}`}>{estado}</Link>)}</nav>
    <div className="admin-barra"><Link href={`/admin/entregas/${id}?orden=nombre`}>Ordenar por nombre</Link><Link href={`/admin/entregas/${id}?orden=hora`}>Ordenar por hora</Link></div>
    <div className="admin-tabla-marco"><table className="admin-tabla"><caption>Estado de las destinatarias</caption><thead><tr><th>Docente</th><th>Estado</th><th>Última subida</th><th>Versiones</th><th>Archivo</th></tr></thead><tbody>{filas.map((e) => <tr key={e.id}>
      <th scope="row">{e.docente.apellidos} {e.docente.nombres}</th>
      <td data-etiqueta="Estado">{e.calculado.estado}{e.calculado.retrasoMs ? ` · ${formatoRetraso(e.calculado.retrasoMs)}` : ""}{e.ultimoFalloEn ? <p>Último intento falló · {formatoCierre(e.ultimoFalloEn)}</p> : null}</td>
      <td data-etiqueta="Última subida">{e.archivos[0] ? formatoCierre(e.archivos[0].subidoEn) : "—"}</td><td data-etiqueta="Versiones">{e.archivos.length}</td>
      <td data-etiqueta="Archivo">{e.archivos[0] ? <a href={`https://drive.google.com/file/d/${encodeURIComponent(e.archivos[0].driveFileId)}/view`} target="_blank" rel="noopener noreferrer">Abrir en Drive</a> : "—"}</td>
    </tr>)}</tbody></table></div>
  </Marco>;
}
