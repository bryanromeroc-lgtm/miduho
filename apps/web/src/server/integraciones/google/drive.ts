import "server-only";
import { randomBytes } from "node:crypto";
import type { IntegracionGoogle } from "@/generated/prisma/client";
import { descifrar } from "./cifrado";
import { refrescarToken } from "./oauth";

export interface ClienteDrive {
  subir(entrada: { integracion: IntegracionGoogle; carpetaId: string; nombre: string; mime: string; bytes: Uint8Array }): Promise<{ id: string; webViewLink: string }>;
  obtenerCarpeta(integracion: IntegracionGoogle, carpetaId: string): Promise<{ id: string; name: string }>;
}
const cacheTokens = new Map<string, { token: string; utilHasta: number }>();
export async function accessToken(integracion: IntegracionGoogle): Promise<string> {
  if (!integracion.refreshTokenCifrado || integracion.estado !== "CONECTADA") throw new Error("Conecta Google Drive desde Cuenta");
  const vigente = cacheTokens.get(integracion.id);
  if (vigente && vigente.utilHasta > Date.now()) return vigente.token;
  const datos = await refrescarToken(descifrar(integracion.refreshTokenCifrado));
  cacheTokens.set(integracion.id, { token: datos.access_token, utilHasta: Date.now() + Math.max(0, datos.expires_in - 300) * 1000 });
  return datos.access_token;
}
export function olvidarToken(integracionId: string) { cacheTokens.delete(integracionId); }
async function respuestaDrive(respuesta: Response) {
  if (!respuesta.ok) throw new Error(`Google Drive respondió ${respuesta.status}`);
  return respuesta.json() as Promise<Record<string, string | boolean>>;
}
export class DriveReal implements ClienteDrive {
  async obtenerCarpeta(integracion: IntegracionGoogle, carpetaId: string) {
    const url = new URL(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(carpetaId)}`);
    url.search = new URLSearchParams({ fields: "id,name,mimeType,trashed", supportsAllDrives: "true" }).toString();
    const datos = await respuestaDrive(await fetch(url, { headers: { Authorization: `Bearer ${await accessToken(integracion)}` }, cache: "no-store" }));
    if (datos.mimeType !== "application/vnd.google-apps.folder" || datos.trashed === true) throw new Error("La carpeta de Drive no está disponible");
    return { id: String(datos.id), name: String(datos.name) };
  }
  async subir({ integracion, carpetaId, nombre, mime, bytes }: Parameters<ClienteDrive["subir"]>[0]) {
    if (bytes.byteLength > 5 * 1024 * 1024) {
      const token = await accessToken(integracion);
      const inicio = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true&fields=id,webViewLink", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, "Content-Type": "application/json; charset=UTF-8",
          "X-Upload-Content-Type": mime, "X-Upload-Content-Length": String(bytes.byteLength),
        },
        body: JSON.stringify({ name: nombre, parents: [carpetaId] }), cache: "no-store",
      });
      if (!inicio.ok) throw new Error(`Google Drive respondió ${inicio.status}`);
      const ubicacion = inicio.headers.get("Location");
      if (!ubicacion || new URL(ubicacion).origin !== "https://www.googleapis.com") throw new Error("Google Drive no devolvió una sesión de subida válida");
      const datos = await respuestaDrive(await fetch(ubicacion, {
        method: "PUT", headers: { "Content-Type": mime, "Content-Length": String(bytes.byteLength) },
        body: Buffer.from(bytes), cache: "no-store",
      }));
      if (!datos.id) throw new Error("Google Drive no devolvió un identificador");
      return { id: String(datos.id), webViewLink: String(datos.webViewLink ?? `https://drive.google.com/file/d/${encodeURIComponent(String(datos.id))}/view`) };
    }
    const boundary = `miduho_${randomBytes(12).toString("hex")}`;
    const metadata = JSON.stringify({ name: nombre, parents: [carpetaId] });
    const cuerpo = Buffer.concat([
      Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n--${boundary}\r\nContent-Type: ${mime}\r\n\r\n`),
      Buffer.from(bytes), Buffer.from(`\r\n--${boundary}--`),
    ]);
    const datos = await respuestaDrive(await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true&fields=id,webViewLink", {
      method: "POST", headers: { Authorization: `Bearer ${await accessToken(integracion)}`, "Content-Type": `multipart/related; boundary=${boundary}` },
      body: cuerpo, cache: "no-store",
    }));
    if (!datos.id) throw new Error("Google Drive no devolvió un identificador");
    return { id: String(datos.id), webViewLink: String(datos.webViewLink ?? `https://drive.google.com/file/d/${encodeURIComponent(String(datos.id))}/view`) };
  }
}
export class DriveFalso implements ClienteDrive {
  readonly subidas: { carpetaId: string; nombre: string; mime: string; tamano: number }[] = [];
  error: Error | null = null;
  async obtenerCarpeta(_integracion: IntegracionGoogle, carpetaId: string) {
    if (this.error) throw this.error;
    return { id: carpetaId, name: "Carpeta ficticia" };
  }
  async subir({ carpetaId, nombre, mime, bytes }: Parameters<ClienteDrive["subir"]>[0]) {
    if (this.error) throw this.error;
    this.subidas.push({ carpetaId, nombre, mime, tamano: bytes.byteLength });
    const id = `archivo-ficticio-${this.subidas.length}`;
    return { id, webViewLink: `https://drive.google.com/file/d/${id}/view` };
  }
}
