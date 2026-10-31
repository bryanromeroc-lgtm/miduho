-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "EstadoUsuario" AS ENUM ('PENDIENTE_ACTIVACION', 'ACTIVO', 'INACTIVO');

-- CreateEnum
CREATE TYPE "EstadoAnioLectivo" AS ENUM ('ACTIVO', 'CERRADO');

-- CreateEnum
CREATE TYPE "NivelEducativo" AS ENUM ('PREESCOLAR', 'PRIMARIA', 'BACHILLERATO');

-- CreateEnum
CREATE TYPE "TipoArea" AS ENUM ('AREA', 'DIMENSION', 'ENFOQUE');

-- CreateEnum
CREATE TYPE "EstadoAsignacionDocente" AS ENUM ('ACTIVA', 'INACTIVA');

-- CreateEnum
CREATE TYPE "DiaSemana" AS ENUM ('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "hashContrasena" TEXT,
    "fotoUrl" TEXT,
    "estado" "EstadoUsuario" NOT NULL DEFAULT 'PENDIENTE_ACTIVACION',
    "debeCambiarContrasena" BOOLEAN NOT NULL DEFAULT false,
    "versionSesion" INTEGER NOT NULL DEFAULT 1,
    "sesionesRevocadasEn" TIMESTAMP(3),
    "ultimoContexto" TEXT,
    "ultimoAcceso" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios_roles" (
    "usuarioId" TEXT NOT NULL,
    "rolId" TEXT NOT NULL,

    CONSTRAINT "usuarios_roles_pkey" PRIMARY KEY ("usuarioId","rolId")
);

-- CreateTable
CREATE TABLE "restablecimientos_contrasena" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'RECUPERACION',
    "expiraEn" TIMESTAMP(3) NOT NULL,
    "usadoEn" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "restablecimientos_contrasena_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anios_lectivos" (
    "id" TEXT NOT NULL,
    "anio" INTEGER NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3) NOT NULL,
    "estado" "EstadoAnioLectivo" NOT NULL DEFAULT 'ACTIVO',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "anios_lectivos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "periodos" (
    "id" TEXT NOT NULL,
    "anioLectivoId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3) NOT NULL,
    "ponderacion" DECIMAL(65,30) NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "periodos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grados" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "nivel" "NivelEducativo" NOT NULL,
    "orden" INTEGER NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grupos" (
    "id" TEXT NOT NULL,
    "gradoId" TEXT NOT NULL,
    "anioLectivoId" TEXT NOT NULL,
    "identificador" TEXT NOT NULL,
    "directorId" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grupos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "areas" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "TipoArea" NOT NULL DEFAULT 'AREA',
    "idioma" TEXT NOT NULL DEFAULT 'es',
    "orden" INTEGER,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asignaturas" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,
    "intensidadHoraria" INTEGER,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asignaturas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asignaturas_grados" (
    "asignaturaId" TEXT NOT NULL,
    "gradoId" TEXT NOT NULL,
    "intensidad" INTEGER,

    CONSTRAINT "asignaturas_grados_pkey" PRIMARY KEY ("asignaturaId","gradoId")
);

