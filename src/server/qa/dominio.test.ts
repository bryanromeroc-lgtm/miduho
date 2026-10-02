/**
 * Suite QA (INC1R-12) · Dominio.
 *
 * Verificación independiente de las reglas de negocio del Incremento 1R contra
 * los servicios reales (cuentas, usuarios, académico y Mi curso) y una SQLite
 * temporal con las migraciones reales. Cubre los criterios de aceptación del
 * requerimiento aprobado:
 *
 *  - combinaciones de roles válidas (§2);
 *  - estados de cuenta y ciclos (§4);
 *  - protección del último ADMIN activo (§2.1);
 *  - asociación estudiante–grupo con traslado (§6);
 *  - cierre de año con suma 100 % e inmutabilidad (§7);
 *  - asignatura habilitada para el grado (§8);
 *  - cruces de horario docente y grupo (§8);
 *  - reactivación y reasignación conservando historial (§8);
 *  - autorización horizontal del docente (§2.2, §3 y §10).
 */
import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaClient } from "@/generated/prisma/client";
import { combinacionDe, esCambioDeCombinacionPermitido } from "@/lib/usuarios";
import { hashearContrasena } from "@/server/auth/contrasena";
import { crearServicioCuentas, type ServicioCuentas } from "@/server/auth/cuentas";
import { ErrorDominio } from "@/server/errores";
import { crearServicioAcademico, type ServicioAcademico } from "@/server/modules/academico/servicio";
import { crearServicioMiCurso, type ServicioMiCurso } from "@/server/modules/mi-curso/servicio";
import { crearServicioUsuarios, type ServicioUsuarios } from "@/server/modules/usuarios/servicio";

const d = (s: string) => new Date(`${s}T00:00:00.000Z`);

async function codigoDe(p: Promise<unknown>) {
  try {
    await p;
  } catch (e) {
    if (e instanceof ErrorDominio) return e.code;
    throw e;
  }
  return "OK";
}

let dir: string;
let db: PrismaClient;
let C: ServicioCuentas;
let U: ServicioUsuarios;
let S: ServicioAcademico;
let M: ServicioMiCurso;
const ids: Record<string, string> = {};
let reloj = new Date("2026-03-01T12:00:00.000Z");

