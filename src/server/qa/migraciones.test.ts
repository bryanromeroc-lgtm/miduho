/**
 * Suite QA (INC1R-12) · Migraciones.
 *
 * Verificación independiente, escrita desde el requerimiento aprobado
 * (docs/software-factory/inc-1r-requerimiento-aprobado.md §2, §4, §6, §8 y
 * criterio 14), del contrato que impone la base de datos:
 *
 *  - base vacía → esquema completo con triggers y restricciones escalares;
 *  - roles retirados (COORDINACION, ACUDIENTE) no pueden volver a crearse;
 *  - combinaciones de roles válidas (nunca ESTUDIANTE + personal);
 *  - estados de cuenta acotados;
 *  - una sola asociación estudiante–grupo activa por año, con finEn ≥ inicioEn;
 *  - bloques de horario con formato HH:MM, día válido y horaFin posterior;
 *  - revocación de sesiones por cambio de estado, contraseña o roles (triggers);
 *  - contexto persistido acotado a ADMIN/DOCENTE;
 *  - migración del esquema previo (base ya poblada) conservando cuentas.
 *
 * Usa una SQLite temporal y las migraciones reales (prisma/migrations), nunca
 * un esquema de prueba; así se valida el mismo camino que producción.
 */
import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { createClient, type Client } from "@libsql/client";
import { afterEach, describe, expect, it } from "vitest";

const migracionesDir = path.resolve(__dirname, "../../../prisma/migrations");
const migraciones = readdirSync(migracionesDir).filter((n) => /^\d+_/.test(n)).sort();

// El esquema previo al Incremento 1R son las tres primeras migraciones
// (auth, estructura académica y roles/asignación docente). A partir de ahí
// arranca la secuencia Inc. 1R que retira roles y añade asociaciones, horarios
// y sesiones.
const previas = migraciones.filter((n) => n < "20261002000000");
const inc1r = migraciones.filter((n) => n >= "20261002000000");

const temporales: string[] = [];

function baseTemporal() {
  const dir = mkdtempSync(path.join(tmpdir(), "miduho-qa-migraciones-"));
  temporales.push(dir);
  return createClient({ url: `file:${path.join(dir, "test.db")}` });
}

async function aplicar(db: Client, nombres: string[]) {
  for (const nombre of nombres) {
    await db.executeMultiple(readFileSync(path.join(migracionesDir, nombre, "migration.sql"), "utf8"));
  }
}

async function falla(p: Promise<unknown>) {
  try {
    await p;
    return false;
  } catch {
    return true;
  }
}

