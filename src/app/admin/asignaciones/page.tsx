import type { Metadata } from "next";
import { SeccionPendiente } from "@/components/shell/seccion-pendiente";
import { exigirRolPagina } from "@/server/pagina";

export const metadata: Metadata = { title: "Asignaciones · Administración MIDUHO" };

export default async function PaginaAsignaciones() {
  await exigirRolPagina(["ADMIN"], "/admin/asignaciones");
  return (
    <SeccionPendiente
      kicker="Administración"
      titulo="Asignaciones"
      descripcion="Aquí se asignarán docentes a asignaturas y grupos, con sus bloques de horario."
    />
  );
}
