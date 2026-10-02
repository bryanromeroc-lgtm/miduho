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
import { accionesAnio, campoIntensidad, CUERPO_CIERRE, cuerpoFormulario, type TipoApi } from "@/app/admin/estructura/edicion";

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
  it("filtros de listados: vacío = sin filtro; entradas inválidas se rechazan", () => {
    expect(E.filtroGrupos.parse({ q: " ", anioLectivoId: "", gradoId: "", page: "2" })).toEqual({ page: 2, pageSize: 20 });
    expect(E.filtroAsignaturas.parse({ q: " robo ", areaId: "a1" })).toMatchObject({ q: "robo", areaId: "a1" });
    expect(E.filtroPeriodos.safeParse({ page: "abc" }).success).toBe(false);
    expect(E.filtroPeriodos.safeParse({ page: "0" }).success).toBe(false);
    expect(E.paginacion.safeParse({ q: "x".repeat(121) }).success).toBe(false);
    expect(E.filtroAnios.parse({ q: "2026" }).q).toBe(2026);
    expect(E.filtroAnios.parse({ q: "" }).q).toBeUndefined();
    expect(E.filtroAnios.safeParse({ q: "dos mil" }).success).toBe(false);
    expect(E.filtroAnios.safeParse({ q: "1999" }).success).toBe(false);
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

  it("no permite cerrar un año sin períodos ni con ponderación parcial", async () => {
    await S.aniosLectivos.actualizar(anioId, { estado: "CERRADO" });
    const vacio = await S.aniosLectivos.crear({ anio: 2040, fechaInicio: d("2040-01-01"), fechaFin: d("2040-12-31"), estado: "ACTIVO" });
    expect(await codigoDe(S.aniosLectivos.actualizar(vacio.id, { estado: "CERRADO" }))).toBe("CIERRE_REQUIERE_PERIODOS");
    await S.periodos.crear({ anioLectivoId: vacio.id, nombre: "P1", orden: 1, fechaInicio: d("2040-01-01"), fechaFin: d("2040-06-01"), ponderacion: 50 });
    expect(await codigoDe(S.aniosLectivos.actualizar(vacio.id, { estado: "CERRADO" }))).toBe("PONDERACION_INCOMPLETA");
    await S.periodos.crear({ anioLectivoId: vacio.id, nombre: "P2", orden: 2, fechaInicio: d("2040-07-01"), fechaFin: d("2040-12-01"), ponderacion: 50 });
    await S.aniosLectivos.actualizar(vacio.id, { estado: "CERRADO" });
  });

  it("bloquea el borrado si el registro ya tiene relaciones o historial", async () => {
    expect(await codigoDe(S.aniosLectivos.eliminar(anioId))).toBe("ANIO_CERRADO");
    expect(await codigoDe(S.grados.eliminar(gradoId))).toBe("REGISTRO_UTILIZADO");
    const areaLibre = await S.areas.crear({ nombre: "Área libre (ficticia)", tipo: "AREA", idioma: "es" });
    await expect(S.areas.eliminar(areaLibre.id)).resolves.toBeUndefined();
  });

  it("año cerrado es de solo lectura (RN-52)", async () => {
    expect(await codigoDe(S.aniosLectivos.actualizar(anioId, { estado: "ACTIVO" }))).toBe("ANIO_CERRADO");
    expect(
      await codigoDe(S.periodos.crear({ anioLectivoId: anioId, nombre: "P3", orden: 3, ponderacion: 1, fechaInicio: d("2026-12-01"), fechaFin: d("2026-12-02") })),
    ).toBe("ANIO_CERRADO");
    expect(await codigoDe(S.grupos.crear({ gradoId, anioLectivoId: anioId, identificador: "02" }))).toBe("ANIO_CERRADO");
    // Cerrado el anterior, ya se puede activar uno nuevo (RN-01).
    expect(await codigoDe(S.aniosLectivos.crear({ anio: 2027, fechaInicio: d("2027-01-18"), fechaFin: d("2027-12-03"), estado: "ACTIVO" }))).toBe("OK");
  });

  it("búsqueda y filtros de los listados con total coherente (§11)", async () => {
    const pagina = { page: 1, pageSize: 20 };
    // Años: búsqueda exacta por número y paginación con total completo.
    const anio = await S.aniosLectivos.listar({ ...pagina, q: 2040 });
    expect(anio.total).toBe(1);
    expect(anio.data[0].anio).toBe(2040);
    const paginaUno = await S.aniosLectivos.listar({ page: 1, pageSize: 2 });
    const paginaDos = await S.aniosLectivos.listar({ page: 2, pageSize: 2 });
    expect(paginaUno.total).toBe(3);
    expect(paginaUno.data.map((a) => a.anio)).toEqual([2040, 2027]);
    expect(paginaDos.data.map((a) => a.anio)).toEqual([2026]);

    // Períodos: texto + año combinados; incluyen el año para mostrar una etiqueta legible.
    const anio2040 = anio.data[0].id;
    const periodos = await S.periodos.listar({ ...pagina, q: "p2", anioLectivoId: anio2040 });
    expect(periodos.total).toBe(1);
    expect(periodos.data[0]).toMatchObject({ nombre: "P2", anioLectivo: { anio: 2040 } });
    expect((await S.periodos.listar({ ...pagina, q: "P2", anioLectivoId: anioId })).total).toBe(0);

    // Áreas y grados por nombre.
    expect((await S.areas.listar({ ...pagina, q: "prueba" })).total).toBe(1);
    expect((await S.areas.listar({ ...pagina, q: "inexistente" })).total).toBe(0);
    expect((await S.grados.listar({ ...pagina, q: "1°" })).total).toBe(1);
    expect((await S.grados.listar({ ...pagina, q: "9°" })).total).toBe(0);

    // Grupos: "1°-01" o "1° 01" coinciden con grado + identificador; los filtros se combinan.
    expect((await S.grupos.listar({ ...pagina, q: "1°-01" })).total).toBe(1);
    expect((await S.grupos.listar({ ...pagina, q: "1° 02" })).total).toBe(0);
    expect((await S.grupos.listar({ ...pagina, q: "01", anioLectivoId: anio2040 })).total).toBe(0);
    expect((await S.grupos.listar({ ...pagina, gradoId, anioLectivoId: anioId })).total).toBe(1);

    // Asignaturas: por nombre propio o del área, combinable con área y grado.
    const area = (await S.areas.listar({ ...pagina, q: "prueba" })).data[0];
    expect((await S.asignaturas.listar({ ...pagina, q: "robó" })).total).toBe(1);
    expect((await S.asignaturas.listar({ ...pagina, q: "prueba", areaId: area.id })).total).toBe(1);
    expect((await S.asignaturas.listar({ ...pagina, q: "robó", gradoId })).total).toBe(0);

    // Catálogos legibles para los selects: años, grados, áreas y docentes activos.
    const catalogo = await S.opciones();
    expect(catalogo.anios.map((a) => a.anio)).toEqual([2040, 2027, 2026]);
    expect(catalogo.grados.map((g) => g.nombre)).toEqual(["1°"]);
    expect(catalogo.docentes).toHaveLength(1);
  });

  it("contrato del panel: los cuerpos de edición y el cierre se aplican en el servicio (INC1R-07H)", async () => {
    // Mismo camino que la UI: FormData → cuerpoFormulario → esquema de la API → servicio.
    type Campos = Record<string, string | string[]>;
    const cuerpo = (tipo: TipoApi, modo: "crear" | "editar", campos: Campos, original?: Record<string, unknown>) => {
      const f = new FormData();
      for (const [k, v] of Object.entries(campos)) for (const x of [v].flat()) f.append(k, x);
      return cuerpoFormulario(tipo, f, modo, original);
    };

    // Área y grado: todos sus campos.
    const area = await S.areas.crear(E.crearArea.parse(cuerpo("areas", "crear", { nombre: "Área contrato (ficticia)", tipo: "AREA", idioma: "es", orden: "" })));
    const areaEditada = await S.areas.actualizar(area.id, E.actualizarArea.parse(cuerpo("areas", "editar", { nombre: "Área contrato editada", tipo: "ENFOQUE", idioma: "en", orden: "4" })));
    expect(areaEditada).toMatchObject({ nombre: "Área contrato editada", tipo: "ENFOQUE", idioma: "en", orden: 4 });
    expect((await S.areas.actualizar(area.id, E.actualizarArea.parse(cuerpo("areas", "editar", { nombre: "Área contrato editada", tipo: "ENFOQUE", idioma: "en", orden: "" })))).orden).toBeNull();
    const grado = await S.grados.crear(E.crearGrado.parse(cuerpo("grados", "crear", { nombre: "2°", nivel: "PRIMARIA", orden: "2" })));
    expect(await S.grados.actualizar(grado.id, E.actualizarGrado.parse(cuerpo("grados", "editar", { nombre: "Transición", nivel: "PREESCOLAR", orden: "0" })))).toMatchObject({
      nombre: "Transición", nivel: "PREESCOLAR", orden: 0,
    });

    // Año 2027 (ACTIVO): fechas, períodos y grupo; luego cierre con PATCH { estado: "CERRADO" }.
    const anio = (await S.aniosLectivos.listar({ page: 1, pageSize: 20, q: 2027 })).data[0];
    expect(accionesAnio(anio.estado).cerrar).toBe(true);
    const fechasAnio = await S.aniosLectivos.actualizar(anio.id, E.actualizarAnioLectivo.parse(cuerpo("anios-lectivos", "editar", { fechaInicio: "2027-01-25", fechaFin: "2027-11-26" })));
    expect(fechasAnio.fechaFin.toISOString().slice(0, 10)).toBe("2027-11-26");
    const p1 = await S.periodos.crear(E.crearPeriodo.parse(cuerpo("periodos", "crear", { anioLectivoId: anio.id, nombre: "Período 1", orden: "1", ponderacion: "50", fechaInicio: "2027-01-25", fechaFin: "2027-06-11" })));
    await S.periodos.crear(E.crearPeriodo.parse(cuerpo("periodos", "crear", { anioLectivoId: anio.id, nombre: "Período 2", orden: "2", ponderacion: "40", fechaInicio: "2027-06-28", fechaFin: "2027-11-26" })));
    const grupo = await S.grupos.crear(E.crearGrupo.parse(cuerpo("grupos", "crear", { anioLectivoId: anio.id, gradoId: grado.id, identificador: "01", directorId: "" })));
    expect((await S.grupos.actualizar(grupo.id, E.actualizarGrupo.parse(cuerpo("grupos", "editar", { identificador: "B", directorId: "" }, { directorId: null })))).identificador).toBe("B");

    // 50 + 40 = 90 %: el cierre devuelve el error de dominio; al editar el período a 60 % ya se puede cerrar.
    expect(await codigoDe(S.aniosLectivos.actualizar(anio.id, E.actualizarAnioLectivo.parse(CUERPO_CIERRE)))).toBe("PONDERACION_INCOMPLETA");
    const datosP1 = { nombre: "Primer período", orden: "1", ponderacion: "60", fechaInicio: "2027-01-25", fechaFin: "2027-06-18" };
    expect(await S.periodos.actualizar(p1.id, E.actualizarPeriodo.parse(cuerpo("periodos", "editar", datosP1)))).toMatchObject({ nombre: "Primer período", ponderacion: 60 });
    const cerrado = await S.aniosLectivos.actualizar(anio.id, E.actualizarAnioLectivo.parse(CUERPO_CIERRE));
    expect(cerrado.estado).toBe("CERRADO");
    expect(accionesAnio(cerrado.estado)).toEqual({ editar: false, cerrar: false, eliminar: false });
    expect(await codigoDe(S.aniosLectivos.actualizar(anio.id, E.actualizarAnioLectivo.parse(cuerpo("anios-lectivos", "editar", { fechaInicio: "2027-01-26", fechaFin: "2027-11-26" }))))).toBe("ANIO_CERRADO");
    expect(await codigoDe(S.periodos.actualizar(p1.id, E.actualizarPeriodo.parse(cuerpo("periodos", "editar", { ...datosP1, nombre: "Otro" }))))).toBe("ANIO_CERRADO");
    expect(await codigoDe(S.grupos.actualizar(grupo.id, E.actualizarGrupo.parse(cuerpo("grupos", "editar", { identificador: "C", directorId: "" }, { directorId: null }))))).toBe("ANIO_CERRADO");

    // Asignatura: nombre, área, intensidad general y conjunto de grados con intensidad por grado.
    const asignatura = await S.asignaturas.crear(E.crearAsignatura.parse(cuerpo("asignaturas", "crear", { nombre: "Asignatura contrato", areaId: area.id, intensidadHoraria: "", gradoId: [grado.id] })));
    const editada = await S.asignaturas.actualizar(
      asignatura.id,
      E.actualizarAsignatura.parse(cuerpo("asignaturas", "editar", { nombre: "Asignatura editada", areaId: area.id, intensidadHoraria: "3", gradoId: [grado.id, gradoId], [campoIntensidad(gradoId)]: "2" })),
    );
    expect(editada).toMatchObject({ nombre: "Asignatura editada", intensidadHoraria: 3 });
    expect(editada.grados.map((g) => [g.gradoId, g.intensidad]).sort()).toEqual([[grado.id, null], [gradoId, 2]].sort());
  });

  it("asignaciones: valida grado/año, evita cruces y conserva historial al reasignar/reactivar", async () => {
    const anio = await S.aniosLectivos.crear({ anio: 2050, fechaInicio: d("2050-01-20"), fechaFin: d("2050-11-30"), estado: "ACTIVO" });
    const grado = await S.grados.crear({ nombre: "3° prueba", nivel: "PRIMARIA", orden: 30 });
    const otroGrado = await S.grados.crear({ nombre: "4° prueba", nivel: "PRIMARIA", orden: 40 });
    const grupoA = await S.grupos.crear({ gradoId: grado.id, anioLectivoId: anio.id, identificador: "A" });
    const grupoB = await S.grupos.crear({ gradoId: grado.id, anioLectivoId: anio.id, identificador: "B" });
    const grupoOtro = await S.grupos.crear({ gradoId: otroGrado.id, anioLectivoId: anio.id, identificador: "A" });
    const area = await S.areas.crear({ nombre: "Área horario (ficticia)", tipo: "AREA", idioma: "es" });
    const asignatura = await S.asignaturas.crear({ nombre: "Horario prueba", areaId: area.id, grados: [{ gradoId: grado.id }] });
    const noHabilitada = await S.asignaturas.crear({ nombre: "No habilitada", areaId: area.id, grados: [] });
    const rol = await db.rol.findUniqueOrThrow({ where: { codigo: "DOCENTE" } });
    const docente = await db.usuario.create({ data: { nombres: "Docente", apellidos: "Ficticio A", correo: "horario-a@miduho.test", hashContrasena: "x", estado: "ACTIVO", roles: { create: { rolId: rol.id } } } });
    const docenteB = await db.usuario.create({ data: { nombres: "Docente", apellidos: "Ficticio B", correo: "horario-b@miduho.test", hashContrasena: "x", estado: "ACTIVO", roles: { create: { rolId: rol.id } } } });
    const bloques = [{ dia: "LUNES" as const, horaInicio: "08:00", horaFin: "09:00" }];

    expect(await codigoDe(S.asignacionesDocente.crear({ docenteId: docente.id, asignaturaId: noHabilitada.id, grupoId: grupoOtro.id, anioLectivoId: anio.id, bloques }))).toBe("ASIGNATURA_GRADO_INVALIDA");
    const primera = await S.asignacionesDocente.crear({ docenteId: docente.id, asignaturaId: asignatura.id, grupoId: grupoA.id, anioLectivoId: anio.id, bloques });
    expect(primera.bloques).toHaveLength(1);
    expect(await codigoDe(S.asignacionesDocente.crear({ docenteId: docente.id, asignaturaId: asignatura.id, grupoId: grupoB.id, anioLectivoId: anio.id, bloques: [{ dia: "LUNES", horaInicio: "08:30", horaFin: "09:30" }] }))).toBe("CRUCE_DOCENTE");
    expect(await codigoDe(S.asignacionesDocente.crear({ docenteId: docenteB.id, asignaturaId: asignatura.id, grupoId: grupoA.id, anioLectivoId: anio.id, bloques: [{ dia: "LUNES", horaInicio: "08:30", horaFin: "09:30" }] }))).toBe("CRUCE_GRUPO");

    const nueva = await S.asignacionesDocente.reasignar(primera.id, { docenteId: docenteB.id, bloques, confirmar: true });
    expect(nueva.id).not.toBe(primera.id);
    expect((await db.asignacionDocente.findUniqueOrThrow({ where: { id: primera.id } })).estado).toBe("INACTIVA");
    await S.asignacionesDocente.desactivar(nueva.id);
    await expect(S.asignacionesDocente.reactivar(nueva.id)).resolves.toMatchObject({ estado: "ACTIVA" });
    expect(await codigoDe(S.asignacionesDocente.reasignar(nueva.id, { docenteId: docente.id, bloques, confirmar: false }))).toBe("CONFIRMACION_REQUERIDA");
    const regreso = await S.asignacionesDocente.reasignar(nueva.id, { docenteId: docente.id, bloques, confirmar: true });
    expect(regreso.docente.id).toBe(docente.id);
    expect(await db.asignacionDocente.count({ where: { docenteId: docente.id, asignaturaId: asignatura.id, grupoId: grupoA.id, anioLectivoId: anio.id } })).toBe(2);

    await S.periodos.crear({ anioLectivoId: anio.id, nombre: "Único", orden: 1, fechaInicio: d("2050-01-20"), fechaFin: d("2050-11-30"), ponderacion: 100 });
    await S.aniosLectivos.actualizar(anio.id, { estado: "CERRADO" });
    expect(await codigoDe(S.asignacionesDocente.desactivar(regreso.id))).toBe("ANIO_CERRADO");
  });
});
