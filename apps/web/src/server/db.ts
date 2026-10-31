import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { urlBaseDatos } from "@/lib/entorno";

// Singleton: evita abrir conexiones nuevas en cada recarga de `next dev`.
const globalParaPrisma = globalThis as unknown as { prisma?: PrismaClient };

function crearCliente() {
  // Sin tope, una base caída deja las peticiones colgadas en vez de fallar.
  const adapter = new PrismaPg({ connectionString: urlBaseDatos(), connectionTimeoutMillis: 5_000 });
  return new PrismaClient({ adapter });
}

export const db = globalParaPrisma.prisma ?? crearCliente();

if (process.env.NODE_ENV !== "production") globalParaPrisma.prisma = db;
