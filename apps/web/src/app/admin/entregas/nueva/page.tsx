import Link from "next/link";
import { Cabecera, Marco, Migas } from "@/components/friso/marco";
import { FormularioSolicitud } from "@/features/entregas/formulario-solicitud";
import { datosFormulario } from "@/features/entregas/datos-formulario";
import { db } from "@/server/db";
import { exigirRolPagina } from "@/server/pagina";

export default async function PaginaNuevaSolicitud() {
  const usuario = await exigirRolPagina(["ADMIN"], "/admin/entregas/nueva");
  const [datos, integracion] = await Promise.all([datosFormulario(), db.integracionGoogle.findUnique({ where: { usuarioId: usuario.id } })]);
  const conectada = integracion?.estado === "CONECTADA" && Boolean(integracion.refreshTokenCifrado);
  return <Marco>
    <Migas pasos={[{ etiqueta: "Administración", href: "/admin/administracion" }, { etiqueta: "Coordinación", href: "/admin/coordinacion" }, { etiqueta: "Entregas", href: "/admin/entregas" }, { etiqueta: "Nueva" }]} />
    <Cabecera kicker="Entregas" titulo="Nueva solicitud" nota="Define el documento, el plazo y la carpeta de coordinación." />
    {conectada ? <FormularioSolicitud {...datos} /> : <p role="status" className="cuenta-panel">Conecta Google Drive desde Cuenta para crear entregas. <Link href="/cuenta">Ir a Cuenta</Link></p>}
  </Marco>;
}
