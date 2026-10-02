/**
 * Suite QA (INC1R-12) · Seguridad.
 *
 * Verificación independiente de los ciclos de contraseña y la revocación de
 * sesiones (requerimiento §4), desde el servicio real de cuentas contra una
 * SQLite temporal con las migraciones reales:
 *
 *  - secretos no recuperables: solo hash bcrypt de contraseñas y SHA-256 de
 *    tokens; la contraseña legible del estudiante se entrega una sola vez;
 *  - tokens de un solo uso, con vigencia de 24 h, tipo (RECUPERACION/INVITACION)
 *    y reenvío que invalida el anterior;
 *  - límites de solicitudes (recuperación y login) con descarte silencioso;
 *  - revocación inmediata: toda mutación sensible incrementa versionSesion,
 *    que es la fuente de invalidación de los JWT.
 */
import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaClient } from "@/generated/prisma/client";
import { hashearToken, hashearContrasena, verificarContrasena, VIGENCIA_RESTABLECIMIENTO_MS } from "@/server/auth/contrasena";
import { generarContrasenaEstudiante } from "@/server/auth/credenciales";
import { crearServicioCuentas, type ServicioCuentas } from "@/server/auth/cuentas";
import { ControlIntentos } from "@/server/auth/intentos";
import { LimiteSolicitudes } from "@/server/auth/limite";
import { ErrorDominio } from "@/server/errores";
import { crearServicioUsuarios, type ServicioUsuarios } from "@/server/modules/usuarios/servicio";

async function codigoDe(p: Promise<unknown>) {
  try {
    await p;
  } catch (e) {
    if (e instanceof ErrorDominio) return `${e.status}:${e.code}`;
    throw e;
  }
  return "OK";
}

let dir: string;
let db: PrismaClient;
let C: ServicioCuentas;
let U: ServicioUsuarios;
const buzon: { para: string; texto: string }[] = [];
const reloj = new Date("2026-03-01T12:00:00.000Z");

beforeAll(async () => {
  dir = mkdtempSync(path.join(tmpdir(), "miduho-qa-seguridad-"));
  const url = `file:${path.join(dir, "test.db")}`;
  const raiz = path.resolve(__dirname, "../../../prisma/migrations");
  const migrador = createClient({ url });
  for (const m of readdirSync(raiz).filter((n) => /^\d+_/.test(n)).sort()) {
    await migrador.executeMultiple(readFileSync(path.join(raiz, m, "migration.sql"), "utf8"));
  }
  migrador.close();
  db = new PrismaClient({ adapter: new PrismaLibSql({ url }) });
  for (const codigo of ["ADMIN", "DOCENTE", "ESTUDIANTE"]) await db.rol.create({ data: { codigo, nombre: codigo } });
  C = crearServicioCuentas(db, {
    notificar: async (m) => void buzon.push(m),
    urlBase: "http://localhost:3000",
    costo: 4,
    ahora: () => reloj,
  });
  U = crearServicioUsuarios(db, C, { ahora: () => reloj });
}, 90_000);

afterAll(async () => {
  await db?.$disconnect();
  if (dir) rmSync(dir, { recursive: true, force: true });
});

describe("suite QA · secretos no recuperables", () => {
  it("la contraseña legible del estudiante se entrega una vez y en BD solo queda el hash", async () => {
    const r = await C.crearEstudiante({ nombres: "Cuenta", apellidos: "Ficticia", correo: "est-secreto@miduho.test" });
    expect(typeof r.contrasena).toBe("string");
    expect(r.contrasena.length).toBeGreaterThanOrEqual(10);

    const u = await db.usuario.findUniqueOrThrow({ where: { id: r.id } });
    // El hash no contiene el texto plano y es un bcrypt válido.
    expect(u.hashContrasena).not.toBe(r.contrasena);
    expect(u.hashContrasena).not.toContain(r.contrasena);
    expect(u.hashContrasena).toMatch(/^\$2/);
    expect(await verificarContrasena(r.contrasena, u.hashContrasena!)).toBe(true);

    // Ninguna ruta de lectura devuelve la contraseña: la única operación posterior
    // es restablecerla (genera una nueva), no recuperarla.
    expect(await db.restablecimientoContrasena.count({ where: { usuarioId: r.id } })).toBe(0);
    const nueva = await C.restablecerEstudiantes({ id: "actor-admin", roles: ["ADMIN"] }, [r.id]);
    expect(nueva.csv).toContain("est-secreto@miduho.test");
    expect(nueva.csv).not.toContain(r.contrasena);
  });

  it("genera contraseñas estudiantiles legibles (dos palabras y cuatro dígitos)", () => {
    for (let i = 0; i < 20; i++) {
      const c = generarContrasenaEstudiante();
      expect(c).toMatch(/^[a-z]+-[a-z]+-\d{4}$/);
    }
  });

  it("los tokens se almacenan solo como SHA-256, nunca en claro", async () => {
    const { id } = await C.invitarAdmin({ nombres: "Cuenta", apellidos: "Ficticia", correo: "admin-secreto@miduho.test" });
    const registro = await db.restablecimientoContrasena.findFirstOrThrow({ where: { usuarioId: id } });
    expect(registro.tokenHash).toMatch(/^[0-9a-f]{64}$/);
    const textoEnviado = buzon.find((m) => m.para === "admin-secreto@miduho.test")?.texto ?? "";
    const token = textoEnviado.split("token=")[1]?.split(/\s/)[0] ?? "";
    expect(token.length).toBeGreaterThanOrEqual(40);
    expect(registro.tokenHash).toBe(hashearToken(decodeURIComponent(token)));
  });
});

