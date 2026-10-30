import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaClient } from "@/generated/prisma/client";
import { ErrorDominio } from "@/server/errores";
import { crearServicioMiCurso, ordenarBloques, type ServicioMiCurso } from "./servicio";

describe("orden de bloques (lógica pura)", () => {
  it("ordena por día de la semana y luego por hora inicial", () => {
    const r = ordenarBloques([
      { dia: "VIERNES", horaInicio: "08:00", horaFin: "09:00" },
      { dia: "LUNES", horaInicio: "10:00", horaFin: "11:00" },
      { dia: "LUNES", horaInicio: "07:00", horaFin: "08:00" },
      { dia: "MIERCOLES", horaInicio: "09:00", horaFin: "10:00" },
    ]);
    expect(r.map((b) => `${b.dia} ${b.horaInicio}`)).toEqual(["LUNES 07:00", "LUNES 10:00", "MIERCOLES 09:00", "VIERNES 08:00"]);
  });
});

// ---------- Integración contra SQLite temporal con las migraciones reales ----------
let dir: string;
let db: PrismaClient;
let S: ServicioMiCurso;
const ids: Record<string, string> = {};

async function codigoDe(p: Promise<unknown>) {
  try {
    await p;
  } catch (e) {
    if (e instanceof ErrorDominio) return `${e.status}:${e.code}`;
    throw e;
  }
  return "OK";
}

async function usuario(correo: string, rol: string, estado: "ACTIVO" | "INACTIVO" = "ACTIVO", apellidos = "Ficticia") {
  const u = await db.usuario.create({ data: { nombres: "Cuenta", apellidos, correo, estado } });
  const r = await db.rol.findUniqueOrThrow({ where: { codigo: rol } });
  await db.usuarioRol.create({ data: { usuarioId: u.id, rolId: r.id } });
  return u.id;
}

