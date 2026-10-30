import { ETIQUETA_DIA } from "@/server/modules/mi-curso";
import type { ResumenGrupo } from "@/server/modules/mi-curso";

/** Asignaturas del docente en un grupo con sus bloques de horario (solo lectura). */
export function HorarioAsignaturas({
  asignaturas,
  nivel,
}: {
  asignaturas: ResumenGrupo["asignaturas"];
  nivel: 2 | 3;
}) {
  const Titulo = nivel === 2 ? "h2" : "h3";
  return (
    <ul className="micurso-asignaturas">
      {asignaturas.map((a) => (
        <li key={a.asignacionId}>
          <Titulo className="micurso-asignatura">
            {a.asignatura} <span>· {a.area}</span>
          </Titulo>
          {a.bloques.length ? (
            <ul className="micurso-bloques" aria-label={`Horario de ${a.asignatura}`}>
              {a.bloques.map((b) => (
                <li key={`${b.dia}-${b.horaInicio}-${b.horaFin}`}>
                  <strong>{ETIQUETA_DIA[b.dia]}</strong> {b.horaInicio}–{b.horaFin}
                </li>
              ))}
            </ul>
          ) : (
            <p className="admin-ayuda">Sin bloques de horario registrados.</p>
          )}
        </li>
      ))}
    </ul>
  );
}
