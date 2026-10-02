import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaClient } from "@/generated/prisma/client";
import { ErrorDominio } from "@/server/errores";
import { hashearContrasena, verificarContrasena } from "./contrasena";
import { celdaCsv, csvCredenciales, generarContrasenaEstudiante, generarContrasenaTemporal, PALABRAS } from "./credenciales";
import { crearServicioCuentas, type ServicioCuentas } from "./cuentas";
import { esquemaCambioContrasena } from "./esquemas";
import { LimiteSolicitudes } from "./limite";

const politica = (s: string) => s.length >= 10 && /[a-z]/i.test(s) && /[0-9]/.test(s);

describe("generadores de contraseña", () => {
  it("ESTUDIANTE: legible, ≥10 caracteres, palabras y números, distinta en cada llamada", () => {
    const vistas = new Set<string>();
    for (let i = 0; i < 200; i++) {
      const c = generarContrasenaEstudiante();
      expect(c).toMatch(/^[a-z]+-[a-z]+-\d{4}$/);
      expect(politica(c)).toBe(true);
      const [a, b] = c.split("-");
      expect(PALABRAS).toContain(a);
      expect(PALABRAS).toContain(b);
      vistas.add(c);
    }
    expect(vistas.size).toBeGreaterThan(190);
  });
  it("DOCENTE temporal cumple la política", () => {
    const c = generarContrasenaTemporal();
    expect(c).toMatch(/^[a-z]+-[a-z]+-[a-z]+-\d{4}$/);
    expect(politica(c)).toBe(true);
  });
  it("las palabras son ASCII en minúscula", () => {
    for (const p of PALABRAS) expect(p).toMatch(/^[a-z]+$/);
  });
});

describe("CSV de credenciales", () => {
  it("escapa comillas/comas y neutraliza fórmulas", () => {
    expect(celdaCsv("a,b")).toBe('"a,b"');
    expect(celdaCsv('x"y')).toBe('"x""y"');
    expect(celdaCsv("=SUMA(1)")).toBe("'=SUMA(1)");
    const csv = csvCredenciales([{ correo: "e1@miduho.test", contrasena: "sol-luna-1234" }]);
    expect(csv).toBe("\uFEFFcorreo,contrasena\r\ne1@miduho.test,sol-luna-1234\r\n");
  });
});

describe("límite de solicitudes", () => {
  it("permite N por ventana y reinicia al vencer", () => {
    let t = 0;
    const l = new LimiteSolicitudes(2, 1_000, () => t);
    expect(l.permitir("A@x.test")).toBe(true);
    expect(l.permitir("a@x.test")).toBe(true);
    expect(l.permitir("a@x.test")).toBe(false);
    expect(l.permitir("b@x.test")).toBe(true);
    t = 1_000;
    expect(l.permitir("a@x.test")).toBe(true);
  });
});

describe("esquema de cambio", () => {
  it("exige política y confirmación", () => {
    expect(esquemaCambioContrasena.safeParse({ actual: "x", contrasena: "corta1", confirmacion: "corta1" }).success).toBe(false);
    expect(
      esquemaCambioContrasena.safeParse({ actual: "x", contrasena: "nueva-clave-1", confirmacion: "nueva-clave-1" }).success,
    ).toBe(true);
  });
});

// ---------- Integración contra SQLite temporal con las migraciones reales ----------
let dir: string;
let db: PrismaClient;
let S: ServicioCuentas;
const buzon: { para: string; asunto: string; texto: string }[] = [];
let reloj = new Date("2026-10-01T12:00:00.000Z");

const enlaceDe = (para: string) => {
  const m = [...buzon].reverse().find((x) => x.para === para);
  const t = m?.texto.match(/token=([^\s]+)/)?.[1];
  return t ? decodeURIComponent(t) : undefined;
};

async function codigoDe(p: Promise<unknown>) {
  try {
    await p;
  } catch (e) {
    if (e instanceof ErrorDominio) return e.code;
    throw e;
  }
  return "OK";
}

async function usuario(correo: string, roles: string[], clave = "clave-inicial-1") {
  const u = await db.usuario.create({
    data: {
      nombres: "Cuenta",
      apellidos: "Ficticia",
      correo,
      estado: "ACTIVO",
      hashContrasena: await hashearContrasena(clave, 4),
    },
  });
  for (const codigo of roles) {
    const rol = await db.rol.findUniqueOrThrow({ where: { codigo } });
    await db.usuarioRol.create({ data: { usuarioId: u.id, rolId: rol.id } });
  }
  return db.usuario.findUniqueOrThrow({ where: { id: u.id } });
}

