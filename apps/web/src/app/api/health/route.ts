import { db } from "@/server/db";
import { comprobarSalud } from "@/server/salud";

// Público a propósito: el matcher de src/proxy.ts excluye /api/* y aquí no hay requerirRol.
export function GET() {
  return comprobarSalud(() => db.$queryRaw`SELECT 1`);
}
