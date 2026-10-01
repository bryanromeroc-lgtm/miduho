-- CreateTable
CREATE TABLE "anios_lectivos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "anio" INTEGER NOT NULL,
    "fechaInicio" DATETIME NOT NULL,
    "fechaFin" DATETIME NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'ACTIVO',
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "periodos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "anioLectivoId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,
    "fechaInicio" DATETIME NOT NULL,
    "fechaFin" DATETIME NOT NULL,
    "ponderacion" DECIMAL NOT NULL,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL,
    CONSTRAINT "periodos_anioLectivoId_fkey" FOREIGN KEY ("anioLectivoId") REFERENCES "anios_lectivos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "grados" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "nivel" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "grupos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gradoId" TEXT NOT NULL,
    "anioLectivoId" TEXT NOT NULL,
    "identificador" TEXT NOT NULL,
    "directorId" TEXT,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL,
    CONSTRAINT "grupos_gradoId_fkey" FOREIGN KEY ("gradoId") REFERENCES "grados" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "grupos_anioLectivoId_fkey" FOREIGN KEY ("anioLectivoId") REFERENCES "anios_lectivos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "grupos_directorId_fkey" FOREIGN KEY ("directorId") REFERENCES "usuarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "areas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'AREA',
    "idioma" TEXT NOT NULL DEFAULT 'es',
    "orden" INTEGER,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "asignaturas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,
    "intensidadHoraria" INTEGER,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL,
    CONSTRAINT "asignaturas_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "areas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "asignaturas_grados" (
    "asignaturaId" TEXT NOT NULL,
    "gradoId" TEXT NOT NULL,
    "intensidad" INTEGER,

    PRIMARY KEY ("asignaturaId", "gradoId"),
    CONSTRAINT "asignaturas_grados_asignaturaId_fkey" FOREIGN KEY ("asignaturaId") REFERENCES "asignaturas" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "asignaturas_grados_gradoId_fkey" FOREIGN KEY ("gradoId") REFERENCES "grados" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

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