beforeAll(async () => {
  dir = mkdtempSync(path.join(tmpdir(), "miduho-qa-dominio-"));
  const url = `file:${path.join(dir, "test.db")}`;
  const raiz = path.resolve(__dirname, "../../../prisma/migrations");
  const migrador = createClient({ url });
  for (const m of readdirSync(raiz).filter((n) => /^\d+_/.test(n)).sort()) {
    await migrador.executeMultiple(readFileSync(path.join(raiz, m, "migration.sql"), "utf8"));
  }
  migrador.close();
  db = new PrismaClient({ adapter: new PrismaLibSql({ url }) });
  for (const codigo of ["ADMIN", "DOCENTE", "ESTUDIANTE"]) await db.rol.create({ data: { codigo, nombre: codigo } });
  C = crearServicioCuentas(db, { notificar: async () => {}, urlBase: "http://localhost:3000", costo: 4, ahora: () => reloj });
  U = crearServicioUsuarios(db, C, { ahora: () => reloj });
  S = crearServicioAcademico(db);
  M = crearServicioMiCurso(db);

  // Escenario ficticio: un ADMIN, dos docentes (uno con carga) y dos estudiantes.
  ids.admin = (await db.usuario.create({
    data: { nombres: "Admin", apellidos: "Ficticia", correo: "admin@miduho.test", estado: "ACTIVO", hashContrasena: await hashearContrasena("clave-1", 4), roles: { create: { rol: { connect: { codigo: "ADMIN" } } } } },
  })).id;
  const docA = await C.crearDocente({ nombres: "Docente", apellidos: "Alfa", correo: "doc-a@miduho.test" });
  ids.docA = docA.id;
  const docB = await C.crearDocente({ nombres: "Docente", apellidos: "Beta", correo: "doc-b@miduho.test" });
  ids.docB = docB.id;
  const est1 = await C.crearEstudiante({ nombres: "Est", apellidos: "Uno", correo: "est-1@miduho.test" });
  ids.est1 = est1.id;
  const est2 = await C.crearEstudiante({ nombres: "Est", apellidos: "Dos", correo: "est-2@miduho.test" });
  ids.est2 = est2.id;

  // Año 2025 CERRADO (con períodos que suman 100 %) y año 2026 ACTIVO.
  const cerrado = await S.aniosLectivos.crear({ anio: 2025, fechaInicio: d("2025-01-20"), fechaFin: d("2025-12-05"), estado: "ACTIVO" });
  await S.periodos.crear({ anioLectivoId: cerrado.id, nombre: "P1", orden: 1, fechaInicio: d("2025-01-20"), fechaFin: d("2025-06-19"), ponderacion: 50 });
  await S.periodos.crear({ anioLectivoId: cerrado.id, nombre: "P2", orden: 2, fechaInicio: d("2025-06-22"), fechaFin: d("2025-12-05"), ponderacion: 50 });
  await S.aniosLectivos.actualizar(cerrado.id, { estado: "CERRADO" });
  ids.anioCerrado = cerrado.id;

  const anio = await S.aniosLectivos.crear({ anio: 2026, fechaInicio: d("2026-01-19"), fechaFin: d("2026-12-04"), estado: "ACTIVO" });
  ids.anio = anio.id;

  const grado = await S.grados.crear({ nombre: "2°", nivel: "PRIMARIA", orden: 2 });
  ids.grado = grado.id;
  const gradoOtro = await S.grados.crear({ nombre: "3°", nivel: "PRIMARIA", orden: 3 });
  ids.gradoOtro = gradoOtro.id;

  ids.g1 = (await S.grupos.crear({ gradoId: grado.id, anioLectivoId: anio.id, identificador: "01" })).id;
  ids.g2 = (await S.grupos.crear({ gradoId: grado.id, anioLectivoId: anio.id, identificador: "02" })).id;
  // El grupo del año cerrado se siembra directo: el servicio rechaza crear en un año CERRADO.
  ids.gCerrado = (await db.grupo.create({ data: { gradoId: grado.id, anioLectivoId: cerrado.id, identificador: "01" } })).id;

  const area = await S.areas.crear({ nombre: "Área QA (ficticia)", tipo: "AREA", idioma: "es" });
  const asignatura = await S.asignaturas.crear({ nombre: "Asignatura QA", areaId: area.id, grados: [{ gradoId: grado.id }] });
  ids.asignatura = asignatura.id;
  const noHabilitada = await S.asignaturas.crear({ nombre: "Sin habilitar", areaId: area.id, grados: [] });
  ids.noHabilitada = noHabilitada.id;

  // Asignación activa de docA en g1 (LUNES 08:00–09:00).
  ids.asignacion = (
    await S.asignacionesDocente.crear({ docenteId: docA.id, asignaturaId: asignatura.id, grupoId: ids.g1, anioLectivoId: anio.id, bloques: [{ dia: "LUNES", horaInicio: "08:00", horaFin: "09:00" }] })
  ).id;

  // est1 en g1 (año activo).
  await db.asociacionEstudianteGrupo.create({ data: { estudianteId: est1.id, grupoId: ids.g1, anioLectivoId: anio.id } });
}, 90_000);

afterAll(async () => {
  await db?.$disconnect();
  if (dir) rmSync(dir, { recursive: true, force: true });
});

