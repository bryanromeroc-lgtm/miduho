import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { PrismaClient } from "@/generated/prisma/client";
import { abrirBasePrueba, type BasePrueba } from "../soporte/base-pruebas";

vi.mock("server-only", () => ({}));
const estado = vi.hoisted(() => ({ db: null as PrismaClient | null }));
vi.mock("@/server/db", () => ({ get db() { return estado.db; } }));
import { DriveFalso } from "@/server/integraciones/google/drive";
import { GoogleRevocadoError } from "@/server/integraciones/google/oauth";
import { crearSolicitud, editarSolicitud, obtenerTablero } from "@/server/modules/entregas/servicio";
import { subirArchivo } from "@/server/modules/entregas/subida";

let base: BasePrueba;
let db: PrismaClient;
let adminId: string;
let docenteId: string;
let ajenaId: string;
let solicitudId: string;
let entregaId: string;
const manana = () => new Date(Date.now() + 86_400_000);
const datos = () => ({
  titulo: "Planilla de prueba ficticia", descripcion: "Sin datos de estudiantes", tipoDocumento: "PLANILLA_NOTAS" as const,
  formatos: [".xlsx" as const], cierreLocal: manana(), periodoId: null, todasDocentes: false,
  docenteIds: [docenteId], carpetaDriveId: "carpeta-ficticia", carpetaDriveNombre: "Carpeta ficticia",
});
const archivo = (nombre: string, bytes: number[]) => new File([new Uint8Array(bytes)], nombre);

beforeAll(async () => {
  base = await abrirBasePrueba(); db = base.db; estado.db = db;
  await db.rol.createMany({ data: [{ codigo: "ADMIN", nombre: "Administración" }, { codigo: "DOCENTE", nombre: "Docente" }] });
  adminId = (await db.usuario.create({ data: { nombres: "Cuenta", apellidos: "Administradora ficticia", correo: "admin-entrega@miduho.test", estado: "ACTIVO", roles: { create: { rol: { connect: { codigo: "ADMIN" } } } } } })).id;
  docenteId = (await db.usuario.create({ data: { nombres: "Cuenta", apellidos: "Docente ficticia", correo: "docente-entrega@miduho.test", estado: "ACTIVO", roles: { create: { rol: { connect: { codigo: "DOCENTE" } } } } } })).id;
  ajenaId = (await db.usuario.create({ data: { nombres: "Otra", apellidos: "Cuenta ficticia", correo: "otra-entrega@miduho.test", estado: "ACTIVO", roles: { create: { rol: { connect: { codigo: "DOCENTE" } } } } } })).id;
});
afterAll(async () => { if (base) await base.cerrar(); });

describe("entregas con Drive falso", () => {
  it("exige conexión y crea una entrega por destinataria", async () => {
    await expect(crearSolicitud(adminId, datos())).rejects.toMatchObject({ code: "DRIVE_SIN_CONEXION" });
    await db.integracionGoogle.create({ data: { usuarioId: adminId, correoGoogle: "cuenta-ficticia@example.test", refreshTokenCifrado: "cifrado-ficticio", scopes: ["drive.file"] } });
    const solicitud = await crearSolicitud(adminId, datos()); solicitudId = solicitud.id;
    entregaId = (await db.entregaDocente.findFirstOrThrow({ where: { solicitudId } })).id;
    expect((await obtenerTablero(solicitudId)).entregas[0].calculado.estado).toBe("Pendiente");
  });
  it("valida destinataria, contenido, versiones y plazo ampliado", async () => {
    const drive = new DriveFalso();
    const zip = archivo("planilla.xlsx", [0x50, 0x4b, 3, 4]);
    await expect(subirArchivo(entregaId, ajenaId, zip, drive)).rejects.toMatchObject({ status: 404 });
    await expect(subirArchivo(entregaId, docenteId, archivo("otro.pdf", [0x25, 0x50, 0x44, 0x46]), drive)).rejects.toMatchObject({ code: "FORMATO_INVALIDO" });
    await expect(subirArchivo(entregaId, docenteId, archivo("falso.xlsx", [1, 2, 3]), drive)).rejects.toMatchObject({ code: "FIRMA_INVALIDA" });
    expect(drive.subidas).toHaveLength(0);
    const primera = await subirArchivo(entregaId, docenteId, zip, drive);
    expect(primera.version).toBe(1);
    expect((await obtenerTablero(solicitudId)).entregas[0].calculado.estado).toBe("Entregada");
    await db.solicitudEntrega.update({ where: { id: solicitudId }, data: { cierraEn: new Date(Date.now() - 60_000) } });
    const segunda = await subirArchivo(entregaId, docenteId, zip, drive);
    expect(segunda.version).toBe(2);
    expect(drive.subidas[1].nombre).toContain("_v2.xlsx");
    expect((await obtenerTablero(solicitudId)).entregas[0].calculado.estado).toBe("Tardía");
    await editarSolicitud(solicitudId, { ...datos(), cierreLocal: manana() });
    expect((await obtenerTablero(solicitudId)).entregas[0].calculado.estado).toBe("Entregada");
  });
  it("registra fallo de Drive, revocación y archivo", async () => {
    const drive = new DriveFalso(); drive.error = new GoogleRevocadoError();
    await expect(subirArchivo(entregaId, docenteId, archivo("planilla.xlsx", [0x50, 0x4b, 3, 4]), drive)).rejects.toMatchObject({ code: "FALLO_DRIVE" });
    expect((await db.entregaDocente.findUniqueOrThrow({ where: { id: entregaId } })).ultimoFalloEn).not.toBeNull();
    expect((await db.integracionGoogle.findUniqueOrThrow({ where: { usuarioId: adminId } })).estado).toBe("REVOCADA");
    await db.solicitudEntrega.update({ where: { id: solicitudId }, data: { estado: "ARCHIVADA" } });
    await expect(subirArchivo(entregaId, docenteId, archivo("planilla.xlsx", [0x50, 0x4b, 3, 4]), new DriveFalso())).rejects.toMatchObject({ code: "ARCHIVADA" });
  });
});
