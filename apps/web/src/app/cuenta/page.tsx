import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { KeyRound, LogOut } from "lucide-react";
import { auth } from "@/auth";
import { Cabecera, Marco } from "@/components/friso/marco";
import { nombreRol } from "@/lib/navegacion";
import { obtenerDatosShell } from "@/server/shell";
import { db } from "@/server/db";
import { pendientesHoy } from "@/server/modules/entregas/servicio";
import { integracionConfigurada } from "@/server/integraciones/google/cifrado";
import { AccionesGoogle } from "@/features/entregas/panel-google";
import { cerrarSesion } from "../(auth)/acciones";
import { Aviso, Panel } from "../(auth)/componentes";

export const metadata: Metadata = { title: "Mi cuenta · MIDUHO" };

/** Cuenta dentro del shell. Verifica la sesión en el servidor (no confía en proxy.ts). */
export default async function PaginaCuenta({
  searchParams,
}: {
  searchParams: Promise<{ sinPermiso?: string; google?: string }>;
}) {
  const sesion = await auth();
  if (!sesion?.user?.id) redirect("/login?desde=/cuenta");
  const datos = await obtenerDatosShell();
  if (!datos) redirect("/login?desde=/cuenta");
  const { sinPermiso, google } = await searchParams;
  const esAdmin = datos.roles.includes("ADMIN");
  const [integracion, pendientes] = await Promise.all([
    esAdmin ? db.integracionGoogle.findUnique({ where: { usuarioId: sesion.user.id } }) : null,
    datos.roles.includes("DOCENTE") ? pendientesHoy(sesion.user.id) : [],
  ]);

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
      {google ? <div className="mb-5 max-w-[720px]"><Aviso tipo={google === "conectado" ? "ok" : "error"}>{({ conectado: "Google Drive conectado", cancelado: "No se conectó Google Drive", permisos: "Google no concedió el permiso para Drive", error: "No se pudo conectar Google Drive" } as Record<string, string>)[google] ?? "No se pudo conectar Google Drive"}</Aviso></div> : null}
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
        {esAdmin ? <Panel titulo="Google Drive" id="cuenta-google">
          <p className="cuenta-texto">{!integracionConfigurada() ? "Integración no configurada" : integracion?.estado === "CONECTADA" && integracion.refreshTokenCifrado ? `Conectado como ${integracion.correoGoogle}` : integracion?.estado === "REVOCADA" ? "Conexión revocada" : "Sin conectar"}</p>
          {integracionConfigurada() ? <AccionesGoogle conectado={Boolean(integracion?.estado === "CONECTADA" && integracion.refreshTokenCifrado)} /> : null}
        </Panel> : null}
        {esDocente ? <Panel titulo="Entregas a coordinación" id="cuenta-entregas">
          <p className="cuenta-texto">{pendientes.length} {pendientes.length === 1 ? "entrega por hacer" : "entregas por hacer"}</p>
          <Link className="boton-pastilla" data-variante="secundario" href="/cuenta/entregas">Ver mis entregas</Link>
        </Panel> : null}
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
