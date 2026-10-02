import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { createClient, type Client } from "@libsql/client";
import { afterEach, describe, expect, it } from "vitest";

const migracionesDir = path.resolve(__dirname, "../../../prisma/migrations");
const migraciones = readdirSync(migracionesDir).filter((nombre) => /^\d+_/.test(nombre)).sort();
const migracionInc1R = "20261002000000_inc1r_modelo_acceso_estudiantes_horarios";
const temporales: string[] = [];

function baseTemporal() {
  const dir = mkdtempSync(path.join(tmpdir(), "miduho-inc1r-"));
  temporales.push(dir);
  return createClient({ url: `file:${path.join(dir, "test.db")}` });
}

async function aplicar(db: Client, nombres: string[]) {
  for (const nombre of nombres) {
    await db.executeMultiple(readFileSync(path.join(migracionesDir, nombre, "migration.sql"), "utf8"));
  }
}

async function falla(promesa: Promise<unknown>) {
  try {
    await promesa;
    return false;
  } catch {
    return true;
  }
}

afterEach(() => {
  for (const dir of temporales.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe("migración Inc. 1R", () => {
  it("construye una base vacía y restringe estados y combinaciones de roles", async () => {
    const db = baseTemporal();
    await aplicar(db, migraciones);

    await db.execute("INSERT INTO roles (id, codigo, nombre) VALUES ('r-admin', 'ADMIN', 'Administración'), ('r-doc', 'DOCENTE', 'Docente'), ('r-est', 'ESTUDIANTE', 'Estudiante')");
    await db.execute("INSERT INTO usuarios (id, nombres, apellidos, correo, actualizadoEn) VALUES ('u', 'Cuenta', 'Ficticia', 'cuenta@miduho.test', CURRENT_TIMESTAMP)");
    const usuario = await db.execute("SELECT estado, hashContrasena, debeCambiarContrasena, versionSesion FROM usuarios WHERE id = 'u'");
    expect(usuario.rows[0]).toMatchObject({
      estado: "PENDIENTE_ACTIVACION",
      hashContrasena: null,
      debeCambiarContrasena: 0,
      versionSesion: 1,
    });

    await db.execute("INSERT INTO usuarios_roles (usuarioId, rolId) VALUES ('u', 'r-est')");
    expect(await falla(db.execute("INSERT INTO usuarios_roles (usuarioId, rolId) VALUES ('u', 'r-admin')"))).toBe(true);
    expect(await falla(db.execute("INSERT INTO roles (id, codigo, nombre) VALUES ('r-old', 'ACUDIENTE', 'Retirado')"))).toBe(true);
    expect(await falla(db.execute("UPDATE usuarios SET estado = 'DESCONOCIDO' WHERE id = 'u'"))).toBe(true);
    db.close();
  });

  it("migra el esquema previo, conserva cuentas y normaliza roles incompatibles", async () => {
    const db = baseTemporal();
    await aplicar(db, migraciones.filter((nombre) => nombre !== migracionInc1R));
    await db.execute("INSERT INTO roles (id, codigo, nombre) VALUES ('admin', 'ADMIN', 'Administración'), ('est', 'ESTUDIANTE', 'Estudiante'), ('acu', 'ACUDIENTE', 'Acudiente'), ('coord', 'COORDINACION', 'Coordinación')");
    await db.execute("INSERT INTO usuarios (id, nombres, apellidos, correo, hashContrasena, actualizadoEn) VALUES ('mixta', 'Cuenta', 'Mixta ficticia', 'mixta@miduho.test', 'hash', CURRENT_TIMESTAMP), ('acud', 'Cuenta', 'Acudiente ficticia', 'acud@miduho.test', 'hash', CURRENT_TIMESTAMP)");
    await db.execute("INSERT INTO usuarios_roles (usuarioId, rolId) VALUES ('mixta', 'admin'), ('mixta', 'est'), ('acud', 'acu')");
    await db.execute("INSERT INTO acudientes_estudiantes (id, acudienteId, estudianteId, parentesco, actualizadoEn) VALUES ('vinculo', 'acud', 'mixta', 'Demo', CURRENT_TIMESTAMP)");

    await aplicar(db, [migracionInc1R]);

    const cuentas = await db.execute("SELECT id, hashContrasena, estado FROM usuarios ORDER BY id");
    expect(cuentas.rows).toHaveLength(2);
    expect(cuentas.rows[1]).toMatchObject({ id: "mixta", hashContrasena: "hash", estado: "ACTIVO" });
    const roles = await db.execute("SELECT r.codigo FROM usuarios_roles ur JOIN roles r ON r.id = ur.rolId WHERE ur.usuarioId = 'mixta'");
    expect(roles.rows.map((fila) => fila.codigo)).toEqual(["ADMIN"]);
    expect((await db.execute("SELECT codigo FROM roles ORDER BY codigo")).rows.map((fila) => fila.codigo)).toEqual(["ADMIN", "ESTUDIANTE"]);
    expect((await db.execute("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'acudientes_estudiantes'")).rows).toHaveLength(0);
    expect((await db.execute("PRAGMA foreign_key_check")).rows).toHaveLength(0);
    db.close();
  });

  it("conserva historial de grupo, limita una asociación activa por año y valida horarios", async () => {
    const db = baseTemporal();
    await aplicar(db, migraciones);
    await db.executeMultiple(`
      INSERT INTO roles (id, codigo, nombre) VALUES ('doc', 'DOCENTE', 'Docente'), ('est', 'ESTUDIANTE', 'Estudiante');
      INSERT INTO usuarios (id, nombres, apellidos, correo, hashContrasena, estado, actualizadoEn)
        VALUES ('docente', 'Cuenta', 'Docente ficticia', 'docente@miduho.test', 'hash', 'ACTIVO', CURRENT_TIMESTAMP),
               ('estudiante', 'Cuenta', 'Estudiantil ficticia', 'estudiante@miduho.test', 'hash', 'ACTIVO', CURRENT_TIMESTAMP);
      INSERT INTO usuarios_roles (usuarioId, rolId) VALUES ('docente', 'doc'), ('estudiante', 'est');
      INSERT INTO anios_lectivos (id, anio, fechaInicio, fechaFin, estado, actualizadoEn)
        VALUES ('anio', 2026, '2026-01-01', '2026-12-01', 'ACTIVO', CURRENT_TIMESTAMP);
      INSERT INTO grados (id, nombre, nivel, orden, actualizadoEn) VALUES ('grado', '1° demo', 'PRIMARIA', 1, CURRENT_TIMESTAMP);
      INSERT INTO grupos (id, gradoId, anioLectivoId, identificador, actualizadoEn)
        VALUES ('g1', 'grado', 'anio', '01', CURRENT_TIMESTAMP), ('g2', 'grado', 'anio', '02', CURRENT_TIMESTAMP);
      INSERT INTO areas (id, nombre, actualizadoEn) VALUES ('area', 'Área demo', CURRENT_TIMESTAMP);
      INSERT INTO asignaturas (id, nombre, areaId, actualizadoEn) VALUES ('asig', 'Asignatura demo', 'area', CURRENT_TIMESTAMP);
      INSERT INTO asignaciones_docente (id, docenteId, asignaturaId, grupoId, anioLectivoId, actualizadoEn)
        VALUES ('asignacion', 'docente', 'asig', 'g1', 'anio', CURRENT_TIMESTAMP);
      INSERT INTO asociaciones_estudiantes_grupos (id, estudianteId, grupoId, anioLectivoId, actualizadoEn)
        VALUES ('a1', 'estudiante', 'g1', 'anio', CURRENT_TIMESTAMP);
    `);

    expect(await falla(db.execute("INSERT INTO asociaciones_estudiantes_grupos (id, estudianteId, grupoId, anioLectivoId, actualizadoEn) VALUES ('a2', 'estudiante', 'g2', 'anio', CURRENT_TIMESTAMP)"))).toBe(true);
    await db.execute("UPDATE asociaciones_estudiantes_grupos SET finEn = CURRENT_TIMESTAMP, actualizadoEn = CURRENT_TIMESTAMP WHERE id = 'a1'");
    await db.execute("INSERT INTO asociaciones_estudiantes_grupos (id, estudianteId, grupoId, anioLectivoId, actualizadoEn) VALUES ('a2', 'estudiante', 'g2', 'anio', CURRENT_TIMESTAMP)");
    expect((await db.execute("SELECT id FROM asociaciones_estudiantes_grupos WHERE estudianteId = 'estudiante' ORDER BY id")).rows).toHaveLength(2);

    await db.execute("INSERT INTO bloques_horario (id, asignacionId, dia, horaInicio, horaFin, actualizadoEn) VALUES ('b1', 'asignacion', 'LUNES', '08:00', '09:00', CURRENT_TIMESTAMP)");
    expect(await falla(db.execute("INSERT INTO bloques_horario (id, asignacionId, dia, horaInicio, horaFin, actualizadoEn) VALUES ('b2', 'asignacion', 'LUNES', '09:00', '08:00', CURRENT_TIMESTAMP)"))).toBe(true);
    expect(await falla(db.execute("INSERT INTO bloques_horario (id, asignacionId, dia, horaInicio, horaFin, actualizadoEn) VALUES ('b3', 'asignacion', 'FUNDAY', '08:00', '09:00', CURRENT_TIMESTAMP)"))).toBe(true);
    db.close();
  });
});
