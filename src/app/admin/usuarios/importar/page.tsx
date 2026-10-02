import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Cabecera, Marco } from "@/components/friso/marco";
import { exigirRolPagina } from "@/server/pagina";
import { FormularioImportacion } from "./formulario";

export const metadata: Metadata = { title: "Importar usuarios · Administración MIDUHO" };

export default async function PaginaImportarUsuarios() {
  await exigirRolPagina(["ADMIN"], "/admin/usuarios/importar");
  return (
    <Marco>
      <Link href="/admin/usuarios" className="admin-volver">
        <ChevronLeft size={18} aria-hidden="true" /> Volver a usuarios
      </Link>
      <Cabecera
        kicker="Administración · Usuarios"
        titulo="Importar desde CSV"
        nota="Hasta 500 filas por archivo. Se revisa todo antes de crear cuentas: si hay un error, no se crea ninguna. Las contraseñas iniciales se descargan una sola vez."
      />
      <FormularioImportacion />
    </Marco>
  );
}
