import type { Metadata } from "next";
import { Cabecera, Marco, Migas } from "@/components/friso/marco";
import { exigirRolPagina } from "@/server/pagina";
import { FormularioImportacion } from "./formulario";

export const metadata: Metadata = { title: "Importar usuarios · Administración MIDUHO" };

export default async function PaginaImportarUsuarios({ searchParams }: { searchParams: Promise<{ tipo?: string | string[] }> }) {
  await exigirRolPagina(["ADMIN"], "/admin/usuarios/importar");
  const { tipo } = await searchParams;
  const inicial = tipo === "docentes" ? "docentes" : "estudiantes";
  return (
    <Marco>
      <Migas
        pasos={[
          { etiqueta: "Administración", href: "/admin/administracion" },
          { etiqueta: "Usuarios", href: "/admin/usuarios" },
          { etiqueta: inicial === "docentes" ? "Docentes" : "Estudiantes", href: `/admin/usuarios/${inicial}` },
          { etiqueta: "Importar CSV" },
        ]}
      />
      <Cabecera
        kicker="Hasta 500 filas por archivo."
        titulo="Importar desde CSV"
        nota="Se revisa todo antes de crear cuentas: si hay un error, no se crea ninguna. Las contraseñas iniciales se descargan una sola vez. El CSV nunca crea cuentas de administración."
      />
      <FormularioImportacion inicial={inicial} />
    </Marco>
  );
}
