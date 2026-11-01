import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Reproductor } from "@/features/actividades/reproductor/reproductor";
import { kitDe, variablesDe } from "@/features/materias/tematica";
import { PatronMarcas } from "@/features/materias/tematica/piezas";
import { EncabezadoMateria } from "@/features/materias/vista/encabezado";
import s from "@/features/materias/vista/vista.module.css";
import { actividadDeSesion } from "@/server/modules/materias";

type Parametros = { params: Promise<{ asignatura: string; id: string }> };

export async function generateMetadata({ params }: Parametros): Promise<Metadata> {
  const { asignatura, id } = await params;
  const datos = await actividadDeSesion(asignatura, id);
  return { title: datos ? `${datos.actividad.titulo} · ${datos.vista.materia.nombre} · MIDUHO` : "Actividad · MIDUHO" };
}

/*
  Una actividad de la materia, en el mismo mundo plano de la vista: fondo y
  marcas de agua de la materia, encabezado flat y el reproductor al centro.
  404 si la materia no es del grupo del estudiante o la actividad no es de su grado.
*/
export default async function PaginaActividad({ params }: Parametros) {
  const { asignatura, id } = await params;
  const datos = await actividadDeSesion(asignatura, id);
  if (!datos) notFound();
  const { vista, actividad } = datos;
  const { materia } = vista;
  const volverHref = `/materias/${encodeURIComponent(materia.id)}`;
  return (
    <div className={s.pagina} data-escena={materia.escena} style={variablesDe(materia.escena) as React.CSSProperties}>
      <PatronMarcas kit={kitDe(materia.escena)} color="var(--m-marca)" className={s.marcas} />
      <EncabezadoMateria
        volverHref={volverHref}
        volverTexto="Volver"
        volverDetalle={`a ${materia.nombre}`}
        saltarA={{ href: "#juego", texto: "Saltar al juego" }}
      />
      <Reproductor
        actividad={{
          slug: actividad.slug,
          titulo: actividad.titulo,
          tipo: actividad.tipo,
          instruccion: actividad.instruccion,
          contenido: actividad.contenido,
        }}
        materia={materia.nombre}
        volverHref={volverHref}
      />
    </div>
  );
}
