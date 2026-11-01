import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VistaMateria } from "@/features/materias/vista/vista-materia";
import { rutaVolver, vistaMateriaDeSesion } from "@/server/modules/materias";

export const metadata: Metadata = { title: "Mi materia · MIDUHO" };

// Vista de una materia del estudiante (vistas-de-materia). 404 fuera de su grupo o de su contexto.
export default async function PaginaMateria({
  params,
  searchParams,
}: {
  params: Promise<{ asignatura: string }>;
  searchParams: Promise<{ pagina?: string | string[] }>;
}) {
  const [{ asignatura }, { pagina }] = await Promise.all([params, searchParams]);
  const datos = await vistaMateriaDeSesion(asignatura);
  if (!datos) notFound();
  const base = `/materias/${encodeURIComponent(asignatura)}`;
  return (
    <VistaMateria
      datos={datos}
      pagina={Number(typeof pagina === "string" ? pagina : 1)}
      hrefPagina={(n) => (n > 1 ? `${base}?pagina=${n}` : base)}
      volverHref={rutaVolver(asignatura)}
    />
  );
}
