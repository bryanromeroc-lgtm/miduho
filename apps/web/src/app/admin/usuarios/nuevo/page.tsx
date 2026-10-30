import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Cabecera, Marco } from "@/components/friso/marco";
import { servicioUsuarios } from "@/server/modules/usuarios";
import { exigirRolPagina } from "@/server/pagina";
import { FormularioNuevoUsuario } from "./formulario";

export const metadata: Metadata = { title: "Nueva cuenta · Administración MIDUHO" };

export default async function PaginaNuevoUsuario() {
  await exigirRolPagina(["ADMIN"], "/admin/usuarios/nuevo");
  const grupos = await servicioUsuarios.gruposDisponibles();
  return (
    <Marco>
      <Link href="/admin/usuarios" className="admin-volver">
        <ChevronLeft size={18} aria-hidden="true" /> Volver a usuarios
      </Link>
      <Cabecera
        kicker="Administración · Usuarios"
        titulo="Nueva cuenta"
        nota="El correo es el usuario de ingreso y debe ser único. La contraseña inicial se muestra una sola vez."
      />
      <FormularioNuevoUsuario grupos={grupos} />
    </Marco>
  );
}
