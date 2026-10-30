import "server-only";
import nodemailer from "nodemailer";

type Mensaje = { para: string; asunto: string; texto: string };

/**
 * Envío de correo por SMTP (variables SMTP_*). Sin SMTP configurado:
 * en desarrollo se escribe el mensaje en consola; en producción se registra
 * un error sin el contenido (el enlace es una credencial).
 */
export async function enviarCorreo({ para, asunto, texto }: Mensaje) {
  const host = process.env.SMTP_HOST;
  if (!host) {
    if (process.env.NODE_ENV === "production") {
      console.error("[correo] SMTP_HOST no configurado; no se envió el correo.");
      return;
    }
    console.info(`[correo:dev] Para: ${para}\nAsunto: ${asunto}\n\n${texto}`);
    return;
  }
  const transporte = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
  await transporte.sendMail({
    from: process.env.SMTP_FROM ?? "MIDUHO <no-responder@localhost>",
    to: para,
    subject: asunto,
    text: texto,
  });
}
