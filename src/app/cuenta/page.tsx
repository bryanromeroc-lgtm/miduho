import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { KeyRound, LogOut } from "lucide-react";
import { auth } from "@/auth";
import { Cabecera, Marco } from "@/components/friso/marco";
import { nombreRol } from "@/lib/navegacion";
import { obtenerDatosShell } from "@/server/shell";
import { cerrarSesion } from "../(auth)/acciones";
import { Aviso, Panel } from "../(auth)/componentes";

export const metadata: Metadata = { title: "Mi cuenta · MIDUHO" };

/** Cuenta dentro del shell. Verifica la sesión en el servidor (no confía en proxy.ts). */
export default async function PaginaCuenta({
  searchParams,
}: {
  searchParams: Promise<{ sinPermiso?: string }>;
}) {
  const sesion = await auth();
  if (!sesion?.user?.id) redirect("/login?desde=/cuenta");
  const datos = await obtenerDatosShell();
  if (!datos) redirect("/login?desde=/cuenta");
  const { sinPermiso } = await searchParams;

  const roles = datos.roles.length ? datos.roles.map(nombreRol).join(", ") : "Sin rol asignado";
  const puedeCambiar = datos.roles.includes("ADMIN") || datos.roles.includes("DOCENTE");
  const esEstudiante = datos.roles.includes("ESTUDIANTE");
  const esDocente = datos.roles.includes("DOCENTE");

  return (
    <Marco>
      <Cabecera kicker={roles} titulo="Mi cuenta" nota="Tus datos los administra el colegio. Si algo no es correcto, avisa a la administración." />
      {sinPermiso === "1" ? (
        <div className="mb-5 max-w-[720px]">
          <Aviso tipo="error">No tienes permiso para abrir esa sección con tu cuenta.</Aviso>
        </div>
      ) : null}
      <div className="cuenta-rejilla">
        <Panel titulo="Datos de la cuenta" id="cuenta-datos">
          <dl className="cuenta-datos">
            <dt>Nombre</dt>
            <dd>{datos.nombre}</dd>
            <dt>Correo</dt>
            <dd>{datos.correo}</dd>
            <dt>Rol</dt>
            <dd>{roles}</dd>
            {esEstudiante ? (
              <>
                <dt>Grupo</dt>
                <dd>{datos.grupo ?? "Sin grupo asignado"}</dd>
              </>
            ) : null}
            {esDocente ? (
              <>
                <dt>Grupos a cargo</dt>
                <dd>{datos.gruposDocente.length ? datos.gruposDocente.join(", ") : "Sin grupos asignados"}</dd>
              </>
            ) : null}
            {datos.periodo ? (
              <>
                <dt>Período</dt>
                <dd>{datos.periodo}</dd>
              </>
            ) : null}
          </dl>
        </Panel>
        <Panel titulo="Seguridad" id="cuenta-seguridad">
          <p className="cuenta-texto">
            {puedeCambiar
              ? "Puedes cambiar tu contraseña cuando quieras. Al hacerlo se cierran tus sesiones abiertas."
              : "Tu contraseña la restablece tu docente o la administración del colegio."}
          </p>
          <div className="cuenta-acciones">
            {puedeCambiar ? (
              <Link href="/cuenta/contrasena" className="boton-pastilla" data-variante="primario">
                <KeyRound size={18} aria-hidden="true" /> Cambiar contraseña
              </Link>
            ) : null}
            <form action={cerrarSesion}>
              <button type="submit" className="boton-pastilla" data-variante="secundario">
                <LogOut size={18} aria-hidden="true" /> Cerrar sesión
              </button>
            </form>
          </div>
        </Panel>
      </div>
    </Marco>
  );
}
