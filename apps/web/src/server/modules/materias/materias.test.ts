import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaClient } from "@/generated/prisma/client";
import { ErrorDominio } from "@/server/errores";
import { guardarAvatarDe } from "./avatar";
import { actividadesDeCatalogo, type PuertoActividadesDeMateria, type PuertoContenidoClase, type PuertoDesempeno } from "./puertos";
import { crearServicioMaterias, ordenarMaterias, rutaMateria, rutaVolver, type ServicioMaterias } from "./servicio";
import { abrirBasePrueba, type BasePrueba } from "../../../../tests/soporte/base-pruebas";

describe("orden y destino (lógica pura)", () => {
  it("ordena por el orden del área, con las áreas sin orden al final, y luego por nombre", () => {
    const r = ordenarMaterias([
      { id: "1", nombre: "Zeta", area: { nombre: "A", orden: 2 } },
      { id: "2", nombre: "Ética", area: { nombre: "B", orden: null } },
      { id: "3", nombre: "Álgebra", area: { nombre: "A", orden: 2 } },
      { id: "4", nombre: "Lectura", area: { nombre: "C", orden: 1 } },
    ]);
    expect(r.map((m) => m.nombre)).toEqual(["Lectura", "Álgebra", "Zeta", "Ética"]);
  });

  it("cada materia entra a su vista propia y vuelve al tablero con la misma materia elegida", () => {
    expect(rutaMateria("abc-123")).toBe("/materias/abc-123");
    expect(rutaVolver("abc-123")).toBe("/?materia=abc-123");
    expect(rutaMateria("a/b")).toBe("/materias/a%2Fb");
  });
});

// ---------- Integración contra una base PostgreSQL de prueba con las migraciones reales ----------
let base: BasePrueba;
let db: PrismaClient;
let S: ServicioMaterias;
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

async function usuario(correo: string, rol: string, nombres = "Cuenta", apellidos = "Ficticia") {
  const u = await db.usuario.create({ data: { nombres, apellidos, correo, estado: "ACTIVO" } });
  const r = await db.rol.findUniqueOrThrow({ where: { codigo: rol } });
  await db.usuarioRol.create({ data: { usuarioId: u.id, rolId: r.id } });
  return u.id;
}