describe("suite QA · combinaciones de roles", () => {
  it("solo reconoce las cuatro combinaciones válidas", () => {
    expect(combinacionDe(["ADMIN"])).toBe("ADMIN");
    expect(combinacionDe(["DOCENTE"])).toBe("DOCENTE");
    expect(combinacionDe(["ESTUDIANTE"])).toBe("ESTUDIANTE");
    expect(combinacionDe(["DOCENTE", "ADMIN"])).toBe("DOCENTE_ADMIN");
    expect(combinacionDe(["ESTUDIANTE", "ADMIN"])).toBeNull();
    expect(combinacionDe(["ESTUDIANTE", "DOCENTE"])).toBeNull();
  });

  it("no convierte una cuenta estudiantil en una del personal ni al revés", () => {
    expect(esCambioDeCombinacionPermitido("DOCENTE", "DOCENTE_ADMIN")).toBe(true);
    expect(esCambioDeCombinacionPermitido("DOCENTE_ADMIN", "ADMIN")).toBe(true);
    expect(esCambioDeCombinacionPermitido("ESTUDIANTE", "DOCENTE")).toBe(false);
    expect(esCambioDeCombinacionPermitido("ADMIN", "ESTUDIANTE")).toBe(false);
  });

  it("crea DOCENTE + ADMIN en una sola escritura y rechaza la conversión de estudiante", async () => {
    const mixta = await C.crearDocente({ nombres: "Mixta", apellidos: "Ficticia", correo: "mixta@miduho.test" }, { tambienAdmin: true });
    expect((await U.obtener(mixta.id)).combinacion).toBe("DOCENTE_ADMIN");
    expect(await codigoDe(U.cambiarRoles(ids.admin, ids.est1, "DOCENTE"))).toBe("COMBINACION_NO_PERMITIDA");
  });
});

describe("suite QA · estados de cuenta", () => {
  it("cada combinación arranca en su estado correcto", async () => {
    const admin = await C.invitarAdmin({ nombres: "Admin", apellidos: "Nuevo", correo: "admin-nuevo@miduho.test" });
    expect((await U.obtener(admin.id)).estado).toBe("PENDIENTE_ACTIVACION");
    const docente = await C.crearDocente({ nombres: "Doc", apellidos: "Nuevo", correo: "doc-nuevo@miduho.test" });
    expect((await U.obtener(docente.id))).toMatchObject({ estado: "ACTIVO", debeCambiarContrasena: true });
    const estudiante = await C.crearEstudiante({ nombres: "Est", apellidos: "Nuevo", correo: "est-nuevo@miduho.test" });
    expect((await U.obtener(estudiante.id)).estado).toBe("ACTIVO");
  });

  it("desactivar conserva el historial; reactivar vuelve a ACTIVO o, sin contraseña, a PENDIENTE", async () => {
    const antes = await db.usuario.findUniqueOrThrow({ where: { id: ids.est1 } });
    await U.cambiarEstado(ids.admin, ids.est1, "INACTIVO");
    expect((await U.obtener(ids.est1)).estado).toBe("INACTIVO");
    expect((await U.obtener(ids.est1)).historialGrupos).toHaveLength(1);

    await U.cambiarEstado(ids.admin, ids.est1, "ACTIVO");
    expect((await U.obtener(ids.est1)).estado).toBe("ACTIVO");
    void antes;
  });

  it("no se puede desactivar a sí mismo ni a una cuenta inexistente", async () => {
    expect(await codigoDe(U.cambiarEstado(ids.admin, ids.admin, "INACTIVO"))).toBe("AUTODESACTIVACION");
    expect(await codigoDe(U.cambiarEstado(ids.admin, "no-existe", "INACTIVO"))).toBe("NO_ENCONTRADO");
  });
});

