import type { Metadata } from "next";
import { Marco } from "@/components/friso/marco";
import { exigirRolPagina } from "@/server/pagina";
import { ListadoCuentas } from "../listado";

export const metadata: Metadata = { title: "Estudiantes · Administración MIDUHO" };

export default async function PaginaEstudiantes({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await exigirRolPagina(["ADMIN"], "/admin/usuarios/estudiantes");
  return (
    <Marco>
      <ListadoCuentas tipo="estudiantes" sp={await searchParams} />
    </Marco>
  );
}
