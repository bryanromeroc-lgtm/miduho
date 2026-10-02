import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Cabecera, Marco } from "@/components/friso/marco";
import { cerrarSesion } from "../../(auth)/acciones";
import { Aviso, Panel, Tarjeta } from "../../(auth)/componentes";
import { FormularioCambioContrasena } from "./formulario";

export const metadata: Metadata = { title: "Cambiar contraseña · MIDUHO" };

/**
 * Cambio de contraseña propio; obligatorio tras recibir una contraseña temporal
 * (§4.2). Con cambio pendiente se muestra como pantalla de acceso (el resto de
 * rutas está bloqueado); si no, dentro del shell.
 */
export default async function PaginaCambioContrasena() {
  const sesion = await auth();
  if (!sesion?.user?.id) redirect("/login?desde=/cuenta/contrasena");
  const puedeCambiar = sesion.user.roles.includes("ADMIN") || sesion.user.roles.includes("DOCENTE");

  if (sesion.user.debeCambiarContrasena) {
    return (
      <Tarjeta
        titulo="Crea tu contraseña"
        bajada="Ingresaste con una contraseña temporal. Crea una propia para continuar; luego vuelve a ingresar con ella."
      >
        <FormularioCambioContrasena />
        <form action={cerrarSesion}>
          <button type="submit" className="acceso-enlace">
            Cerrar sesión
          </button>
        </form>
      </Tarjeta>
    );
  }

  return (
    <Marco>
      <Cabecera kicker="Cuenta" titulo="Cambiar contraseña" />
      <div className="max-w-[520px]">
        <Panel titulo="Nueva contraseña" id="contrasena-titulo">
          {!puedeCambiar ? (
            <div className="acceso-formulario">
              <Aviso tipo="error">Tu contraseña la restablece tu docente o la administración del colegio.</Aviso>
              <Link href="/cuenta" className="acceso-enlace">
                Volver a Cuenta
              </Link>
            </div>
          ) : (
            <FormularioCambioContrasena />
          )}
        </Panel>
      </div>
    </Marco>
  );
}
