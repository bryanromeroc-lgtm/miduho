import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { inicioDeContexto } from "@/lib/navegacion";
import { Tarjeta } from "../componentes";
import { FormularioLogin } from "./formulario";

export const metadata: Metadata = { title: "Ingresar · MIDUHO" };

export default async function PaginaLogin({
  searchParams,
}: {
  searchParams: Promise<{ desde?: string; restablecida?: string }>;
}) {
  const sesion = await auth();
  if (sesion?.user?.id) {
    redirect(sesion.user.debeCambiarContrasena ? "/cuenta/contrasena" : inicioDeContexto(sesion.user.contexto));
  }
  const { desde, restablecida } = await searchParams;
  return (
    <Tarjeta titulo="Ingresar a MIDUHO" bajada="Usa el correo y la contraseña que te entregó el colegio.">
      <FormularioLogin desde={desde} restablecida={restablecida === "1"} />
    </Tarjeta>
  );
}
