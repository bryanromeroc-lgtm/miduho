import { Marco } from "@/components/friso/marco";
import { AgendaDocente } from "@/features/agenda/agenda-docente";
import { AgendaEstudiante } from "@/features/agenda/agenda-estudiante";
import { agendaDeSesion } from "@/server/modules/materias";

// La agenda decide por contexto: el estudiante ve «Mi agenda»; la docente, la suya.
export default async function Agenda() {
  const datos = await agendaDeSesion();
  if (!datos) return <AgendaDocente />;
  return (
    <Marco dia>
      <AgendaEstudiante datos={datos} />
    </Marco>
  );
}
