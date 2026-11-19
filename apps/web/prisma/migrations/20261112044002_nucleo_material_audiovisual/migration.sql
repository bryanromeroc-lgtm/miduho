-- CreateEnum
CREATE TYPE "OrigenActividad" AS ENUM ('CURRICULO', 'DOCENTE');

-- CreateEnum
CREATE TYPE "EstadoActividad" AS ENUM ('PUBLICADA', 'RETIRADA');

-- CreateEnum
CREATE TYPE "EstadoAsignacionActividad" AS ENUM ('PUBLICADA', 'ANULADA');

-- CreateEnum
CREATE TYPE "EstadoIntento" AS ENUM ('EN_CURSO', 'ENVIADO', 'ABANDONADO');

-- CreateTable
CREATE TABLE "actividades" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "instruccion" TEXT,
    "tipo" TEXT NOT NULL,
    "asignaturaId" TEXT NOT NULL,
    "gradoId" TEXT NOT NULL,
    "origen" "OrigenActividad" NOT NULL DEFAULT 'DOCENTE',
    "autorId" TEXT,
    "estado" "EstadoActividad" NOT NULL DEFAULT 'PUBLICADA',
    "creadoEn" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "actividades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "versiones_actividad" (
    "id" TEXT NOT NULL,
    "actividadId" TEXT NOT NULL,
    "numero" INTEGER NOT NULL DEFAULT 1,
    "tipo" TEXT NOT NULL,
    "versionEsquema" INTEGER NOT NULL,
    "contenido" JSONB NOT NULL,
    "puntajeMaximo" DECIMAL(10,2) NOT NULL,
    "hash" TEXT NOT NULL,

    CONSTRAINT "versiones_actividad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asignaciones_actividad" (
    "id" TEXT NOT NULL,
    "versionActividadId" TEXT NOT NULL,
    "asignacionDocenteId" TEXT NOT NULL,
    "grupoId" TEXT NOT NULL,
    "periodoId" TEXT NOT NULL,
    "abreEn" TIMESTAMPTZ(3) NOT NULL,
    "cierraEn" TIMESTAMPTZ(3) NOT NULL,
    "maxIntentos" INTEGER NOT NULL DEFAULT 3,
    "cuentaComoNota" BOOLEAN NOT NULL DEFAULT true,
    "estado" "EstadoAsignacionActividad" NOT NULL DEFAULT 'PUBLICADA',
    "creadoPorId" TEXT NOT NULL,
    "creadoEn" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "asignaciones_actividad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "intentos_actividad" (
    "id" TEXT NOT NULL,
    "asignacionId" TEXT NOT NULL,
    "estudianteId" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "estado" "EstadoIntento" NOT NULL DEFAULT 'EN_CURSO',
    "vioVideoEn" TIMESTAMPTZ(3),
    "iniciadoEn" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "enviadoEn" TIMESTAMPTZ(3),
    "puntaje" DECIMAL(10,2),
    "porcentaje" DECIMAL(5,2),

    CONSTRAINT "intentos_actividad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "respuestas_item" (
    "id" TEXT NOT NULL,
    "intentoId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "respuesta" JSONB NOT NULL,
    "correcta" BOOLEAN NOT NULL,
    "puntaje" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "respuestas_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resultados_actividad" (
    "id" TEXT NOT NULL,
    "asignacionId" TEXT NOT NULL,
    "estudianteId" TEXT NOT NULL,
    "mejorIntentoId" TEXT NOT NULL,
    "porcentaje" DECIMAL(5,2) NOT NULL,

    CONSTRAINT "resultados_actividad_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "actividades_asignaturaId_gradoId_estado_idx" ON "actividades"("asignaturaId", "gradoId", "estado");

-- CreateIndex
CREATE INDEX "actividades_autorId_estado_idx" ON "actividades"("autorId", "estado");

-- CreateIndex
CREATE UNIQUE INDEX "versiones_actividad_actividadId_numero_key" ON "versiones_actividad"("actividadId", "numero");

-- CreateIndex
CREATE INDEX "asignaciones_actividad_grupoId_estado_abreEn_idx" ON "asignaciones_actividad"("grupoId", "estado", "abreEn");

-- CreateIndex
CREATE INDEX "asignaciones_actividad_asignacionDocenteId_estado_idx" ON "asignaciones_actividad"("asignacionDocenteId", "estado");

-- CreateIndex
CREATE INDEX "asignaciones_actividad_versionActividadId_idx" ON "asignaciones_actividad"("versionActividadId");

-- CreateIndex
CREATE INDEX "intentos_actividad_estudianteId_estado_idx" ON "intentos_actividad"("estudianteId", "estado");

-- CreateIndex
CREATE UNIQUE INDEX "intentos_actividad_asignacionId_estudianteId_numero_key" ON "intentos_actividad"("asignacionId", "estudianteId", "numero");

-- CreateIndex
CREATE UNIQUE INDEX "respuestas_item_intentoId_itemId_key" ON "respuestas_item"("intentoId", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "resultados_actividad_asignacionId_estudianteId_key" ON "resultados_actividad"("asignacionId", "estudianteId");

-- AddForeignKey
ALTER TABLE "actividades" ADD CONSTRAINT "actividades_asignaturaId_fkey" FOREIGN KEY ("asignaturaId") REFERENCES "asignaturas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actividades" ADD CONSTRAINT "actividades_gradoId_fkey" FOREIGN KEY ("gradoId") REFERENCES "grados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actividades" ADD CONSTRAINT "actividades_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "versiones_actividad" ADD CONSTRAINT "versiones_actividad_actividadId_fkey" FOREIGN KEY ("actividadId") REFERENCES "actividades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones_actividad" ADD CONSTRAINT "asignaciones_actividad_versionActividadId_fkey" FOREIGN KEY ("versionActividadId") REFERENCES "versiones_actividad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones_actividad" ADD CONSTRAINT "asignaciones_actividad_asignacionDocenteId_fkey" FOREIGN KEY ("asignacionDocenteId") REFERENCES "asignaciones_docente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones_actividad" ADD CONSTRAINT "asignaciones_actividad_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "grupos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones_actividad" ADD CONSTRAINT "asignaciones_actividad_periodoId_fkey" FOREIGN KEY ("periodoId") REFERENCES "periodos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones_actividad" ADD CONSTRAINT "asignaciones_actividad_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intentos_actividad" ADD CONSTRAINT "intentos_actividad_asignacionId_fkey" FOREIGN KEY ("asignacionId") REFERENCES "asignaciones_actividad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intentos_actividad" ADD CONSTRAINT "intentos_actividad_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "respuestas_item" ADD CONSTRAINT "respuestas_item_intentoId_fkey" FOREIGN KEY ("intentoId") REFERENCES "intentos_actividad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resultados_actividad" ADD CONSTRAINT "resultados_actividad_asignacionId_fkey" FOREIGN KEY ("asignacionId") REFERENCES "asignaciones_actividad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resultados_actividad" ADD CONSTRAINT "resultados_actividad_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resultados_actividad" ADD CONSTRAINT "resultados_actividad_mejorIntentoId_fkey" FOREIGN KEY ("mejorIntentoId") REFERENCES "intentos_actividad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Reglas de integridad que Prisma no representa.
ALTER TABLE "actividades" ADD CONSTRAINT "actividades_origen_autor_check"
  CHECK ("origen" = 'DOCENTE' AND "autorId" IS NOT NULL);
ALTER TABLE "asignaciones_actividad" ADD CONSTRAINT "asignaciones_actividad_fechas_check"
  CHECK ("cierraEn" > "abreEn");
ALTER TABLE "asignaciones_actividad" ADD CONSTRAINT "asignaciones_actividad_max_intentos_check"
  CHECK ("maxIntentos" BETWEEN 1 AND 5);
ALTER TABLE "intentos_actividad" ADD CONSTRAINT "intentos_actividad_porcentaje_check"
  CHECK ("porcentaje" IS NULL OR "porcentaje" BETWEEN 0 AND 100);
ALTER TABLE "resultados_actividad" ADD CONSTRAINT "resultados_actividad_porcentaje_check"
  CHECK ("porcentaje" BETWEEN 0 AND 100);

CREATE UNIQUE INDEX "asignacion_publicada_version_grupo_key"
  ON "asignaciones_actividad" ("versionActividadId", "grupoId")
  WHERE "estado" = 'PUBLICADA';
CREATE UNIQUE INDEX "intento_en_curso_estudiante_asignacion_key"
  ON "intentos_actividad" ("asignacionId", "estudianteId")
  WHERE "estado" = 'EN_CURSO';

CREATE FUNCTION impedir_cambio_version_con_respuestas() RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM "asignaciones_actividad" a
    JOIN "intentos_actividad" i ON i."asignacionId" = a."id"
    WHERE a."versionActividadId" = OLD."id" AND i."estado" = 'ENVIADO'
  ) THEN
    RAISE EXCEPTION 'La versión tiene respuestas enviadas y no se puede modificar ni borrar';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "versiones_actividad_inmutables_con_respuestas"
  BEFORE UPDATE OR DELETE ON "versiones_actividad"
  FOR EACH ROW EXECUTE FUNCTION impedir_cambio_version_con_respuestas();