-- CreateTable
CREATE TABLE "asignaciones_docente" (
    "id" TEXT NOT NULL,
    "docenteId" TEXT NOT NULL,
    "asignaturaId" TEXT NOT NULL,
    "grupoId" TEXT NOT NULL,
    "anioLectivoId" TEXT NOT NULL,
    "estado" "EstadoAsignacionDocente" NOT NULL DEFAULT 'ACTIVA',
    "creadoPorId" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asignaciones_docente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asociaciones_estudiantes_grupos" (
    "id" TEXT NOT NULL,
    "estudianteId" TEXT NOT NULL,
    "grupoId" TEXT NOT NULL,
    "anioLectivoId" TEXT NOT NULL,
    "inicioEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finEn" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asociaciones_estudiantes_grupos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bloques_horario" (
    "id" TEXT NOT NULL,
    "asignacionId" TEXT NOT NULL,
    "dia" "DiaSemana" NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFin" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bloques_horario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_correo_key" ON "usuarios"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "roles_codigo_key" ON "roles"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "restablecimientos_contrasena_tokenHash_key" ON "restablecimientos_contrasena"("tokenHash");

-- CreateIndex
CREATE INDEX "restablecimientos_contrasena_usuarioId_idx" ON "restablecimientos_contrasena"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "anios_lectivos_anio_key" ON "anios_lectivos"("anio");

-- CreateIndex
CREATE UNIQUE INDEX "periodos_anioLectivoId_orden_key" ON "periodos"("anioLectivoId", "orden");

-- CreateIndex
CREATE UNIQUE INDEX "grados_nombre_key" ON "grados"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "grados_orden_key" ON "grados"("orden");

-- CreateIndex
CREATE INDEX "grupos_anioLectivoId_idx" ON "grupos"("anioLectivoId");

-- CreateIndex
CREATE UNIQUE INDEX "grupos_gradoId_anioLectivoId_identificador_key" ON "grupos"("gradoId", "anioLectivoId", "identificador");

-- CreateIndex
CREATE UNIQUE INDEX "areas_nombre_idioma_key" ON "areas"("nombre", "idioma");

-- CreateIndex
CREATE UNIQUE INDEX "asignaturas_areaId_nombre_key" ON "asignaturas"("areaId", "nombre");

-- CreateIndex
CREATE INDEX "asignaciones_docente_docenteId_asignaturaId_grupoId_anioLec_idx" ON "asignaciones_docente"("docenteId", "asignaturaId", "grupoId", "anioLectivoId");

-- CreateIndex
CREATE INDEX "asignaciones_docente_docenteId_anioLectivoId_idx" ON "asignaciones_docente"("docenteId", "anioLectivoId");

-- CreateIndex
CREATE INDEX "asociaciones_estudiantes_grupos_estudianteId_anioLectivoId_idx" ON "asociaciones_estudiantes_grupos"("estudianteId", "anioLectivoId");

-- CreateIndex
CREATE INDEX "asociaciones_estudiantes_grupos_grupoId_finEn_idx" ON "asociaciones_estudiantes_grupos"("grupoId", "finEn");

-- CreateIndex
CREATE INDEX "bloques_horario_dia_horaInicio_horaFin_idx" ON "bloques_horario"("dia", "horaInicio", "horaFin");

-- CreateIndex
CREATE UNIQUE INDEX "bloques_horario_asignacionId_dia_horaInicio_horaFin_key" ON "bloques_horario"("asignacionId", "dia", "horaInicio", "horaFin");

-- AddForeignKey
ALTER TABLE "usuarios_roles" ADD CONSTRAINT "usuarios_roles_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios_roles" ADD CONSTRAINT "usuarios_roles_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restablecimientos_contrasena" ADD CONSTRAINT "restablecimientos_contrasena_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "periodos" ADD CONSTRAINT "periodos_anioLectivoId_fkey" FOREIGN KEY ("anioLectivoId") REFERENCES "anios_lectivos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grupos" ADD CONSTRAINT "grupos_gradoId_fkey" FOREIGN KEY ("gradoId") REFERENCES "grados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grupos" ADD CONSTRAINT "grupos_anioLectivoId_fkey" FOREIGN KEY ("anioLectivoId") REFERENCES "anios_lectivos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grupos" ADD CONSTRAINT "grupos_directorId_fkey" FOREIGN KEY ("directorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaturas" ADD CONSTRAINT "asignaturas_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "areas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaturas_grados" ADD CONSTRAINT "asignaturas_grados_asignaturaId_fkey" FOREIGN KEY ("asignaturaId") REFERENCES "asignaturas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaturas_grados" ADD CONSTRAINT "asignaturas_grados_gradoId_fkey" FOREIGN KEY ("gradoId") REFERENCES "grados"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones_docente" ADD CONSTRAINT "asignaciones_docente_docenteId_fkey" FOREIGN KEY ("docenteId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones_docente" ADD CONSTRAINT "asignaciones_docente_asignaturaId_fkey" FOREIGN KEY ("asignaturaId") REFERENCES "asignaturas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones_docente" ADD CONSTRAINT "asignaciones_docente_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "grupos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones_docente" ADD CONSTRAINT "asignaciones_docente_anioLectivoId_fkey" FOREIGN KEY ("anioLectivoId") REFERENCES "anios_lectivos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones_docente" ADD CONSTRAINT "asignaciones_docente_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asociaciones_estudiantes_grupos" ADD CONSTRAINT "asociaciones_estudiantes_grupos_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asociaciones_estudiantes_grupos" ADD CONSTRAINT "asociaciones_estudiantes_grupos_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "grupos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asociaciones_estudiantes_grupos" ADD CONSTRAINT "asociaciones_estudiantes_grupos_anioLectivoId_fkey" FOREIGN KEY ("anioLectivoId") REFERENCES "anios_lectivos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bloques_horario" ADD CONSTRAINT "bloques_horario_asignacionId_fkey" FOREIGN KEY ("asignacionId") REFERENCES "asignaciones_docente"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- =====================================================================
-- Reglas de integridad que Prisma no expresa en schema.prisma.
-- Paridad con las migraciones SQLite archivadas: ver el inventario en
-- prisma/migrations-sqlite-archivo/README.md. Los nombres de restricción y
-- los mensajes de RAISE conservan el código que la app y las pruebas leen.
-- Las listas de valores de estado, día y booleano las impone el tipo nativo
-- (ENUM / BOOLEAN), así que no llevan CHECK.
-- =====================================================================

-- R1 · Solo los tres roles del incremento.
ALTER TABLE "roles" ADD CONSTRAINT "ROL_NO_PERMITIDO"
  CHECK ("codigo" IN ('ADMIN', 'DOCENTE', 'ESTUDIANTE'));

-- R4 · La versión de sesión arranca en 1 y nunca baja de ahí.
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_versionSesion_minima"
  CHECK ("versionSesion" >= 1);

-- R5 · Contexto persistido solo ADMIN o DOCENTE (NULL = aún sin elegir).
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_ultimoContexto_invalido"
  CHECK ("ultimoContexto" IS NULL OR "ultimoContexto" IN ('ADMIN', 'DOCENTE'));

-- R6 · Propósito del token de un solo uso.
ALTER TABLE "restablecimientos_contrasena" ADD CONSTRAINT "restablecimientos_tipo_invalido"
  CHECK ("tipo" IN ('RECUPERACION', 'INVITACION'));

-- R8 · Una asociación no termina antes de empezar.
ALTER TABLE "asociaciones_estudiantes_grupos" ADD CONSTRAINT "asociaciones_fin_posterior_inicio"
  CHECK ("finEn" IS NULL OR "finEn" >= "inicioEn");

-- R9 · Una sola asociación activa por estudiante y año.
CREATE UNIQUE INDEX "asociacion_estudiante_activa_por_anio_key"
  ON "asociaciones_estudiantes_grupos"("estudianteId", "anioLectivoId")
  WHERE "finEn" IS NULL;

-- R11 · Horas en formato HH:MM (00:00–23:59) y fin posterior al inicio.
ALTER TABLE "bloques_horario" ADD CONSTRAINT "bloques_horaInicio_formato"
  CHECK ("horaInicio" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$');
ALTER TABLE "bloques_horario" ADD CONSTRAINT "bloques_horaFin_formato"
  CHECK ("horaFin" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$');
ALTER TABLE "bloques_horario" ADD CONSTRAINT "bloques_fin_posterior_inicio"
  CHECK ("horaInicio" COLLATE "C" < "horaFin" COLLATE "C");

-- R7 · ESTUDIANTE nunca se combina con ADMIN ni DOCENTE.
-- El FOR UPDATE sobre la cuenta serializa asignaciones concurrentes de roles.
CREATE FUNCTION "usuarios_roles_combinacion_valida"() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  nuevo TEXT;
BEGIN
  PERFORM 1 FROM "usuarios" WHERE "id" = NEW."usuarioId" FOR UPDATE;
  SELECT "codigo" INTO nuevo FROM "roles" WHERE "id" = NEW."rolId";
  IF EXISTS (
    SELECT 1 FROM "usuarios_roles" ur JOIN "roles" r ON r."id" = ur."rolId"
    WHERE ur."usuarioId" = NEW."usuarioId"
      AND (TG_OP = 'INSERT' OR NOT (ur."usuarioId" = OLD."usuarioId" AND ur."rolId" = OLD."rolId"))
      AND ((nuevo = 'ESTUDIANTE' AND r."codigo" IN ('ADMIN', 'DOCENTE'))
        OR (nuevo IN ('ADMIN', 'DOCENTE') AND r."codigo" = 'ESTUDIANTE'))
  ) THEN
    RAISE EXCEPTION 'COMBINACION_ROLES_INVALIDA';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER "usuarios_roles_combinacion_valida"
BEFORE INSERT OR UPDATE ON "usuarios_roles"
FOR EACH ROW EXECUTE FUNCTION "usuarios_roles_combinacion_valida"();

-- R10 · El grupo de la asociación pertenece a su año lectivo.
CREATE FUNCTION "asociacion_grupo_anio"() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM "grupos" g
    WHERE g."id" = NEW."grupoId" AND g."anioLectivoId" = NEW."anioLectivoId"
  ) THEN
    RAISE EXCEPTION 'GRUPO_ANIO_INVALIDO';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER "asociacion_grupo_anio"
BEFORE INSERT OR UPDATE OF "grupoId", "anioLectivoId" ON "asociaciones_estudiantes_grupos"
FOR EACH ROW EXECUTE FUNCTION "asociacion_grupo_anio"();

-- R12 · Cambiar estado o contraseña revoca las sesiones (versionSesion es la
-- fuente de invalidación de los JWT). Como en SQLite, la versión queda en
-- OLD + 1 aunque la escritura haya intentado fijar otra.
CREATE FUNCTION "usuarios_revocar_por_estado_o_clave"() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF OLD."estado" IS DISTINCT FROM NEW."estado"
     OR OLD."hashContrasena" IS DISTINCT FROM NEW."hashContrasena" THEN
    NEW."versionSesion" := OLD."versionSesion" + 1;
    NEW."sesionesRevocadasEn" := now() AT TIME ZONE 'UTC';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER "usuarios_revocar_por_estado_o_clave"
BEFORE UPDATE OF "estado", "hashContrasena" ON "usuarios"
FOR EACH ROW EXECUTE FUNCTION "usuarios_revocar_por_estado_o_clave"();

-- R13 · Agregar o retirar un rol también revoca las sesiones.
CREATE FUNCTION "usuarios_revocar_por_rol"() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  UPDATE "usuarios"
  SET "versionSesion" = "versionSesion" + 1,
      "sesionesRevocadasEn" = now() AT TIME ZONE 'UTC'
  WHERE "id" = CASE WHEN TG_OP = 'DELETE' THEN OLD."usuarioId" ELSE NEW."usuarioId" END;
  RETURN NULL;
END;
$$;
CREATE TRIGGER "usuarios_revocar_por_rol"
AFTER INSERT OR DELETE ON "usuarios_roles"
FOR EACH ROW EXECUTE FUNCTION "usuarios_revocar_por_rol"();
