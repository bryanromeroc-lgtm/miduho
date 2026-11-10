import type { Metadata } from "next";
import Link from "next/link";
import { Cabecera, Marco } from "@/components/friso/marco";
import { IndiceContenidoPedagogico } from "@/features/contenido-coordinacion/matriz";
import { RUTA_CONTENIDO } from "@/lib/contenido";
import { servicioContenido } from "@/server/modules/contenido";
import { exigirRolPagina } from "@/server/pagina";

export const metadata: Metadata = { title: "Contenido pedagógico · Administración MIDUHO" };

/** Contenido pedagógico del colegio por área, asignatura y grado. Solo consulta (vista-admin-contenido). */
export default async function PaginaContenido() {
  await exigirRolPagina(["ADMIN"], RUTA_CONTENIDO);
  const indice = await servicioContenido.indice();

  return (
    <Marco>
      <Cabecera
        kicker="Solo consulta: lo que reciben los estudiantes en cada grado."
        titulo="Contenido pedagógico"
        nota="Cada cifra es el número real de actividades del currículo para esa asignatura y grado. Abre una celda para ver la materia como la ve el estudiante."
      />
      {indice.areas.length === 0 ? (
        <div className="admin-vacio">
          <p>Todavía no hay áreas en la estructura académica.</p>
          <Link href="/admin/estructura" className="admin-enlace-fila">
            Ir a Estructura
          </Link>
        </div>
      ) : (
        <IndiceContenidoPedagogico indice={indice} />
      )}
    </Marco>
  );
}
