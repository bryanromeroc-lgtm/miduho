import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, UsersRound } from "lucide-react";
import { Cabecera, Marco } from "@/components/friso/marco";
import { HorarioAsignaturas } from "./horario";
import { servicioMiCurso } from "@/server/modules/mi-curso";
import { exigirRolPagina } from "@/server/pagina";

export const metadata: Metadata = { title: "Mi curso · MIDUHO" };

/**
 * Mi curso del DOCENTE (INC1R-10, §2.2): solo los grupos del año activo con
 * al menos una asignación ACTIVA, con sus asignaturas, bloques y estudiantes.
 */
export default async function PaginaMiCurso() {
  const usuario = await exigirRolPagina(["DOCENTE"], "/mi-curso");
  const grupos = await servicioMiCurso.listarGrupos(usuario.id);

  return (
    <Marco>
      <Cabecera
        kicker="Docente"
        titulo="Mi curso"
        nota="Tus grupos con asignación activa, sus asignaturas, el horario y los estudiantes. Desde cada grupo puedes restablecer contraseñas estudiantiles."
      />
      {grupos.length === 0 ? (
        <div className="admin-vacio">
          <p>No tienes grupos con asignación activa en el año lectivo vigente.</p>
          <p>Cuando la administración te asigne una asignatura y un grupo, aparecerán aquí.</p>
        </div>
      ) : (
        <ul className="micurso-grupos" aria-label="Grupos asignados">
          {grupos.map((g) => (
            <li key={g.id}>
              <article className="micurso-grupo" aria-labelledby={`grupo-${g.id}`}>
                <header className="micurso-grupo-cabecera">
                  <h2 id={`grupo-${g.id}`}>Grupo {g.etiqueta}</h2>
                  <p>
                    Año {g.anio} · <UsersRound size={16} aria-hidden="true" />{" "}
                    {g.totalEstudiantes === 1 ? "1 estudiante" : `${g.totalEstudiantes} estudiantes`}
                  </p>
                </header>
                <HorarioAsignaturas asignaturas={g.asignaturas} nivel={3} />
                <Link href={`/mi-curso/${g.id}`} className="boton-pastilla micurso-ir" data-variante="primario">
                  Ver estudiantes del grupo {g.etiqueta} <ChevronRight size={18} aria-hidden="true" />
                </Link>
              </article>
            </li>
          ))}
        </ul>
      )}
    </Marco>
  );
}
