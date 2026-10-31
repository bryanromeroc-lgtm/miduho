/**
 * Línea base de migraciones PostgreSQL vista desde la app.
 *
 *  - `prisma migrate deploy` sobre base vacía deja el esquema idéntico a
 *    schema.prisma (`migrate diff` vacío);
 *  - los códigos de las reglas (ROL_NO_PERMITIDO, COMBINACION_ROLES_INVALIDA,
 *    GRUPO_ANIO_INVALIDO) llegan intactos a través de Prisma y del adaptador pg;
 *  - la combinación de roles se respeta también con escrituras concurrentes.
 */
import { execFileSync } from "node:child_process";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { PrismaClient } from "@/generated/prisma/client";
import { abrirBasePrueba, type BasePrueba } from "../soporte/base-pruebas";

const APP = path.resolve(__dirname, "../..");

let base: BasePrueba;
let db: PrismaClient;

async function mensajeDe(p: Promise<unknown>) {
  try {
    await p;
  } catch (e) {
    return (e as Error).message;
  }
  return "OK";
}

beforeAll(async () => {
  base = await abrirBasePrueba();
  db = base.db;
  for (const codigo of ["ADMIN", "DOCENTE", "ESTUDIANTE"]) await db.rol.create({ data: { codigo, nombre: codigo } });
});

afterAll(async () => {
  await base?.cerrar();
});

describe("línea base PostgreSQL", () => {
  it("la base migrada no difiere de schema.prisma", () => {
    const salida = execFileSync(
      path.join(APP, "node_modules/.bin/prisma"),
      ["migrate", "diff", "--from-config-datasource", "--to-schema", "prisma/schema.prisma", "--exit-code"],
      { cwd: APP, env: { ...process.env, DATABASE_URL: base.url }, encoding: "utf8", stdio: "pipe" },
    );
    expect(salida).toMatch(/No difference detected|empty migration/i);
  });

  it("los códigos de las reglas llegan a la app a través de Prisma", async () => {
    expect(await mensajeDe(db.rol.create({ data: { codigo: "ACUDIENTE", nombre: "Retirado" } }))).toMatch("ROL_NO_PERMITIDO");

    const u = await db.usuario.create({
      data: { nombres: "Cuenta", apellidos: "Ficticia", correo: "mixta@miduho.test", roles: { create: { rol: { connect: { codigo: "ESTUDIANTE" } } } } },
    });
    expect(
      await mensajeDe(db.usuarioRol.create({ data: { usuarioId: u.id, rolId: (await db.rol.findUniqueOrThrow({ where: { codigo: "ADMIN" } })).id } })),
    ).toMatch("COMBINACION_ROLES_INVALIDA");

    const anio = await db.anioLectivo.create({ data: { anio: 2026, fechaInicio: new Date("2026-01-19"), fechaFin: new Date("2026-12-04") } });
    const otro = await db.anioLectivo.create({ data: { anio: 2025, fechaInicio: new Date("2025-01-20"), fechaFin: new Date("2025-12-05") } });
    const grado = await db.grado.create({ data: { nombre: "1°", nivel: "PRIMARIA", orden: 1 } });
    const grupo = await db.grupo.create({ data: { gradoId: grado.id, anioLectivoId: anio.id, identificador: "01" } });
    expect(
      await mensajeDe(db.asociacionEstudianteGrupo.create({ data: { estudianteId: u.id, grupoId: grupo.id, anioLectivoId: otro.id } })),
    ).toMatch("GRUPO_ANIO_INVALIDO");
  });

  it("dos asignaciones de rol simultáneas no producen una combinación inválida", async () => {
    const roles = Object.fromEntries((await db.rol.findMany()).map((r) => [r.codigo, r.id]));
    for (let i = 0; i < 5; i++) {
      const u = await db.usuario.create({ data: { nombres: "Cuenta", apellidos: `Concurrente ${i}`, correo: `concurrente-${i}@miduho.test` } });
      await Promise.allSettled([
        db.usuarioRol.create({ data: { usuarioId: u.id, rolId: roles.ESTUDIANTE } }),
        db.usuarioRol.create({ data: { usuarioId: u.id, rolId: roles.DOCENTE } }),
      ]);
      expect(await db.usuarioRol.count({ where: { usuarioId: u.id } })).toBe(1);
    }
  });
});
