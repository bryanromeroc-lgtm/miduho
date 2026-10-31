/**
 * Suite QA · Reglas de integridad de la base.
 *
 * Una prueba por regla del inventario (prisma/migrations-sqlite-archivo/README.md,
 * R1–R14): cada trigger y CHECK que imponían las migraciones SQLite existe en
 * PostgreSQL con el mismo efecto y, cuando la app lo interpreta, el mismo código.
 *
 * SQL directo sobre una base clonada de la plantilla migrada con las migraciones
 * reales (prisma/migrations), nunca un esquema de prueba: es el camino de producción.
 */
import pg from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { abrirBasePrueba, type BasePrueba } from "../soporte/base-pruebas";

let base: BasePrueba;
let sql: pg.Client;

/** Mensaje de error de la escritura, o null si la base la aceptó. */
async function rechazo(consulta: string) {
  await sql.query("SAVEPOINT intento");
  try {
    await sql.query(consulta);
    await sql.query("RELEASE SAVEPOINT intento");
    return null;
  } catch (e) {
    await sql.query("ROLLBACK TO SAVEPOINT intento");
    return (e as Error).message;
  }
}

const fila = async (consulta: string) => (await sql.query(consulta)).rows[0];

beforeAll(async () => {
  base = await abrirBasePrueba();
  sql = new pg.Client({ connectionString: base.url });
  await sql.connect();
});

afterAll(async () => {
  await sql?.end();
  await base?.cerrar();
});

// Cada prueba corre en una transacción que se revierte: parten de la base vacía.
beforeEach(async () => {
  await sql.query("BEGIN");
  await sql.query(`
    INSERT INTO roles (id, codigo, nombre) VALUES ('admin','ADMIN','Administración'),('doc','DOCENTE','Docente'),('est','ESTUDIANTE','Estudiante');
    INSERT INTO usuarios (id, nombres, apellidos, correo, "hashContrasena", estado, "actualizadoEn")
      VALUES ('u','Cuenta','Ficticia','cuenta@miduho.test','hash-1','ACTIVO',now());
    INSERT INTO anios_lectivos (id, anio, "fechaInicio", "fechaFin", "actualizadoEn")
      VALUES ('anio',2026,'2026-01-01','2026-12-01',now()),('otro',2025,'2025-01-01','2025-12-01',now());
    INSERT INTO grados (id, nombre, nivel, orden, "actualizadoEn") VALUES ('grado','1°','PRIMARIA',1,now());
    INSERT INTO grupos (id, "gradoId", "anioLectivoId", identificador, "actualizadoEn")
      VALUES ('g1','grado','anio','01',now()),('g2','grado','anio','02',now()),('g-otro','grado','otro','01',now());
    INSERT INTO areas (id, nombre, "actualizadoEn") VALUES ('area','Área',now());
    INSERT INTO asignaturas (id, nombre, "areaId", "actualizadoEn") VALUES ('asig','Asignatura','area',now());
    INSERT INTO asignaciones_docente (id, "docenteId", "asignaturaId", "grupoId", "anioLectivoId", "actualizadoEn")
      VALUES ('asig-doc','u','asig','g1','anio',now());
  `);
  return async () => {
    await sql.query("ROLLBACK");
  };
});

const version = () => fila(`SELECT "versionSesion" AS v, "sesionesRevocadasEn" AS en FROM usuarios WHERE id='u'`);
const asociacion = (id: string, grupo: string, anio = "anio") =>
  `INSERT INTO asociaciones_estudiantes_grupos (id, "estudianteId", "grupoId", "anioLectivoId", "actualizadoEn") VALUES ('${id}','u','${grupo}','${anio}',now())`;
const bloque = (id: string, dia: string, inicio: string, fin: string) =>
  `INSERT INTO bloques_horario (id, "asignacionId", dia, "horaInicio", "horaFin", "actualizadoEn") VALUES ('${id}','asig-doc','${dia}','${inicio}','${fin}',now())`;

