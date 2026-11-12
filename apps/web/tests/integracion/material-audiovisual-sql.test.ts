import pg from "pg";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { abrirBasePrueba, type BasePrueba } from "../soporte/base-pruebas";

let base: BasePrueba;
let sql: pg.Client;

async function rechazo(consulta: string) {
  await sql.query("SAVEPOINT comprobacion");
  try {
    await sql.query(consulta);
    await sql.query("RELEASE SAVEPOINT comprobacion");
    return null;
  } catch (error) {
    await sql.query("ROLLBACK TO SAVEPOINT comprobacion");
    return (error as Error).message;
  }
}

beforeAll(async () => {
  base = await abrirBasePrueba();
  sql = new pg.Client({ connectionString: base.url });
  await sql.connect();
});
afterAll(async () => {
  await sql?.end();
  await base?.cerrar();
});
beforeEach(async () => {
  await sql.query("BEGIN");
  await sql.query(`
    INSERT INTO usuarios (id,nombres,apellidos,correo,"actualizadoEn") VALUES
      ('doc','Cuenta','Ficticia','doc@miduho.test',now()),
      ('est','Cuenta','Ficticia','est@miduho.test',now());
    INSERT INTO anios_lectivos (id,anio,"fechaInicio","fechaFin","actualizadoEn")
      VALUES ('anio',2026,'2026-01-01','2026-12-31',now());
    INSERT INTO periodos (id,"anioLectivoId",nombre,orden,"fechaInicio","fechaFin",ponderacion,"actualizadoEn")
      VALUES ('periodo','anio','Período',1,'2026-01-01','2026-12-31',100,now());
    INSERT INTO grados (id,nombre,nivel,orden,"actualizadoEn") VALUES ('grado','1°','PRIMARIA',1,now());
    INSERT INTO grupos (id,"gradoId","anioLectivoId",identificador,"actualizadoEn")
      VALUES ('grupo','grado','anio','01',now());
    INSERT INTO areas (id,nombre,"actualizadoEn") VALUES ('area','Área',now());
    INSERT INTO asignaturas (id,nombre,"areaId","actualizadoEn") VALUES ('asig','Asignatura','area',now());
    INSERT INTO asignaciones_docente (id,"docenteId","asignaturaId","grupoId","anioLectivoId","actualizadoEn")
      VALUES ('ad','doc','asig','grupo','anio',now());
    INSERT INTO actividades (id,titulo,tipo,"asignaturaId","gradoId","autorId","actualizadoEn")
      VALUES ('a','Material','video-preguntas','asig','grado','doc',now());
    INSERT INTO versiones_actividad (id,"actividadId",tipo,"versionEsquema",contenido,"puntajeMaximo",hash)
      VALUES ('v','a','video-preguntas',1,'{}',1,'hash');
    INSERT INTO asignaciones_actividad (id,"versionActividadId","asignacionDocenteId","grupoId","periodoId","abreEn","cierraEn","creadoPorId","actualizadoEn")
      VALUES ('as','v','ad','grupo','periodo','2026-02-01','2026-03-01','doc',now());
  `);
});
afterEach(async () => {
  await sql.query("ROLLBACK");
});

describe("integridad SQL del material audiovisual", () => {
  it("exige origen DOCENTE y autora", async () => {
    expect(await rechazo(`UPDATE actividades SET "autorId"=NULL WHERE id='a'`)).toContain("actividades_origen_autor_check");
    expect(await rechazo(`UPDATE actividades SET origen='CURRICULO' WHERE id='a'`)).toContain("actividades_origen_autor_check");
  });

  it("limita las fechas y los intentos de la asignación", async () => {
    expect(await rechazo(`UPDATE asignaciones_actividad SET "cierraEn"="abreEn" WHERE id='as'`)).toContain("asignaciones_actividad_fechas_check");
    for (const n of [0, 6]) {
      expect(await rechazo(`UPDATE asignaciones_actividad SET "maxIntentos"=${n} WHERE id='as'`)).toContain("asignaciones_actividad_max_intentos_check");
    }
  });

  it("limita ambos porcentajes a 0–100", async () => {
    await sql.query(`INSERT INTO intentos_actividad (id,"asignacionId","estudianteId",numero) VALUES ('i','as','est',1)`);
    expect(await rechazo(`UPDATE intentos_actividad SET porcentaje=101 WHERE id='i'`)).toContain("intentos_actividad_porcentaje_check");
    expect(await rechazo(`INSERT INTO resultados_actividad (id,"asignacionId","estudianteId","mejorIntentoId",porcentaje) VALUES ('r','as','est','i',-1)`)).toContain("resultados_actividad_porcentaje_check");
  });

  it("admite una sola asignación publicada por versión y grupo", async () => {
    expect(await rechazo(`INSERT INTO asignaciones_actividad (id,"versionActividadId","asignacionDocenteId","grupoId","periodoId","abreEn","cierraEn","creadoPorId","actualizadoEn") VALUES ('as2','v','ad','grupo','periodo','2026-02-01','2026-03-01','doc',now())`)).toContain("asignacion_publicada_version_grupo_key");
    await sql.query(`UPDATE asignaciones_actividad SET estado='ANULADA' WHERE id='as'`);
    expect(await rechazo(`INSERT INTO asignaciones_actividad (id,"versionActividadId","asignacionDocenteId","grupoId","periodoId","abreEn","cierraEn","creadoPorId","actualizadoEn") VALUES ('as2','v','ad','grupo','periodo','2026-02-01','2026-03-01','doc',now())`)).toBeNull();
  });

  it("admite un solo intento en curso por estudiante y asignación", async () => {
    await sql.query(`INSERT INTO intentos_actividad (id,"asignacionId","estudianteId",numero) VALUES ('i','as','est',1)`);
    expect(await rechazo(`INSERT INTO intentos_actividad (id,"asignacionId","estudianteId",numero) VALUES ('i2','as','est',2)`)).toContain("intento_en_curso_estudiante_asignacion_key");
    await sql.query(`UPDATE intentos_actividad SET estado='ABANDONADO' WHERE id='i'`);
    expect(await rechazo(`INSERT INTO intentos_actividad (id,"asignacionId","estudianteId",numero) VALUES ('i2','as','est',2)`)).toBeNull();
  });

  it("bloquea cambiar o borrar una versión con respuestas enviadas", async () => {
    expect(await rechazo(`UPDATE versiones_actividad SET hash='otro' WHERE id='v'`)).toBeNull();
    await sql.query(`INSERT INTO intentos_actividad (id,"asignacionId","estudianteId",numero,estado) VALUES ('i','as','est',1,'ENVIADO')`);
    expect(await rechazo(`UPDATE versiones_actividad SET hash='nuevo' WHERE id='v'`)).toContain("La versión tiene respuestas enviadas");
    expect(await rechazo(`DELETE FROM versiones_actividad WHERE id='v'`)).toContain("La versión tiene respuestas enviadas");
  });
});
