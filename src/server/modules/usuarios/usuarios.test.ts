import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaClient } from "@/generated/prisma/client";
import { combinacionDe, esCambioDeCombinacionPermitido, rolesDeCombinacion } from "@/lib/usuarios";
import { hashearContrasena, verificarContrasena } from "@/server/auth/contrasena";
import { crearServicioCuentas } from "@/server/auth/cuentas";
import { ErrorDominio } from "@/server/errores";
import { actualizarIdentidad, crearUsuario, filtroUsuarios } from "./esquemas";
import { crearServicioUsuarios, type ServicioUsuarios } from "./servicio";

describe("combinaciones de roles (lógica pura)", () => {
  it("reconoce solo las cuatro combinaciones válidas", () => {
    expect(combinacionDe(["ADMIN"])).toBe("ADMIN");
    expect(combinacionDe(["DOCENTE"])).toBe("DOCENTE");
    expect(combinacionDe(["ADMIN", "DOCENTE"])).toBe("DOCENTE_ADMIN");
    expect(combinacionDe(["ESTUDIANTE"])).toBe("ESTUDIANTE");
    expect(combinacionDe(["ESTUDIANTE", "ADMIN"])).toBeNull();
    expect(combinacionDe(["ESTUDIANTE", "DOCENTE"])).toBeNull();
    expect(combinacionDe([])).toBeNull();
    expect(rolesDeCombinacion("DOCENTE_ADMIN")).toEqual(["DOCENTE", "ADMIN"]);
  });
  it("no convierte cuentas estudiantiles en cuentas del personal ni al revés", () => {
    expect(esCambioDeCombinacionPermitido("DOCENTE", "DOCENTE_ADMIN")).toBe(true);
    expect(esCambioDeCombinacionPermitido("DOCENTE_ADMIN", "ADMIN")).toBe(true);
    expect(esCambioDeCombinacionPermitido("ESTUDIANTE", "DOCENTE")).toBe(false);
    expect(esCambioDeCombinacionPermitido("ADMIN", "ESTUDIANTE")).toBe(false);
  });
});

describe("esquemas de administración de usuarios", () => {
  it("el grupo solo se acepta para ESTUDIANTE", () => {
    const base = { nombres: "Cuenta", apellidos: "Ficticia", correo: "X@MIDUHO.TEST" };
    expect(crearUsuario.safeParse({ ...base, combinacion: "DOCENTE", grupoId: "g1" }).success).toBe(false);
    const ok = crearUsuario.safeParse({ ...base, combinacion: "ESTUDIANTE", grupoId: "g1" });
    expect(ok.success && ok.data.correo).toBe("x@miduho.test");
    expect(crearUsuario.safeParse({ ...base, combinacion: "ESTUDIANTE_ADMIN" }).success).toBe(false);
  });
  it("la edición exige al menos un cambio y rechaza campos ajenos (rol/estado)", () => {
    expect(actualizarIdentidad.safeParse({}).success).toBe(false);
    expect(actualizarIdentidad.safeParse({ estado: "ACTIVO" }).success).toBe(false);
    expect(actualizarIdentidad.safeParse({ nombres: "Nuevo" }).success).toBe(true);
  });
  it("filtros vacíos equivalen a sin filtro y la página se acota", () => {
    const f = filtroUsuarios.parse({ q: " ", rol: "", estado: "", grupoId: "", page: "2" });
    expect(f).toMatchObject({ q: undefined, rol: undefined, estado: undefined, grupoId: undefined, page: 2, pageSize: 20 });
    expect(filtroUsuarios.safeParse({ pageSize: "500" }).success).toBe(false);
  });
});

// ---------- Integración contra SQLite temporal con las migraciones reales ----------
let dir: string;
let db: PrismaClient;
let U: ServicioUsuarios;
const buzon: { para: string; texto: string }[] = [];
let reloj = new Date("2026-03-01T12:00:00.000Z");
const ids: Record<string, string> = {};