describe("inventario de reglas (SQLite → PostgreSQL)", () => {
  it("R1 · solo ADMIN, DOCENTE y ESTUDIANTE, al crear y al renombrar (ROL_NO_PERMITIDO)", async () => {
    expect(await rechazo("INSERT INTO roles (id, codigo, nombre) VALUES ('r','ACUDIENTE','Acudiente')")).toMatch("ROL_NO_PERMITIDO");
    expect(await rechazo("INSERT INTO roles (id, codigo, nombre) VALUES ('r','COORDINACION','Coordinación')")).toMatch("ROL_NO_PERMITIDO");
    expect(await rechazo("UPDATE roles SET codigo='DIRECTOR' WHERE id='doc'")).toMatch("ROL_NO_PERMITIDO");
    expect((await sql.query("SELECT codigo FROM roles ORDER BY codigo")).rows.map((r) => r.codigo)).toEqual(["ADMIN", "DOCENTE", "ESTUDIANTE"]);
  });

  it("R2 · estado de cuenta acotado y PENDIENTE_ACTIVACION por defecto", async () => {
    await sql.query(`INSERT INTO usuarios (id, nombres, apellidos, correo, "actualizadoEn") VALUES ('n','Cuenta','Nueva','nueva@miduho.test',now())`);
    expect(await fila(`SELECT estado, "hashContrasena" FROM usuarios WHERE id='n'`)).toEqual({ estado: "PENDIENTE_ACTIVACION", hashContrasena: null });
    expect(await rechazo("UPDATE usuarios SET estado='DESCONOCIDO' WHERE id='u'")).toMatch(/EstadoUsuario/);
  });

  it("R3 · debeCambiarContrasena es booleano nativo, falso por defecto", async () => {
    expect((await fila(`SELECT "debeCambiarContrasena" AS b FROM usuarios WHERE id='u'`)).b).toBe(false);
    expect(await rechazo(`UPDATE usuarios SET "debeCambiarContrasena"=2 WHERE id='u'`)).not.toBeNull();
  });

  it("R4 · versionSesion arranca en 1 y no baja de 1", async () => {
    expect((await version()).v).toBe(1);
    expect(await rechazo(`UPDATE usuarios SET "versionSesion"=0 WHERE id='u'`)).toMatch("usuarios_versionSesion_minima");
  });

  it("R5 · ultimoContexto solo nulo, ADMIN o DOCENTE", async () => {
    expect(await rechazo(`UPDATE usuarios SET "ultimoContexto"='ESTUDIANTE' WHERE id='u'`)).toMatch("usuarios_ultimoContexto_invalido");
    expect(
      await rechazo(`INSERT INTO usuarios (id, nombres, apellidos, correo, "ultimoContexto", "actualizadoEn") VALUES ('x','C','F','x@miduho.test','OTRO',now())`),
    ).toMatch("usuarios_ultimoContexto_invalido");
    expect(await rechazo(`UPDATE usuarios SET "ultimoContexto"='DOCENTE' WHERE id='u'`)).toBeNull();
    expect(await rechazo(`UPDATE usuarios SET "ultimoContexto"=NULL WHERE id='u'`)).toBeNull();
  });

  it("R6 · tipo de token RECUPERACION (por defecto) o INVITACION", async () => {
    await sql.query(`INSERT INTO restablecimientos_contrasena (id, "usuarioId", "tokenHash", "expiraEn") VALUES ('t','u','h1',now())`);
    expect((await fila("SELECT tipo FROM restablecimientos_contrasena WHERE id='t'")).tipo).toBe("RECUPERACION");
    expect(await rechazo("UPDATE restablecimientos_contrasena SET tipo='OTRO' WHERE id='t'")).toMatch("restablecimientos_tipo_invalido");
    expect(
      await rechazo(`INSERT INTO restablecimientos_contrasena (id, "usuarioId", "tokenHash", "expiraEn", tipo) VALUES ('t2','u','h2',now(),'MAGIA')`),
    ).toMatch("restablecimientos_tipo_invalido");
    expect(await rechazo("UPDATE restablecimientos_contrasena SET tipo='INVITACION' WHERE id='t'")).toBeNull();
  });

  it("R7 · ESTUDIANTE nunca junto a ADMIN o DOCENTE, en ningún orden (COMBINACION_ROLES_INVALIDA)", async () => {
    await sql.query(`INSERT INTO usuarios_roles ("usuarioId", "rolId") VALUES ('u','est')`);
    expect(await rechazo(`INSERT INTO usuarios_roles ("usuarioId", "rolId") VALUES ('u','admin')`)).toMatch("COMBINACION_ROLES_INVALIDA");
    expect(await rechazo(`INSERT INTO usuarios_roles ("usuarioId", "rolId") VALUES ('u','doc')`)).toMatch("COMBINACION_ROLES_INVALIDA");

    await sql.query(`DELETE FROM usuarios_roles WHERE "usuarioId"='u'`);
    await sql.query(`INSERT INTO usuarios_roles ("usuarioId", "rolId") VALUES ('u','admin'),('u','doc')`); // ADMIN + DOCENTE sí
    expect(await rechazo(`INSERT INTO usuarios_roles ("usuarioId", "rolId") VALUES ('u','est')`)).toMatch("COMBINACION_ROLES_INVALIDA");
    // Cambiar un rol existente por ESTUDIANTE tampoco cuela la combinación.
    expect(await rechazo(`UPDATE usuarios_roles SET "rolId"='est' WHERE "usuarioId"='u' AND "rolId"='doc'`)).toMatch("COMBINACION_ROLES_INVALIDA");
  });

  it("R8 · una asociación no termina antes de empezar", async () => {
    await sql.query(asociacion("a1", "g1"));
    expect(await rechazo("UPDATE asociaciones_estudiantes_grupos SET \"finEn\"='2020-01-01' WHERE id='a1'")).toMatch("asociaciones_fin_posterior_inicio");
  });

  it("R9 · una sola asociación activa por estudiante y año; cerrada, se conserva el historial", async () => {
    await sql.query(asociacion("a1", "g1"));
    expect(await rechazo(asociacion("a2", "g2"))).toMatch("asociacion_estudiante_activa_por_anio_key");
    await sql.query(`UPDATE asociaciones_estudiantes_grupos SET "finEn"=now() + interval '1 second' WHERE id='a1'`);
    await sql.query(asociacion("a2", "g2"));
    expect((await sql.query("SELECT id FROM asociaciones_estudiantes_grupos ORDER BY id")).rows).toHaveLength(2);
  });

  it("R10 · el grupo de la asociación pertenece a su año (GRUPO_ANIO_INVALIDO)", async () => {
    expect(await rechazo(asociacion("a1", "g-otro"))).toMatch("GRUPO_ANIO_INVALIDO");
    await sql.query(asociacion("a1", "g1"));
    expect(await rechazo(`UPDATE asociaciones_estudiantes_grupos SET "grupoId"='g-otro' WHERE id='a1'`)).toMatch("GRUPO_ANIO_INVALIDO");
    expect(await rechazo(`UPDATE asociaciones_estudiantes_grupos SET "anioLectivoId"='otro' WHERE id='a1'`)).toMatch("GRUPO_ANIO_INVALIDO");
  });

  it("R11 · bloques: día válido, HH:MM entre 00:00 y 23:59 y fin posterior al inicio", async () => {
    expect(await rechazo(bloque("b1", "LUNES", "08:00", "09:00"))).toBeNull();
    expect(await rechazo(bloque("b2", "FUNDAY", "08:00", "09:00"))).toMatch(/DiaSemana/);
    expect(await rechazo(bloque("b3", "LUNES", "07:5", "09:00"))).toMatch("bloques_horaInicio_formato");
    expect(await rechazo(bloque("b4", "LUNES", "08:00", "24:00"))).toMatch("bloques_horaFin_formato");
    expect(await rechazo(bloque("b5", "LUNES", "08:60", "09:00"))).toMatch("bloques_horaInicio_formato");
    expect(await rechazo(bloque("b6", "LUNES", "09:00", "08:00"))).toMatch("bloques_fin_posterior_inicio");
    expect(await rechazo(bloque("b7", "MARTES", "10:00", "10:00"))).toMatch("bloques_fin_posterior_inicio");
  });

  it("R12 · cambiar estado o contraseña revoca sesiones; otros cambios no", async () => {
    await sql.query("UPDATE usuarios SET nombres='Otra' WHERE id='u'");
    expect(await version()).toEqual({ v: 1, en: null });

    await sql.query(`UPDATE usuarios SET "hashContrasena"='hash-2' WHERE id='u'`);
    expect((await version()).v).toBe(2);
    // Como en SQLite: la versión queda en anterior + 1 aunque la escritura fije otra.
    await sql.query(`UPDATE usuarios SET estado='INACTIVO', "versionSesion"=40 WHERE id='u'`);
    const revocada = await version();
    expect(revocada.v).toBe(3);
    expect(revocada.en).toBeInstanceOf(Date);
    // Reescribir el mismo valor no revoca.
    await sql.query(`UPDATE usuarios SET estado='INACTIVO' WHERE id='u'`);
    expect((await version()).v).toBe(3);
  });

  it("R13 · agregar o retirar un rol revoca sesiones", async () => {
    await sql.query(`INSERT INTO usuarios_roles ("usuarioId", "rolId") VALUES ('u','admin')`);
    expect((await version()).v).toBe(2);
    await sql.query(`DELETE FROM usuarios_roles WHERE "usuarioId"='u' AND "rolId"='admin'`);
    const v = await version();
    expect(v.v).toBe(3);
    expect(v.en).toBeInstanceOf(Date);
  });

  it("R14 · la misma asignación docente puede repetirse para conservar historial", async () => {
    await sql.query(`UPDATE asignaciones_docente SET estado='INACTIVA' WHERE id='asig-doc'`);
    expect(
      await rechazo(`INSERT INTO asignaciones_docente (id, "docenteId", "asignaturaId", "grupoId", "anioLectivoId", "actualizadoEn") VALUES ('asig-doc-2','u','asig','g1','anio',now())`),
    ).toBeNull();
  });
});
