import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { abrirBasePrueba, type BasePrueba } from "../../../../tests/soporte/base-pruebas";
import { crearServicioActividades } from "./servicio";
import { actividadesAsignadas, combinar } from "../materias/puertos";

let base: BasePrueba;
let sql: pg.Client;
let actividadId: string;
let asignacionIds: string[];
let actividadIntentosId: string;

beforeAll(async () => {
  base = await abrirBasePrueba();
  sql = new pg.Client({ connectionString: base.url });
  await sql.connect();
  await sql.query(`
    INSERT INTO usuarios (id,nombres,apellidos,correo,"actualizadoEn") VALUES
      ('doc','Cuenta','Ficticia','doc@miduho.test',now()),
      ('otra','Cuenta','Ficticia','otra@miduho.test',now()),
      ('est','Cuenta','Ficticia','est@miduho.test',now());
    INSERT INTO anios_lectivos (id,anio,"fechaInicio","fechaFin","actualizadoEn")
      VALUES ('anio',2026,'2026-01-01','2026-12-31',now());
    INSERT INTO periodos (id,"anioLectivoId",nombre,orden,"fechaInicio","fechaFin",ponderacion,"actualizadoEn")
      VALUES ('periodo','anio','Período',1,'2026-11-01','2026-12-01',100,now());
    INSERT INTO grados (id,nombre,nivel,orden,"actualizadoEn") VALUES ('grado','5°','PRIMARIA',5,now());
    INSERT INTO grupos (id,"gradoId","anioLectivoId",identificador,"actualizadoEn")
      VALUES ('g1','grado','anio','01',now()),('g2','grado','anio','02',now());
    INSERT INTO areas (id,nombre,"actualizadoEn") VALUES ('area','Área',now());
    INSERT INTO asignaturas (id,nombre,"areaId","actualizadoEn") VALUES ('asig','Asignatura','area',now());
    INSERT INTO asignaciones_docente (id,"docenteId","asignaturaId","grupoId","anioLectivoId","actualizadoEn")
      VALUES ('ad1','doc','asig','g1','anio',now()),('ad2','doc','asig','g2','anio',now());
  `);
  const creado = await crearServicioActividades(base.db, { http, reloj }).crearMaterial("doc", datos);
  actividadId = creado.actividad.id;
  asignacionIds = creado.asignaciones.map((a) => a.id);
});
afterAll(async () => {
  await sql?.end();
  await base?.cerrar();
});

const reloj = () => new Date("2026-11-11T15:00:00Z");
const http = async () => ({ status: 200, json: async () => ({ title: "Video de prueba" }) });
const datos = {
  titulo: "Material de prueba",
  instruccion: "Mira el video y responde.",
  url: "https://youtu.be/aBc123_-XyZ",
  contenido: { preguntas: [{ id: "p1", enunciado: "Pregunta de prueba", opciones: ["Sí", "No"], correcta: 0 }] },
  asignaturaId: "asig",
  gradoId: "grado",
  grupoIds: ["g1", "g2"],
};

