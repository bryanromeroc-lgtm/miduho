import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Aviso, Tarjeta } from "../../(auth)/componentes";
import { FormularioCambioContrasena } from "./formulario";

export const metadata: Metadata = { title: "Cambiar contraseña · MIDUHO" };

/** Cambio de contraseña propio; obligatorio tras recibir una contraseña temporal (§4.2). */
export default async function PaginaCambioContrasena() {
  const sesion = await auth();
  if (!sesion?.user?.id) redirect("/login?desde=/cuenta/contrasena");
  const puedeCambiar = sesion.user.roles.includes("ADMIN") || sesion.user.roles.includes("DOCENTE");
  return (
    <Tarjeta titulo="Cambiar contraseña">
      {!puedeCambiar ? (
        <Aviso tipo="error">Tu contraseña la restablece tu docente o la administración del colegio.</Aviso>
      ) : (
        <>
          {sesion.user.debeCambiarContrasena ? (
            <div className="mb-4">
              <Aviso tipo="ok">
                Ingresaste con una contraseña temporal. Crea una contraseña propia para continuar.
              </Aviso>
            </div>
          ) : null}
          <FormularioCambioContrasena />
        </>
      )}
    </Tarjeta>
  );
}
