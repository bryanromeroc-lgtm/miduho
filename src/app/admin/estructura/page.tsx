import type { Metadata } from "next";
import { SeccionPendiente } from "@/components/shell/seccion-pendiente";
import { exigirRolPagina } from "@/server/pagina";

export const metadata: Metadata = { title: "Estructura académica · Administración MIDUHO" };

export default async function PaginaEstructura() {
  await exigirRolPagina(["ADMIN"], "/admin/estructura");
  return (
    <SeccionPendiente
      kicker="Administración"
      titulo="Estructura académica"
      descripcion="Aquí se administrarán años lectivos, períodos, áreas, grados, grupos y asignaturas."
    />
  );
}
