import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaClient } from "@/generated/prisma/client";
import { docenteIdSegunAlcance, evaluarAcceso, ROLES_ACADEMICO } from "@/server/http-acceso";
import { ErrorDominio } from "@/server/errores";
import * as E from "./esquemas";
import { dentroDe, ponderacionCompleta, ponderacionExcede, seSolapan, sumaPonderaciones } from "./reglas";
import { crearServicioAcademico, type ServicioAcademico } from "./servicio";

const d = (s: string) => new Date(`${s}T00:00:00.000Z`);

describe("reglas puras", () => {
  it("detecta solape de períodos con bordes inclusivos (RN-02)", () => {
    const a = { fechaInicio: d("2026-01-01"), fechaFin: d("2026-03-31") };
    expect(seSolapan(a, { fechaInicio: d("2026-03-31"), fechaFin: d("2026-06-01") })).toBe(true);
    expect(seSolapan(a, { fechaInicio: d("2026-04-01"), fechaFin: d("2026-06-01") })).toBe(false);
  });
  it("contención dentro del año (RN-03)", () => {
    const anio = { fechaInicio: d("2026-01-15"), fechaFin: d("2026-12-01") };
    expect(dentroDe({ fechaInicio: d("2026-01-15"), fechaFin: d("2026-04-01") }, anio)).toBe(true);
    expect(dentroDe({ fechaInicio: d("2026-01-14"), fechaFin: d("2026-04-01") }, anio)).toBe(false);
  });
  it("ponderaciones sin error de coma flotante (RN-06)", () => {
    expect(sumaPonderaciones([33.33, 33.33, 33.34])).toBe(100);
    expect(ponderacionCompleta([33.33, 33.33, 33.34])).toBe(true);
    expect(ponderacionExcede([50, 50.01])).toBe(true);
    expect(ponderacionExcede([25, 25, 25])).toBe(false);
  });
});

describe("esquemas Zod", () => {
  it("convierte fechas AAAA-MM-DD y rechaza formatos ambiguos", () => {
    expect(E.crearAnioLectivo.parse({ anio: 2026, fechaInicio: "2026-01-19", fechaFin: "2026-12-04" }).fechaInicio).toEqual(
      d("2026-01-19"),
    );
    expect(E.crearAnioLectivo.safeParse({ anio: 2026, fechaInicio: "19/01/2026", fechaFin: "2026-12-04" }).success).toBe(false);
  });
  it("limita pageSize y rechaza grados repetidos en asignatura", () => {
    expect(E.paginacion.safeParse({ pageSize: "500" }).success).toBe(false);
    expect(E.paginacion.parse({})).toEqual({ page: 1, pageSize: 20 });
    const r = E.crearAsignatura.safeParse({ nombre: "X", areaId: "a", grados: [{ gradoId: "g" }, { gradoId: "g" }] });
    expect(r.success).toBe(false);
  });
});

describe("acceso académico", () => {
  it("401 sin sesión, 403 sin rol, permitido a ADMIN", () => {
    expect(evaluarAcceso(null, ROLES_ACADEMICO)).toBe(401);
    expect(evaluarAcceso(["DOCENTE"], ROLES_ACADEMICO)).toBe(403);
    expect(evaluarAcceso(["DOCENTE", "ADMIN"], ROLES_ACADEMICO)).toBeNull();
  });

  it("limita las asignaciones al docente de la sesión e ignora un docenteId ajeno", () => {
    expect(docenteIdSegunAlcance(["DOCENTE"], "docente-sesion", "docente-ajeno")).toBe("docente-sesion");
    expect(docenteIdSegunAlcance(["DOCENTE"], "docente-sesion")).toBe("docente-sesion");
  });

  it("conserva el filtro y el listado completo para roles administrativos", () => {
    expect(docenteIdSegunAlcance(["ADMIN"], "admin", "docente-solicitado")).toBe("docente-solicitado");
    expect(docenteIdSegunAlcance(["DOCENTE", "ADMIN"], "admin-docente")).toBeUndefined();
  });
});

