-- CreateTable
CREATE TABLE "desafios_google" (
    "stateHash" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "expiraEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "desafios_google_pkey" PRIMARY KEY ("stateHash")
);

-- CreateIndex
CREATE INDEX "desafios_google_expiraEn_idx" ON "desafios_google"("expiraEn");

-- AddForeignKey
ALTER TABLE "desafios_google" ADD CONSTRAINT "desafios_google_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
