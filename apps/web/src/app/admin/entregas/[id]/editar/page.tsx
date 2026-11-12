import { notFound } from "next/navigation";
import { Cabecera, Marco, Migas } from "@/components/friso/marco";
import { FormularioSolicitud } from "@/features/entregas/formulario-solicitud";
import { datosFormulario } from "@/features/entregas/datos-formulario";
import { db } from "@/server/db";
import { exigirRolPagina } from "@/server/pagina";

export default async function PaginaEditarSolicitud({ params }: { params: Promise<{ id: string }> }) {
  await exigirRolPagina(["ADMIN"], "/admin/entregas");
  const { id } = await params;
  const [datos, solicitud] = await Promise.all([datosFormulario(), db.solicitudEntrega.findUnique({ where: { id }, include: { entregas: { select: { docenteId: true } } } })]);
  if (!solicitud) notFound();
  const cierreLocal = new Date(solicitud.cierraEn.getTime() - 5 * 60 * 60_000).toISOString().slice(0, 16);
  return <Marco>
    <Migas pasos={[{ etiqueta: "Administración", href: "/admin/administracion" }, { etiqueta: "Coordinación", href: "/admin/coordinacion" }, { etiqueta: "Entregas", href: "/admin/entregas" }, { etiqueta: solicitud.titulo, href: `/admin/entregas/${id}` }, { etiqueta: "Editar" }]} />
    <Cabecera kicker="Entregas" titulo="Editar solicitud" nota="Los archivos ya subidos no se mueven si cambias la carpeta." />
    <FormularioSolicitud {...datos} inicial={{ id, titulo: solicitud.titulo, descripcion: solicitud.descripcion, tipoDocumento: solicitud.tipoDocumento, formatos: solicitud.formatos, cierreLocal, periodoId: solicitud.periodoId, carpetaDriveId: solicitud.carpetaDriveId, carpetaDriveNombre: solicitud.carpetaDriveNombre, docenteIds: solicitud.entregas.map((e) => e.docenteId) }} />
  </Marco>;
}
