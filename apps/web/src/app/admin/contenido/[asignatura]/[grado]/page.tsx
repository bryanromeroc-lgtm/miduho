import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VistaMateria } from "@/features/materias/vista/vista-materia";
import { RUTA_CONTENIDO, rutaVistaPrevia } from "@/lib/contenido";
import { servicioContenido } from "@/server/modules/contenido";
import { exigirRolPagina } from "@/server/pagina";

type Parametros = {
  params: Promise<{ asignatura: string; grado: string }>;
  searchParams: Promise<{ pagina?: string | string[] }>;
};

export async function generateMetadata({ params }: Pick<Parametros, "params">): Promise<Metadata> {
  const { asignatura, grado } = await params;
  await exigirRolPagina(["ADMIN"], `${RUTA_CONTENIDO}/${asignatura}/${grado}`);
  const datos = await servicioContenido.materia(asignatura, grado);
  return { title: datos ? `Vista previa · ${datos.materia.nombre} ${datos.grado.nombre} · MIDUHO` : "Vista previa · MIDUHO" };
}

/*
  Vista previa de una materia en un grado para la coordinadora
  (vista-admin-contenido, D1/D3): la misma vista del estudiante, rotulada,
  sin estrellas, intentos ni datos de nadie. 404 si la asignatura o el grado
  no existen, o la asignatura no se dicta en ese grado.
*/
export default async function PaginaVistaPrevia({ params, searchParams }: Parametros) {
  const [{ asignatura, grado }, { pagina }] = await Promise.all([params, searchParams]);
  await exigirRolPagina(["ADMIN"], `${RUTA_CONTENIDO}/${asignatura}/${grado}`);
  const datos = await servicioContenido.materia(asignatura, grado);
  if (!datos) notFound();
  const base = rutaVistaPrevia(datos.materia.id, datos.grado.orden);
  return (
    <VistaMateria
      datos={datos}
      modo={{ tipo: "vista-previa", grado: datos.grado.nombre }}
      pagina={Number(typeof pagina === "string" ? pagina : 1)}
      hrefPagina={(n) => (n > 1 ? `${base}?pagina=${n}` : base)}
      volverHref={RUTA_CONTENIDO}
    />
  );
}
