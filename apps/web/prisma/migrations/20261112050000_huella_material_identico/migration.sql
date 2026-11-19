-- AlterTable
ALTER TABLE "actividades" ADD COLUMN     "huellaCreacion" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "actividades_huellaCreacion_key" ON "actividades"("huellaCreacion");