describe("suite QA · tokens de un solo uso", () => {
  it("la invitación de ADMIN vence en 24 h y se consume una sola vez", async () => {
    const { id } = await C.invitarAdmin({ nombres: "Cuenta", apellidos: "Ficticia", correo: "admin-token@miduho.test" });
    const registro = await db.restablecimientoContrasena.findFirstOrThrow({ where: { usuarioId: id } });
    expect(registro.expiraEn.getTime() - reloj.getTime()).toBe(VIGENCIA_RESTABLECIMIENTO_MS);
    expect(registro.tipo).toBe("INVITACION");

    const token = decodeURIComponent((buzon.find((m) => m.para === "admin-token@miduho.test")!.texto.split("token=")[1] ?? "").split(/\s/)[0]);
    const r1 = await C.establecerConToken(token, "clave-nueva-1");
    expect(r1).toEqual({ ok: true });
    expect((await db.usuario.findUniqueOrThrow({ where: { id } })).estado).toBe("ACTIVO");

    // Un solo uso: el mismo token ya no sirve.
    expect(await C.establecerConToken(token, "otra-clave-2")).toEqual({ ok: false, motivo: "token-invalido" });
  });

  it("el reenvío invalida el enlace anterior", async () => {
    const { id } = await C.invitarAdmin({ nombres: "Cuenta", apellidos: "Ficticia", correo: "admin-reenvio@miduho.test" });
    const primero = decodeURIComponent((buzon.find((m) => m.para === "admin-reenvio@miduho.test")!.texto.split("token=")[1] ?? "").split(/\s/)[0]);
    await C.reenviarInvitacion(id);
    expect(await C.establecerConToken(primero, "clave-nueva-1")).toEqual({ ok: false, motivo: "token-invalido" });
    // El nuevo enlace sí funciona.
    const segundo = decodeURIComponent((buzon.filter((m) => m.para === "admin-reenvio@miduho.test").at(-1)!.texto.split("token=")[1] ?? "").split(/\s/)[0]);
    expect(segundo).not.toBe(primero);
    expect(await C.establecerConToken(segundo, "clave-nueva-1")).toEqual({ ok: true });
  });

  it("la recuperación solo aplica a ADMIN/DOCENTE activos y no revela la existencia", async () => {
    await db.usuario.create({
      data: { nombres: "Doc", apellidos: "Ficticia", correo: "doc-recupera@miduho.test", estado: "ACTIVO", hashContrasena: await hashearContrasena("clave-actual-1", 4), roles: { create: { rol: { connect: { codigo: "DOCENTE" } } } } },
    });
    const est = await db.usuario.create({
      data: { nombres: "Est", apellidos: "Ficticia", correo: "est-recupera@miduho.test", estado: "ACTIVO", hashContrasena: await hashearContrasena("clave-actual-1", 4), roles: { create: { rol: { connect: { codigo: "ESTUDIANTE" } } } } },
    });

    await C.solicitarRecuperacion("doc-recupera@miduho.test");
    expect(buzon.some((m) => m.para === "doc-recupera@miduho.test")).toBe(true);
    expect((await db.restablecimientoContrasena.findFirst({ where: { usuarioId: (await db.usuario.findUniqueOrThrow({ where: { correo: "doc-recupera@miduho.test" } })).id } }))?.tipo).toBe("RECUPERACION");

    // Estudiante: no hay recuperación por correo (§4.3).
    await C.solicitarRecuperacion("est-recupera@miduho.test");
    expect(buzon.some((m) => m.para === "est-recupera@miduho.test")).toBe(false);
    expect(await db.restablecimientoContrasena.count({ where: { usuarioId: est.id } })).toBe(0);

    // Cuenta inexistente: silencio total, sin token ni correo.
    await C.solicitarRecuperacion("nadie@miduho.test");
    expect(buzon.some((m) => m.para === "nadie@miduho.test")).toBe(false);
  });
});

