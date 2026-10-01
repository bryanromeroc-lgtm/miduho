import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Tarjeta } from "../componentes";
import { FormularioLogin } from "./formulario";

export const metadata: Metadata = { title: "Ingresar · MIDUHO" };

export default async function PaginaLogin({
  searchParams,
}: {
  searchParams: Promise<{ desde?: string; restablecida?: string }>;
}) {
  const sesion = await auth();
  if (sesion?.user) redirect("/cuenta");
  const { desde, restablecida } = await searchParams;
  return (
    <Tarjeta titulo="Ingresar a MIDUHO">
      <FormularioLogin desde={desde} restablecida={restablecida === "1"} />
    </Tarjeta>
  );
}