beforeAll(async () => {
  dir = mkdtempSync(path.join(tmpdir(), "miduho-micurso-"));
  const url = `file:${path.join(dir, "test.db")}`;
  const raiz = path.resolve(__dirname, "../../../../prisma/migrations");
  const migrador = createClient({ url });
  for (const m of readdirSync(raiz).filter((n) => /^\d+_/.test(n)).sort()) {
    await migrador.executeMultiple(readFileSync(path.join(raiz, m, "migration.sql"), "utf8"));
  }
  migrador.close();
  db = new PrismaClient({ adapter: new PrismaLibSql({ url }) });
  for (const codigo of ["ADMIN", "DOCENTE", "ESTUDIANTE"]) await db.rol.create({ data: { codigo, nombre: codigo } });
  S = crearServicioMiCurso(db);

  // Escenario ficticio:
  // - docA dicta dos asignaturas en G1 (año activo) y tiene una asignación INACTIVA en G2.
  // - docB dicta en G2 y además tiene historial en un grupo de un año CERRADO.
  // - docSin no tiene asignaciones.
  ids.docA = await usuario("doc-a@miduho.test", "DOCENTE");
  ids.docB = await usuario("doc-b@miduho.test", "DOCENTE");
  ids.docSin = await usuario("doc-sin@miduho.test", "DOCENTE");
  const cerrado = await db.anioLectivo.create({
    data: { anio: 2025, fechaInicio: new Date("2025-01-20"), fechaFin: new Date("2025-12-05"), estado: "CERRADO" },
  });
  const anio = await db.anioLectivo.create({ data: { anio: 2026, fechaInicio: new Date("2026-01-19"), fechaFin: new Date("2026-12-04") } });
  const grado = await db.grado.create({ data: { nombre: "3°", nivel: "PRIMARIA", orden: 3 } });
  ids.g1 = (await db.grupo.create({ data: { gradoId: grado.id, anioLectivoId: anio.id, identificador: "01" } })).id;
  ids.g2 = (await db.grupo.create({ data: { gradoId: grado.id, anioLectivoId: anio.id, identificador: "02" } })).id;
  ids.gCerrado = (await db.grupo.create({ data: { gradoId: grado.id, anioLectivoId: cerrado.id, identificador: "01" } })).id;
  const area = await db.area.create({ data: { nombre: "Área demo" } });
  const asig1 = await db.asignatura.create({ data: { nombre: "Asignatura B", areaId: area.id } });
  const asig2 = await db.asignatura.create({ data: { nombre: "Asignatura A", areaId: area.id } });
  for (const a of [asig1, asig2]) await db.asignaturaGrado.create({ data: { asignaturaId: a.id, gradoId: grado.id } });

  const asignar = (docenteId: string, asignaturaId: string, grupoId: string, anioLectivoId: string, estado: "ACTIVA" | "INACTIVA", bloques: { dia: "LUNES" | "MARTES" | "JUEVES"; horaInicio: string; horaFin: string }[]) =>
    db.asignacionDocente.create({ data: { docenteId, asignaturaId, grupoId, anioLectivoId, estado, bloques: { create: bloques } } });

  await asignar(ids.docA, asig1.id, ids.g1, anio.id, "ACTIVA", [
    { dia: "JUEVES", horaInicio: "09:00", horaFin: "10:00" },
    { dia: "LUNES", horaInicio: "07:00", horaFin: "08:00" },
  ]);
  await asignar(ids.docA, asig2.id, ids.g1, anio.id, "ACTIVA", [{ dia: "MARTES", horaInicio: "08:00", horaFin: "09:00" }]);
  await asignar(ids.docA, asig1.id, ids.g2, anio.id, "INACTIVA", [{ dia: "MARTES", horaInicio: "10:00", horaFin: "11:00" }]);
  await asignar(ids.docB, asig1.id, ids.g2, anio.id, "ACTIVA", [{ dia: "MARTES", horaInicio: "10:00", horaFin: "11:00" }]);
  await asignar(ids.docB, asig1.id, ids.gCerrado, cerrado.id, "ACTIVA", [{ dia: "LUNES", horaInicio: "07:00", horaFin: "08:00" }]);

  // Estudiantes ficticios: e1 y e2 en G1 (e2 inactivo), e3 en G2, e4 trasladado de G1 a G2.
  ids.e1 = await usuario("e1@miduho.test", "ESTUDIANTE", "ACTIVO", "Zeta");
  ids.e2 = await usuario("e2@miduho.test", "ESTUDIANTE", "INACTIVO", "Alfa");
  ids.e3 = await usuario("e3@miduho.test", "ESTUDIANTE");
  ids.e4 = await usuario("e4@miduho.test", "ESTUDIANTE");
  const asociar = (estudianteId: string, grupoId: string, finEn: Date | null = null) =>
    db.asociacionEstudianteGrupo.create({
      data: { estudianteId, grupoId, anioLectivoId: anio.id, inicioEn: new Date(finEn ? "2026-01-20" : "2026-03-02"), finEn },
    });
  await asociar(ids.e1, ids.g1);
  await asociar(ids.e2, ids.g1);
  await asociar(ids.e3, ids.g2);
  await asociar(ids.e4, ids.g1, new Date("2026-03-01"));
  await asociar(ids.e4, ids.g2);

  // Fila cruzada (no la crea el servicio administrativo, pero la BD no la impide):
  // asignación ACTIVA con año ACTIVO que apunta a un grupo de un año CERRADO.
  ids.docCruzado = await usuario("doc-cruzado@miduho.test", "DOCENTE");
  await asignar(ids.docCruzado, asig1.id, ids.gCerrado, anio.id, "ACTIVA", [{ dia: "JUEVES", horaInicio: "10:00", horaFin: "11:00" }]);
  ids.eHistorico = await usuario("e-historico@miduho.test", "ESTUDIANTE");
  await db.asociacionEstudianteGrupo.create({
    data: { estudianteId: ids.eHistorico, grupoId: ids.gCerrado, anioLectivoId: cerrado.id, inicioEn: new Date("2025-02-03"), finEn: null },
  });
}, 90_000); // migrar SQLite desde vacío tarda ~13 s aislado; con la suite en paralelo puede pasar de 30 s

