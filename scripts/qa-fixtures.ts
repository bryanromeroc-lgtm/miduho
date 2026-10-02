/**
 * Fixtures QA (ficticias) — crea dos docentes con asignaciones y una asociación
 * estudiante–grupo. No representa identidades reales ni contiene datos de menores.
 */
import "dotenv/config";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";

const db = new PrismaClient({
  adapter: new PrismaLibSql({ url: process.env.DATABASE_URL ?? "file:./dev.db" }),
});

async function main() {
  const rolDocente = await db.rol.findUniqueOrThrow({ where: { codigo: "DOCENTE" } });
  const rolEstudiante = await db.rol.findUniqueOrThrow({ where: { codigo: "ESTUDIANTE" } });

  const clave = process.env.QA_FIXTURES_PASSWORD;
  if (!clave) throw new Error("Define QA_FIXTURES_PASSWORD para crear las cuentas QA.");
  const hash = await bcrypt.hash(clave, 12);

  const mk = (nombres: string, apellidos: string, correo: string) =>
    db.usuario.upsert({
      where: { correo },
      update: {},
      create: { nombres, apellidos, correo, hashContrasena: hash, estado: "ACTIVO" },
    });

  const d1 = await mk("Cuenta Docente", "Uno (ficticia)", "docente1.qa@miduho.test");
  const d2 = await mk("Cuenta Docente", "Dos (ficticia)", "docente2.qa@miduho.test");
  const est = await mk("Cuenta", "Estudiantil (ficticia)", "estudiante.qa@miduho.test");

  for (const [u, rol] of [[d1, rolDocente], [d2, rolDocente], [est, rolEstudiante]] as const) {
    await db.usuarioRol.upsert({
      where: { usuarioId_rolId: { usuarioId: u.id, rolId: rol.id } },
      update: {},
      create: { usuarioId: u.id, rolId: rol.id },
    });
  }

  const anio = await db.anioLectivo.findFirstOrThrow({ where: { anio: 2026 } });
  const grupo = await db.grupo.findFirstOrThrow({ where: { anioLectivoId: anio.id } });
  const asig = await db.asignatura.findFirstOrThrow({ where: { nombre: "Comprensión Lectora" } });

  await db.asociacionEstudianteGrupo.upsert({
    where: { id: "asociacion-estudiante-qa" },
    update: {},
    create: { id: "asociacion-estudiante-qa", estudianteId: est.id, grupoId: grupo.id, anioLectivoId: anio.id },
  });

  await db.asignacionDocente.upsert({
    where: { docenteId_asignaturaId_grupoId_anioLectivoId: { docenteId: d1.id, asignaturaId: asig.id, grupoId: grupo.id, anioLectivoId: anio.id } },
    update: {},
    create: { docenteId: d1.id, asignaturaId: asig.id, grupoId: grupo.id, anioLectivoId: anio.id },
  });
  await db.asignacionDocente.upsert({
    where: { docenteId_asignaturaId_grupoId_anioLectivoId: { docenteId: d2.id, asignaturaId: asig.id, grupoId: grupo.id, anioLectivoId: anio.id } },
    update: {},
    create: { docenteId: d2.id, asignaturaId: asig.id, grupoId: grupo.id, anioLectivoId: anio.id },
  });

  console.log("fixtures listos. docente1/2 =", d1.correo, "/", d2.correo);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