beforeAll(async () => {
  base = await abrirBasePrueba();
  db = base.db;
  for (const codigo of ["ADMIN", "DOCENTE", "ESTUDIANTE"]) await db.rol.create({ data: { codigo, nombre: codigo } });
  S = crearServicioMaterias(db);

  // Escenario ficticio:
  // - G1 (año activo): Matemáticas (dos asignaciones activas, dos docentes), Comprensión
  //   lectora (activa) y Música (solo una asignación INACTIVA).
  // - G2 (año activo): Inglés, que el estudiante de G1 no debe ver.
  // - Un grupo de un año CERRADO con una asociación vieja del mismo estudiante.
  ids.docA = await usuario("doc-a@miduho.test", "DOCENTE", "Docente", "Apellidoúnico Alfa");
  ids.docB = await usuario("doc-b@miduho.test", "DOCENTE", "Docente", "Apellidoúnico Beta");
  ids.est = await usuario("est@miduho.test", "ESTUDIANTE");
  ids.est2 = await usuario("est2@miduho.test", "ESTUDIANTE");
  ids.sinGrupo = await usuario("sin-grupo@miduho.test", "ESTUDIANTE");

  const cerrado = await db.anioLectivo.create({
    data: { anio: 2025, fechaInicio: new Date("2025-01-20"), fechaFin: new Date("2025-12-05"), estado: "CERRADO" },
  });
  const anio = await db.anioLectivo.create({ data: { anio: 2026, fechaInicio: new Date("2026-01-19"), fechaFin: new Date("2026-12-04") } });
  const grado = await db.grado.create({ data: { nombre: "1°", nivel: "PRIMARIA", orden: 1 } });
  ids.g1 = (await db.grupo.create({ data: { gradoId: grado.id, anioLectivoId: anio.id, identificador: "01" } })).id;
  ids.g2 = (await db.grupo.create({ data: { gradoId: grado.id, anioLectivoId: anio.id, identificador: "02" } })).id;
  ids.gViejo = (await db.grupo.create({ data: { gradoId: grado.id, anioLectivoId: cerrado.id, identificador: "01" } })).id;

  const lengua = await db.area.create({ data: { nombre: "Humanidades: Lengua Castellana", orden: 1 } });
  const mate = await db.area.create({ data: { nombre: "Matemáticas", orden: 2 } });
  const artes = await db.area.create({ data: { nombre: "Educación Artística", orden: 3 } });
  const idiomas = await db.area.create({ data: { nombre: "Humanidades: Inglés", orden: 4 } });
  const asig = async (nombre: string, areaId: string) => (await db.asignatura.create({ data: { nombre, areaId } })).id;
  ids.matematicas = await asig("Matemáticas", mate.id);
  ids.lectura = await asig("Comprensión Lectora", lengua.id);
  ids.musica = await asig("Música", artes.id);
  ids.ingles = await asig("Inglés", idiomas.id);
  ids.viejo = await asig("Asignatura vieja", artes.id);

  const asignar = (docenteId: string, asignaturaId: string, grupoId: string, anioLectivoId: string, estado: "ACTIVA" | "INACTIVA" = "ACTIVA") =>
    db.asignacionDocente.create({ data: { docenteId, asignaturaId, grupoId, anioLectivoId, estado } });
  await asignar(ids.docA, ids.matematicas, ids.g1, anio.id);
  await asignar(ids.docB, ids.matematicas, ids.g1, anio.id);
  await asignar(ids.docA, ids.lectura, ids.g1, anio.id);
  await asignar(ids.docB, ids.musica, ids.g1, anio.id, "INACTIVA");
  await asignar(ids.docB, ids.ingles, ids.g2, anio.id);
  await asignar(ids.docA, ids.viejo, ids.gViejo, cerrado.id);

  await db.asociacionEstudianteGrupo.create({
    data: { estudianteId: ids.est, grupoId: ids.gViejo, anioLectivoId: cerrado.id, inicioEn: new Date("2025-01-20"), finEn: new Date("2025-12-05") },
  });
  await db.asociacionEstudianteGrupo.create({ data: { estudianteId: ids.est, grupoId: ids.g1, anioLectivoId: anio.id } });
  await db.asociacionEstudianteGrupo.create({ data: { estudianteId: ids.est2, grupoId: ids.g2, anioLectivoId: anio.id } });
});

afterAll(async () => {
  await base?.cerrar();
});

describe("asignaturas del grupo del estudiante", () => {
  it("lista solo las asignaturas activas de su grupo, sin duplicar y en orden de área", async () => {
    const r = await S.deEstudiante(ids.est);
    expect(r.grupo?.etiqueta).toBe("1°-01");
    expect(r.materias.map((m) => m.nombre)).toEqual(["Comprensión Lectora", "Matemáticas"]);
  });

  it("no incluye asignaturas de otro grupo", async () => {
    const r = await S.deEstudiante(ids.est);
    expect(r.materias.some((m) => m.id === ids.ingles)).toBe(false);
    const otro = await S.deEstudiante(ids.est2);
    expect(otro.materias.map((m) => m.nombre)).toEqual(["Inglés"]);
  });

  it("una asignatura con solo asignaciones INACTIVAS no aparece", async () => {
    const r = await S.deEstudiante(ids.est);
    expect(r.materias.some((m) => m.id === ids.musica)).toBe(false);
  });

  it("deja de aparecer cuando su última asignación activa pasa a INACTIVA", async () => {
    await db.asignacionDocente.updateMany({ where: { asignaturaId: ids.lectura, grupoId: ids.g1 }, data: { estado: "INACTIVA" } });
    try {
      const r = await S.deEstudiante(ids.est);
      expect(r.materias.map((m) => m.nombre)).toEqual(["Matemáticas"]);
    } finally {
      await db.asignacionDocente.updateMany({ where: { asignaturaId: ids.lectura, grupoId: ids.g1 }, data: { estado: "ACTIVA" } });
    }
  });

  it("un estudiante sin grupo vigente recibe el tablero vacío", async () => {
    expect(await S.deEstudiante(ids.sinGrupo)).toEqual({ grupo: null, materias: [] });
  });

  it("no expone nombres ni correos de docentes", async () => {
    const texto = JSON.stringify(await S.deEstudiante(ids.est));
    expect(texto).not.toMatch(/Apellidoúnico|doc-a@|doc-b@/);
  });

  it("sin fuentes de progreso ni de contenido, esos campos son null y la escena sale del nombre", async () => {
    const [lectura] = (await S.deEstudiante(ids.est)).materias;
    expect(lectura).toMatchObject({
      escena: "lectura",
      claseHref: `/materias/${ids.lectura}`,
      estrellas: null,
      avance: null,
      sigue: null,
      nuevo: null,
      conMaterial: null,
    });
  });

  it("los adaptadores conectados llenan los campos sin cambiar el contrato", async () => {
    const desempeno: PuertoDesempeno = {
      porAsignatura: async () => new Map([[ids.matematicas, { estrellas: 2, avance: { hechas: 4, total: 6 }, sigue: "Sumas hasta 20" }]]),
    };
    const contenido: PuertoContenidoClase = {
      porAsignatura: async () => new Map([[ids.lectura, { conMaterial: false, nuevo: false }]]),
    };
    const r = await crearServicioMaterias(db, { desempeno, contenido }).deEstudiante(ids.est);
    expect(r.materias[0]).toMatchObject({ nombre: "Comprensión Lectora", conMaterial: false, estrellas: null });
    expect(r.materias[1]).toMatchObject({ nombre: "Matemáticas", estrellas: 2, avance: { hechas: 4, total: 6 }, sigue: "Sumas hasta 20" });
  });
});