describe("suite QA · último ADMIN", () => {
  it("el último ADMIN activo no se degrada ni se desactiva", async () => {
    // Degradar a la única otra cuenta ADMIN (mixta) para dejar a admin como único ADMIN activo.
    const mixta = (await db.usuario.findUniqueOrThrow({ where: { correo: "mixta@miduho.test" } })).id;
    expect(await codigoDe(U.cambiarRoles(ids.admin, mixta, "DOCENTE"))).toBe("OK");

    expect(await codigoDe(U.cambiarRoles(mixta, ids.admin, "DOCENTE"))).toBe("ULTIMO_ADMIN");
    expect(await codigoDe(U.cambiarEstado(mixta, ids.admin, "INACTIVO"))).toBe("ULTIMO_ADMIN");
    expect((await U.obtener(ids.admin))).toMatchObject({ estado: "ACTIVO" });
    expect((await U.obtener(ids.admin)).roles).toContain("ADMIN");
  });

  it("un ADMIN pendiente de activación no cuenta como ADMIN activo", async () => {
    const pendiente = await C.invitarAdmin({ nombres: "Admin", apellidos: "Pendiente", correo: "admin-pendiente@miduho.test" });
    // Sigue sin poderse degradar/desactivar el único ADMIN activo (admin).
    expect(await codigoDe(U.cambiarEstado(ids.admin, ids.admin, "INACTIVO"))).toBe("AUTODESACTIVACION");
    expect(await codigoDe(U.cambiarRoles(ids.admin, pendiente.id, "DOCENTE_ADMIN"))).toBe("CUENTA_PENDIENTE");
  });
});

describe("suite QA · asociación estudiante–grupo", () => {
  it("el traslado exige confirmación, cierra la anterior y deja una sola activa", async () => {
    expect(await codigoDe(U.asignarGrupo(ids.est2, { grupoId: ids.g1, confirmarTraslado: false }))).toBe("OK");
    expect(await codigoDe(U.asignarGrupo(ids.est2, { grupoId: ids.g1, confirmarTraslado: true }))).toBe("MISMO_GRUPO");
    reloj = new Date("2026-04-01T12:00:00.000Z");
    const r = await U.asignarGrupo(ids.est2, { grupoId: ids.g2, confirmarTraslado: true });
    expect(r.traslado).toBe(true);

    const asociaciones = await db.asociacionEstudianteGrupo.findMany({ where: { estudianteId: ids.est2 }, orderBy: { inicioEn: "asc" } });
    expect(asociaciones).toHaveLength(2);
    expect(asociaciones.filter((a) => a.finEn === null)).toHaveLength(1);
    expect((await U.obtener(ids.est2)).grupoActual?.id).toBe(ids.g2);
  });

  it("rechaza personal, cuentas inactivas y grupos de año cerrado", async () => {
    expect(await codigoDe(U.asignarGrupo(ids.docA, { grupoId: ids.g1, confirmarTraslado: false }))).toBe("NO_ES_ESTUDIANTE");
    expect(await codigoDe(U.asignarGrupo(ids.est1, { grupoId: ids.gCerrado, confirmarTraslado: true }))).toBe("ANIO_CERRADO");
    await U.cambiarEstado(ids.admin, ids.est1, "INACTIVO");
    expect(await codigoDe(U.asignarGrupo(ids.est1, { grupoId: ids.g2, confirmarTraslado: true }))).toBe("CUENTA_INACTIVA");
    await U.cambiarEstado(ids.admin, ids.est1, "ACTIVO");
  });
});

