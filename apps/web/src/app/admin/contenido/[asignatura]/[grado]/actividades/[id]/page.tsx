import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Reproductor } from "@/features/actividades/reproductor/reproductor";
import { kitDe, variablesDe } from "@/features/materias/tematica";
import { PatronMarcas } from "@/features/materias/tematica/piezas";
import { EncabezadoMateria } from "@/features/materias/vista/encabezado";
import s from "@/features/materias/vista/vista.module.css";
import { RUTA_CONTENIDO, rutaVistaPrevia } from "@/lib/contenido";
import { servicioContenido } from "@/server/modules/contenido";
import { exigirRolPagina } from "@/server/pagina";

type Parametros = { params: Promise<{ asignatura: string; grado: string; id: string }> };

const desde = ({ asignatura, grado, id }: Awaited<Parametros["params"]>) => `${RUTA_CONTENIDO}/${asignatura}/${grado}/actividades/${id}`;

export async function generateMetadata({ params }: Parametros): Promise<Metadata> {
  const p = await params;
  await exigirRolPagina(["ADMIN"], desde(p));
  const datos = await servicioContenido.actividad(p.asignatura, p.grado, p.id);
  return { title: datos ? `Vista previa · ${datos.actividad.titulo} · MIDUHO` : "Vista previa · MIDUHO" };
}

/*
  Una actividad en vista previa (vista-admin-contenido, D4): la misma escena
  y encabezado que la del estudiante, con el reproductor en modo
  `vista-previa`. Nada se guarda y la pantalla lo dice. Volver lleva a la
  vista previa de la materia, nunca a la del estudiante.
  404 si la actividad no es del currículo de esa asignatura y grado.
*/
export default async function PaginaActividadPrevia({ params }: Parametros) {
  const p = await params;
  await exigirRolPagina(["ADMIN"], desde(p));
  const datos = await servicioContenido.actividad(p.asignatura, p.grado, p.id);
  if (!datos) notFound();
  const { vista, actividad } = datos;
  const { materia, grado } = vista;
  const volverHref = rutaVistaPrevia(materia.id, grado.orden);
  return (
    <div className={s.pagina} data-escena={materia.escena} style={variablesDe(materia.escena) as React.CSSProperties}>
      <PatronMarcas kit={kitDe(materia.escena)} color="var(--m-marca)" className={s.marcas} />
      <EncabezadoMateria
        volverHref={volverHref}
        volverTexto="Volver"
        volverDetalle={`a ${materia.nombre} ${grado.nombre}`}
        saltarA={{ href: "#juego", texto: "Saltar al juego" }}
        franja={`Vista previa · ${grado.nombre}`}
      />
      <Reproductor
        actividad={{
          slug: actividad.slug,
          titulo: actividad.titulo,
          tipo: actividad.tipo,
          instruccion: actividad.instruccion,
          contenido: actividad.contenido,
        }}
        materia={`${materia.nombre} ${grado.nombre}`}
        volverHref={volverHref}
        modo="vista-previa"
      />
    </div>
  );
}
