-- Avatar explorador del estudiante (rediseño identidad juvenil, D6).
-- Retrocompatible: enum nuevo y columna opcional; nulo equivale a CASITA.
CREATE TYPE "AvatarExplorador" AS ENUM ('CASITA', 'PINO', 'GOTA', 'SOL');

ALTER TABLE "usuarios" ADD COLUMN "avatar" "AvatarExplorador";
