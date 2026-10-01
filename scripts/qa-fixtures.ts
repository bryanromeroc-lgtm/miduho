/**
 * Fixtures QA (ficticias) — crea dos docentes con asignaciones y un vínculo
 * acudiente/estudiante para probar autorización por rol. NO datos de menores:
 * son cuentas demo de adultos ficticios ("Docente Uno (ficticio)", etc.).
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
  const rolAcudiente = await db.rol.findUniqueOrThrow({ where: { codigo: "ACUDIENTE" } });

  const clave = "qa-docente-ficticia-2026";
  const hash = await bcrypt.hash(clave, 12);

  const mk = (nombres: string, apellidos: string, correo: string, roles: string[]) =>
    db.usuario.upsert({
      where: { correo },
      update: {},
      create: { nombres, apellidos, correo, hashContrasena: hash },
    });

  const d1 = await mk("Docente Uno", "(ficticio)", "docente1.qa@miduho.test", ["DOCENTE"]);
  const d2 = await mk("Docente Dos", "(ficticio)", "docente2.qa@miduho.test", ["DOCENTE"]);
  const est = await mk("Estudiante Demo", "(ficticio)", "estudiante.qa@miduho.test", ["ESTUDIANTE"]);
  const acud = await mk("Acudiente Demo", "(ficticio)", "acudiente.qa@miduho.test", ["ACUDIENTE"]);

  for (const [u, rol] of [[d1, rolDocente], [d2, rolDocente], [est, rolEstudiante], [acud, rolAcudiente]] as const) {
    await db.usuarioRol.upsert({
      where: { usuarioId_rolId: { usuarioId: u.id, rolId: rol.id } },
      update: {},
      create: { usuarioId: u.id, rolId: rol.id },
    });
  }

  const anio = await db.anioLectivo.findFirstOrThrow({ where: { anio: 2026 } });
  const grupo = await db.grupo.findFirstOrThrow({ where: { anioLectivoId: anio.id } });
  const asig = await db.asignatura.findFirstOrThrow({ where: { nombre: "Comprensión Lectora" } });

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
  console.log("clave docente:", clave);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