let ids: Record<string, string> = {};

beforeAll(async () => {
  dir = mkdtempSync(path.join(tmpdir(), "miduho-cuentas-"));
  const url = `file:${path.join(dir, "test.db")}`;
  const raiz = path.resolve(__dirname, "../../../prisma/migrations");
  const migrador = createClient({ url });
  for (const m of readdirSync(raiz).filter((n) => /^\d+_/.test(n)).sort()) {
    await migrador.executeMultiple(readFileSync(path.join(raiz, m, "migration.sql"), "utf8"));
  }
  migrador.close();
  db = new PrismaClient({ adapter: new PrismaLibSql({ url }) });
  for (const codigo of ["ADMIN", "DOCENTE", "ESTUDIANTE"]) await db.rol.create({ data: { codigo, nombre: codigo } });
  S = crearServicioCuentas(db, {
    notificar: async (m) => void buzon.push(m),
    urlBase: "http://localhost:3000/",
    costo: 4,
    ahora: () => reloj,
  });

  // Escenario ficticio: dos grupos; el docente A dicta en G1; el docente B dirige G2.
  const admin = await usuario("admin@miduho.test", ["ADMIN"]);
  const docA = await usuario("doc-a@miduho.test", ["DOCENTE"]);
  const docB = await usuario("doc-b@miduho.test", ["DOCENTE"]);
  const e1 = await usuario("e1@miduho.test", ["ESTUDIANTE"]);
  const e2 = await usuario("e2@miduho.test", ["ESTUDIANTE"]);
  const e3 = await usuario("e3@miduho.test", ["ESTUDIANTE"]);
  const anio = await db.anioLectivo.create({
    data: { anio: 2026, fechaInicio: new Date("2026-01-19"), fechaFin: new Date("2026-12-04") },
  });
  const grado = await db.grado.create({ data: { nombre: "1°", nivel: "PRIMARIA", orden: 1 } });
  const g1 = await db.grupo.create({ data: { gradoId: grado.id, anioLectivoId: anio.id, identificador: "01" } });
  const g2 = await db.grupo.create({
    data: { gradoId: grado.id, anioLectivoId: anio.id, identificador: "02", directorId: docB.id },
  });
  const area = await db.area.create({ data: { nombre: "Área demo" } });
  const asig = await db.asignatura.create({ data: { nombre: "Asignatura demo", areaId: area.id } });
  await db.asignaturaGrado.create({ data: { asignaturaId: asig.id, gradoId: grado.id } });
  await db.asignacionDocente.create({
    data: { docenteId: docA.id, asignaturaId: asig.id, grupoId: g1.id, anioLectivoId: anio.id },
  });
  for (const [e, g] of [[e1, g1], [e2, g1], [e3, g2]] as const) {
    await db.asociacionEstudianteGrupo.create({ data: { estudianteId: e.id, grupoId: g.id, anioLectivoId: anio.id } });
  }
  ids = { admin: admin.id, docA: docA.id, docB: docB.id, e1: e1.id, e2: e2.id, e3: e3.id };
});

afterAll(async () => {
  await db?.$disconnect();
  if (dir) rmSync(dir, { recursive: true, force: true });
});

describe("recuperación por correo", () => {
  it("solo ADMIN/DOCENTE activos reciben enlace; estudiante e inexistente no (sin error visible)", async () => {
    buzon.length = 0;
    await S.solicitarRecuperacion("doc-a@miduho.test");
    await S.solicitarRecuperacion("admin@miduho.test");
    await S.solicitarRecuperacion("e1@miduho.test");
    await S.solicitarRecuperacion("nadie@miduho.test");
    expect(buzon.map((m) => m.para).sort()).toEqual(["admin@miduho.test", "doc-a@miduho.test"]);
    expect(buzon[0].texto).toContain("http://localhost:3000/recuperar/nueva?token=");
  });

  it("guarda solo el hash del token; un solo uso; revoca sesiones", async () => {
    const token = enlaceDe("doc-a@miduho.test")!;
    const fila = await db.restablecimientoContrasena.findFirstOrThrow({ where: { usuarioId: ids.docA } });
    expect(fila.tokenHash).not.toBe(token);
    expect(fila.tipo).toBe("RECUPERACION");
    const antes = await db.usuario.findUniqueOrThrow({ where: { id: ids.docA } });
    expect(await S.establecerConToken(token, "nueva-clave-22")).toEqual({ ok: true });
    expect(await S.establecerConToken(token, "otra-clave-33")).toEqual({ ok: false, motivo: "token-invalido" });
    const despues = await db.usuario.findUniqueOrThrow({ where: { id: ids.docA } });
    expect(despues.versionSesion).toBeGreaterThan(antes.versionSesion);
    expect(await verificarContrasena("nueva-clave-22", despues.hashContrasena!)).toBe(true);
  });

  it("el enlace vence a las 24 h", async () => {
    await S.solicitarRecuperacion("admin@miduho.test");
    const token = enlaceDe("admin@miduho.test")!;
    reloj = new Date(reloj.getTime() + 24 * 60 * 60 * 1000);
    expect(await S.establecerConToken(token, "nueva-clave-22")).toEqual({ ok: false, motivo: "token-invalido" });
    reloj = new Date("2026-10-01T12:00:00.000Z");
  });
});

