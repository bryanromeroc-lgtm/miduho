-- Incremento 1R: acceso, asociación estudiante–grupo e intervalos de horario.
PRAGMA foreign_keys=OFF;

-- Rebuild para cambiar el estado predeterminado, permitir invitaciones sin
-- contraseña y aplicar restricciones escalares que el esquema previo no tenía.
CREATE TABLE "new_usuarios" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "hashContrasena" TEXT,
    "fotoUrl" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE_ACTIVACION'
      CHECK ("estado" IN ('PENDIENTE_ACTIVACION', 'ACTIVO', 'INACTIVO')),
    "debeCambiarContrasena" BOOLEAN NOT NULL DEFAULT false
      CHECK ("debeCambiarContrasena" IN (0, 1)),
    "versionSesion" INTEGER NOT NULL DEFAULT 1 CHECK ("versionSesion" >= 1),
    "sesionesRevocadasEn" DATETIME,
    "ultimoAcceso" DATETIME,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL
);
INSERT INTO "new_usuarios" (
  "id", "nombres", "apellidos", "correo", "hashContrasena", "fotoUrl",
  "estado", "ultimoAcceso", "creadoEn", "actualizadoEn"
)
SELECT "id", "nombres", "apellidos", "correo", "hashContrasena", "fotoUrl",
       "estado", "ultimoAcceso", "creadoEn", "actualizadoEn"
FROM "usuarios";
DROP TABLE "usuarios";
ALTER TABLE "new_usuarios" RENAME TO "usuarios";
CREATE UNIQUE INDEX "usuarios_correo_key" ON "usuarios"("correo");

-- Retiro funcional de roles previos. Si una cuenta antigua mezclaba ESTUDIANTE
-- con un rol de personal, se conserva el rol de personal para normalizarla a una
-- combinación válida sin eliminar la cuenta ni su historial.
DELETE FROM "usuarios_roles"
WHERE "rolId" IN (SELECT "id" FROM "roles" WHERE "codigo" IN ('COORDINACION', 'ACUDIENTE'));
DELETE FROM "usuarios_roles"
WHERE "rolId" = (SELECT "id" FROM "roles" WHERE "codigo" = 'ESTUDIANTE')
  AND "usuarioId" IN (
    SELECT ur."usuarioId"
    FROM "usuarios_roles" ur
    JOIN "roles" r ON r."id" = ur."rolId"
    WHERE r."codigo" IN ('ADMIN', 'DOCENTE')
  );
DELETE FROM "roles" WHERE "codigo" IN ('COORDINACION', 'ACUDIENTE');
DROP TABLE IF EXISTS "acudientes_estudiantes";

CREATE TRIGGER "roles_codigo_permitido_insert"
BEFORE INSERT ON "roles"
WHEN NEW."codigo" NOT IN ('ADMIN', 'DOCENTE', 'ESTUDIANTE')
BEGIN
  SELECT RAISE(ABORT, 'ROL_NO_PERMITIDO');
END;
CREATE TRIGGER "roles_codigo_permitido_update"
BEFORE UPDATE OF "codigo" ON "roles"
WHEN NEW."codigo" NOT IN ('ADMIN', 'DOCENTE', 'ESTUDIANTE')
BEGIN
  SELECT RAISE(ABORT, 'ROL_NO_PERMITIDO');
END;
CREATE TRIGGER "usuarios_roles_combinacion_valida"
BEFORE INSERT ON "usuarios_roles"
WHEN
  ((SELECT "codigo" FROM "roles" WHERE "id" = NEW."rolId") = 'ESTUDIANTE'
    AND EXISTS (
      SELECT 1 FROM "usuarios_roles" ur JOIN "roles" r ON r."id" = ur."rolId"
      WHERE ur."usuarioId" = NEW."usuarioId" AND r."codigo" IN ('ADMIN', 'DOCENTE')
    ))
  OR
  ((SELECT "codigo" FROM "roles" WHERE "id" = NEW."rolId") IN ('ADMIN', 'DOCENTE')
    AND EXISTS (
      SELECT 1 FROM "usuarios_roles" ur JOIN "roles" r ON r."id" = ur."rolId"
      WHERE ur."usuarioId" = NEW."usuarioId" AND r."codigo" = 'ESTUDIANTE'
    ))
