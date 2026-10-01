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

/**
 * Estructura académica DEMO (t_b089e01a). Todo es ficticio y provisional 🔶:
 * fechas de año y períodos inventadas para desarrollo, ponderación 25 % cada
 * uno, y solo las tres asignaturas que hoy tiene la maqueta (la lista real de
 * 14 asignaturas de 1.° está pendiente de confirmar con el colegio, D-05).
 * No incluye personas: el grupo piloto queda sin director.
 */
const ANIO_DEMO = 2026;
const PERIODOS_DEMO = [
  { orden: 1, nombre: "Período 1 (demo)", fechaInicio: "2026-01-26", fechaFin: "2026-04-03" },
  { orden: 2, nombre: "Período 2 (demo)", fechaInicio: "2026-04-13", fechaFin: "2026-06-19" },
  { orden: 3, nombre: "Período 3 (demo)", fechaInicio: "2026-07-13", fechaFin: "2026-09-18" },
  { orden: 4, nombre: "Período 4 (demo)", fechaInicio: "2026-09-28", fechaFin: "2026-11-27" },
];
const GRADOS_DEMO = ["1°", "2°", "3°", "4°", "5°"];
const AREAS_DEMO = [
  { nombre: "Humanidades: lengua castellana (demo)", orden: 1, asignaturas: ["Comprensión Lectora"] },
  { nombre: "Tecnología e informática (demo)", orden: 2, asignaturas: ["Robótica"] },
  { nombre: "Emprendimiento (demo)", orden: 3, asignaturas: ["Emprendimiento"] },
];
const fechaUtc = (s: string) => new Date(`${s}T00:00:00.000Z`);

async function sembrarAcademico() {
  const anio = await db.anioLectivo.upsert({
    where: { anio: ANIO_DEMO },
    update: {},
    create: { anio: ANIO_DEMO, fechaInicio: fechaUtc("2026-01-19"), fechaFin: fechaUtc("2026-12-04") },
  });
  for (const p of PERIODOS_DEMO) {
    const datos = { nombre: p.nombre, fechaInicio: fechaUtc(p.fechaInicio), fechaFin: fechaUtc(p.fechaFin), ponderacion: 25 };
    await db.periodo.upsert({
      where: { anioLectivoId_orden: { anioLectivoId: anio.id, orden: p.orden } },
      update: {},
      create: { ...datos, anioLectivoId: anio.id, orden: p.orden },
    });
  }
  const grados = [];
  for (const [i, nombre] of GRADOS_DEMO.entries()) {
    grados.push(
      await db.grado.upsert({ where: { nombre }, update: {}, create: { nombre, nivel: "PRIMARIA", orden: i + 1 } }),
    );
  }
  const primero = grados[0];
  await db.grupo.upsert({
    where: { gradoId_anioLectivoId_identificador: { gradoId: primero.id, anioLectivoId: anio.id, identificador: "01" } },
    update: {},
    create: { gradoId: primero.id, anioLectivoId: anio.id, identificador: "01" },
  });
  for (const a of AREAS_DEMO) {
    const area = await db.area.upsert({
      where: { nombre_idioma: { nombre: a.nombre, idioma: "es" } },
      update: {},
      create: { nombre: a.nombre, orden: a.orden },
    });
    for (const nombre of a.asignaturas) {
      const asig = await db.asignatura.upsert({
        where: { areaId_nombre: { areaId: area.id, nombre } },
        update: {},
        create: { nombre, areaId: area.id },
      });
      await db.asignaturaGrado.upsert({
        where: { asignaturaId_gradoId: { asignaturaId: asig.id, gradoId: primero.id } },
        update: {},
        create: { asignaturaId: asig.id, gradoId: primero.id },
      });
    }
  }
  console.info(`Estructura académica demo ${ANIO_DEMO} lista (ficticia).`);
}

async function main() {
  for (const r of ROLES) {
    await db.rol.upsert({ where: { codigo: r.codigo }, update: { nombre: r.nombre }, create: r });
  }
  await sembrarAcademico();

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
