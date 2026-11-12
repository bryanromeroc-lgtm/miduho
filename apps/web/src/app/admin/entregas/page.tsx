import type { Metadata } from "next";
import Link from "next/link";
import { Cabecera, Marco, Migas } from "@/components/friso/marco";
import { ETIQUETAS_TIPO_DOCUMENTO, formatoCierre } from "@/lib/entregas";
import { listarSolicitudes } from "@/server/modules/entregas/servicio";
import { exigirRolPagina } from "@/server/pagina";
import { db } from "@/server/db";

export const metadata: Metadata = { title: "Entregas · Coordinación MIDUHO" };
export default async function PaginaEntregas({ searchParams }: { searchParams: Promise<{ estado?: string }> }) {
  const usuario = await exigirRolPagina(["ADMIN"], "/admin/entregas");
  const estado = (await searchParams).estado === "ARCHIVADA" ? "ARCHIVADA" : "ABIERTA";
  const [solicitudes, integracion] = await Promise.all([listarSolicitudes(estado), db.integracionGoogle.findUnique({ where: { usuarioId: usuario.id } })]);
  return <Marco>
    <Migas pasos={[{ etiqueta: "Administración", href: "/admin/administracion" }, { etiqueta: "Coordinación", href: "/admin/coordinacion" }, { etiqueta: "Entregas" }]} />
    <Cabecera kicker="Coordinación" titulo="Entregas a coordinación" nota="Solicita documentos y consulta quién entregó, quién va tarde y quién falta." />
    {!integracion?.refreshTokenCifrado || integracion.estado !== "CONECTADA" ? <p role="status" className="admin-nota">Drive desconectado: las docentes no pueden subir. <Link href="/cuenta">Volver a conectar</Link></p> : null}
    <nav className="admin-barra" aria-label="Estado de solicitudes">
      <Link className="boton-pastilla" data-variante={estado === "ABIERTA" ? "primario" : "secundario"} href="/admin/entregas">Abiertas</Link>
      <Link className="boton-pastilla" data-variante={estado === "ARCHIVADA" ? "primario" : "secundario"} href="/admin/entregas?estado=ARCHIVADA">Archivadas</Link>
      <Link className="boton-pastilla" data-variante="secundario" href="/admin/entregas/nueva">Nueva solicitud</Link>
    </nav>
    {solicitudes.length ? <ul className="admin-columna">
      {solicitudes.map((solicitud) => <li key={solicitud.id} className="cuenta-panel">
        <h2><Link href={`/admin/entregas/${solicitud.id}`}>{solicitud.titulo}</Link></h2>
        <p>{ETIQUETAS_TIPO_DOCUMENTO[solicitud.tipoDocumento]} · Cierra el {formatoCierre(solicitud.cierraEn)}</p>
        <p>Carpeta: {solicitud.carpetaDriveNombre}</p>
        {solicitud.carpetaRequiereSeleccion ? <p role="status">Elige de nuevo la carpeta para esta solicitud antes de recibir archivos.</p> : null}
        <p>{solicitud.resumen.entregadas} de {solicitud.resumen.total} entregadas · {solicitud.resumen.tardias} tardías · {solicitud.resumen.sinEntregar} sin entregar</p>
      </li>)}
    </ul> : <p>No hay solicitudes {estado === "ABIERTA" ? "abiertas" : "archivadas"}. {estado === "ABIERTA" ? "Crea una solicitud para comenzar." : ""}</p>}
  </Marco>;
}