async function codigoDe(p: Promise<unknown>) {
  try {
    await p;
  } catch (e) {
    if (e instanceof ErrorDominio) return e.code;
    throw e;
  }
  return "OK";
}

async function usuario(correo: string, roles: string[], estado: "ACTIVO" | "INACTIVO" = "ACTIVO") {
  const u = await db.usuario.create({
    data: { nombres: "Cuenta", apellidos: "Ficticia", correo, estado, hashContrasena: await hashearContrasena("clave-inicial-1", 4) },
  });
  for (const codigo of roles) {
    const rol = await db.rol.findUniqueOrThrow({ where: { codigo } });
    await db.usuarioRol.create({ data: { usuarioId: u.id, rolId: rol.id } });
  }
  return u;
}

const version = async (id: string) => (await db.usuario.findUniqueOrThrow({ where: { id } })).versionSesion;

beforeAll(async () => {
  dir = mkdtempSync(path.join(tmpdir(), "miduho-usuarios-"));
  const url = `file:${path.join(dir, "test.db")}`;
  const raiz = path.resolve(__dirname, "../../../../prisma/migrations");
  const migrador = createClient({ url });
  for (const m of readdirSync(raiz).filter((n) => /^\d+_/.test(n)).sort()) {
    await migrador.executeMultiple(readFileSync(path.join(raiz, m, "migration.sql"), "utf8"));
  }
  migrador.close();
  db = new PrismaClient({ adapter: new PrismaLibSql({ url }) });
  for (const codigo of ["ADMIN", "DOCENTE", "ESTUDIANTE"]) await db.rol.create({ data: { codigo, nombre: codigo } });
  const cuentas = crearServicioCuentas(db, {
    notificar: async (m) => void buzon.push(m),
    urlBase: "http://localhost:3000",
    costo: 4,
    ahora: () => reloj,
  });
  U = crearServicioUsuarios(db, cuentas, { ahora: () => reloj });

  // Escenario ficticio: un ADMIN, un docente con carga y otro sin carga; dos grupos del año activo y uno de un año cerrado.
  ids.admin = (await usuario("admin@miduho.test", ["ADMIN"])).id;
  ids.docCarga = (await usuario("doc-carga@miduho.test", ["DOCENTE"])).id;
  ids.docLibre = (await usuario("doc-libre@miduho.test", ["DOCENTE"])).id;
  const cerrado = await db.anioLectivo.create({
    data: { anio: 2025, fechaInicio: new Date("2025-01-20"), fechaFin: new Date("2025-12-05"), estado: "CERRADO" },
  });
  const anio = await db.anioLectivo.create({ data: { anio: 2026, fechaInicio: new Date("2026-01-19"), fechaFin: new Date("2026-12-04") } });
  const grado = await db.grado.create({ data: { nombre: "2°", nivel: "PRIMARIA", orden: 2 } });
  ids.g1 = (await db.grupo.create({ data: { gradoId: grado.id, anioLectivoId: anio.id, identificador: "01" } })).id;
  ids.g2 = (await db.grupo.create({ data: { gradoId: grado.id, anioLectivoId: anio.id, identificador: "02" } })).id;
  ids.gCerrado = (await db.grupo.create({ data: { gradoId: grado.id, anioLectivoId: cerrado.id, identificador: "01" } })).id;
  ids.anio = anio.id;
  const area = await db.area.create({ data: { nombre: "Área demo" } });
  const asig = await db.asignatura.create({ data: { nombre: "Asignatura demo", areaId: area.id } });
  await db.asignaturaGrado.create({ data: { asignaturaId: asig.id, gradoId: grado.id } });
  await db.asignacionDocente.create({ data: { docenteId: ids.docCarga, asignaturaId: asig.id, grupoId: ids.g1, anioLectivoId: anio.id } });
});

afterAll(async () => {
  await db?.$disconnect();
  if (dir) rmSync(dir, { recursive: true, force: true });
});

