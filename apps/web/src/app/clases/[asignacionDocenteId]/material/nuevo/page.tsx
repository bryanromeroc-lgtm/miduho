import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Marco, Migas, Cabecera } from "@/components/friso/marco";
import { FormularioMaterial } from "@/features/actividades/docente/formulario-material";
import { ErrorDominio } from "@/server/errores";
import { servicioActividades } from "@/server/modules/actividades";
import { exigirRolPagina } from "@/server/pagina";

export const metadata: Metadata = { title: "Nuevo material audiovisual · MIDUHO" };

export default async function NuevoMaterial({ params }: { params: Promise<{ asignacionDocenteId: string }> }) {
  const { asignacionDocenteId } = await params;
  const docente = await exigirRolPagina(["DOCENTE"], `/clases/${encodeURIComponent(asignacionDocenteId)}/material/nuevo`);
  const clase = await servicioActividades.detalleClase(docente.id, asignacionDocenteId).catch((error) => {
    if (error instanceof ErrorDominio && error.status === 404) notFound();
    throw error;
  });
  const opciones = await servicioActividades.opcionesDeCreacion(docente.id);
  const inicial = opciones.opciones.find((o) => o.asignatura === clase.asignatura && o.gradoId === clase.gradoId);
  if (!inicial || !opciones.periodo) notFound();

  return <Marco>
    <Migas pasos={[{ etiqueta: "Mis clases", href: "/clases" },
      { etiqueta: `${clase.asignatura} · ${clase.grupo}`, href: `/clases/${clase.id}` },
      { etiqueta: "Nuevo material audiovisual" }]} />
    <Cabecera kicker={`${clase.asignatura} · Grupo ${clase.grupo}`} titulo="Nuevo material audiovisual"
      nota="Elige el video, escribe las preguntas y publica para los grupos seleccionados." />
    <FormularioMaterial claseId={clase.id} opciones={opciones.opciones}
      combinacionInicial={`${inicial.asignaturaId}:${inicial.gradoId}`}
      cierrePorDefecto={opciones.periodo.fin.toLocaleDateString("es-CO", { timeZone: "America/Bogota", dateStyle: "medium" })} />
  </Marco>;
}
