import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaClient } from "@/generated/prisma/client";
import { verificarContrasena } from "@/server/auth/contrasena";
import { leerCsv, plantillaCsv } from "./csv";
import { crearServicioImportacion, ErrorImportacion, type ServicioImportacion } from "./servicio";

describe("lectura de CSV", () => {
  it("acepta BOM, comillas, comas internas, CRLF y punto y coma", () => {
    expect(leerCsv('\uFEFFa,b\r\n"x, y","di ""hola"""\r\n\r\n')).toEqual([
      ["a", "b"],
      ["x, y", 'di "hola"'],
    ]);
    expect(leerCsv("a;b\n1;2")).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
  });
  it("las plantillas traen los encabezados exactos", () => {
    expect(plantillaCsv("estudiantes")).toBe("\uFEFFnombres,apellidos,correo,año,grado,grupo\r\n");
    expect(plantillaCsv("docentes")).toBe("\uFEFFnombres,apellidos,correo\r\n");
  });
});

// ---------- Integración contra SQLite temporal con las migraciones reales ----------
let dir: string;
let db: PrismaClient;
let S: ServicioImportacion;

const EST = "nombres,apellidos,correo,año,grado,grupo";
const DOC = "nombres,apellidos,correo";

async function revisionDeError(p: Promise<unknown>) {
  try {
    await p;
  } catch (e) {
    if (e instanceof ErrorImportacion) return e.revision;
    throw e;
  }
  throw new Error("se esperaba IMPORTACION_INVALIDA");
}

const totalUsuarios = () => db.usuario.count();

beforeAll(async () => {
  dir = mkdtempSync(path.join(tmpdir(), "miduho-importacion-"));
  const url = `file:${path.join(dir, "test.db")}`;
  const raiz = path.resolve(__dirname, "../../../../prisma/migrations");
  const migrador = createClient({ url });
  for (const m of readdirSync(raiz).filter((n) => /^\d+_/.test(n)).sort()) {
    await migrador.executeMultiple(readFileSync(path.join(raiz, m, "migration.sql"), "utf8"));
  }
  migrador.close();
  db = new PrismaClient({ adapter: new PrismaLibSql({ url }) });
  for (const codigo of ["ADMIN", "DOCENTE", "ESTUDIANTE"]) await db.rol.create({ data: { codigo, nombre: codigo } });
  S = crearServicioImportacion(db, { costo: 4 });

  // Escenario ficticio: año activo 2026 con 2°-01 y año cerrado 2025 con 2°-01; una cuenta existente.
  const anio = await db.anioLectivo.create({ data: { anio: 2026, fechaInicio: new Date("2026-01-19"), fechaFin: new Date("2026-12-04") } });
  const cerrado = await db.anioLectivo.create({
    data: { anio: 2025, fechaInicio: new Date("2025-01-20"), fechaFin: new Date("2025-12-05"), estado: "CERRADO" },
  });
  const grado = await db.grado.create({ data: { nombre: "2°", nivel: "PRIMARIA", orden: 2 } });
  await db.grupo.create({ data: { gradoId: grado.id, anioLectivoId: anio.id, identificador: "01" } });
  await db.grupo.create({ data: { gradoId: grado.id, anioLectivoId: cerrado.id, identificador: "01" } });
  await db.usuario.create({ data: { nombres: "Cuenta", apellidos: "Existente", correo: "existe@miduho.test", estado: "ACTIVO" } });
});

afterAll(async () => {
  await db?.$disconnect();
  if (dir) rmSync(dir, { recursive: true, force: true });
});

