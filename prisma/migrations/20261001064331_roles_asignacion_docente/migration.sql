-- CreateTable
CREATE TABLE "asignaciones_docente" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "docenteId" TEXT NOT NULL,
    "asignaturaId" TEXT NOT NULL,
    "grupoId" TEXT NOT NULL,
    "anioLectivoId" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'ACTIVA',
    "creadoPorId" TEXT,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL,
    CONSTRAINT "asignaciones_docente_docenteId_fkey" FOREIGN KEY ("docenteId") REFERENCES "usuarios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "asignaciones_docente_asignaturaId_fkey" FOREIGN KEY ("asignaturaId") REFERENCES "asignaturas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "asignaciones_docente_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "grupos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "asignaciones_docente_anioLectivoId_fkey" FOREIGN KEY ("anioLectivoId") REFERENCES "anios_lectivos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "asignaciones_docente_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "usuarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "acudientes_estudiantes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "acudienteId" TEXT NOT NULL,
    "estudianteId" TEXT NOT NULL,
    "parentesco" TEXT NOT NULL,
    "verificado" BOOLEAN NOT NULL DEFAULT false,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL,
    CONSTRAINT "acudientes_estudiantes_acudienteId_fkey" FOREIGN KEY ("acudienteId") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "acudientes_estudiantes_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "asignaciones_docente_docenteId_anioLectivoId_idx" ON "asignaciones_docente"("docenteId", "anioLectivoId");

-- CreateIndex
CREATE UNIQUE INDEX "asignaciones_docente_docenteId_asignaturaId_grupoId_anioLectivoId_key" ON "asignaciones_docente"("docenteId", "asignaturaId", "grupoId", "anioLectivoId");

-- CreateIndex
CREATE UNIQUE INDEX "acudientes_estudiantes_acudienteId_estudianteId_key" ON "acudientes_estudiantes"("acudienteId", "estudianteId");
