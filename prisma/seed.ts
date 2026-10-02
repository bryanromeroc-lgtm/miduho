/**
 * Seed de desarrollo — SOLO datos ficticios (AGENTS.md regla 1).
 * Crea los 3 roles de Inc. 1R y datos integrados de prueba, sin identidades reales.
 * Las contraseñas salen del entorno; no se versiona ni imprime ninguna.
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
  { codigo: "DOCENTE", nombre: "Docente" },
  { codigo: "ESTUDIANTE", nombre: "Estudiante" },
];

/** Estructura académica DEMO. Todo es ficticio y provisional 🔶. */
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
  const grupo = await db.grupo.upsert({
    where: { gradoId_anioLectivoId_identificador: { gradoId: primero.id, anioLectivoId: anio.id, identificador: "01" } },
    update: {},
    create: { gradoId: primero.id, anioLectivoId: anio.id, identificador: "01" },
  });
  let asignaturaDemo: Awaited<ReturnType<typeof db.asignatura.upsert>> | undefined;
  for (const a of AREAS_DEMO) {
    const area = await db.area.upsert({
      where: { nombre_idioma: { nombre: a.nombre, idioma: "es" } },
      update: {},
      create: { nombre: a.nombre, orden: a.orden },
    });
    for (const nombre of a.asignaturas) {
      const asignatura = await db.asignatura.upsert({
        where: { areaId_nombre: { areaId: area.id, nombre } },
        update: {},
        create: { nombre, areaId: area.id },
      });
      asignaturaDemo ??= asignatura;
      await db.asignaturaGrado.upsert({
        where: { asignaturaId_gradoId: { asignaturaId: asignatura.id, gradoId: primero.id } },
        update: {},
        create: { asignaturaId: asignatura.id, gradoId: primero.id },
      });
    }
  }
  if (!asignaturaDemo) throw new Error("El seed académico requiere al menos una asignatura demo.");
  console.info(`Estructura académica demo ${ANIO_DEMO} lista (ficticia).`);
  return { anio, grupo, asignatura: asignaturaDemo };
}

async function sembrarUsuario(datos: {
  correo: string;
  nombres: string;
  apellidos: string;
  clave: string;
  rol: "ADMIN" | "DOCENTE" | "ESTUDIANTE";
  debeCambiarContrasena?: boolean;
}) {
  const usuario = await db.usuario.upsert({
    where: { correo: datos.correo },
    update: {},
    create: {
      nombres: datos.nombres,
      apellidos: datos.apellidos,
      correo: datos.correo,
      hashContrasena: await bcrypt.hash(datos.clave, 12),
      estado: "ACTIVO",
      debeCambiarContrasena: datos.debeCambiarContrasena ?? false,
    },
  });
  const rol = await db.rol.findUniqueOrThrow({ where: { codigo: datos.rol } });
  await db.usuarioRol.upsert({
    where: { usuarioId_rolId: { usuarioId: usuario.id, rolId: rol.id } },
    update: {},
    create: { usuarioId: usuario.id, rolId: rol.id },
  });
  return usuario;
}

async function main() {
  for (const rol of ROLES) {
    await db.rol.upsert({ where: { codigo: rol.codigo }, update: { nombre: rol.nombre }, create: rol });
  }
  const academico = await sembrarAcademico();

  const claveAdmin = process.env.SEED_ADMIN_PASSWORD;
  if (!claveAdmin) {
    console.info("Roles y estructura creados. Define SEED_ADMIN_PASSWORD para crear el ADMIN ficticio.");
    return;
  }
  // Seed seguro del primer ADMIN: la clave sale del entorno, cumple la política
  // (§4.4) y nunca sobrescribe una cuenta existente (upsert con update vacío).
  if (claveAdmin.length < 10 || !/[A-Za-zÁÉÍÓÚÑáéíóúñ]/.test(claveAdmin) || !/[0-9]/.test(claveAdmin)) {
    throw new Error("SEED_ADMIN_PASSWORD debe tener al menos 10 caracteres, una letra y un número.");
  }
  const admin = await sembrarUsuario({
    correo: (process.env.SEED_ADMIN_EMAIL ?? "admin@miduho.test").toLowerCase(),
    nombres: "Cuenta",
    apellidos: "Administradora (ficticia)",
    clave: claveAdmin,
    rol: "ADMIN",
  });

  const claveDocente = process.env.SEED_DOCENTE_PASSWORD;
  const claveEstudiante = process.env.SEED_ESTUDIANTE_PASSWORD;
  if (!claveDocente || !claveEstudiante) {
    console.info("ADMIN ficticio listo. Define SEED_DOCENTE_PASSWORD y SEED_ESTUDIANTE_PASSWORD para completar el escenario demo.");
    return;
  }
  const docente = await sembrarUsuario({
    correo: "docente@miduho.test",
    nombres: "Cuenta",
    apellidos: "Docente (ficticia)",
    clave: claveDocente,
    rol: "DOCENTE",
    debeCambiarContrasena: true,
  });
  const estudiante = await sembrarUsuario({
    correo: "estudiante@miduho.test",
    nombres: "Cuenta",
    apellidos: "Estudiantil (ficticia)",
    clave: claveEstudiante,
    rol: "ESTUDIANTE",
  });
  await db.asociacionEstudianteGrupo.upsert({
    where: { id: "asociacion-estudiante-demo" },
    update: {},
    create: {
      id: "asociacion-estudiante-demo",
      estudianteId: estudiante.id,
      grupoId: academico.grupo.id,
      anioLectivoId: academico.anio.id,
    },
  });
  const asignacion = await db.asignacionDocente.upsert({
    where: {
      docenteId_asignaturaId_grupoId_anioLectivoId: {
        docenteId: docente.id,
        asignaturaId: academico.asignatura.id,
        grupoId: academico.grupo.id,
        anioLectivoId: academico.anio.id,
      },
    },
    update: {},
    create: {
      docenteId: docente.id,
      asignaturaId: academico.asignatura.id,
      grupoId: academico.grupo.id,
      anioLectivoId: academico.anio.id,
      creadoPorId: admin.id,
    },
  });
  await db.bloqueHorario.upsert({
    where: {
      asignacionId_dia_horaInicio_horaFin: {
        asignacionId: asignacion.id,
        dia: "LUNES",
        horaInicio: "08:00",
        horaFin: "09:00",
      },
    },
    update: {},
    create: { asignacionId: asignacion.id, dia: "LUNES", horaInicio: "08:00", horaFin: "09:00" },
  });
  console.info("Escenario demo ficticio de Inc. 1R listo.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