describe("alta individual", () => {
  it("DOCENTE: temporal con cambio obligatorio; solo se guarda el hash", async () => {
    const r = await U.crear({ nombres: "Docente", apellidos: "Nuevo", correo: "doc-nuevo@miduho.test", combinacion: "DOCENTE" });
    if (!r.contrasena) throw new Error("falta la contraseña temporal");
    expect(r.temporal).toBe(true);
    const u = await db.usuario.findUniqueOrThrow({ where: { id: r.id } });
    expect(u.estado).toBe("ACTIVO");
    expect(u.debeCambiarContrasena).toBe(true);
    expect(u.hashContrasena).not.toBe(r.contrasena);
    expect(await verificarContrasena(r.contrasena, u.hashContrasena!)).toBe(true);
  });

  it("DOCENTE + ADMIN en una sola escritura", async () => {
    const r = await U.crear({ nombres: "Mixta", apellidos: "Nueva", correo: "mixta@miduho.test", combinacion: "DOCENTE_ADMIN" });
    expect((await U.obtener(r.id)).combinacion).toBe("DOCENTE_ADMIN");
  });

  it("ADMIN puro: invitación, sin contraseña, pendiente de activación", async () => {
    const r = await U.crear({ nombres: "Admin", apellidos: "Invitado", correo: "admin-inv@miduho.test", combinacion: "ADMIN" });
    expect(r).toMatchObject({ invitacionEnviada: true });
    expect("contrasena" in r).toBe(false);
    const u = await db.usuario.findUniqueOrThrow({ where: { id: r.id } });
    expect(u.estado).toBe("PENDIENTE_ACTIVACION");
    expect(u.hashContrasena).toBeNull();
    expect(buzon.some((m) => m.para === "admin-inv@miduho.test" && m.texto.includes("token="))).toBe(true);
    ids.adminInv = r.id;
  });

  it("ESTUDIANTE con grupo: asociación activa creada en la misma operación", async () => {
    const r = await U.crear({ nombres: "Est", apellidos: "Uno", correo: "est-1@miduho.test", combinacion: "ESTUDIANTE", grupoId: ids.g1 });
    const f = await U.obtener(r.id);
    expect(f.grupoActual?.etiqueta).toBe("2°-01");
    ids.est1 = r.id;
  });

  it("rechaza correo duplicado y grupo de año cerrado sin escribir", async () => {
    expect(await codigoDe(U.crear({ nombres: "X", apellidos: "Y", correo: "est-1@miduho.test", combinacion: "DOCENTE" }))).toBe(
      "CORREO_DUPLICADO",
    );
    expect(
      await codigoDe(U.crear({ nombres: "X", apellidos: "Y", correo: "est-z@miduho.test", combinacion: "ESTUDIANTE", grupoId: ids.gCerrado })),
    ).toBe("ANIO_CERRADO");
    expect(await db.usuario.findUnique({ where: { correo: "est-z@miduho.test" } })).toBeNull();
  });
});

describe("listado", () => {
  it("busca por nombre o correo, filtra por rol/estado/grupo y pagina", async () => {
    const todos = await U.listar(filtroUsuarios.parse({}));
    expect(todos.total).toBeGreaterThanOrEqual(7);
    const est = await U.listar(filtroUsuarios.parse({ rol: "ESTUDIANTE" }));
    expect(est.data.every((u) => u.combinacion === "ESTUDIANTE")).toBe(true);
    const porGrupo = await U.listar(filtroUsuarios.parse({ grupoId: ids.g1 }));
    expect(porGrupo.data.map((u) => u.correo)).toEqual(["est-1@miduho.test"]);
    expect(porGrupo.data[0].grupo?.etiqueta).toBe("2°-01");
    const busq = await U.listar(filtroUsuarios.parse({ q: "doc-libre" }));
    expect(busq.data.map((u) => u.correo)).toEqual(["doc-libre@miduho.test"]);
    const pend = await U.listar(filtroUsuarios.parse({ estado: "PENDIENTE_ACTIVACION" }));
    expect(pend.data.map((u) => u.id)).toEqual([ids.adminInv]);
    const p = await U.listar(filtroUsuarios.parse({ pageSize: "2", page: "2" }));
    expect(p.data).toHaveLength(2);
    expect(p.total).toBe(todos.total);
    expect((await U.listar(filtroUsuarios.parse({ q: "no-existe-nadie" }))).data).toEqual([]);
  });
});

