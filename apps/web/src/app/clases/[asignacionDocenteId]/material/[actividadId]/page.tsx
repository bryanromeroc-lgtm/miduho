import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Marco, Migas, Cabecera } from "@/components/friso/marco";
import { EditorMaterial } from "@/features/actividades/docente/editor-material";
import { TablaSeguimiento } from "@/features/actividades/docente/tabla-seguimiento";
import { ErrorDominio } from "@/server/errores";
import { servicioActividades } from "@/server/modules/actividades";
import { exigirRolPagina } from "@/server/pagina";

export const metadata: Metadata = { title: "Material audiovisual · MIDUHO" };

export default async function MaterialDocente({ params }: { params: Promise<{ asignacionDocenteId: string; actividadId: string }> }) {
  const { asignacionDocenteId, actividadId } = await params;
  const docente = await exigirRolPagina(["DOCENTE"], `/clases/${encodeURIComponent(asignacionDocenteId)}/material/${encodeURIComponent(actividadId)}`);
  const [clase, material, seguimiento] = await Promise.all([
    servicioActividades.detalleClase(docente.id, asignacionDocenteId),
    servicioActividades.materialDocente(docente.id, actividadId, asignacionDocenteId),
    servicioActividades.seguimiento(docente.id, actividadId),
  ]).catch((error) => {
    if (error instanceof ErrorDominio && error.status === 404) notFound();
    throw error;
  });

  return <Marco>
    <Migas pasos={[{ etiqueta: "Mis clases", href: "/clases" },
      { etiqueta: `${clase.asignatura} · ${clase.grupo}`, href: `/clases/${clase.id}` },
      { etiqueta: material.titulo }]} />
    <Cabecera kicker="Material audiovisual" titulo={material.titulo}
      nota="Edita el material y revisa las respuestas de los grupos asignados." />
    <EditorMaterial claseId={clase.id} actividadId={material.id} tituloInicial={material.titulo}
      instruccionInicial={material.instruccion} video={material.contenido.video}
      preguntasIniciales={material.contenido.preguntas} contenidoBloqueado={material.contenidoBloqueado}
      asignaciones={material.asignaciones.map((a) => ({ ...a, abreEn: a.abreEn.toISOString(), cierraEn: a.cierraEn.toISOString() }))} />
    <section className="sticker-panel mt-8 p-5" aria-labelledby="seguimiento-titulo">
      <h2 id="seguimiento-titulo" className="font-heading text-xl font-bold text-tinta">Seguimiento</h2>
      {seguimiento.grupos.map((grupo) => <TablaSeguimiento key={grupo.asignacionId} grupo={grupo} />)}
    </section>
  </Marco>;
}
