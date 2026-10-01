/**
 * Seed de desarrollo — SOLO datos ficticios (AGENTS.md regla 1).
 * Crea los 5 roles y una cuenta administradora de prueba, sin datos de menores.
 * La contraseña sale de SEED_ADMIN_PASSWORD (no se versiona ninguna).
 */
import "dotenv/config";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";

const db = new PrismaClient({
  adapter: new PrismaLibSql({ url: process.env.DATABASE_URL ?? "file:./dev.db" }),
});

const ROLES = [
  { codigo: "ADMIN", nombre: "Administración" },
  { codigo: "COORDINACION", nombre: "Coordinación" },
  { codigo: "DOCENTE", nombre: "Docente" },
  { codigo: "ESTUDIANTE", nombre: "Estudiante" },
  { codigo: "ACUDIENTE", nombre: "Acudiente" },
];

async function main() {
  for (const r of ROLES) {
    await db.rol.upsert({ where: { codigo: r.codigo }, update: { nombre: r.nombre }, create: r });
  }

  const clave = process.env.SEED_ADMIN_PASSWORD;
  if (!clave) {
    console.info("Roles creados. Define SEED_ADMIN_PASSWORD para crear la cuenta admin ficticia.");
    return;
  }
  const correo = (process.env.SEED_ADMIN_EMAIL ?? "admin@miduho.test").toLowerCase();
  const admin = await db.usuario.upsert({
    where: { correo },
    update: {},
    create: {
      nombres: "Cuenta",
      apellidos: "Administradora (ficticia)",
      correo,
      hashContrasena: await bcrypt.hash(clave, 12),
    },
  });
  const rolAdmin = await db.rol.findUniqueOrThrow({ where: { codigo: "ADMIN" } });
  await db.usuarioRol.upsert({
    where: { usuarioId_rolId: { usuarioId: admin.id, rolId: rolAdmin.id } },
    update: {},
    create: { usuarioId: admin.id, rolId: rolAdmin.id },
  });
  console.info(`Roles y cuenta ficticia ${correo} listos.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