afterAll(async () => {
  await db?.$disconnect();
  if (dir) rmSync(dir, { recursive: true, force: true });
});

describe("listado de grupos del docente", () => {
  it("solo grupos con asignación ACTIVA del año activo; asignaturas y bloques ordenados", async () => {
    const grupos = await S.listarGrupos(ids.docA);
    expect(grupos.map((g) => g.id)).toEqual([ids.g1]); // G2 tiene solo una asignación INACTIVA
    const [g1] = grupos;
    expect(g1).toMatchObject({ etiqueta: "3°-01", anio: 2026, totalEstudiantes: 2 }); // e4 ya salió de G1
    expect(g1.asignaturas.map((a) => a.asignatura)).toEqual(["Asignatura A", "Asignatura B"]);
    expect(g1.asignaturas[1].bloques.map((b) => b.dia)).toEqual(["LUNES", "JUEVES"]);
  });

  it("no incluye asignaciones de años cerrados ni grupos de otros docentes", async () => {
    const grupos = await S.listarGrupos(ids.docB);
    expect(grupos.map((g) => g.id)).toEqual([ids.g2]);
    expect(grupos[0].totalEstudiantes).toBe(2);
  });

  it("docente sin asignaciones: lista vacía", async () => {
    expect(await S.listarGrupos(ids.docSin)).toEqual([]);
  });
});

describe("detalle de un grupo", () => {
  it("lista solo estudiantes con asociación vigente, con nombre, correo y estado", async () => {
    const g = await S.obtenerGrupo(ids.docA, ids.g1);
    expect(g.estudiantes.map((e) => e.correo)).toEqual(["e2@miduho.test", "e1@miduho.test"]); // por apellido
    expect(Object.keys(g.estudiantes[0]).sort()).toEqual(["apellidos", "correo", "estado", "id", "nombres"]);
    expect(g.estudiantes[0].estado).toBe("INACTIVO");
  });

  it("aislamiento horizontal: grupo ajeno, inactivo, de año cerrado o inexistente → el mismo 404", async () => {
    const esperado = "404:NO_ENCONTRADO";
    expect(await codigoDe(S.obtenerGrupo(ids.docA, ids.g2))).toBe(esperado); // asignación INACTIVA
    expect(await codigoDe(S.obtenerGrupo(ids.docB, ids.g1))).toBe(esperado); // grupo de otro docente
    expect(await codigoDe(S.obtenerGrupo(ids.docB, ids.gCerrado))).toBe(esperado); // año cerrado
    expect(await codigoDe(S.obtenerGrupo(ids.docSin, ids.g1))).toBe(esperado);
    expect(await codigoDe(S.obtenerGrupo(ids.docA, "no-existe"))).toBe(esperado);
    expect(await codigoDe(S.obtenerGrupo(ids.docA, ""))).toBe(esperado);
    expect(await codigoDe(S.obtenerGrupo(ids.docA, "x".repeat(65)))).toBe(esperado);
  });

  it("asignación de año activo cruzada hacia un grupo de año cerrado: ni listado ni roster", async () => {
    expect(await S.listarGrupos(ids.docCruzado)).toEqual([]);
    expect(await codigoDe(S.obtenerGrupo(ids.docCruzado, ids.gCerrado))).toBe("404:NO_ENCONTRADO");
  });

  it("un estudiante (o cualquier id que no sea docente) no obtiene grupos", async () => {
    expect(await S.listarGrupos(ids.e1)).toEqual([]);
    expect(await codigoDe(S.obtenerGrupo(ids.e1, ids.g1))).toBe("404:NO_ENCONTRADO");
  });
});
