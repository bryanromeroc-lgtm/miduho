import "server-only";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

function clave(): Buffer {
  const valor = process.env.CLAVE_CIFRADO_INTEGRACIONES;
  if (!valor) throw new Error("La integración de Google Drive no está configurada");
  const bytes = Buffer.from(valor, "base64");
  if (bytes.length !== 32 || bytes.toString("base64").replace(/=+$/, "") !== valor.replace(/=+$/, "")) {
    throw new Error("La clave de cifrado de integraciones debe tener 32 bytes en base64");
  }
  return bytes;
}

export function integracionConfigurada(): boolean {
  try { clave(); return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_API_KEY && process.env.GOOGLE_APP_ID); }
  catch { return false; }
}

export function cifrar(texto: string): string {
  const iv = randomBytes(12);
  const cifrador = createCipheriv("aes-256-gcm", clave(), iv);
  const cifrado = Buffer.concat([cifrador.update(texto, "utf8"), cifrador.final()]);
  return `v1:${iv.toString("base64url")}:${cifrador.getAuthTag().toString("base64url")}:${cifrado.toString("base64url")}`;
}

export function descifrar(valor: string): string {
  const [version, iv, tag, cifrado, extra] = valor.split(":");
  if (version !== "v1" || !iv || !tag || !cifrado || extra !== undefined) throw new Error("Credencial cifrada inválida");
  const descifrador = createDecipheriv("aes-256-gcm", clave(), Buffer.from(iv, "base64url"));
  descifrador.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([descifrador.update(Buffer.from(cifrado, "base64url")), descifrador.final()]).toString("utf8");
}
