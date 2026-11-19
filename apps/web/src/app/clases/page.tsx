import type { Metadata } from "next";
import { Marco, Migas, Cabecera } from "@/components/friso/marco";
import { Friso, TrechoConRegla } from "@/components/friso/friso";
import { Plancha } from "@/components/friso/plancha";
import { Boton } from "@/components/friso/piezas";
import { AREAS } from "@/components/friso/areas";
import { servicioActividades } from "@/server/modules/actividades";
import { exigirRolPagina } from "@/server/pagina";

export const metadata: Metadata = { title: "Mis clases · MIDUHO" };

function areaFriso(nombre: string): keyof typeof AREAS | undefined {
  const normal = nombre.toLocaleLowerCase("es-CO");
  if (normal.includes("robótica")) return "robotica";
  if (normal.includes("emprendimiento")) return "emprendimiento";
  if (normal.includes("literatura") || normal.includes("comprensión lectora")) return "literatura";
  return undefined;
}

export default async function MisClases() {
  const docente = await exigirRolPagina(["DOCENTE"], "/clases");
  const clases = await servicioActividades.clasesDocente(docente.id);

  return (
    <Marco>
      <Migas pasos={[{ etiqueta: "Hoy", href: "/" }, { etiqueta: "Mis clases" }]} />
      <Cabecera kicker="Asignaciones vigentes" titulo="Mis clases"
        nota={`${clases.length} ${clases.length === 1 ? "clase asignada" : "clases asignadas"} en el año lectivo activo.`} />
      {clases.length === 0 ? (
        <section className="sticker-panel max-w-[65ch] p-6" aria-labelledby="clases-vacias">
          <h2 id="clases-vacias" className="font-heading text-xl font-bold text-tinta">Aún no tienes clases asignadas</h2>
          <p className="mt-2 text-tinta">Cuando coordinación te asigne una asignatura y un grupo, aparecerán aquí.</p>
        </section>
      ) : (
        <Friso>
          {clases.map((clase) => {
            const grupo = `${clase.grupo.grado.nombre}-${clase.grupo.identificador}`;
            const area = areaFriso(clase.asignatura.area.nombre);
            return (
              <TrechoConRegla key={clase.id} hora={`Grupo ${grupo}`} area={area}>
                <Plancha area={area} hora={`Grupo ${grupo}`} rotulo={clase.asignatura.nombre}
                  titulo={clase.asignatura.nombre} transicion={`plancha-${clase.id}`}
                  pie={<div className="px-[22px] pb-5 pt-1"><Boton href={`/clases/${clase.id}`} tono="tinta" className="w-full">Abrir clase</Boton></div>}>
                  <p className="text-[15px] leading-relaxed text-tinta">Actividades y material de esta asignatura para el grupo {grupo}.</p>
                </Plancha>
              </TrechoConRegla>
            );
          })}
        </Friso>
      )}
    </Marco>
  );
}