afterEach(() => {
  for (const dir of temporales.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe("suite QA · base vacía", () => {
  it("aplica todas las migraciones y solo acepta los tres roles del incremento", async () => {
    const db = baseTemporal();
    await aplicar(db, migraciones);

    await db.execute(
      "INSERT INTO roles (id, codigo, nombre) VALUES ('r-admin','ADMIN','Administración'),('r-doc','DOCENTE','Docente'),('r-est','ESTUDIANTE','Estudiante')",
    );
    // Roles retirados del incremento (§2, §14): el trigger los rechaza.
    expect(await falla(db.execute("INSERT INTO roles (id, codigo, nombre) VALUES ('r-old','ACUDIENTE','Acudiente')"))).toBe(true);
    expect(await falla(db.execute("INSERT INTO roles (id, codigo, nombre) VALUES ('r-old2','COORDINACION','Coordinación')"))).toBe(true);
    expect(await falla(db.execute("UPDATE roles SET codigo='DIRECTOR' WHERE id='r-doc'"))).toBe(true);

    const codigos = await db.execute("SELECT codigo FROM roles ORDER BY codigo");
    expect(codigos.rows.map((r) => r.codigo)).toEqual(["ADMIN", "DOCENTE", "ESTUDIANTE"]);
    db.close();
  });

  it("acota los estados de cuenta y las combinaciones de roles", async () => {
    const db = baseTemporal();
    await aplicar(db, migraciones);
    await db.execute("INSERT INTO roles (id, codigo, nombre) VALUES ('r-admin','ADMIN','Administración'),('r-est','ESTUDIANTE','Estudiante')");
    await db.execute("INSERT INTO usuarios (id, nombres, apellidos, correo, actualizadoEn) VALUES ('u','Cuenta','Ficticia','cuenta@miduho.test',CURRENT_TIMESTAMP)");

    // Estado inicial y campos nuevos de la migración.
    const u = await db.execute("SELECT estado, hashContrasena, debeCambiarContrasena, versionSesion, ultimoContexto FROM usuarios WHERE id='u'");
    expect(u.rows[0]).toMatchObject({
      estado: "PENDIENTE_ACTIVACION",
      hashContrasena: null,
      debeCambiarContrasena: 0,
      versionSesion: 1,
      ultimoContexto: null,
    });

    // Estado acotado (§4).
    expect(await falla(db.execute("UPDATE usuarios SET estado='DESCONOCIDO' WHERE id='u'"))).toBe(true);

    // ESTUDIANTE no puede combinarse con ADMIN ni DOCENTE (§2).
    await db.execute("INSERT INTO usuarios_roles (usuarioId, rolId) VALUES ('u','r-est')");
    expect(await falla(db.execute("INSERT INTO usuarios_roles (usuarioId, rolId) VALUES ('u','r-admin')"))).toBe(true);

    // Contexto persistido solo ADMIN/DOCENTE (§2.4).
    expect(await falla(db.execute("UPDATE usuarios SET ultimoContexto='ESTUDIANTE' WHERE id='u'"))).toBe(true);
    await db.execute("UPDATE usuarios SET ultimoContexto='ADMIN' WHERE id='u'");
    expect((await db.execute("SELECT ultimoContexto FROM usuarios WHERE id='u'")).rows[0].ultimoContexto).toBe("ADMIN");
    db.close();
  });

  it("garantiza una sola asociación estudiante–grupo activa por año, con finEn posterior al inicio", async () => {
    const db = baseTemporal();
    await aplicar(db, migraciones);
    await db.executeMultiple(`
      INSERT INTO roles (id, codigo, nombre) VALUES ('est','ESTUDIANTE','Estudiante');
      INSERT INTO usuarios (id, nombres, apellidos, correo, estado, actualizadoEn)
        VALUES ('e','Cuenta','Ficticia','est@miduho.test','ACTIVO',CURRENT_TIMESTAMP);
      INSERT INTO usuarios_roles (usuarioId, rolId) VALUES ('e','est');
      INSERT INTO anios_lectivos (id, anio, fechaInicio, fechaFin, estado, actualizadoEn)
        VALUES ('anio',2026,'2026-01-01','2026-12-01','ACTIVO',CURRENT_TIMESTAMP);
      INSERT INTO grados (id, nombre, nivel, orden, actualizadoEn) VALUES ('grado','1°','PRIMARIA',1,CURRENT_TIMESTAMP);
      INSERT INTO grupos (id, gradoId, anioLectivoId, identificador, actualizadoEn)
        VALUES ('g1','grado','anio','01',CURRENT_TIMESTAMP),('g2','grado','anio','02',CURRENT_TIMESTAMP);
    `);
    await db.execute("INSERT INTO asociaciones_estudiantes_grupos (id, estudianteId, grupoId, anioLectivoId, actualizadoEn) VALUES ('a1','e','g1','anio',CURRENT_TIMESTAMP)");

    // Índice parcial único: una segunda asociación activa en el mismo año se rechaza.
    expect(await falla(db.execute("INSERT INTO asociaciones_estudiantes_grupos (id, estudianteId, grupoId, anioLectivoId, actualizadoEn) VALUES ('a2','e','g2','anio',CURRENT_TIMESTAMP)"))).toBe(true);
    // finEn no puede ser anterior a inicioEn.
    expect(await falla(db.execute("UPDATE asociaciones_estudiantes_grupos SET finEn='2020-01-01' WHERE id='a1'"))).toBe(true);
    // Grupo y año deben ser coherentes (trigger).
    expect(await falla(db.execute("INSERT INTO asociaciones_estudiantes_grupos (id, estudianteId, grupoId, anioLectivoId, actualizadoEn) VALUES ('a3','e','g1','otro-anio',CURRENT_TIMESTAMP)"))).toBe(true);

    // Al cerrar la anterior sí se conserva historial y se permite la nueva.
    await db.execute("UPDATE asociaciones_estudiantes_grupos SET finEn=CURRENT_TIMESTAMP, actualizadoEn=CURRENT_TIMESTAMP WHERE id='a1'");
    await db.execute("INSERT INTO asociaciones_estudiantes_grupos (id, estudianteId, grupoId, anioLectivoId, actualizadoEn) VALUES ('a2','e','g2','anio',CURRENT_TIMESTAMP)");
    expect((await db.execute("SELECT id FROM asociaciones_estudiantes_grupos WHERE estudianteId='e' ORDER BY id")).rows).toHaveLength(2);
    db.close();
  });

  it("valida bloques de horario: formato HH:MM, día de semana y horaFin posterior", async () => {
    const db = baseTemporal();
    await aplicar(db, migraciones);
    await db.executeMultiple(`
      INSERT INTO roles (id, codigo, nombre) VALUES ('doc','DOCENTE','Docente');
      INSERT INTO usuarios (id, nombres, apellidos, correo, estado, actualizadoEn)
        VALUES ('d','Cuenta','Ficticia','doc@miduho.test','ACTIVO',CURRENT_TIMESTAMP);
      INSERT INTO usuarios_roles (usuarioId, rolId) VALUES ('d','doc');
      INSERT INTO anios_lectivos (id, anio, fechaInicio, fechaFin, estado, actualizadoEn)
        VALUES ('anio',2026,'2026-01-01','2026-12-01','ACTIVO',CURRENT_TIMESTAMP);
      INSERT INTO grados (id, nombre, nivel, orden, actualizadoEn) VALUES ('grado','1°','PRIMARIA',1,CURRENT_TIMESTAMP);
      INSERT INTO grupos (id, gradoId, anioLectivoId, identificador, actualizadoEn) VALUES ('g1','grado','anio','01',CURRENT_TIMESTAMP);
      INSERT INTO areas (id, nombre, actualizadoEn) VALUES ('area','Área',CURRENT_TIMESTAMP);
      INSERT INTO asignaturas (id, nombre, areaId, actualizadoEn) VALUES ('asig','Asignatura','area',CURRENT_TIMESTAMP);
      INSERT INTO asignaturas_grados (asignaturaId, gradoId) VALUES ('asig','grado');
      INSERT INTO asignaciones_docente (id, docenteId, asignaturaId, grupoId, anioLectivoId, actualizadoEn)
        VALUES ('asig-doc','d','asig','g1','anio',CURRENT_TIMESTAMP);
    `);

    await db.execute("INSERT INTO bloques_horario (id, asignacionId, dia, horaInicio, horaFin, actualizadoEn) VALUES ('b1','asig-doc','LUNES','08:00','09:00',CURRENT_TIMESTAMP)");
    expect(await falla(db.execute("INSERT INTO bloques_horario (id, asignacionId, dia, horaInicio, horaFin, actualizadoEn) VALUES ('b2','asig-doc','LUNES','09:00','08:00',CURRENT_TIMESTAMP)"))).toBe(true);
    expect(await falla(db.execute("INSERT INTO bloques_horario (id, asignacionId, dia, horaInicio, horaFin, actualizadoEn) VALUES ('b3','asig-doc','FUNDAY','08:00','09:00',CURRENT_TIMESTAMP)"))).toBe(true);
    expect(await falla(db.execute("INSERT INTO bloques_horario (id, asignacionId, dia, horaInicio, horaFin, actualizadoEn) VALUES ('b4','asig-doc','LUNES','8:00','09:00',CURRENT_TIMESTAMP)"))).toBe(true);
    db.close();
  });

  it("revoca sesiones al cambiar estado, contraseña o roles, e incrementa la versión", async () => {
    const db = baseTemporal();
    await aplicar(db, migraciones);
    await db.executeMultiple(`
      INSERT INTO roles (id, codigo, nombre) VALUES ('admin','ADMIN','Administración'),('doc','DOCENTE','Docente');
      INSERT INTO usuarios (id, nombres, apellidos, correo, hashContrasena, estado, actualizadoEn)
        VALUES ('u','Cuenta','Ficticia','sesion@miduho.test','hash-1','ACTIVO',CURRENT_TIMESTAMP);
    `);

    const version = async () => (await db.execute("SELECT versionSesion, sesionesRevocadasEn FROM usuarios WHERE id='u'")).rows[0];

    await db.execute("INSERT INTO usuarios_roles (usuarioId, rolId) VALUES ('u','admin')");
    expect((await version()).versionSesion).toBe(2); // rol agregado

    await db.execute("UPDATE usuarios SET hashContrasena='hash-2' WHERE id='u'");
    expect((await version()).versionSesion).toBe(3); // contraseña cambiada

    await db.execute("DELETE FROM usuarios_roles WHERE usuarioId='u' AND rolId='admin'");
    expect((await version()).versionSesion).toBe(4); // rol retirado

    await db.execute("UPDATE usuarios SET estado='INACTIVO' WHERE id='u'");
    const revocada = await version();
    expect(revocada.versionSesion).toBe(5); // estado cambiado
    expect(revocada.sesionesRevocadasEn).not.toBeNull();
    db.close();
  });
});

describe("suite QA · migración desde el esquema previo", () => {
  it("conserva cuentas, retira los roles retirados y normaliza combinaciones inválidas", async () => {
    const db = baseTemporal();
    await aplicar(db, previas);

    // Datos ficticios del esquema previo: roles ya retirados, una cuenta mixta
    // ESTUDIANTE+ADMIN y un acudiente vinculado.
    await db.executeMultiple(`
      INSERT INTO roles (id, codigo, nombre) VALUES
        ('admin','ADMIN','Administración'),
        ('est','ESTUDIANTE','Estudiante'),
        ('acu','ACUDIENTE','Acudiente'),
        ('coord','COORDINACION','Coordinación');
      INSERT INTO usuarios (id, nombres, apellidos, correo, hashContrasena, estado, actualizadoEn) VALUES
        ('mixta','Cuenta','Mixta ficticia','mixta@miduho.test','hash','ACTIVO',CURRENT_TIMESTAMP),
        ('acud','Cuenta','Acudiente ficticia','acud@miduho.test','hash','ACTIVO',CURRENT_TIMESTAMP);
      INSERT INTO usuarios_roles (usuarioId, rolId) VALUES
        ('mixta','admin'),('mixta','est'),('acud','acu');
      INSERT INTO acudientes_estudiantes (id, acudienteId, estudianteId, parentesco, actualizadoEn)
        VALUES ('vinculo','acud','mixta','Demo',CURRENT_TIMESTAMP);
    `);

    await aplicar(db, inc1r);

    // Los roles retirados desaparecen; la tabla de acudientes se elimina.
    expect((await db.execute("SELECT codigo FROM roles ORDER BY codigo")).rows.map((r) => r.codigo)).toEqual(["ADMIN", "ESTUDIANTE"]);
    expect((await db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='acudientes_estudiantes'")).rows).toHaveLength(0);

    // La cuenta mixta se normaliza a una combinación válida: queda ADMIN, sin ESTUDIANTE.
    const rolesMixta = await db.execute("SELECT r.codigo FROM usuarios_roles ur JOIN roles r ON r.id=ur.rolId WHERE ur.usuarioId='mixta'");
    expect(rolesMixta.rows.map((r) => r.codigo)).toEqual(["ADMIN"]);

    // Ambas cuentas se conservan con su hash y estado.
    const cuentas = await db.execute("SELECT id, hashContrasena, estado FROM usuarios ORDER BY id");
    expect(cuentas.rows).toHaveLength(2);
    expect(cuentas.rows.find((r) => r.id === "mixta")).toMatchObject({ hashContrasena: "hash", estado: "ACTIVO" });

    // Integridad referencial limpia tras la migración.
    expect((await db.execute("PRAGMA foreign_key_check")).rows).toHaveLength(0);
    db.close();
  });
});
