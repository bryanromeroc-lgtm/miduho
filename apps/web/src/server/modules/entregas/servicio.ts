import "server-only";
import { db } from "@/server/db";
import { conflicto, ErrorDominio, noEncontrado } from "@/server/errores";
import { estadoEntrega } from "@/lib/entregas";
import type { DatosSolicitud } from "./esquemas";

async function docentesDestinatarias(datos: DatosSolicitud) {
  const docentes = await db.usuario.findMany({ where: {
    estado: "ACTIVO", roles: { some: { rol: { codigo: "DOCENTE" } } },
    ...(!datos.todasDocentes ? { id: { in: [...new Set(datos.docenteIds)] } } : {}),
  }, select: { id: true } });
  if (!docentes.length || (!datos.todasDocentes && docentes.length !== new Set(datos.docenteIds).size)) {
    throw new ErrorDominio("DESTINATARIAS_INVALIDAS", "Elige docentes activas válidas");
  }
  return docentes.map((docente) => docente.id);
}
async function validarPeriodo(periodoId: string | null | undefined) {
  if (!periodoId) return;
  const periodo = await db.periodo.findFirst({ where: { id: periodoId, anioLectivo: { estado: "ACTIVO" } } });
  if (!periodo) throw new ErrorDominio("PERIODO_INVALIDO", "El período no pertenece al año lectivo activo");
}
export async function crearSolicitud(adminId: string, datos: DatosSolicitud) {
  if (datos.cierreLocal.getTime() < Date.now()) throw new ErrorDominio("CIERRE_PASADO", "La fecha de cierre ya pasó");
  await validarPeriodo(datos.periodoId);
  const integracion = await db.integracionGoogle.findUnique({ where: { usuarioId: adminId } });
  if (!integracion || integracion.estado !== "CONECTADA" || !integracion.refreshTokenCifrado) {
    throw conflicto("DRIVE_SIN_CONEXION", "Conecta Google Drive desde Cuenta para crear entregas");
  }
  const destinatarias = await docentesDestinatarias(datos);
  return db.solicitudEntrega.create({ data: {
    titulo: datos.titulo, descripcion: datos.descripcion, tipoDocumento: datos.tipoDocumento,
    formatos: datos.formatos, cierraEn: datos.cierreLocal, periodoId: datos.periodoId,
    carpetaDriveId: datos.carpetaDriveId, carpetaDriveNombre: datos.carpetaDriveNombre,
    integracionId: integracion.id, creadaPorId: adminId,
    entregas: { create: destinatarias.map((docenteId) => ({ docenteId })) },
  } });
}
export async function editarSolicitud(id: string, datos: DatosSolicitud) {
  const existente = await db.solicitudEntrega.findUnique({ where: { id }, include: { entregas: { include: { archivos: { select: { id: true }, take: 1 } } } } });
  if (!existente) throw noEncontrado("La solicitud");
  if (existente.estado !== "ABIERTA") throw conflicto("SOLICITUD_ARCHIVADA", "Esta solicitud está archivada");
  await validarPeriodo(datos.periodoId);
  const destinatarias = await docentesDestinatarias(datos);
  const quitar = existente.entregas.filter((entrega) => !destinatarias.includes(entrega.docenteId));
  if (quitar.some((entrega) => entrega.archivos.length)) throw conflicto("YA_ENTREGO", "Esta docente ya entregó; no se puede quitar");
  const actuales = new Set(existente.entregas.map((entrega) => entrega.docenteId));
  return db.$transaction(async (tx) => {
    if (quitar.length) await tx.entregaDocente.deleteMany({ where: { id: { in: quitar.map((entrega) => entrega.id) } } });
    const nuevas = destinatarias.filter((docenteId) => !actuales.has(docenteId));
    if (nuevas.length) await tx.entregaDocente.createMany({ data: nuevas.map((docenteId) => ({ solicitudId: id, docenteId })) });
    return tx.solicitudEntrega.update({ where: { id }, data: {
      titulo: datos.titulo, descripcion: datos.descripcion, tipoDocumento: datos.tipoDocumento,
      formatos: datos.formatos, cierraEn: datos.cierreLocal, periodoId: datos.periodoId,
      carpetaDriveId: datos.carpetaDriveId, carpetaDriveNombre: datos.carpetaDriveNombre,
      carpetaRequiereSeleccion: false,
    } });
  });
}
export async function archivarSolicitud(id: string) {
  return db.solicitudEntrega.update({ where: { id }, data: { estado: "ARCHIVADA" } });
}
export async function eliminarSolicitud(id: string) {
  const archivos = await db.archivoEntrega.count({ where: { entrega: { solicitudId: id } } });
  if (archivos) throw conflicto("TIENE_ARCHIVOS", "No se puede eliminar una solicitud con archivos entregados");
  return db.solicitudEntrega.delete({ where: { id } });
}
export async function listarSolicitudes(estado: "ABIERTA" | "ARCHIVADA" = "ABIERTA") {
  const solicitudes = await db.solicitudEntrega.findMany({ where: { estado }, orderBy: { cierraEn: "asc" }, include: { entregas: { include: { archivos: { orderBy: { version: "desc" }, take: 1 } } } } });
  return solicitudes.map((solicitud) => {
    const estados = solicitud.entregas.map((entrega) => estadoEntrega({ cierraEn: solicitud.cierraEn, ultimaSubida: entrega.archivos[0]?.subidoEn, ahora: new Date() }).estado);
    return { ...solicitud, resumen: { entregadas: estados.filter((e) => e === "Entregada").length, tardias: estados.filter((e) => e === "Tardía").length, sinEntregar: estados.filter((e) => e === "Sin entregar").length, total: estados.length } };
  });
}
export async function obtenerTablero(id: string) {
  const solicitud = await db.solicitudEntrega.findUnique({ where: { id }, include: { entregas: { include: { docente: { select: { nombres: true, apellidos: true } }, archivos: { orderBy: { version: "desc" } } } } } });
  if (!solicitud) throw noEncontrado("La solicitud");
  return { ...solicitud, entregas: solicitud.entregas.map((entrega) => ({ ...entrega, calculado: estadoEntrega({ cierraEn: solicitud.cierraEn, ultimaSubida: entrega.archivos[0]?.subidoEn, ahora: new Date() }) })) };
}
export async function entregasDocente(docenteId: string) {
  const entregas = await db.entregaDocente.findMany({ where: { docenteId, solicitud: { estado: "ABIERTA" } }, include: { solicitud: true, archivos: { orderBy: { version: "desc" } } }, orderBy: { solicitud: { cierraEn: "asc" } } });
  return entregas.map((entrega) => ({ ...entrega, calculado: estadoEntrega({ cierraEn: entrega.solicitud.cierraEn, ultimaSubida: entrega.archivos[0]?.subidoEn, ahora: new Date() }) }));
}
export async function pendientesHoy(docenteId: string) {
  const entregas = await entregasDocente(docenteId);
  return entregas.filter((entrega) => entrega.calculado.estado === "Pendiente" || entrega.calculado.estado === "Sin entregar");
}
