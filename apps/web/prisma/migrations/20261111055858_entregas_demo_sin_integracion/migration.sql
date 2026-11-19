-- DropForeignKey
ALTER TABLE "solicitudes_entrega" DROP CONSTRAINT "solicitudes_entrega_integracionId_fkey";

-- AlterTable
ALTER TABLE "solicitudes_entrega" ALTER COLUMN "integracionId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "solicitudes_entrega" ADD CONSTRAINT "solicitudes_entrega_integracionId_fkey" FOREIGN KEY ("integracionId") REFERENCES "integraciones_google"("id") ON DELETE SET NULL ON UPDATE CASCADE;
