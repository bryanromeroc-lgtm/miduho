import "server-only";
import { createHash } from "node:crypto";
import { db } from "@/server/db";
import { conflicto, ErrorDominio, noEncontrado } from "@/server/errores";
import { extensionArchivo, nombreArchivoDrive, TAMANO_MAXIMO_ENTREGA, validarArchivoEntrega } from "@/lib/entregas";
import { type ClienteDrive, DriveReal } from "@/server/integraciones/google/drive";
import { GoogleRevocadoError } from "@/server/integraciones/google/oauth";

const MIMES = {
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".xls": "application/vnd.ms-excel",
  ".csv": "text/csv",
  ".pdf": "application/pdf",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
} as const;

export async function subirArchivo(entregaId: string, docenteId: string, archivo: File, cliente: ClienteDrive = new DriveReal()) {
  const entrega = await db.entregaDocente.findFirst({ where: { id: entregaId, docenteId }, include: {
    solicitud: { include: { integracion: true } }, docente: { select: { nombres: true, apellidos: true } },
  } });
  if (!entrega) throw noEncontrado("La entrega");
  if (entrega.solicitud.estado !== "ABIERTA") throw conflicto("ARCHIVADA", "Esta entrega ya no está abierta");
  if (archivo.size > TAMANO_MAXIMO_ENTREGA) throw new ErrorDominio("ARCHIVO_GRANDE", "El archivo supera 20 MB", 413);
  const extension = extensionArchivo(archivo.name);
  if (!extension || !entrega.solicitud.formatos.includes(extension)) {
    throw new ErrorDominio("FORMATO_INVALIDO", `Este documento debe ser ${entrega.solicitud.formatos.join(" o ")}`);
  }
  const bytes = new Uint8Array(await archivo.arrayBuffer());
  const errorFirma = validarArchivoEntrega(bytes, extension);
  if (errorFirma) throw new ErrorDominio("FIRMA_INVALIDA", errorFirma);
  const integracion = entrega.solicitud.integracion;
  if (!integracion || integracion.estado !== "CONECTADA" || !integracion.refreshTokenCifrado || entrega.solicitud.carpetaRequiereSeleccion) {
    await db.entregaDocente.update({ where: { id: entregaId }, data: { ultimoFalloEn: new Date() } });
    throw conflicto("DRIVE_SIN_CONEXION", "No se pudo guardar en el Drive de coordinación. Intenta más tarde");
  }
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  try {
    return await db.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM entregas_docente WHERE id = ${entregaId} FOR UPDATE`;
      const anterior = await tx.archivoEntrega.findFirst({ where: { entregaId }, orderBy: { version: "desc" }, select: { version: true } });
      const version = (anterior?.version ?? 0) + 1;
      const ahora = new Date();
      const nombre = nombreArchivoDrive(entrega.solicitud.titulo, `${entrega.docente.apellidos} ${entrega.docente.nombres}`, ahora, version, extension);
      const subido = await cliente.subir({ integracion, carpetaId: entrega.solicitud.carpetaDriveId, nombre, mime: MIMES[extension], bytes });
      return tx.archivoEntrega.create({ data: {
        entregaId, version, driveFileId: subido.id, nombreDrive: nombre, nombreOriginal: archivo.name,
        tamanoBytes: bytes.byteLength, sha256, mime: MIMES[extension], subidoEn: ahora,
      } });
    }, { timeout: 30_000 });
  } catch (error) {
    await db.entregaDocente.update({ where: { id: entregaId }, data: { ultimoFalloEn: new Date() } });
    if (error instanceof GoogleRevocadoError) await db.integracionGoogle.update({ where: { id: integracion.id }, data: { estado: "REVOCADA" } });
    throw conflicto("FALLO_DRIVE", "No se pudo guardar en el Drive de coordinación. Intenta más tarde");
  }
}
