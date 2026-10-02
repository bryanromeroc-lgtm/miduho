import type { Metadata } from "next";
import { SeccionPendiente } from "@/components/shell/seccion-pendiente";
import { exigirRolPagina } from "@/server/pagina";

export const metadata: Metadata = { title: "Usuarios · Administración MIDUHO" };

export default async function PaginaUsuarios() {
  await exigirRolPagina(["ADMIN"], "/admin/usuarios");
  return (
    <SeccionPendiente
      kicker="Administración"
      titulo="Usuarios"
      descripcion="Aquí se buscarán, crearán y editarán las cuentas de docentes, estudiantes y administración, con sus roles, estado y grupo."
    />
  );
}