describe("invitación de ADMIN", () => {
  it("crea ADMIN pendiente sin contraseña, reenvía invalidando el enlace previo y activa al aceptar", async () => {
    buzon.length = 0;
    const { id } = await S.invitarAdmin({ nombres: "Cuenta", apellidos: "Invitada", correo: "inv@miduho.test" });
    const pendiente = await db.usuario.findUniqueOrThrow({ where: { id } });
    expect(pendiente).toMatchObject({ estado: "PENDIENTE_ACTIVACION", hashContrasena: null });
    const primero = enlaceDe("inv@miduho.test")!;

    // Una cuenta pendiente no puede pedir recuperación.
    await S.solicitarRecuperacion("inv@miduho.test");
    expect(buzon).toHaveLength(1);

    await S.reenviarInvitacion(id);
    const segundo = enlaceDe("inv@miduho.test")!;
    expect(segundo).not.toBe(primero);
    expect(await S.establecerConToken(primero, "clave-admin-11")).toEqual({ ok: false, motivo: "token-invalido" });
    expect(await S.establecerConToken(segundo, "clave-admin-11")).toEqual({ ok: true });
    const activo = await db.usuario.findUniqueOrThrow({ where: { id } });
    expect(activo.estado).toBe("ACTIVO");
    expect(await codigoDe(S.reenviarInvitacion(id))).toBe("INVITACION_NO_APLICA");
  });

  it("la invitación vence a las 24 h y rechaza correo duplicado", async () => {
    const { id } = await S.invitarAdmin({ nombres: "Cuenta", apellidos: "Tardía", correo: "inv2@miduho.test" });
    const token = enlaceDe("inv2@miduho.test")!;
    reloj = new Date(reloj.getTime() + 24 * 60 * 60 * 1000 + 1);
    expect(await S.establecerConToken(token, "clave-admin-11")).toEqual({ ok: false, motivo: "token-invalido" });
    reloj = new Date("2026-10-01T12:00:00.000Z");
    expect((await db.usuario.findUniqueOrThrow({ where: { id } })).estado).toBe("PENDIENTE_ACTIVACION");
    expect(
      await codigoDe(S.invitarAdmin({ nombres: "X", apellidos: "Y", correo: "inv2@miduho.test" })),
    ).toBe("CORREO_DUPLICADO");
  });
});

describe("DOCENTE con contraseña temporal", () => {
  it("queda ACTIVO con cambio obligatorio; el cambio limpia la marca y revoca sesiones", async () => {
    const r = await S.crearDocente({ nombres: "Cuenta", apellidos: "Docente", correo: "doc-n@miduho.test" });
    expect(politica(r.contrasenaTemporal)).toBe(true);
    const u = await db.usuario.findUniqueOrThrow({ where: { id: r.id } });
    expect(u).toMatchObject({ estado: "ACTIVO", debeCambiarContrasena: true });
    expect(u.hashContrasena).not.toContain(r.contrasenaTemporal);

    expect(await codigoDe(S.cambiarContrasena(r.id, "incorrecta-1", "propia-clave-9"))).toBe("CONTRASENA_ACTUAL_INVALIDA");
    expect(await codigoDe(S.cambiarContrasena(r.id, r.contrasenaTemporal, r.contrasenaTemporal))).toBe(
      "CONTRASENA_REPETIDA",
    );
    expect(await codigoDe(S.cambiarContrasena(r.id, r.contrasenaTemporal, "propia-clave-9"))).toBe("OK");
    const d = await db.usuario.findUniqueOrThrow({ where: { id: r.id } });
    expect(d.debeCambiarContrasena).toBe(false);
    expect(d.versionSesion).toBeGreaterThan(u.versionSesion);
  });

  it("ESTUDIANTE no puede cambiar su propia contraseña", async () => {
    expect(await codigoDe(S.cambiarContrasena(ids.e1, "clave-inicial-1", "propia-clave-9"))).toBe("SIN_PERMISO");
  });
});

