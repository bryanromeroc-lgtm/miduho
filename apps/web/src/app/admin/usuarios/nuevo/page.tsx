import type { Metadata } from "next";
import { Cabecera, Marco, Migas } from "@/components/friso/marco";
import type { CombinacionAlta } from "@/lib/usuarios";
import { servicioUsuarios } from "@/server/modules/usuarios";
import { exigirRolPagina } from "@/server/pagina";
import { FormularioNuevoUsuario } from "./formulario";

export const metadata: Metadata = { title: "Nueva cuenta · Administración MIDUHO" };

const SECCION = {
  ESTUDIANTE: { etiqueta: "Estudiantes", href: "/admin/usuarios/estudiantes", titulo: "Nuevo estudiante" },
  DOCENTE: { etiqueta: "Docentes", href: "/admin/usuarios/docentes", titulo: "Nuevo docente" },
} as const;

export default async function PaginaNuevoUsuario({ searchParams }: { searchParams: Promise<{ tipo?: string | string[] }> }) {
  await exigirRolPagina(["ADMIN"], "/admin/usuarios/nuevo");
  const { tipo } = await searchParams;
  const inicial: CombinacionAlta = tipo === "estudiantes" ? "ESTUDIANTE" : "DOCENTE";
  const s = SECCION[inicial];
  const grupos = await servicioUsuarios.gruposDisponibles();
  return (
    <Marco>
      <Migas
        pasos={[
          { etiqueta: "Administración", href: "/admin/administracion" },
          { etiqueta: "Usuarios", href: "/admin/usuarios" },
          { etiqueta: s.etiqueta, href: s.href },
          { etiqueta: "Nueva cuenta" },
        ]}
      />
      <Cabecera
        kicker="El correo es el usuario de ingreso y debe ser único."
        titulo={s.titulo}
        nota="La contraseña inicial se muestra una sola vez. Las cuentas de administración las crea el equipo de desarrollo."
      />
      <FormularioNuevoUsuario grupos={grupos} inicial={inicial} />
    </Marco>
  );
}
