import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { ReproductorAsignado } from "@/features/actividades/asignadas/reproductor-asignado";
import { kitDe, variablesDe } from "@/features/materias/tematica";
import { PatronMarcas } from "@/features/materias/tematica/piezas";
import { EncabezadoMateria } from "@/features/materias/vista/encabezado";
import s from "@/features/materias/vista/vista.module.css";
import { ErrorDominio } from "@/server/errores";
import { servicioActividades } from "@/server/modules/actividades";
import { vistaMateriaDeSesion } from "@/server/modules/materias";

export const metadata: Metadata = { title: "Material audiovisual · MIDUHO" };

export default async function ActividadAsignada({ params }: { params: Promise<{ asignatura: string; asignacionId: string }> }) {
  const { asignatura, asignacionId } = await params;
  const [vista, sesion] = await Promise.all([vistaMateriaDeSesion(asignatura), auth()]);
  if (!vista || !sesion?.user?.id || sesion.user.contexto !== "ESTUDIANTE") notFound();
  const actividad = await servicioActividades.asignacionDeEstudiante(sesion.user.id, vista.grupo.id, asignatura, asignacionId).catch((error) => {
    if (error instanceof ErrorDominio && error.status === 404) notFound();
    throw error;
  });
  const volverHref = `/materias/${encodeURIComponent(asignatura)}`;
  return <div className={s.pagina} data-escena={vista.materia.escena} style={variablesDe(vista.materia.escena) as React.CSSProperties}>
    <PatronMarcas kit={kitDe(vista.materia.escena)} color="var(--m-marca)" className={s.marcas} />
    <EncabezadoMateria volverHref={volverHref} volverTexto="Volver" volverDetalle={`a ${vista.materia.nombre}`}
      saltarA={{ href: "#actividad-asignada", texto: "Saltar a la actividad" }} />
    <ReproductorAsignado asignacion={actividad} volverHref={volverHref} />
  </div>;
}
