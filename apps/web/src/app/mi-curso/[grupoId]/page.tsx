import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Cabecera, Marco } from "@/components/friso/marco";
import { ErrorDominio } from "@/server/errores";
import { servicioMiCurso } from "@/server/modules/mi-curso";
import { exigirRolPagina } from "@/server/pagina";
import { HorarioAsignaturas } from "../horario";
import { EstudiantesGrupo } from "./estudiantes";

export const metadata: Metadata = { title: "Grupo · Mi curso · MIDUHO" };

/**
 * Detalle de un grupo asignado (INC1R-10). Un grupo inexistente y uno ajeno
 * responden el mismo 404: la URL no sirve para enumerar grupos (§3, gate 10).
 */
export default async function PaginaGrupo({ params }: { params: Promise<{ grupoId: string }> }) {
  const { grupoId } = await params;
  const usuario = await exigirRolPagina(["DOCENTE"], `/mi-curso/${encodeURIComponent(grupoId)}`);
  const grupo = await servicioMiCurso.obtenerGrupo(usuario.id, grupoId).catch((e) => {
    if (e instanceof ErrorDominio && e.status === 404) notFound();
    throw e;
  });

  return (
    <Marco>
      <Link href="/mi-curso" className="admin-volver">
        <ChevronLeft size={18} aria-hidden="true" /> Mi curso
      </Link>
      <Cabecera
        kicker={`Mi curso · Año ${grupo.anio}`}
        titulo={`Grupo ${grupo.etiqueta}`}
        nota="Consulta tus asignaturas y los estudiantes del grupo. Puedes restablecer contraseñas; la edición de datos corresponde a la administración."
      />
      <div className="admin-columna">
        <section className="cuenta-panel" aria-labelledby="micurso-horario">
          <h2 id="micurso-horario">Asignaturas y horario</h2>
          <HorarioAsignaturas asignaturas={grupo.asignaturas} nivel={3} />
        </section>
        <EstudiantesGrupo grupo={grupo.etiqueta} estudiantes={grupo.estudiantes} />
      </div>
    </Marco>
  );
}