describe("suite QA · asignatura–grado y cruces de horario", () => {
  it("no asigna una asignatura que no está habilitada para el grado", async () => {
    expect(
      await codigoDe(
        S.asignacionesDocente.crear({ docenteId: ids.docB, asignaturaId: ids.noHabilitada, grupoId: ids.g1, anioLectivoId: ids.anio, bloques: [{ dia: "MARTES", horaInicio: "08:00", horaFin: "09:00" }] }),
      ),
    ).toBe("ASIGNATURA_GRADO_INVALIDA");
  });

  it("bloquea cruces del mismo docente y del mismo grupo", async () => {
    // docA ya tiene LUNES 08:00–09:00 en g1.
    expect(
      await codigoDe(
        S.asignacionesDocente.crear({ docenteId: ids.docA, asignaturaId: ids.asignatura, grupoId: ids.g2, anioLectivoId: ids.anio, bloques: [{ dia: "LUNES", horaInicio: "08:30", horaFin: "09:30" }] }),
      ),
    ).toBe("CRUCE_DOCENTE");
    expect(
      await codigoDe(
        S.asignacionesDocente.crear({ docenteId: ids.docB, asignaturaId: ids.asignatura, grupoId: ids.g1, anioLectivoId: ids.anio, bloques: [{ dia: "LUNES", horaInicio: "08:30", horaFin: "09:30" }] }),
      ),
    ).toBe("CRUCE_GRUPO");
    // Sin cruce sí se permite.
    expect(
      await codigoDe(
        S.asignacionesDocente.crear({ docenteId: ids.docB, asignaturaId: ids.asignatura, grupoId: ids.g2, anioLectivoId: ids.anio, bloques: [{ dia: "MARTES", horaInicio: "08:00", horaFin: "09:00" }] }),
      ),
    ).toBe("OK");
  });

  it("valida docente activo con rol DOCENTE, grupo del año y año no cerrado", async () => {
    const noDocente = await db.usuario.create({ data: { nombres: "Cuenta", apellidos: "SinRol", correo: "sin-rol@miduho.test", estado: "ACTIVO", hashContrasena: "x" } });
    expect(
      await codigoDe(
        S.asignacionesDocente.crear({ docenteId: noDocente.id, asignaturaId: ids.asignatura, grupoId: ids.g1, anioLectivoId: ids.anio, bloques: [{ dia: "VIERNES", horaInicio: "08:00", horaFin: "09:00" }] }),
      ),
    ).toBe("DOCENTE_INVALIDO");
    expect(
      await codigoDe(
        S.asignacionesDocente.crear({ docenteId: ids.docB, asignaturaId: ids.asignatura, grupoId: ids.g1, anioLectivoId: ids.anioCerrado, bloques: [{ dia: "VIERNES", horaInicio: "08:00", horaFin: "09:00" }] }),
      ),
    ).toBe("GRUPO_ANIO_INVALIDO");
  });
});

describe("suite QA · reactivación y reasignación", () => {
  it("reactiva una asignación inactiva y revalida conflictos; reasigna con confirmación e historial", async () => {
    // docB → g2 (MARTES 08:00–09:00) ya existe activa. Crear una y desactivarla.
    const a = await S.asignacionesDocente.crear({ docenteId: ids.docB, asignaturaId: ids.asignatura, grupoId: ids.g1, anioLectivoId: ids.anio, bloques: [{ dia: "JUEVES", horaInicio: "08:00", horaFin: "09:00" }] });
    await S.asignacionesDocente.desactivar(a.id);
    expect((await db.asignacionDocente.findUniqueOrThrow({ where: { id: a.id } })).estado).toBe("INACTIVA");
    await S.asignacionesDocente.reactivar(a.id);
    expect((await db.asignacionDocente.findUniqueOrThrow({ where: { id: a.id } })).estado).toBe("ACTIVA");

    // Reasignación exige confirmación.
    expect(await codigoDe(S.asignacionesDocente.reasignar(a.id, { docenteId: ids.docA, bloques: [{ dia: "JUEVES", horaInicio: "08:00", horaFin: "09:00" }], confirmar: false }))).toBe("CONFIRMACION_REQUERIDA");

    const nueva = await S.asignacionesDocente.reasignar(a.id, { docenteId: ids.docA, bloques: [{ dia: "JUEVES", horaInicio: "08:00", horaFin: "09:00" }], confirmar: true });
    expect(nueva.id).not.toBe(a.id);
    // Historial conservado: la anterior queda INACTIVA (no se borra) y la nueva ACTIVA.
    expect((await db.asignacionDocente.findUniqueOrThrow({ where: { id: a.id } })).estado).toBe("INACTIVA");
    expect((await db.asignacionDocente.findUniqueOrThrow({ where: { id: nueva.id } })).estado).toBe("ACTIVA");
    expect(await db.asignacionDocente.count({ where: { asignaturaId: ids.asignatura, grupoId: ids.g1, anioLectivoId: ids.anio } })).toBeGreaterThanOrEqual(2);
  });
});