describe("creación de material audiovisual", () => {
  it("ofrece las combinaciones reales y crea una asignación por grupo", async () => {
    const servicio = crearServicioActividades(base.db, { http, reloj });
    const opciones = await servicio.opcionesDeCreacion("doc");
    expect(opciones.opciones).toHaveLength(1);
    expect(opciones.opciones[0].grupos.map((g) => g.grupoId)).toEqual(["g1", "g2"]);
    expect(opciones.periodo?.fin.toISOString()).toBe("2026-12-02T04:59:00.000Z");
    const creado = await base.db.actividad.findUniqueOrThrow({ where: { id: actividadId }, include: { versiones: { include: { asignaciones: true } } } });
    expect(creado.versiones[0].asignaciones.map((a) => a.grupoId).sort()).toEqual(["g1", "g2"]);
    expect(creado.versiones[0].puntajeMaximo.toNumber()).toBe(1);
  });

  it("rechaza el envío idéntico pero permite otro material con el mismo video", async () => {
    const servicio = crearServicioActividades(base.db, { http, reloj });
    await expect(servicio.crearMaterial("doc", datos)).rejects.toMatchObject({ code: "MATERIAL_IDENTICO", status: 409 });
    await expect(servicio.crearMaterial("doc", { ...datos, titulo: "Otro material de prueba" })).resolves.toMatchObject({ actividad: { titulo: "Otro material de prueba" } });
  });

  it("rechaza a otra docente y un cierre fuera del período", async () => {
    const servicio = crearServicioActividades(base.db, { http, reloj });
    await expect(servicio.crearMaterial("otra", datos)).rejects.toMatchObject({ status: 403 });
    await expect(servicio.crearMaterial("doc", { ...datos, cierraEn: new Date("2026-12-03T00:00:00Z") })).rejects.toMatchObject({ code: "FECHAS_INVALIDAS" });
  });

  it("abandona intentos en curso al editar preguntas, bloquea contenido después de un envío y permite título", async () => {
    const servicio = crearServicioActividades(base.db, { http, reloj });
    await base.db.intentoActividad.create({ data: { asignacionId: asignacionIds[0], estudianteId: "est", numero: 1 } });
    const nuevas = { preguntas: [{ id: "p1", enunciado: "Pregunta modificada", opciones: ["Sí", "No"], correcta: 0 }] };
    await servicio.editarMaterial("doc", actividadId, { contenido: nuevas });
    expect((await base.db.intentoActividad.findFirstOrThrow({ where: { asignacionId: asignacionIds[0], estudianteId: "est" } })).estado).toBe("ABANDONADO");
    await base.db.intentoActividad.create({ data: { asignacionId: asignacionIds[0], estudianteId: "est", numero: 2, estado: "ENVIADO" } });
    await expect(servicio.editarMaterial("doc", actividadId, { contenido: datos.contenido })).rejects.toMatchObject({ status: 409 });
    await expect(servicio.editarMaterial("doc", actividadId, { titulo: "Título corregido" })).resolves.toMatchObject({ titulo: "Título corregido" });
    await expect(servicio.editarMaterial("otra", actividadId, { titulo: "Ajeno" })).rejects.toMatchObject({ status: 404 });
    await expect(servicio.editarAsignacion("doc", asignacionIds[0], { maxIntentos: 1 })).resolves.toMatchObject({ maxIntentos: 1 });
    await base.db.intentoActividad.create({ data: { asignacionId: asignacionIds[0], estudianteId: "est", numero: 3, estado: "ENVIADO" } });
    await expect(servicio.editarAsignacion("doc", asignacionIds[0], { maxIntentos: 1 })).rejects.toMatchObject({ code: "INTENTOS_USADOS" });
    const futuro = crearServicioActividades(base.db, { http, reloj: () => new Date("2026-11-12T15:00:00Z") });
    await expect(futuro.editarAsignacion("doc", asignacionIds[0], { cierraEn: new Date("2026-11-11T16:00:00Z") })).rejects.toMatchObject({ code: "CIERRE_CON_INTENTOS" });
  });

  it("cierra los intentos vencidos sin consumirlos", async () => {
    const servicio = crearServicioActividades(base.db, { http, reloj });
    await servicio.editarAsignacion("doc", asignacionIds[1], { cierraEn: new Date("2026-11-11T16:00:00Z") });
    const intento = await base.db.intentoActividad.create({ data: { asignacionId: asignacionIds[1], estudianteId: "est", numero: 1 } });
    const posterior = crearServicioActividades(base.db, { http, reloj: () => new Date("2026-11-11T17:00:00Z") });
    expect((await posterior.cerrarVencidos()).count).toBeGreaterThanOrEqual(1);
    expect((await base.db.intentoActividad.findUniqueOrThrow({ where: { id: intento.id } })).estado).toBe("ABANDONADO");
  });

  it("anula una asignación y luego todas sin borrar los intentos", async () => {
    const servicio = crearServicioActividades(base.db, { http, reloj });
    expect(await servicio.anularAsignacion("doc", asignacionIds[0])).toBe(1);
    expect((await base.db.asignacionActividad.findUniqueOrThrow({ where: { id: asignacionIds[1] } })).estado).toBe("PUBLICADA");
    expect(await servicio.anularAsignacion("doc", asignacionIds[1], true)).toBe(2);
    expect(await base.db.intentoActividad.count({ where: { asignacionId: asignacionIds[0] } })).toBe(3);
  });

  it("exige «Ya lo vi», califica en servidor, conserva el mejor intento y es idempotente", async () => {
    await sql.query(`INSERT INTO asociaciones_estudiantes_grupos (id,"estudianteId","grupoId","anioLectivoId","inicioEn","actualizadoEn") VALUES ('asoc','est','g1','anio','2026-01-01',now())`);
    const servicio = crearServicioActividades(base.db, { http, reloj });
    const creado = await servicio.crearMaterial("doc", { ...datos, titulo: "Material para intentos", grupoIds: ["g1"], maxIntentos: 2 });
    actividadIntentosId = creado.actividad.id;
    const id = creado.asignaciones[0].id;
    const primero = await servicio.iniciarIntento("est", id);
    expect((await servicio.iniciarIntento("est", id)).intento.id).toBe(primero.intento.id);
    await expect(servicio.enviarIntento("est", primero.intento.id, { respuestas: { p1: 1 } })).rejects.toMatchObject({ code: "VIDEO_NO_VISTO" });
    const visto = await servicio.marcarVisto("est", primero.intento.id);
    expect((await servicio.marcarVisto("est", primero.intento.id)).vioVideoEn).toEqual(visto.vioVideoEn);
    const envio = await servicio.enviarIntento("est", primero.intento.id, { respuestas: { p1: 1 }, puntaje: 100 } as never);
    expect(envio.resultado.porcentaje).toBe(0);
    expect((await servicio.enviarIntento("est", primero.intento.id, { respuestas: { p1: 0 } })).resultado.porcentaje).toBe(0);
    expect(await base.db.respuestaItem.count({ where: { intentoId: primero.intento.id } })).toBe(1);
    const segundo = await servicio.iniciarIntento("est", id);
    await servicio.marcarVisto("est", segundo.intento.id);
    expect((await servicio.enviarIntento("est", segundo.intento.id, { respuestas: { p1: 0 } })).resultado.porcentaje).toBe(100);
    const mejor = await base.db.resultadoActividad.findUniqueOrThrow({ where: { asignacionId_estudianteId: { asignacionId: id, estudianteId: "est" } } });
    expect(mejor.mejorIntentoId).toBe(segundo.intento.id);
    await expect(servicio.iniciarIntento("est", id)).rejects.toMatchObject({ code: "INTENTOS_AGOTADOS" });
    await expect(servicio.iniciarIntento("otra", id)).rejects.toMatchObject({ status: 404 });
  });

  it("muestra seguimiento real y oculta el grupo a una docente ajena", async () => {
    const servicio = crearServicioActividades(base.db, { http, reloj });
    const vista = await servicio.seguimiento("doc", actividadIntentosId);
    expect(vista.grupos[0].resumen).toEqual({ respondieron: 1, total: 1, promedio: 100 });
    expect(vista.grupos[0].estudiantes[0]).toMatchObject({ estado: "RESPONDIO", intentosUsados: 2, nota: 100 });
    await expect(servicio.seguimiento("otra", actividadIntentosId)).rejects.toMatchObject({ status: 404 });
  });

  it("envía a la materia solo asignaciones abiertas y publicadas, antes del catálogo", async () => {
    const servicio = crearServicioActividades(base.db, { http, reloj });
    await servicio.crearMaterial("doc", { ...datos, titulo: "Material futuro", grupoIds: ["g1"],
      abreEn: new Date("2026-11-12T15:00:00Z") });
    const asignadas = actividadesAsignadas(base.db, reloj);
    const libres = { deMateria: async () => [{ id: "libre", titulo: "Práctica libre", tipo: "quiz",
      estado: "disponible" as const, estrellas: null, intentosUsados: 0, intentosMax: null,
      abre: null, cierra: null, href: "/actividades/libre" }] };
    const lista = await combinar(asignadas, libres).deMateria("est", "g1", "asig");
    expect(lista?.at(-1)?.titulo).toBe("Práctica libre");
    expect(lista?.map((a) => a.titulo)).toContain("Material para intentos");
    expect(lista?.map((a) => a.titulo)).not.toContain("Material futuro");
    expect(lista?.map((a) => a.titulo)).not.toContain("Título corregido");
    expect(lista?.find((a) => a.titulo === "Material para intentos")).toMatchObject({ estado: "hecha", intentosUsados: 2, estrellas: 3 });
    await expect(servicio.asignacionDeEstudiante("est", "g1", "asig", asignacionIds[0])).rejects.toMatchObject({ status: 404 });
    const futura = await base.db.actividad.findFirstOrThrow({ where: { titulo: "Material futuro" }, include: { versiones: { include: { asignaciones: true } } } });
    await expect(servicio.asignacionDeEstudiante("est", "g1", "asig", futura.versiones[0].asignaciones[0].id)).rejects.toMatchObject({ status: 404 });
  });
});