BEGIN
  SELECT RAISE(ABORT, 'COMBINACION_ROLES_INVALIDA');
END;

CREATE TABLE "asociaciones_estudiantes_grupos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "estudianteId" TEXT NOT NULL,
    "grupoId" TEXT NOT NULL,
    "anioLectivoId" TEXT NOT NULL,
    "inicioEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finEn" DATETIME,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL,
    CONSTRAINT "asociaciones_estudiantes_grupos_estudianteId_fkey"
      FOREIGN KEY ("estudianteId") REFERENCES "usuarios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "asociaciones_estudiantes_grupos_grupoId_fkey"
      FOREIGN KEY ("grupoId") REFERENCES "grupos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "asociaciones_estudiantes_grupos_anioLectivoId_fkey"
      FOREIGN KEY ("anioLectivoId") REFERENCES "anios_lectivos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CHECK ("finEn" IS NULL OR "finEn" >= "inicioEn")
);
CREATE INDEX "asociaciones_estudiantes_grupos_estudianteId_anioLectivoId_idx"
  ON "asociaciones_estudiantes_grupos"("estudianteId", "anioLectivoId");
CREATE INDEX "asociaciones_estudiantes_grupos_grupoId_finEn_idx"
  ON "asociaciones_estudiantes_grupos"("grupoId", "finEn");
CREATE UNIQUE INDEX "asociacion_estudiante_activa_por_anio_key"
  ON "asociaciones_estudiantes_grupos"("estudianteId", "anioLectivoId")
  WHERE "finEn" IS NULL;
CREATE TRIGGER "asociacion_grupo_anio_insert"
BEFORE INSERT ON "asociaciones_estudiantes_grupos"
WHEN NOT EXISTS (
  SELECT 1 FROM "grupos" g
  WHERE g."id" = NEW."grupoId" AND g."anioLectivoId" = NEW."anioLectivoId"
)
BEGIN
  SELECT RAISE(ABORT, 'GRUPO_ANIO_INVALIDO');
END;
CREATE TRIGGER "asociacion_grupo_anio_update"
BEFORE UPDATE OF "grupoId", "anioLectivoId" ON "asociaciones_estudiantes_grupos"
WHEN NOT EXISTS (
  SELECT 1 FROM "grupos" g
  WHERE g."id" = NEW."grupoId" AND g."anioLectivoId" = NEW."anioLectivoId"
)
BEGIN
  SELECT RAISE(ABORT, 'GRUPO_ANIO_INVALIDO');
END;

CREATE TABLE "bloques_horario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "asignacionId" TEXT NOT NULL,
    "dia" TEXT NOT NULL CHECK ("dia" IN ('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO')),
    "horaInicio" TEXT NOT NULL,
    "horaFin" TEXT NOT NULL,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL,
    CONSTRAINT "bloques_horario_asignacionId_fkey"
      FOREIGN KEY ("asignacionId") REFERENCES "asignaciones_docente" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CHECK (length("horaInicio") = 5 AND substr("horaInicio", 3, 1) = ':'
      AND "horaInicio" BETWEEN '00:00' AND '23:59'
      AND CAST(substr("horaInicio", 4, 2) AS INTEGER) BETWEEN 0 AND 59),
    CHECK (length("horaFin") = 5 AND substr("horaFin", 3, 1) = ':'
      AND "horaFin" BETWEEN '00:00' AND '23:59'
      AND CAST(substr("horaFin", 4, 2) AS INTEGER) BETWEEN 0 AND 59),
    CHECK ("horaInicio" < "horaFin")
);
CREATE INDEX "bloques_horario_dia_horaInicio_horaFin_idx"
  ON "bloques_horario"("dia", "horaInicio", "horaFin");
CREATE UNIQUE INDEX "bloques_horario_asignacionId_dia_horaInicio_horaFin_key"
  ON "bloques_horario"("asignacionId", "dia", "horaInicio", "horaFin");

PRAGMA foreign_keys=ON;