// ---------- Integración contra una SQLite temporal con las migraciones reales ----------
let dir: string;
let db: PrismaClient;
let S: ServicioAcademico;

async function codigoDe(p: Promise<unknown>) {
  try {
    await p;
  } catch (e) {
    if (e instanceof ErrorDominio) return e.code;
    throw e;
  }
  return "OK";
}

beforeAll(async () => {
  dir = mkdtempSync(path.join(tmpdir(), "miduho-academico-"));
  const url = `file:${path.join(dir, "test.db")}`;
  const raiz = path.resolve(__dirname, "../../../../prisma/migrations");
  const migrador = createClient({ url });
  for (const m of readdirSync(raiz).filter((n) => /^\d+_/.test(n)).sort()) {
    const sql = readFileSync(path.join(raiz, m, "migration.sql"), "utf8");
    await migrador.executeMultiple(sql);
  }
  migrador.close();
  db = new PrismaClient({ adapter: new PrismaLibSql({ url }) });
  S = crearServicioAcademico(db);
});

afterAll(async () => {
  await db?.$disconnect();
  rmSync(dir, { recursive: true, force: true });
});

describe("servicio académico (SQLite temporal)", () => {
  let anioId = "";
  let gradoId = "";

  it("año lectivo: solo uno activo (RN-01) y año único", async () => {
    const a = await S.aniosLectivos.crear({ anio: 2026, fechaInicio: d("2026-01-19"), fechaFin: d("2026-12-04"), estado: "ACTIVO" });
    anioId = a.id;
    expect(await codigoDe(S.aniosLectivos.crear({ anio: 2027, fechaInicio: d("2027-01-18"), fechaFin: d("2027-12-03"), estado: "ACTIVO" }))).toBe(
      "ANIO_ACTIVO_EXISTE",
    );
    expect(await codigoDe(S.aniosLectivos.crear({ anio: 2026, fechaInicio: d("2026-01-19"), fechaFin: d("2026-12-04"), estado: "CERRADO" }))).toBe(
      "ANIO_DUPLICADO",
    );
    expect(await codigoDe(S.aniosLectivos.crear({ anio: 2030, fechaInicio: d("2030-12-01"), fechaFin: d("2030-01-01"), estado: "CERRADO" }))).toBe(
      "RANGO_INVALIDO",
    );
  });

  it("períodos: dentro del año, sin solape, orden único y ponderación ≤ 100 (RN-02/03/06)", async () => {
    const base = { anioLectivoId: anioId, nombre: "P", ponderacion: 50 };
    await S.periodos.crear({ ...base, orden: 1, fechaInicio: d("2026-01-26"), fechaFin: d("2026-06-19") });
    expect(await codigoDe(S.periodos.crear({ ...base, orden: 2, fechaInicio: d("2026-06-19"), fechaFin: d("2026-11-27") }))).toBe("PERIODO_SOLAPADO");
    expect(await codigoDe(S.periodos.crear({ ...base, orden: 1, fechaInicio: d("2026-07-01"), fechaFin: d("2026-11-27") }))).toBe(
      "PERIODO_ORDEN_DUPLICADO",
    );
    expect(await codigoDe(S.periodos.crear({ ...base, orden: 2, fechaInicio: d("2026-07-01"), fechaFin: d("2026-12-31") }))).toBe(
      "PERIODO_FUERA_DE_ANIO",
    );
    expect(
      await codigoDe(S.periodos.crear({ ...base, orden: 2, ponderacion: 50.5, fechaInicio: d("2026-07-01"), fechaFin: d("2026-11-27") })),
    ).toBe("PONDERACION_EXCEDIDA");
    const p2 = await S.periodos.crear({ ...base, orden: 2, fechaInicio: d("2026-07-01"), fechaFin: d("2026-11-27") });
    expect(p2.ponderacion).toBe(50);
    const anio = await S.aniosLectivos.obtener(anioId);
    expect(anio.sumaPonderaciones).toBe(100);
    expect(anio.ponderacionCompleta).toBe(true);
    // Editar un período no puede romper el solape ni sacar a otro período del año.
    expect(await codigoDe(S.periodos.actualizar(p2.id, { fechaInicio: d("2026-06-01") }))).toBe("PERIODO_SOLAPADO");
    expect(await codigoDe(S.aniosLectivos.actualizar(anioId, { fechaFin: d("2026-10-01") }))).toBe("PERIODO_FUERA_DE_ANIO");
  });

  it("grados y grupos: grupo único por grado+año+identificador (RN-07) y director docente", async () => {
    const g = await S.grados.crear({ nombre: "1°", nivel: "PRIMARIA", orden: 1 });
    gradoId = g.id;
    const grupo = await S.grupos.crear({ gradoId, anioLectivoId: anioId, identificador: "01" });
    expect(grupo.grado.nombre).toBe("1°");
    await expect(S.grupos.crear({ gradoId, anioLectivoId: anioId, identificador: "01" })).rejects.toMatchObject({ code: "P2002" });

    const noDocente = await db.usuario.create({
      data: { nombres: "Cuenta", apellidos: "Ficticia sin rol", correo: "sin-rol@miduho.test", hashContrasena: "x", estado: "ACTIVO" },
    });
    expect(await codigoDe(S.grupos.actualizar(grupo.id, { directorId: noDocente.id }))).toBe("DIRECTOR_INVALIDO");
    const rol = await db.rol.create({ data: { codigo: "DOCENTE", nombre: "Docente" } });
    await db.usuarioRol.create({ data: { usuarioId: noDocente.id, rolId: rol.id } });
    const conDirector = await S.grupos.actualizar(grupo.id, { directorId: noDocente.id });
    expect(conDirector.director?.id).toBe(noDocente.id);

    const { data, total } = await S.grupos.listar({ page: 1, pageSize: 20, anioLectivoId: anioId });
    expect(total).toBe(1);
    expect(data[0].identificador).toBe("01");
  });

  it("asignaturas: área obligatoria e intensidad por grado (RN-09)", async () => {
    const area = await db.area.create({ data: { nombre: "Área de prueba (ficticia)" } });
    expect(await codigoDe(S.asignaturas.crear({ nombre: "Robótica", areaId: "no-existe", grados: [] }))).toBe("NO_ENCONTRADO");
    const a = await S.asignaturas.crear({ nombre: "Robótica", areaId: area.id, grados: [{ gradoId, intensidad: 2 }] });
    expect(a.grados).toHaveLength(1);
    expect(a.grados[0].intensidad).toBe(2);
    const sinGrados = await S.asignaturas.actualizar(a.id, { grados: [] });
    expect(sinGrados.grados).toHaveLength(0);
    const filtrada = await S.asignaturas.listar({ page: 1, pageSize: 20, gradoId });
    expect(filtrada.total).toBe(0);
  });

  it("año cerrado es de solo lectura (RN-52)", async () => {
    await S.aniosLectivos.actualizar(anioId, { estado: "CERRADO" });
    expect(await codigoDe(S.aniosLectivos.actualizar(anioId, { estado: "ACTIVO" }))).toBe("ANIO_CERRADO");
    expect(
      await codigoDe(S.periodos.crear({ anioLectivoId: anioId, nombre: "P3", orden: 3, ponderacion: 1, fechaInicio: d("2026-12-01"), fechaFin: d("2026-12-02") })),
    ).toBe("ANIO_CERRADO");
    expect(await codigoDe(S.grupos.crear({ gradoId, anioLectivoId: anioId, identificador: "02" }))).toBe("ANIO_CERRADO");
    // Cerrado el anterior, ya se puede activar uno nuevo (RN-01).
    expect(await codigoDe(S.aniosLectivos.crear({ anio: 2027, fechaInicio: d("2027-01-18"), fechaFin: d("2027-12-03"), estado: "ACTIVO" }))).toBe("OK");
  });
});
