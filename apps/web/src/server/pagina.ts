import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import type { RolSesion } from "@/server/auth/sesion";

/**
 * Guarda de página en servidor (defensa en profundidad: no confía solo en
 * proxy.ts). Sin sesión → login conservando destino; sin rol → Cuenta.
 */
export async function exigirRolPagina(permitidos: RolSesion[], desde: string) {
  const sesion = await auth();
  if (!sesion?.user?.id) redirect(`/login?desde=${encodeURIComponent(desde)}`);
  if (sesion.user.debeCambiarContrasena) redirect("/cuenta/contrasena");
  if (!sesion.user.roles.some((r) => (permitidos as string[]).includes(r))) redirect("/cuenta?sinPermiso=1");
  return sesion.user;
}