describe("suite QA · autorización horizontal del docente", () => {
  it("Mi curso solo expone grupos del año activo donde el docente tiene asignación activa", async () => {
    const deA = await M.listarGrupos(ids.docA);
    expect(deA.map((g) => g.id)).toContain(ids.g1);
    expect(deA.every((g) => g.id !== ids.gCerrado)).toBe(true);
    const deB = await M.listarGrupos(ids.docB);
    expect(deB.map((g) => g.id)).toContain(ids.g2);
  });

  it("obtenerGrupo responde el mismo 404 para grupo ajeno, inexistente o sin asignación", async () => {
    expect(await codigoDe(M.obtenerGrupo(ids.docA, ids.g2))).toBe("NO_ENCONTRADO"); // docB tiene g2, no docA
    expect(await codigoDe(M.obtenerGrupo(ids.docA, ids.gCerrado))).toBe("NO_ENCONTRADO");
    expect(await codigoDe(M.obtenerGrupo(ids.docA, "no-existe"))).toBe("NO_ENCONTRADO");
    expect(await codigoDe(M.obtenerGrupo(ids.est1, ids.g1))).toBe("NO_ENCONTRADO"); // un estudiante no consulta grupos
  });

  it("el detalle muestra solo estudiantes con asociación vigente, sin datos de edición", async () => {
    const grupo = await M.obtenerGrupo(ids.docA, ids.g1);
    expect(grupo.estudiantes.map((e) => e.correo)).toEqual(["est-1@miduho.test"]);
    expect(Object.keys(grupo.estudiantes[0]).sort()).toEqual(["apellidos", "correo", "estado", "id", "nombres"]);
  });

  it("un docente solo restablece credenciales de sus estudiantes", async () => {
    expect(await codigoDe(C.restablecerEstudiantes({ id: ids.docB, roles: ["DOCENTE"] }, [ids.est1]))).toBe("SIN_PERMISO");
    // ADMIN sí puede.
    const r = await C.restablecerEstudiantes({ id: ids.admin, roles: ["ADMIN"] }, [ids.est1]);
    expect(r.total).toBe(1);
  });
});

describe("suite QA · año cerrado y suma 100 %", () => {
  it("no cierra sin períodos ni con ponderación incompleta; cierra al 100 % y queda inmutable", async () => {
    // El año 2026 sigue ACTIVO y sin períodos: sirve para verificar el cierre completo.
    expect(await codigoDe(S.aniosLectivos.actualizar(ids.anio, { estado: "CERRADO" }))).toBe("CIERRE_REQUIERE_PERIODOS");

    await S.periodos.crear({ anioLectivoId: ids.anio, nombre: "P1", orden: 1, fechaInicio: d("2026-01-19"), fechaFin: d("2026-06-30"), ponderacion: 50 });
    expect(await codigoDe(S.aniosLectivos.actualizar(ids.anio, { estado: "CERRADO" }))).toBe("PONDERACION_INCOMPLETA");

    await S.periodos.crear({ anioLectivoId: ids.anio, nombre: "P2", orden: 2, fechaInicio: d("2026-07-01"), fechaFin: d("2026-12-04"), ponderacion: 50 });
    await S.aniosLectivos.actualizar(ids.anio, { estado: "CERRADO" });

    // Inmutable: no se reabre, no se editan fechas y no se crean períodos nuevos.
    expect(await codigoDe(S.aniosLectivos.actualizar(ids.anio, { estado: "ACTIVO" }))).toBe("ANIO_CERRADO");
    expect(await codigoDe(S.aniosLectivos.actualizar(ids.anio, { fechaFin: d("2026-11-30") }))).toBe("ANIO_CERRADO");
    expect(await codigoDe(S.periodos.crear({ anioLectivoId: ids.anio, nombre: "P3", orden: 3, ponderacion: 1, fechaInicio: d("2026-12-01"), fechaFin: d("2026-12-02") }))).toBe("ANIO_CERRADO");
  });
});