describe("edición de identidad", () => {
  it("actualiza nombres y correo; mantiene el correo único", async () => {
    await U.actualizarIdentidad(ids.est1, { nombres: "Estudiante", correo: "est-uno@miduho.test" });
    const f = await U.obtener(ids.est1);
    expect(f).toMatchObject({ nombres: "Estudiante", correo: "est-uno@miduho.test" });
    expect(await codigoDe(U.actualizarIdentidad(ids.est1, { correo: "admin@miduho.test" }))).toBe("CORREO_DUPLICADO");
    expect(await codigoDe(U.actualizarIdentidad("no-existe", { nombres: "X" }))).toBe("NO_ENCONTRADO");
  });
});

describe("roles", () => {
  it("promueve DOCENTE a ADMIN y revoca sus sesiones", async () => {
    const antes = await version(ids.docLibre);
    await U.cambiarRoles(ids.admin, ids.docLibre, "DOCENTE_ADMIN");
    expect((await U.obtener(ids.docLibre)).combinacion).toBe("DOCENTE_ADMIN");
    expect(await version(ids.docLibre)).toBeGreaterThan(antes);
  });

  it("no convierte estudiante en personal ni retira DOCENTE con carga activa", async () => {
    expect(await codigoDe(U.cambiarRoles(ids.admin, ids.est1, "DOCENTE"))).toBe("COMBINACION_NO_PERMITIDA");
    expect(await codigoDe(U.cambiarRoles(ids.admin, ids.docCarga, "ADMIN"))).toBe("CARGA_DOCENTE_ACTIVA");
    expect((await U.obtener(ids.docCarga)).combinacion).toBe("DOCENTE");
  });

  it("no cambia roles de un ADMIN pendiente de activación", async () => {
    expect(await codigoDe(U.cambiarRoles(ids.admin, ids.adminInv, "DOCENTE_ADMIN"))).toBe("CUENTA_PENDIENTE");
  });

  it("un ADMIN no se retira su propio rol", async () => {
    expect(await codigoDe(U.cambiarRoles(ids.docLibre, ids.docLibre, "DOCENTE"))).toBe("AUTODEGRADACION");
  });
});

describe("último ADMIN", () => {
  it("con otro ADMIN activo se puede degradar; el último no se degrada ni desactiva", async () => {
    // Activos con ADMIN: admin, mixta, docLibre. Se retiran hasta dejar solo a `admin`.
    const mixta = (await db.usuario.findUniqueOrThrow({ where: { correo: "mixta@miduho.test" } })).id;
    expect(await codigoDe(U.cambiarRoles(ids.admin, mixta, "DOCENTE"))).toBe("OK");
    expect(await codigoDe(U.cambiarEstado(ids.admin, ids.docLibre, "INACTIVO"))).toBe("OK");
    // El ADMIN pendiente no cuenta como activo.
    expect(await codigoDe(U.cambiarRoles(ids.docLibre, ids.admin, "DOCENTE_ADMIN"))).toBe("OK");
    expect(await codigoDe(U.cambiarRoles(ids.docCarga, ids.admin, "DOCENTE"))).toBe("ULTIMO_ADMIN");
    expect(await codigoDe(U.cambiarEstado(ids.docCarga, ids.admin, "INACTIVO"))).toBe("ULTIMO_ADMIN");
    const f = await U.obtener(ids.admin);
    expect(f.estado).toBe("ACTIVO");
    expect(f.roles).toContain("ADMIN");
  });

  it("nadie se desactiva a sí mismo", async () => {
    expect(await codigoDe(U.cambiarEstado(ids.admin, ids.admin, "INACTIVO"))).toBe("AUTODESACTIVACION");
  });
});