describe("vista de una materia", () => {
  const estudiante = () => ({ user: { id: ids.est, contexto: "ESTUDIANTE" } });

  it("una asignatura activa de su grupo: la materia, su grupo y actividades null sin fuente", async () => {
    const v = await S.vistaMateria(estudiante(), ids.matematicas);
    expect(v).toMatchObject({
      materia: { id: ids.matematicas, nombre: "Matemáticas", escena: "matematicas", claseHref: `/materias/${ids.matematicas}` },
      grupo: { id: ids.g1, etiqueta: "1°-01" },
      actividades: null,
    });
  });

  it("una asignatura de otro grupo, inactiva, de un año cerrado o inexistente: null (404)", async () => {
    expect(await S.vistaMateria(estudiante(), ids.ingles)).toBeNull();
    expect(await S.vistaMateria(estudiante(), ids.musica)).toBeNull();
    expect(await S.vistaMateria(estudiante(), ids.viejo)).toBeNull();
    expect(await S.vistaMateria(estudiante(), "no-existe")).toBeNull();
  });

  it("el contexto docente o la sesión ausente reciben null (404)", async () => {
    expect(await S.vistaMateria({ user: { id: ids.docA, contexto: "DOCENTE" } }, ids.matematicas)).toBeNull();
    expect(await S.vistaMateria(null, ids.matematicas)).toBeNull();
    expect(await S.vistaMateria({ user: { id: ids.est } }, ids.matematicas)).toBeNull();
  });

  it("no expone nombres ni correos de docentes", async () => {
    expect(JSON.stringify(await S.vistaMateria(estudiante(), ids.matematicas))).not.toMatch(/Apellidoúnico|doc-a@|doc-b@/);
  });

  it("con el puerto conectado, pide las actividades de esa asignatura y grupo, y las ordena", async () => {
    const pedidos: string[][] = [];
    const actividades: PuertoActividadesDeMateria = {
      deMateria: async (...args) => {
        pedidos.push(args);
        const base = { tipo: "quiz", estrellas: null, intentosUsados: 0, intentosMax: 3, abre: null, cierra: null, href: "#" };
        return [
          { ...base, id: "a2", titulo: "Hecha", estado: "hecha" as const },
          { ...base, id: "a1", titulo: "Para jugar", estado: "disponible" as const },
        ];
      },
    };
    const v = await crearServicioMaterias(db, { actividades }).vistaMateria(estudiante(), ids.lectura);
    expect(pedidos).toEqual([[ids.est, ids.g1, ids.lectura]]);
    expect(v?.actividades?.map((a) => a.id)).toEqual(["a1", "a2"]);
  });
  it("práctica libre: el catálogo del currículo según el nombre de la asignatura y el grado del grupo", async () => {
    const consultas: [string, number][] = [];
    const catalogo = {
      de: (asignatura: string, grado: number) => {
        consultas.push([asignatura, grado]);
        return [{ slug: "parejas", titulo: "Parejas", tipo: "memoria" }];
      },
    };
    const v = await crearServicioMaterias(db, { actividades: actividadesDeCatalogo(db, catalogo) }).vistaMateria(estudiante(), ids.matematicas);
    expect(consultas).toEqual([["Matemáticas", 1]]);
    expect(v?.actividades).toEqual([
      {
        id: "parejas",
        titulo: "Parejas",
        tipo: "memoria",
        estado: "disponible",
        estrellas: null,
        intentosUsados: 0,
        intentosMax: null,
        abre: null,
        cierra: null,
        href: `/materias/${ids.matematicas}/actividades/parejas`,
      },
    ]);
  });
});

