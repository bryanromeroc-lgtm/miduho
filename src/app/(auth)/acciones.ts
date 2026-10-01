"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/auth";
import {
  esquemaLogin,
  esquemaRestablecer,
  esquemaSolicitudRecuperacion,
} from "@/server/auth/esquemas";
import { restablecerContrasena, solicitarRestablecimiento } from "@/server/auth/recuperacion";

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
    await solicitarRestablecimiento(datos.data.correo);
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
