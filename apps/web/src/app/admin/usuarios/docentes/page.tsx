import type { Metadata } from "next";
import { Marco } from "@/components/friso/marco";
import { exigirRolPagina } from "@/server/pagina";
import { ListadoCuentas } from "../listado";

export const metadata: Metadata = { title: "Docentes · Administración MIDUHO" };

export default async function PaginaDocentes({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await exigirRolPagina(["ADMIN"], "/admin/usuarios/docentes");
  return (
    <Marco>
      <ListadoCuentas tipo="docentes" sp={await searchParams} />
    </Marco>
  );
}