describe("agenda del estudiante", () => {
  const estudiante = () => ({ user: { id: ids.est, contexto: "ESTUDIANTE" } });
  const base = { tipo: "quiz", estrellas: null, intentosUsados: 0, intentosMax: 3, cierra: null, href: "#" };

  it("reúne las actividades de sus materias, sin las por abrir, y fija hoy en Bogotá", async () => {
    const pedidos: string[] = [];
    const actividades: PuertoActividadesDeMateria = {
      deMateria: async (_e, _g, asignaturaId) => {
        pedidos.push(asignaturaId);
        return [
          { ...base, id: `${asignaturaId}-1`, titulo: "Abierta", estado: "disponible" as const, abre: null },
          { ...base, id: `${asignaturaId}-2`, titulo: "Futura", estado: "porAbrir" as const, abre: "2099-01-01T12:00:00Z" },
        ];
      },
    };
    const a = await crearServicioMaterias(db, { actividades }).agenda(estudiante(), new Date("2026-09-12T03:00:00Z"));
    expect(a?.hoy).toBe("2026-09-11");
    expect(pedidos.sort()).toEqual([ids.lectura, ids.matematicas].sort());
    expect(a?.actividades.map((x) => x.titulo)).toEqual(["Abierta", "Abierta"]);
    expect(a?.actividades.every((x) => x.id.startsWith(`${x.materia.id}-`))).toBe(true);
    expect(pedidos).not.toContain(ids.ingles);
  });

  it("solo para la sesión ESTUDIANTE", async () => {
    expect(await S.agenda({ user: { id: ids.docA, contexto: "DOCENTE" } })).toBeNull();
    expect(await S.agenda(null)).toBeNull();
  });
});

describe("guardar el avatar", () => {
  const avatarDe = async (id: string) => (await db.usuario.findUniqueOrThrow({ where: { id }, select: { avatar: true } })).avatar;

  it("el estudiante guarda su avatar en su propia cuenta", async () => {
    expect(await guardarAvatarDe(db, { user: { id: ids.est, contexto: "ESTUDIANTE" } }, "PINO")).toBe("PINO");
    expect(await avatarDe(ids.est)).toBe("PINO");
    expect(await avatarDe(ids.est2)).toBeNull();
  });

  it("rechaza un valor fuera del enum sin modificar nada", async () => {
    expect(await codigoDe(guardarAvatarDe(db, { user: { id: ids.est, contexto: "ESTUDIANTE" } }, "DRAGON"))).toBe("400:AVATAR_INVALIDO");
    expect(await avatarDe(ids.est)).toBe("PINO");
  });

  it("rechaza el contexto DOCENTE", async () => {
    expect(await codigoDe(guardarAvatarDe(db, { user: { id: ids.docA, contexto: "DOCENTE" } }, "SOL"))).toBe("403:PROHIBIDO");
    expect(await avatarDe(ids.docA)).toBeNull();
  });

  it("rechaza la sesión ausente", async () => {
    expect(await codigoDe(guardarAvatarDe(db, null, "SOL"))).toBe("401:NO_AUTENTICADO");
    expect(await codigoDe(guardarAvatarDe(db, { user: null }, "SOL"))).toBe("401:NO_AUTENTICADO");
  });
});