describe("validación del archivo", () => {
  it("rechaza encabezados distintos a la plantilla, incluida una columna de rol", async () => {
    const r = await S.vistaPrevia("docentes", `${DOC},rol\nDocente,Uno,d1@miduho.test,ADMIN\n`);
    expect(r.errorArchivo).toMatch(/encabezados/);
    expect(r.errorArchivo).toMatch(/no asigna roles/);
    expect((await S.vistaPrevia("estudiantes", `${DOC}\nA,B,c@miduho.test\n`)).errorArchivo).toMatch(/encabezados/);
  });

  it("rechaza vacío y más de 500 filas, sin escribir", async () => {
    const antes = await totalUsuarios();
    expect((await S.vistaPrevia("docentes", "")).errorArchivo).toMatch(/vacío/);
    expect((await S.vistaPrevia("docentes", `${DOC}\n`)).errorArchivo).toMatch(/no tiene filas/);
    const filas = Array.from({ length: 501 }, (_, i) => `Docente,Ficticio,d${i}@miduho.test`).join("\n");
    const rev = await revisionDeError(S.importar("docentes", `${DOC}\n${filas}\n`));
    expect(rev.errorArchivo).toMatch(/501 filas; el máximo es 500/);
    expect(await totalUsuarios()).toBe(antes);
  });

  it("acepta exactamente 500 filas en la vista previa", async () => {
    const filas = Array.from({ length: 500 }, (_, i) => `Docente,Ficticio,lim${i}@miduho.test`).join("\n");
    const r = await S.vistaPrevia("docentes", `${DOC}\n${filas}`);
    expect(r.errorArchivo).toBeNull();
    expect(r.resumen).toEqual({ total: 500, nuevas: 500, duplicadas: 0, conError: 0 });
  });

  it("reporta errores por fila con número de línea y referencias legibles", async () => {
    const csv = [
      EST,
      "Estudiante,Uno,e1@miduho.test,2026,2°,01", // válida
      ",Dos,no-es-correo,2026,2°,01", // nombres y correo
      "Estudiante,Tres,e3@miduho.test,2026,9°,01", // grupo inexistente
      "Estudiante,Cuatro,e4@miduho.test,2025,2°,01", // año cerrado
      "Estudiante,Cinco,E1@MIDUHO.TEST,2026,2°,01", // repetido en el archivo
      "Estudiante,Seis,e6@miduho.test,26,2°,01", // año mal escrito
      "Estudiante,Siete,existe@miduho.test,2026,2°,01", // ya tiene cuenta
    ].join("\n");
    const antes = await totalUsuarios();
    const r = await S.vistaPrevia("estudiantes", csv);
    const por = Object.fromEntries(r.filas.map((f) => [f.linea, f]));
    expect(por[2]).toMatchObject({ estado: "NUEVA", grupo: "2°-01 · 2026", errores: [] });
    expect(por[3].estado).toBe("ERROR");
    expect(por[3].errores.join(" ")).toMatch(/nombres/);
    expect(por[3].errores.join(" ")).toMatch(/correo válido/);
    expect(por[4].errores).toContain("No existe el grupo 9°-01 en el año 2026.");
    expect(por[5].errores.join(" ")).toMatch(/2025 está cerrado/);
    expect(por[6].errores).toContain("El correo se repite en el archivo (línea 2).");
    expect(por[7].errores.join(" ")).toMatch(/cuatro dígitos/);
    expect(por[8]).toMatchObject({ estado: "DUPLICADA", errores: [] });
    expect(r.resumen).toEqual({ total: 7, nuevas: 1, duplicadas: 1, conError: 5 });
    // Ningún ID interno en el reporte.
    expect(JSON.stringify(r)).not.toMatch(/grupoId|anioLectivoId|"id"/);
    // Cero escrituras con errores.
    const rev = await revisionDeError(S.importar("estudiantes", csv));
    expect(rev.resumen.conError).toBe(5);
    expect(await totalUsuarios()).toBe(antes);
  });
});

describe("importación correcta", () => {
  it("estudiantes: ACTIVOS, asociados al grupo, duplicados omitidos y CSV único con contraseñas", async () => {
    const csv = [EST, "Estudiante,Ana,est-a@miduho.test,2026,2°,01", "Estudiante,Beto,est-b@miduho.test,2026,2°,01", "Cuenta,Existente,existe@miduho.test,2026,2°,01"].join("\r\n");
    const r = await S.importar("estudiantes", csv);
    expect(r.creadas).toBe(2);
    expect(r.duplicadas).toEqual([{ linea: 4, correo: "existe@miduho.test" }]);
    const lineas = r.csv.replace(/^\uFEFF/, "").trim().split("\r\n");
    expect(lineas[0]).toBe("correo,contrasena");
    expect(lineas).toHaveLength(3);
    const [correo, clave] = lineas[1].split(",");
    expect(correo).toBe("est-a@miduho.test");
    const u = await db.usuario.findUniqueOrThrow({
      where: { correo },
      include: { roles: { include: { rol: true } }, asociacionesGrupo: { include: { grupo: true } } },
    });
    expect(u.estado).toBe("ACTIVO");
    expect(u.debeCambiarContrasena).toBe(false);
    expect(u.roles.map((x) => x.rol.codigo)).toEqual(["ESTUDIANTE"]);
    expect(u.asociacionesGrupo).toHaveLength(1);
    expect(u.asociacionesGrupo[0].finEn).toBeNull();
    // Solo hash en BD.
    expect(u.hashContrasena).not.toBe(clave);
    expect(await verificarContrasena(clave, u.hashContrasena!)).toBe(true);
    // La cuenta existente no se tocó.
    expect((await db.usuario.findUniqueOrThrow({ where: { correo: "existe@miduho.test" } })).hashContrasena).toBeNull();
  });

  it("docentes: ACTIVOS con cambio obligatorio y nunca ADMIN", async () => {
    const r = await S.importar("docentes", `${DOC}\nDocente,Uno,doc-1@miduho.test\nDocente,Dos,doc-2@miduho.test\n`);
    expect(r.creadas).toBe(2);
    const docs = await db.usuario.findMany({
      where: { correo: { in: ["doc-1@miduho.test", "doc-2@miduho.test"] } },
      include: { roles: { include: { rol: true } } },
    });
    for (const d of docs) {
      expect(d.estado).toBe("ACTIVO");
      expect(d.debeCambiarContrasena).toBe(true);
      expect(d.roles.map((x) => x.rol.codigo)).toEqual(["DOCENTE"]);
    }
    expect(await db.usuarioRol.count({ where: { rol: { codigo: "ADMIN" } } })).toBe(0);
  });

  it("reimportar el mismo archivo no recrea cuentas ni vuelve a entregar contraseñas", async () => {
    const e = await S.importar("docentes", `${DOC}\nDocente,Uno,doc-1@miduho.test\n`).catch((x) => x);
    expect(e).toMatchObject({ code: "SIN_CUENTAS_NUEVAS" });
  });
});
