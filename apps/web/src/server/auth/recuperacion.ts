import "server-only";
import { db } from "@/server/db";
import { enviarCorreo } from "@/server/correo";
import { crearServicioCuentas } from "./cuentas";

function urlBase() {
  return process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
}

/**
 * Instancia de la app. Sin SMTP_HOST, en desarrollo `enviarCorreo` imprime el
 * enlace en consola (requerimiento §4.1–4.2); SMTP productivo queda fuera.
 */
export const servicioCuentas = crearServicioCuentas(db, { notificar: enviarCorreo, urlBase: urlBase() });

/** Compatibilidad con los llamadores de Inc. 1. */
export const solicitarRestablecimiento = (correo: string) => servicioCuentas.solicitarRecuperacion(correo);
export const restablecerContrasena = (token: string, nueva: string) => servicioCuentas.establecerConToken(token, nueva);
export type ResultadoRestablecer = Awaited<ReturnType<typeof restablecerContrasena>>;
