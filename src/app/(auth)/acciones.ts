"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth, signIn, signOut } from "@/auth";
import {
  esquemaCambioContrasena,
  esquemaLogin,
  esquemaRestablecer,
  esquemaSolicitudRecuperacion,
} from "@/server/auth/esquemas";
import { restablecerContrasena, servicioCuentas, solicitarRestablecimiento } from "@/server/auth/recuperacion";
import { recuperacionPermitida } from "@/server/auth/limite";
import { ErrorDominio } from "@/server/errores";

export type EstadoFormulario = {
  error?: string;
  errores?: Record<string, string>;
  ok?: boolean;
};

function primerosErrores(issues: { path: PropertyKey[]; message: string }[]) {
  const errores: Record<string, string> = {};
  for (const i of issues) {
    const k = String(i.path[0] ?? "formulario");
    errores[k] ??= i.message;
  }
  return errores;
}

/** Solo rutas internas: evita redirecciones abiertas con ?desde=https://… */
function destinoSeguro(desde: FormDataEntryValue | null) {
  return typeof desde === "string" && desde.startsWith("/") && !desde.startsWith("//") ? desde : "/cuenta";
}

export async function iniciarSesion(_: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const datos = esquemaLogin.safeParse({
    correo: formData.get("correo"),
    contrasena: formData.get("contrasena"),
  });
  if (!datos.success) return { errores: primerosErrores(datos.error.issues) };

  try {
    await signIn("credentials", {
      correo: datos.data.correo,
      contrasena: datos.data.contrasena,
      redirectTo: destinoSeguro(formData.get("desde")),
    });
  } catch (e) {
    // signIn redirige lanzando; solo se capturan errores de Auth.js.
    if (e instanceof AuthError) {
      return {
        error:
          "Credenciales inválidas. Si fallas varias veces, el acceso se bloquea 15 minutos.",
      };
    }
    throw e;
  }
  return {};
}

export async function cerrarSesion() {
  await signOut({ redirectTo: "/login" });
}

export async function pedirRecuperacion(_: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const datos = esquemaSolicitudRecuperacion.safeParse({ correo: formData.get("correo") });
  if (!datos.success) return { errores: primerosErrores(datos.error.issues) };
  try {
    const h = await headers();
    const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip");
    // Excedido el límite se descarta en silencio: la respuesta es idéntica (sin enumeración).
    if (recuperacionPermitida(datos.data.correo, ip ?? null)) {
      await solicitarRestablecimiento(datos.data.correo);
    }
  } catch (e) {
    // Mismo mensaje para todos los casos (no revelar existencia de la cuenta).
    console.error("[recuperacion] fallo al solicitar", e instanceof Error ? e.message : e);
  }
  return { ok: true };
}

export async function guardarNuevaContrasena(_: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const datos = esquemaRestablecer.safeParse({
    token: formData.get("token"),
    contrasena: formData.get("contrasena"),
    confirmacion: formData.get("confirmacion"),
  });
  if (!datos.success) return { errores: primerosErrores(datos.error.issues) };

  const r = await restablecerContrasena(datos.data.token, datos.data.contrasena);
  if (!r.ok) {
    return { error: "El enlace no es válido o ya venció. Solicita uno nuevo." };
  }
  redirect("/login?restablecida=1");
}

/**
 * Cambio de contraseña propio (obligatorio para DOCENTE con contraseña temporal).
 * El trigger de BD revoca todas las sesiones; se vuelve a ingresar con la nueva.
 */
export async function cambiarContrasenaPropia(_: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const sesion = await auth();
  if (!sesion?.user?.id) redirect("/login?desde=/cuenta/contrasena");
  const datos = esquemaCambioContrasena.safeParse({
    actual: formData.get("actual"),
    contrasena: formData.get("contrasena"),
    confirmacion: formData.get("confirmacion"),
  });
  if (!datos.success) return { errores: primerosErrores(datos.error.issues) };
  try {
    await servicioCuentas.cambiarContrasena(sesion.user.id, datos.data.actual, datos.data.contrasena);
  } catch (e) {
    if (e instanceof ErrorDominio) {
      return e.code === "CONTRASENA_ACTUAL_INVALIDA" ? { errores: { actual: e.message } } : { error: e.message };
    }
    throw e;
  }
  await signOut({ redirectTo: "/login?restablecida=1" });
  return {};
}
