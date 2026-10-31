/**
 * Base PostgreSQL de pruebas.
 *
 * - `default` es el `globalSetup` de Vitest: crea `miduho_plantilla` desde cero
 *   y le aplica las migraciones reales con `prisma migrate deploy`, una sola vez.
 * - `abrirBasePrueba()` clona la plantilla en `miduho_test_<id>` (CREATE DATABASE
 *   … TEMPLATE tarda milisegundos) y la elimina al cerrar. Cada suite queda aislada
 *   y las suites pueden correr en paralelo.
 *
 * El servidor sale de TEST_DATABASE_URL (base de mantenimiento, p. ej. `postgres`);
 * por defecto, el PostgreSQL de docker-compose.dev.yml. Nunca se usa DATABASE_URL,
 * para no crear ni borrar bases en el servidor de la app.
 */
import { execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { inject } from "vitest";
import type { TestProject } from "vitest/node";
import { PrismaClient } from "@/generated/prisma/client";

const PLANTILLA = "miduho_plantilla";
const PREFIJO = "miduho_test_";
const URL_POR_DEFECTO = "postgresql://miduho:miduho@localhost:5432/postgres";

declare module "vitest" {
  export interface ProvidedContext {
    basePruebas: { servidor: string } | { error: string };
  }
}

const urlServidor = () => process.env.TEST_DATABASE_URL || URL_POR_DEFECTO;

function urlDe(servidor: string, base: string) {
  const url = new URL(servidor);
  url.pathname = `/${base}`;
  return url.toString();
}

function sinPostgres(servidor: string, causa: unknown) {
  const { host } = new URL(servidor);
  const detalle = causa instanceof Error ? causa.message : String(causa);
  return (
    `No hay un PostgreSQL de pruebas alcanzable en ${host} (${detalle}). ` +
    "Ejecuta `docker compose -f docker-compose.dev.yml up -d` desde la raíz del repositorio " +
    "o define TEST_DATABASE_URL."
  );
}

async function conServidor<T>(servidor: string, fn: (c: pg.Client) => Promise<T>) {
  const cliente = new pg.Client({ connectionString: servidor, connectionTimeoutMillis: 3_000 });
  await cliente.connect();
  try {
    return await fn(cliente);
  } finally {
    await cliente.end();
  }
}

export default async function prepararPlantilla(project: TestProject) {
  const servidor = urlServidor();
  try {
    await conServidor(servidor, async (c) => {
      // Restos de ejecuciones interrumpidas.
      const viejas = await c.query<{ datname: string }>("SELECT datname FROM pg_database WHERE datname LIKE $1", [`${PREFIJO}%`]);
      for (const { datname } of viejas.rows) await c.query(`DROP DATABASE IF EXISTS "${datname}" WITH (FORCE)`);
      await c.query(`DROP DATABASE IF EXISTS "${PLANTILLA}" WITH (FORCE)`);
      await c.query(`CREATE DATABASE "${PLANTILLA}"`);
    });
  } catch (e) {
    // Las pruebas puras siguen corriendo; las de integración fallan con este mensaje.
    project.provide("basePruebas", { error: sinPostgres(servidor, e) });
    return;
  }
  execFileSync(path.resolve(__dirname, "../../node_modules/.bin/prisma"), ["migrate", "deploy"], {
    cwd: path.resolve(__dirname, "../.."),
    env: { ...process.env, DATABASE_URL: urlDe(servidor, PLANTILLA) },
    stdio: "pipe",
  });
  project.provide("basePruebas", { servidor });
}

export interface BasePrueba {
  url: string;
  db: PrismaClient;
  /** Desconecta el cliente y elimina la base. */
  cerrar(): Promise<void>;
}

export async function abrirBasePrueba(): Promise<BasePrueba> {
  const config = inject("basePruebas");
  if ("error" in config) throw new Error(config.error);
  const nombre = `${PREFIJO}${randomBytes(6).toString("hex")}`;
  await conServidor(config.servidor, async (c) => {
    // Dos CREATE … TEMPLATE simultáneos pueden chocar mientras el otro copia.
    for (let intento = 0; ; intento++) {
      try {
        await c.query(`CREATE DATABASE "${nombre}" TEMPLATE "${PLANTILLA}"`);
        return;
      } catch (e) {
        if (intento >= 20 || !/being accessed by other users/.test(String(e))) throw e;
        await new Promise((r) => setTimeout(r, 100 + Math.random() * 200));
      }
    }
  });
  const url = urlDe(config.servidor, nombre);
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
  return {
    url,
    db,
    async cerrar() {
      await db.$disconnect();
      await conServidor(config.servidor, (c) => c.query(`DROP DATABASE IF EXISTS "${nombre}" WITH (FORCE)`));
    },
  };
}
