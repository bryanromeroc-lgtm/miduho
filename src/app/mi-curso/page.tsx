import type { Metadata } from "next";
import { SeccionPendiente } from "@/components/shell/seccion-pendiente";
import { exigirRolPagina } from "@/server/pagina";

export const metadata: Metadata = { title: "Mi curso · MIDUHO" };

export default async function PaginaMiCurso() {
  await exigirRolPagina(["DOCENTE"], "/mi-curso");
  return (
    <SeccionPendiente
      kicker="Docente"
      titulo="Mi curso"
      descripcion="Aquí verás tus grupos asignados, sus asignaturas, bloques de horario y estudiantes, y podrás restablecer sus contraseñas."
    />
  );
}
