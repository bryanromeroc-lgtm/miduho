-- CreateEnum
CREATE TYPE "EstadoIntegracion" AS ENUM ('CONECTADA', 'REVOCADA');

-- CreateEnum
CREATE TYPE "TipoDocumentoEntrega" AS ENUM ('PLANILLA_NOTAS', 'PLANEACION', 'OBSERVADOR', 'INFORME', 'OTRO');

-- CreateEnum
CREATE TYPE "EstadoSolicitudEntrega" AS ENUM ('ABIERTA', 'ARCHIVADA');

-- CreateTable
CREATE TABLE "integraciones_google" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "correoGoogle" TEXT NOT NULL,
    "refreshTokenCifrado" TEXT,
    "scopes" TEXT[],
    "estado" "EstadoIntegracion" NOT NULL DEFAULT 'CONECTADA',
    "conectadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integraciones_google_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solicitudes_entrega" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "tipoDocumento" "TipoDocumentoEntrega" NOT NULL,
    "formatos" TEXT[],
    "cierraEn" TIMESTAMPTZ(3) NOT NULL,
    "periodoId" TEXT,
    "carpetaDriveId" TEXT NOT NULL,
    "carpetaDriveNombre" TEXT NOT NULL,
    "integracionId" TEXT NOT NULL,
    "estado" "EstadoSolicitudEntrega" NOT NULL DEFAULT 'ABIERTA',
    "creadaPorId" TEXT NOT NULL,
    "creadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadaEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "solicitudes_entrega_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entregas_docente" (
    "id" TEXT NOT NULL,
    "solicitudId" TEXT NOT NULL,
    "docenteId" TEXT NOT NULL,
    "ultimoFalloEn" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "entregas_docente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "archivos_entrega" (
    "id" TEXT NOT NULL,
    "entregaId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "driveFileId" TEXT NOT NULL,
    "nombreDrive" TEXT NOT NULL,
    "nombreOriginal" TEXT NOT NULL,
    "tamanoBytes" INTEGER NOT NULL,
    "sha256" TEXT NOT NULL,
    "mime" TEXT NOT NULL,
    "subidoEn" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "archivos_entrega_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "integraciones_google_usuarioId_key" ON "integraciones_google"("usuarioId");

-- CreateIndex
CREATE INDEX "solicitudes_entrega_estado_cierraEn_idx" ON "solicitudes_entrega"("estado", "cierraEn");

-- CreateIndex
CREATE INDEX "entregas_docente_docenteId_idx" ON "entregas_docente"("docenteId");

-- CreateIndex
CREATE UNIQUE INDEX "entregas_docente_solicitudId_docenteId_key" ON "entregas_docente"("solicitudId", "docenteId");

-- CreateIndex
CREATE UNIQUE INDEX "archivos_entrega_entregaId_version_key" ON "archivos_entrega"("entregaId", "version");

-- AddForeignKey
ALTER TABLE "integraciones_google" ADD CONSTRAINT "integraciones_google_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_entrega" ADD CONSTRAINT "solicitudes_entrega_periodoId_fkey" FOREIGN KEY ("periodoId") REFERENCES "periodos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_entrega" ADD CONSTRAINT "solicitudes_entrega_integracionId_fkey" FOREIGN KEY ("integracionId") REFERENCES "integraciones_google"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_entrega" ADD CONSTRAINT "solicitudes_entrega_creadaPorId_fkey" FOREIGN KEY ("creadaPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entregas_docente" ADD CONSTRAINT "entregas_docente_solicitudId_fkey" FOREIGN KEY ("solicitudId") REFERENCES "solicitudes_entrega"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entregas_docente" ADD CONSTRAINT "entregas_docente_docenteId_fkey" FOREIGN KEY ("docenteId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archivos_entrega" ADD CONSTRAINT "archivos_entrega_entregaId_fkey" FOREIGN KEY ("entregaId") REFERENCES "entregas_docente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