describe("estado", () => {
  it("desactivar conserva historial, revoca sesiones e invalida enlaces pendientes", async () => {
    const antes = await version(ids.est1);
    await U.cambiarEstado(ids.admin, ids.est1, "INACTIVO");
    const f = await U.obtener(ids.est1);
    expect(f.estado).toBe("INACTIVO");
    expect(f.historialGrupos).toHaveLength(1);
    expect(await version(ids.est1)).toBeGreaterThan(antes);

    expect(await db.restablecimientoContrasena.count({ where: { usuarioId: ids.adminInv, usadoEn: null } })).toBe(1);
    await U.cambiarEstado(ids.admin, ids.adminInv, "INACTIVO");
    expect(await db.restablecimientoContrasena.count({ where: { usuarioId: ids.adminInv, usadoEn: null } })).toBe(0);
  });

  it("reactivar devuelve ACTIVO o, sin contraseña, PENDIENTE_ACTIVACION", async () => {
    expect((await U.cambiarEstado(ids.admin, ids.est1, "ACTIVO")).estado).toBe("ACTIVO");
    expect((await U.cambiarEstado(ids.admin, ids.adminInv, "ACTIVO")).estado).toBe("PENDIENTE_ACTIVACION");
  });
});

describe("grupo del estudiante", () => {
  it("asigna grupo a un estudiante sin grupo", async () => {
    const e = await usuario("est-2@miduho.test", ["ESTUDIANTE"]);
    ids.est2 = e.id;
    const r = await U.asignarGrupo(e.id, { grupoId: ids.g2, confirmarTraslado: false });
    expect(r).toMatchObject({ traslado: false, grupo: { etiqueta: "2°-02" } });
  });

  it("traslado exige confirmación, cierra la asociación anterior y deja una sola activa", async () => {
    expect(await codigoDe(U.asignarGrupo(ids.est2, { grupoId: ids.g1, confirmarTraslado: false }))).toBe(
      "TRASLADO_REQUIERE_CONFIRMACION",
    );
    expect(await codigoDe(U.asignarGrupo(ids.est2, { grupoId: ids.g2, confirmarTraslado: true }))).toBe("MISMO_GRUPO");
    reloj = new Date("2026-04-01T12:00:00.000Z");
    const r = await U.asignarGrupo(ids.est2, { grupoId: ids.g1, confirmarTraslado: true });
    expect(r.traslado).toBe(true);
    const asociaciones = await db.asociacionEstudianteGrupo.findMany({ where: { estudianteId: ids.est2 }, orderBy: { inicioEn: "asc" } });
    expect(asociaciones).toHaveLength(2);
    expect(asociaciones.filter((a) => a.finEn === null)).toHaveLength(1);
    expect(asociaciones[0].finEn?.toISOString()).toBe("2026-04-01T12:00:00.000Z");
    expect((await U.obtener(ids.est2)).grupoActual?.etiqueta).toBe("2°-01");
  });

  it("rechaza personal, cuentas inactivas, grupos inexistentes y años cerrados", async () => {
    expect(await codigoDe(U.asignarGrupo(ids.docCarga, { grupoId: ids.g1, confirmarTraslado: false }))).toBe("NO_ES_ESTUDIANTE");
    expect(await codigoDe(U.asignarGrupo(ids.est2, { grupoId: "no-existe", confirmarTraslado: true }))).toBe("NO_ENCONTRADO");
    expect(await codigoDe(U.asignarGrupo(ids.est2, { grupoId: ids.gCerrado, confirmarTraslado: true }))).toBe("ANIO_CERRADO");
    await U.cambiarEstado(ids.admin, ids.est2, "INACTIVO");
    expect(await codigoDe(U.asignarGrupo(ids.est2, { grupoId: ids.g2, confirmarTraslado: true }))).toBe("CUENTA_INACTIVA");
  });

  it("solo ofrece grupos de años no cerrados", async () => {
    const opciones = await U.gruposDisponibles();
    expect(opciones.map((g) => g.id).sort()).toEqual([ids.g1, ids.g2].sort());
  });
});
