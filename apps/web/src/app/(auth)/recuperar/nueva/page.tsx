import type { Metadata } from "next";
import Link from "next/link";
import { Aviso, Tarjeta } from "../../componentes";
import { FormularioNuevaContrasena } from "./formulario";

export const metadata: Metadata = {
  title: "Nueva contraseña · MIDUHO",
  // El token viaja en la URL: no indexar ni filtrar por Referer.
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function PaginaNuevaContrasena({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return (
    <Tarjeta titulo="Crear nueva contraseña" bajada="Elige una contraseña que no uses en otro sitio.">
      {token ? (
        <FormularioNuevaContrasena token={token} />
      ) : (
        <div className="acceso-formulario">
          <Aviso tipo="error">El enlace no es válido o está incompleto.</Aviso>
          <Link href="/recuperar" className="acceso-enlace">
            Pedir otro enlace
          </Link>
        </div>
      )}
    </Tarjeta>
  );
}