describe("ESTUDIANTE", () => {
  it("se crea con contraseña legible que solo existe como hash", async () => {
    const r = await S.crearEstudiante({ nombres: "Cuenta", apellidos: "Estudiante", correo: "e-n@miduho.test" });
    expect(r.contrasena).toMatch(/^[a-z]+-[a-z]+-\d{4}$/);
    const u = await db.usuario.findUniqueOrThrow({ where: { id: r.id } });
    expect(u.hashContrasena!.startsWith("$2")).toBe(true);
    expect(await verificarContrasena(r.contrasena, u.hashContrasena!)).toBe(true);
    expect(u.debeCambiarContrasena).toBe(false);
  });

  it("ADMIN restablece varios: CSV con nuevas credenciales, anteriores invalidadas y sesiones revocadas", async () => {
    const antes = await db.usuario.findMany({ where: { id: { in: [ids.e1, ids.e3] } } });
    const { csv, total } = await S.restablecerEstudiantes({ id: ids.admin, roles: ["ADMIN"] }, [ids.e3, ids.e1, ids.e1]);
    expect(total).toBe(2);
    const lineas = csv.replace(/^\uFEFF/, "").trim().split("\r\n");
    expect(lineas[0]).toBe("correo,contrasena");
    expect(lineas.slice(1).map((l) => l.split(",")[0])).toEqual(["e1@miduho.test", "e3@miduho.test"]);
    for (const l of lineas.slice(1)) {
      const [correo, clave] = l.split(",");
      const u = await db.usuario.findUniqueOrThrow({ where: { correo } });
      expect(await verificarContrasena(clave, u.hashContrasena!)).toBe(true);
      expect(await verificarContrasena("clave-inicial-1", u.hashContrasena!)).toBe(false);
      expect(u.versionSesion).toBeGreaterThan(antes.find((a) => a.id === u.id)!.versionSesion);
    }
  });

  it("DOCENTE solo restablece estudiantes de sus grupos (asignación o dirección); todo o nada", async () => {
    const actorA = { id: ids.docA, roles: ["DOCENTE"] };
    const actorB = { id: ids.docB, roles: ["DOCENTE"] };
    expect((await S.restablecerEstudiantes(actorA, [ids.e1, ids.e2])).total).toBe(2);
    expect((await S.restablecerEstudiantes(actorB, [ids.e3])).total).toBe(1);

    const e1Antes = await db.usuario.findUniqueOrThrow({ where: { id: ids.e1 } });
    expect(await codigoDe(S.restablecerEstudiantes(actorA, [ids.e1, ids.e3]))).toBe("SIN_PERMISO");
    expect(await codigoDe(S.restablecerEstudiantes(actorB, [ids.e1]))).toBe("SIN_PERMISO");
    expect(await codigoDe(S.restablecerEstudiantes(actorA, [ids.docB]))).toBe("SIN_PERMISO");
    expect(await codigoDe(S.restablecerEstudiantes(actorA, ["no-existe"]))).toBe("SIN_PERMISO");
    expect(await codigoDe(S.restablecerEstudiantes({ id: ids.e1, roles: ["ESTUDIANTE"] }, [ids.e2]))).toBe("SIN_PERMISO");
    expect(await codigoDe(S.restablecerEstudiantes(actorA, []))).toBe("SELECCION_VACIA");
    const e1Despues = await db.usuario.findUniqueOrThrow({ where: { id: ids.e1 } });
    expect(e1Despues.hashContrasena).toBe(e1Antes.hashContrasena);
  });

  it("DOCENTE pierde el alcance al cerrar la asociación del estudiante", async () => {
    await db.asociacionEstudianteGrupo.updateMany({ where: { estudianteId: ids.e2 }, data: { finEn: new Date() } });
    expect(await codigoDe(S.restablecerEstudiantes({ id: ids.docA, roles: ["DOCENTE"] }, [ids.e2]))).toBe("SIN_PERMISO");
  });
});
