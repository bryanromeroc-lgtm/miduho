import type { Metadata } from "next";
import { Cabecera, Marco } from "@/components/friso/marco";
import { FormularioEstructura } from "./formulario";
import { exigirRolPagina } from "@/server/pagina";
import { esquemasAcademico as E, servicioAcademico } from "@/server/modules/academico";
import { esquemasUsuarios as EU, servicioUsuarios } from "@/server/modules/usuarios";

export const metadata: Metadata = { title: "Estructura académica · Administración MIDUHO" };

const plano = <T,>(valor: T): T => JSON.parse(JSON.stringify(valor)) as T;

export default async function PaginaEstructura() {
  await exigirRolPagina(["ADMIN"], "/admin/estructura");
  const pagina = E.paginacion.parse({ page: 1, pageSize: 100 });
  const filtroDocentes = EU.filtroUsuarios.parse({ rol: "DOCENTE", page: 1, pageSize: 100 });
  const [anios, periodos, areas, grados, grupos, asignaturas, docentes] = await Promise.all([
    servicioAcademico.aniosLectivos.listar(pagina),
    servicioAcademico.periodos.listar(E.filtroPeriodos.parse(pagina)),
    servicioAcademico.areas.listar(pagina),
    servicioAcademico.grados.listar(pagina),
    servicioAcademico.grupos.listar(E.filtroGrupos.parse(pagina)),
    servicioAcademico.asignaturas.listar(E.filtroAsignaturas.parse(pagina)),
    servicioUsuarios.listar(filtroDocentes),
  ]);

  return <Marco><Cabecera kicker="Administración" titulo="Estructura académica" nota="Configura años, períodos, áreas, grados, grupos y asignaturas. Todos los datos de prueba de MIDUHO son ficticios." />
    <FormularioEstructura
      anios={plano(anios.data)} periodos={plano(periodos.data)} areas={plano(areas.data)} grados={plano(grados.data)}
      grupos={plano(grupos.data)} asignaturas={plano(asignaturas.data)}
      docentes={docentes.data.filter((u) => u.estado === "ACTIVO").map((u) => ({ id: u.id, etiqueta: `${u.nombres} ${u.apellidos}` }))}
    />
  </Marco>;
}