describe("suite QA · límites de solicitudes", () => {
  it("limita la recuperación a 3 por correo y 10 por IP cada hora", () => {
    let t = 0;
    const porCorreo = new LimiteSolicitudes(3, 60 * 60 * 1000, () => t);
    const porIp = new LimiteSolicitudes(10, 60 * 60 * 1000, () => t);
    for (let i = 0; i < 3; i++) expect(porCorreo.permitir("doc@miduho.test")).toBe(true);
    expect(porCorreo.permitir("doc@miduho.test")).toBe(false);
    // La misma clave normalizada (mayúsculas/espacios) sigue contando.
    expect(porCorreo.permitir(" DOC@MIDUHO.TEST ")).toBe(false);
    for (let i = 0; i < 10; i++) expect(porIp.permitir("10.0.0.1")).toBe(true);
    expect(porIp.permitir("10.0.0.1")).toBe(false);
    // Al vencer la ventana se reinicia.
    t = 60 * 60 * 1000 + 1;
    expect(porCorreo.permitir("doc@miduho.test")).toBe(true);
  });

  it("bloquea el login tras 5 fallos durante 15 minutos", () => {
    let t = 0;
    const c = new ControlIntentos(() => t, 5, 15 * 60 * 1000, 15 * 60 * 1000);
    for (let i = 0; i < 5; i++) c.registrarFallo("alguien@miduho.test");
    expect(c.estaBloqueado("ALGUIEN@miduho.test")).toBe(true);
    expect(c.estaBloqueado("alguien@miduho.test")).toBe(true);
    t = 15 * 60 * 1000 + 1;
    expect(c.estaBloqueado("alguien@miduho.test")).toBe(false);
    c.limpiar("alguien@miduho.test");
  });
});

describe("suite QA · revocación inmediata", () => {
  it("cambiar estado, contraseña o roles incrementa la versión de sesión", async () => {
    const doc = await C.crearDocente({ nombres: "Doc", apellidos: "Ficticia", correo: "doc-revoca@miduho.test" });
    const version = async () => (await db.usuario.findUniqueOrThrow({ where: { id: doc.id } })).versionSesion;
    const inicial = await version();

    // Cambio de contraseña obligatorio (DOCENTE con temporal) revoca.
    await C.cambiarContrasena(doc.id, doc.contrasenaTemporal, "clave-nueva-123");
    expect(await version()).toBe(inicial + 1);

    // Desactivar la cuenta revoca.
    const admin = (await db.usuario.create({
      data: { nombres: "Admin", apellidos: "Ficticia", correo: "admin-revoca@miduho.test", estado: "ACTIVO", hashContrasena: await hashearContrasena("clave-1", 4), roles: { create: { rol: { connect: { codigo: "ADMIN" } } } } },
    })).id;
    const antes = await version();
    await U.cambiarEstado(admin, doc.id, "INACTIVO");
    expect(await version()).toBe(antes + 1);
  });

  it("promover o retirar un rol revoca la sesión del afectado", async () => {
    const doc = await C.crearDocente({ nombres: "Doc", apellidos: "Ficticia", correo: "doc-rol@miduho.test" });
    const admin = (await db.usuario.findFirstOrThrow({ where: { correo: "admin-revoca@miduho.test" } })).id;
    const version = async () => (await db.usuario.findUniqueOrThrow({ where: { id: doc.id } })).versionSesion;
    const inicial = await version();

    await U.cambiarRoles(admin, doc.id, "DOCENTE_ADMIN");
    expect(await version()).toBe(inicial + 1);
  });

  it("restablecer la contraseña de un estudiante invalida las sesiones previas", async () => {
    const est = await C.crearEstudiante({ nombres: "Est", apellidos: "Ficticia", correo: "est-revoca@miduho.test" });
    const version = async () => (await db.usuario.findUniqueOrThrow({ where: { id: est.id } })).versionSesion;
    const inicial = await version();

    await C.restablecerEstudiantes({ id: "actor-admin", roles: ["ADMIN"] }, [est.id]);
    expect(await version()).toBe(inicial + 1);
  });

  it("un DOCENTE no restablece estudiantes fuera de sus grupos", async () => {
    const ajeno = await C.crearEstudiante({ nombres: "Est", apellidos: "Ajeno", correo: "est-ajeno@miduho.test" });
    const docente = await C.crearDocente({ nombres: "Doc", apellidos: "SinGrupo", correo: "doc-sin-grupo@miduho.test" });
    expect(await codigoDe(C.restablecerEstudiantes({ id: docente.id, roles: ["DOCENTE"] }, [ajeno.id]))).toBe("403:SIN_PERMISO");
  });
});
